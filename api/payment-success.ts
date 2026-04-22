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
                console.error("[CRITICAL] Razorpay signature mismatch!");
                throw new Error("Invalid payment signature");
            }
            console.log("[SUCCESS] Razorpay signature verified successfully.");
        }

        // --- 1. RECORD TRANSACTION WITH IDEMPOTENCY ---
        const { data: duplicateTx } = await supabase
            .from('whoposted_transactions')
            .select('id')
            .eq('transaction_id', transactionId)
            .maybeSingle();

        if (duplicateTx) {
            console.warn(`[WARN] Transaction ${transactionId} already exists. Skipping.`);
            return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { status: 200 });
        }

        // --- 2. RECORD NEW TRANSACTION ---
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
            console.error("[ERROR] whoposted_transactions insert failed:", txError);
            throw new Error(`Failed to record transaction: ${txError.message}`);
        }

        // --- 3. UPDATE FORM STATUS ---
        await supabase
            .from('user_by_form')
            .update({ payment_status: 'paid' })
            .eq('email', email);

        // --- 4. PROVISION USER ACCOUNT ---
        const firstName = fullName.split(' ')[0] || "User";
        const generatedPassword = `${firstName}@123`;

        console.log(`[INFO] Provisioning account for ${email}...`);
        const { error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: generatedPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError && !authError.message.includes("already registered")) {
            console.error("[ERROR] Supabase Auth creation failed:", authError);
        }

        // --- 5. SEND NOTIFICATION ---
        try {
            await sendSuccessEmail(email, fullName, transactionId, new Date().toISOString(), expiryDate.toISOString(), generatedPassword);
            console.log(`[SUCCESS] Onboarding email sent to ${email}`);
        } catch (emailErr: any) {
            console.error("[EMAIL ERROR] Failed to send onboarding email:", emailErr.message);
        }

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("[FATAL ERROR] payment-success verification failed:", error);
        return new Response(JSON.stringify({ 
            error: error.message || 'Internal Server Error'
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
        throw new Error("MS 365 configuration incomplete");
    }

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

    await fetch(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mailOptions)
    });
}

