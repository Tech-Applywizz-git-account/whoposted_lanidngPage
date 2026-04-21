export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    const { email, otp, verificationToken, expiresAt } = await req.json();

    if (!email || !otp || !verificationToken || !expiresAt) {
        return new Response(JSON.stringify({ error: 'Validation data missing' }), { status: 400 });
    }

    const now = Date.now();
    if (now > expiresAt) {
        return new Response(JSON.stringify({ error: 'Verification code has expired' }), { status: 400 });
    }

    const secret = process.env.OTP_SECRET || "fallback_secret_123";
    
    // Re-calculate the expected hash
    const dataToSign = `${email}|${otp}|${expiresAt}|${secret}`;
    const expectedHash = Buffer.from(dataToSign).toString('base64');

    if (verificationToken !== expectedHash) {
        return new Response(JSON.stringify({ error: 'Invalid verification code' }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
