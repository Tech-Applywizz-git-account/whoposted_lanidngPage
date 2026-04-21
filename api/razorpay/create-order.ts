import Razorpay from 'razorpay';

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { amount, currency = "USD" } = await req.json();

        // 1. Initialize Razorpay Server Client
        // Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in .env
        const razorpay = new Razorpay({
            key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.VITE_RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
        });

        // 2. Create Order
        const options = {
            amount: amount * 100, // Amount in smallest currency unit (e.g., cents for USD, paise for INR)
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        return new Response(JSON.stringify(order), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        console.error("Razorpay Create Order Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
