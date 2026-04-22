export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { email } = await req.json();
        
        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

        const secret = process.env.OTP_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "fallback_secret_123";
        
        // Create a simple stateless token: Base64(email|otp|expiresAt|secret)
        const dataToSign = `${email}|${otp}|${expiresAt}|${secret}`;
        const hash = btoa(dataToSign); 

        // Send Email via MS Graph
        console.log(`[OTP] Attempting to send OTP to ${email}`);
        await sendOtpEmail(email, otp);
        console.log(`[OTP] Successfully sent OTP to ${email}`);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'OTP sent successfully',
            verificationToken: hash,
            expiresAt: expiresAt
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("[OTP ERROR]", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function sendOtpEmail(toEmail: string, otp: string) {
    const clientId = (process.env.MS_CLIENT_ID || "").trim();
    const tenantId = (process.env.MS_TENANT_ID || "").trim();
    const clientSecret = (process.env.MS_CLIENT_SECRET || "").trim();
    const senderEmail = (process.env.MS_SENDER_EMAIL || "").trim();

    if (!clientId || !tenantId || !clientSecret || !senderEmail) {
        console.error("[OTP ERROR] Missing Microsoft credentials in environment variables.");
        throw new Error("Email service is not configured correctly.");
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

    if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error("[OTP ERROR] MS Token fetch failed:", errText);
        throw new Error("Failed to authenticate with email service.");
    }

    const tokenData: any = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const mailOptions = {
        message: {
            subject: `${otp} is your WhoPosted verification code`,
            body: {
                contentType: "HTML",
                content: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #9333ea; text-align: center;">Verification Code</h2>
                        <p>Hi there,</p>
                        <p>Use the code below to verify your email address and continue with your account creation:</p>
                        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 10 minutes.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #9ca3af; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `
            },
            toRecipients: [{ emailAddress: { address: toEmail } }]
        }
    };

    const sendResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mailOptions)
    });

    if (!sendResponse.ok) {
        const errText = await sendResponse.text();
        console.error("[OTP ERROR] MS Graph sendMail failed:", errText);
        throw new Error("Failed to send verification email.");
    }
}

