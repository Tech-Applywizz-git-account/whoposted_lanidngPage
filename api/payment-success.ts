import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    // Initialize Supabase with service role key for admin privileges
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "").trim();

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("[CRITICAL] Supabase configuration missing in backend environment.");
        return new Response(JSON.stringify({ error: 'Internal Server Configuration Error', details: 'Missing Supabase URL or Service Key' }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const payload = await req.json();
        const {
            orderId,
            transactionId,
            amount,
            currency,
            paymentGateway,
            email,
            fullName,
            metadata
        } = payload;

        console.log(`[INFO] Processing ${paymentGateway} payment success for ${email}. Order: ${orderId}`);

        // --- RAZORPAY SIGNATURE VERIFICATION ---
        if (paymentGateway === 'razorpay') {
            const secret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = metadata || {};

            if (!secret) {
                console.error("[CRITICAL] RAZORPAY_KEY_SECRET is missing for verification!");
                throw new Error("Server configuration error: Razorpay secret missing");
            }

            if (!razorpay_signature || !razorpay_order_id || !razorpay_payment_id) {
                console.error("[ERROR] Missing Razorpay fields in metadata:", metadata);
                throw new Error("Razorpay payment details missing in metadata");
            }

            const generated_signature = crypto
                .createHmac('sha256', secret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            if (generated_signature !== razorpay_signature) {
                console.error("[CRITICAL] Razorpay signature mismatch! Possible fraud attempt.");
                throw new Error("Invalid payment signature");
            }
            console.log("[SUCCESS] Razorpay signature verified successfully.");
        }

        // --- 1. RECORD TRANSACTION WITH HISTORY LOGIC ---
        
        // A. Idempotency Check (specific transaction ID)
        const { data: duplicateTx } = await supabase
            .from('whoposted_transactions')
            .select('id')
            .eq('transaction_id', transactionId)
            .maybeSingle();

        if (duplicateTx) {
            console.warn(`[WARN] Transaction ${transactionId} already exists. Skipping.`);
            return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { status: 200 });
        }

        // B. Check for existing active transaction for this user
        const { data: oldTx, error: fetchError } = await supabase
            .from('whoposted_transactions')
            .select('*')
            .eq('user_email', email)
            .maybeSingle();

        if (oldTx) {
            console.log(`[INFO] Moving old transaction for ${email} to history...`);
            
            // Move to history table
            const { error: historyError } = await supabase.from('whoposted_transaction_history').insert({
                user_email: oldTx.user_email,
                user_name: oldTx.user_name,
                order_id: oldTx.order_id,
                transaction_id: oldTx.transaction_id,
                amount: oldTx.amount,
                currency: oldTx.currency,
                status: oldTx.status,
                payment_gateway: oldTx.payment_gateway,
                metadata: oldTx.metadata,
                created_at: oldTx.created_at,
                expiry_date: oldTx.expiry_date,
                moved_to_history_at: new Date().toISOString()
            });

            if (historyError) {
                console.error("[ERROR] Failed to move old transaction to history:", historyError);
            } else {
                // Delete from active transactions
                await supabase.from('whoposted_transactions').delete().eq('id', oldTx.id);
            }
        }

        // C. Record New Transaction
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        const { error: txError } = await supabase.from('whoposted_transactions').insert({
            user_email: email,
            user_name: fullName,
            order_id: orderId,
            transaction_id: transactionId,
            amount: parseFloat(amount),
            currency: currency || 'USD',
            status: 'captured',
            payment_gateway: paymentGateway || 'paypal',
            metadata: metadata,
            expiry_date: expiryDate.toISOString()
        });

        if (txError) {
            console.error("[ERROR] whoposted_transactions insert failed:", txError);
            throw new Error(`Failed to record transaction: ${txError.message}`);
        }

        // --- 2. UPDATE FORM STATUS ---
        const { error: ubfError } = await supabase
            .from('user_by_form')
            .update({ payment_status: 'paid' })
            .eq('email', email);

        if (ubfError) {
            console.error("[ERROR] Failed to update user_by_form status:", ubfError);
        }

        // --- 3. PROVISION USER ACCOUNT ---
        const firstName = fullName.split(' ')[0] || "User";
        const generatedPassword = `${firstName}@123`;

        console.log(`[INFO] Provisioning account for ${email}...`);
        const { error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: generatedPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            if (authError.message.includes("already registered") || authError.status === 422) {
                console.log(`[INFO] User ${email} already exists in Auth. Skipping creation.`);
            } else {
                console.error("[ERROR] Supabase Auth creation failed:", authError);
            }
        }

        // --- 4. SEND NOTIFICATION ---
        try {
            // Calculate a virtual expiry for the email text
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            await sendSuccessEmail(email, fullName, transactionId, new Date().toISOString(), expiryDate.toISOString(), generatedPassword);
            console.log(`[SUCCESS] Onboarding email sent to ${email}`);
    } catch (emailErr: any) {
        console.error("[CRITICAL EMAIL ERROR] Detailed failure report:", {
            message: emailErr.message,
            stack: emailErr.stack,
            context: "Microsoft Graph API Sending Attempt"
        });
    }

    return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

} catch (error: any) {
    console.error("[FATAL ERROR] payment-success verification failed:", error);
    
    return new Response(JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
}
}

async function sendSuccessEmail(toEmail: string, name: string, transactionId: string, startDate: string, endDate: string, password: string) {
const clientId = (process.env.MS_CLIENT_ID || "").trim();
const tenantId = (process.env.MS_TENANT_ID || "").trim();
const clientSecret = (process.env.MS_CLIENT_SECRET || "").trim();
const senderEmail = (process.env.MS_SENDER_EMAIL || "").trim();

if (!clientId || !tenantId || !clientSecret || !senderEmail) {
    console.error("[ERROR] Missing MS 365 credentials in env:", { 
        clientId: !!clientId, 
        tenantId: !!tenantId, 
        clientSecret: !!clientSecret, 
        senderEmail: !!senderEmail 
    });
    throw new Error("MS 365 configuration incomplete");
}

console.log(`[INFO] Requesting MS Access Token for tenant: ${tenantId}`);
const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        client_id: clientId,
        scope: 'https://graph.microsoft.com/.default',
        client_secret: clientSecret,
        grant_type: 'client_credentials'
    })
});

