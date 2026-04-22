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

        console.log(`[SUCCESS API] [${paymentGateway}] Starting verification for ${email}`);

        // --- RAZORPAY SIGNATURE VERIFICATION ---
        if (paymentGateway === 'razorpay') {
            console.log("[SUCCESS API] Verifying Razorpay signature...");
            const secret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = metadata || {};

            if (!secret) {
                console.error("[SUCCESS API] RAZORPAY_KEY_SECRET is missing!");
                throw new Error("Server configuration error: Razorpay secret missing");
            }

            const generated_signature = crypto
                .createHmac('sha256', secret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            if (generated_signature !== razorpay_signature) {
                console.error("[SUCCESS API] Signature mismatch!");
                throw new Error("Invalid payment signature");
            }
            console.log("[SUCCESS API] Signature verified.");
        }

        // --- 1. RECORD TRANSACTION ---
        console.log("[SUCCESS API] Checking for duplicate transaction...");
        const { data: duplicateTx, error: fetchErr } = await supabase
            .from('whoposted_transactions')
            .select('id')
            .eq('transaction_id', transactionId)
            .maybeSingle();

        if (fetchErr) console.warn("[SUCCESS API] Supabase fetch error (non-fatal):", fetchErr);

        if (duplicateTx) {
            console.log(`[SUCCESS API] Transaction ${transactionId} already exists. Returning success.`);
            return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { status: 200 });
        }

        console.log("[SUCCESS API] Inserting new transaction record...");
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
            console.error("[SUCCESS API] Transaction record failed:", txError);
            throw new Error(`Failed to record transaction: ${txError.message}`);
        }
        console.log("[SUCCESS API] Transaction recorded.");

        // --- 2. UPDATE FORM STATUS ---
        console.log("[SUCCESS API] Updating form status...");
        await supabase
            .from('user_by_form')
            .update({ payment_status: 'paid' })
            .eq('email', email);

        // --- 3. PROVISION USER ACCOUNT ---
        console.log("[SUCCESS API] Provisioning Auth account...");
        const firstName = fullName.split(' ')[0] || "User";
        const generatedPassword = `${firstName}@123`;

        const { error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: generatedPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError && !authError.message.includes("already registered")) {
            console.error("[SUCCESS API] Auth creation failed:", authError);
        } else {
            console.log("[SUCCESS API] Auth account ready.");
        }

        // --- 4. SEND NOTIFICATION ---
        console.log("[SUCCESS API] Attempting to send success email...");
        try {
            await sendSuccessEmail(email, fullName, transactionId, new Date().toISOString(), expiryDate.toISOString(), generatedPassword);
            console.log("[SUCCESS API] Email sent.");
        } catch (emailErr: any) {
            console.error("[SUCCESS API] Email notification failed (non-fatal):", emailErr.message);
        }

        console.log("[SUCCESS API] All steps completed successfully.");
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


