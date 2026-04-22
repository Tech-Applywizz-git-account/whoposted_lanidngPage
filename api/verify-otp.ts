export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { email, otp, verificationToken, expiresAt } = body;

        if (!email || !otp || !verificationToken || !expiresAt) {
            return res.status(400).json({ error: 'Validation data missing' });
        }

        const now = Date.now();
        if (now > expiresAt) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        const secret = process.env.OTP_SECRET || "fallback_secret_123";
        
        // Re-calculate the expected hash
        const dataToSign = `${email}|${otp}|${expiresAt}|${secret}`;
        const expectedHash = Buffer.from(dataToSign).toString('base64');

        if (verificationToken !== expectedHash) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("[VERIFY OTP ERROR]", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
