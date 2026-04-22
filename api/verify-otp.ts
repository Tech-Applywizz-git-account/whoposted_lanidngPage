export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { email, otp, verificationToken, expiresAt } = await req.json();

        if (!email || !otp || !verificationToken || !expiresAt) {
            return new Response(JSON.stringify({ error: 'Validation data missing' }), { status: 400 });
        }

        const now = Date.now();
        if (now > expiresAt) {
            return new Response(JSON.stringify({ error: 'Verification code has expired' }), { status: 400 });
        }

        const secret = process.env.OTP_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "fallback_secret_123";
        
        // Re-calculate the expected hash
        const dataToSign = `${email}|${otp}|${expiresAt}|${secret}`;
        const expectedHash = btoa(dataToSign);

        if (verificationToken !== expectedHash) {
            console.warn(`[OTP] Invalid code attempt for ${email}`);
            return new Response(JSON.stringify({ error: 'Invalid verification code' }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("[VERIFY OTP ERROR]", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