if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    console.error("[ERROR] MS Auth Token Request Failed:", errorBody);
    throw new Error(`MS Token Error: ${tokenResponse.status} ${errorBody}`);
}

const tokenData = await tokenResponse.json();
const accessToken = tokenData.access_token;

if (!accessToken) {
    throw new Error("Access token missing in MS response");
}

console.log(`[INFO] Sending email from ${senderEmail} to ${toEmail}...`);
const mailOptions = {
    message: {
        subject: "Your WhoPosted Account is Ready!",
        body: {
            contentType: "HTML",
            content: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #374151; line-height: 1.6;">
                    <div style="background: linear-gradient(to right, #9333ea, #2563eb); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h2 style="color: white; margin: 0; font-size: 24px;">Welcome to WhoPosted!</h2>
                    </div>
                    
                    <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
                        <p>Thank you for your payment! Your account has been successfully provisioned and you now have full access to our premium job database.</p>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="margin-top: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</h3>
                            <p style="margin: 10px 0; font-size: 16px;"><strong>Email:</strong> ${toEmail}</p>
                            <p style="margin: 10px 0; font-size: 16px;"><strong>Password:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #d1d5db; color: #9333ea; font-weight: bold;">${password}</code></p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://whoposted-main.vercel.app/login" style="background: #9333ea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Login Now</a>
                        </div>

                         <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 13px; color: #9ca3af;">
                            <p><strong>Transaction Info:</strong><br/>
                            ID: ${transactionId}<br/>
                            Valid until: ${new Date(endDate).toLocaleDateString()}</p>
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 14px;">Best regards,<br/>The WhoPosted Team</p>
                    </div>
                </div>
            `
        },
        toRecipients: [{ emailAddress: { address: toEmail } }]
    },
    saveToSentItems: "true"
};

const mailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(mailOptions)
});

if (!mailResponse.ok) {
    const errBody = await mailResponse.text();
    console.error("[CRITICAL MS GRAPH ERROR]:", {
        status: mailResponse.status,
        body: errBody
    });
    throw new Error(`MS Graph API Error: ${mailResponse.status} ${errBody}`);
}
}
