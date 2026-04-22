import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';

export default async function handler(req: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] Payment Success API called.`);
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    // Initialize Supabase with service role key for admin privileges
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "").trim();

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error(`[${requestId}] [CRITICAL] Supabase configuration missing`);
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

        console.log(`[${requestId}] [${paymentGateway?.toUpperCase()}] Starting verification for ${email}`);

        // --- RAZORPAY SIGNATURE VERIFICATION ---
        if (paymentGateway === 'razorpay') {
            console.log(`[${requestId}] Verifying Razorpay signature...`);
            const secret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = metadata || {};

            if (!secret) {
                console.error(`[${requestId}] RAZORPAY_KEY_SECRET is missing!`);
                throw new Error("Server configuration error: Razorpay secret missing");
            }

            const generated_signature = crypto
                .createHmac('sha256', secret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            if (generated_signature !== razorpay_signature) {
                console.error(`[${requestId}] Signature mismatch!`);
                throw new Error("Invalid payment signature");
            }
            console.log(`[${requestId}] Signature verified.`);
        }

        // --- 1. RECORD TRANSACTION ---
        console.log(`[${requestId}] Checking for duplicate transaction...`);
        const { data: duplicateTx, error: fetchErr } = await supabase
            .from('whoposted_transactions')
            .select('id')
            .eq('transaction_id', transactionId)
            .maybeSingle();

        if (fetchErr) {
            console.warn(`[${requestId}] Supabase fetch error (non-fatal):`, fetchErr);
        }

        if (duplicateTx) {
            console.log(`[${requestId}] Transaction ${transactionId} already exists. Returning success.`);
            return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`[${requestId}] Inserting new transaction record...`);
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        const { error: txError } = await supabase.from('whoposted_transactions').insert({
            user_email: email,
            user_name: fullName,
            order_id: orderId,
            transaction_id: transactionId,
            amount: parseFloat(amount as string),
            currency: currency || 'USD',
            status: 'captured',
            payment_gateway: paymentGateway,
            metadata: metadata,
            expiry_date: expiryDate.toISOString()
        });

        if (txError) {
            console.error(`[${requestId}] Transaction record failed:`, txError);
            throw new Error(`Failed to record transaction: ${txError.message}`);
        }
        console.log(`[${requestId}] Transaction recorded.`);

        // --- 2. UPDATE FORM STATUS ---
        console.log(`[${requestId}] Updating form status...`);
        const { error: updateError } = await supabase
            .from('user_by_form')
            .update({ payment_status: 'paid' })
            .eq('email', email);
        
        if (updateError) {
            console.warn(`[${requestId}] Form status update failed (non-fatal):`, updateError);
        }

        // --- 3. PROVISION USER ACCOUNT ---
        console.log(`[${requestId}] Provisioning Auth account...`);
        const firstName = fullName.split(' ')[0] || "User";
        const generatedPassword = `${firstName}@123`;

        const { error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: generatedPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError && !authError.message.includes("already registered")) {
            console.error(`[${requestId}] Auth creation failed:`, authError);
        } else {
            console.log(`[${requestId}] Auth account ready.`);
        }

        // --- 4. SEND NOTIFICATION (non-blocking) ---
        console.log(`[${requestId}] Attempting to send success email...`);
        try {
            await sendSuccessEmail(email, fullName, transactionId, new Date().toISOString(), expiryDate.toISOString(), generatedPassword);
            console.log(`[${requestId}] Email sent.`);
        } catch (emailErr: unknown) {
            const emailMessage = emailErr instanceof Error ? emailErr.message : 'Unknown error';
            console.error(`[${requestId}] Email notification failed (non-fatal):`, emailMessage);
        }

        console.log(`[${requestId}] All steps completed successfully.`);
        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: unknown) {
        console.error(`[${requestId}] [FATAL ERROR] payment-success verification failed:`, error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new Response(JSON.stringify({ 
            error: message
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
        console.warn("[SUCCESS API] MS 365 config missing. Skipping email.");
        return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
        const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                scope: 'https://graph.microsoft.com/.default',
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }),
            signal: controller.signal
        });

        if (!tokenResponse.ok) throw new Error("MS Token Error");
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const mailOptions = {
            message: {
                subject: "Your WhoPosted Account is Ready!",
                body: {
                    contentType: "HTML",
                    content: `<p>Hi ${name}, your account is ready! Email: ${toEmail} Password: ${password}</p>`
                },
                toRecipients: [{ emailAddress: { address: toEmail } }]
            }
        };

        const mailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mailOptions),
            signal: controller.signal
        });
        
        if (!mailResponse.ok) console.error("[SUCCESS API] Mail send failed:", await mailResponse.text());
    } finally {
        clearTimeout(timeout);
    }
}


