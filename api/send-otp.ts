export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    const { email } = await req.json();
    if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    const secret = process.env.OTP_SECRET || "fallback_secret_123";
    
    // Create a simple signature: hash(email + otp + expiresAt + secret)
    // In actual production, use crypto.createHmac
    const dataToSign = `${email}|${otp}|${expiresAt}|${secret}`;
    const hash = Buffer.from(dataToSign).toString('base64'); 

    try {
        // Send Email via MS Graph
        await sendOtpEmail(email, otp);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'OTP sent successfully',
            verificationToken: hash, // This is our stateless token
            expiresAt: expiresAt
        }), { status: 200 });
    } catch (error: any) {
        console.error("[OTP ERROR]", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

async function sendOtpEmail(toEmail: string, otp: string) {
    const clientId = (process.env.MS_CLIENT_ID || "").trim();
    const tenantId = (process.env.MS_TENANT_ID || "").trim();
    const clientSecret = (process.env.MS_CLIENT_SECRET || "").trim();
    const senderEmail = (process.env.MS_SENDER_EMAIL || "").trim();

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

    const tokenData = await tokenResponse.json();
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

    await fetch(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mailOptions)
    });
}
