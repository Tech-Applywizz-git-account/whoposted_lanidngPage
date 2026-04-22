import Razorpay from 'razorpay';

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { amount, currency = "USD" } = await req.json();

        // 1. Initialize Razorpay Server Client
        const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

        console.log(`[DEBUG] Initializing Razorpay with Key ID: ${keyId}`);
        if (!keySecret) {
            console.error("[ERROR] Razorpay Key Secret is MISSING from environment variables!");
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        // 2. Create Order
        const options = {
            amount: Math.round(amount * 100), // Amount in smallest currency unit, rounded to evitar floats
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        console.log(`[DEBUG] Creating Razorpay order with options:`, JSON.stringify(options));

        const order = await razorpay.orders.create(options);
        return new Response(JSON.stringify(order), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error: any) {
        console.error("Razorpay Create Order Error Full:", JSON.stringify(error, null, 2));
        
        const errorMessage = error.description || error.message || (typeof error === 'string' ? error : 'Internal Server Error');
        
        return new Response(JSON.stringify({ 
            error: errorMessage,
            details: error
        }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}
