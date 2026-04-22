import Razorpay from 'razorpay';

export default async function handler(req: Request) {
    console.log(`[INFO] Razorpay Create Order API called. Method: ${req.method}`);
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { amount, currency = "USD" } = body;
        
        console.log(`[DEBUG] Received request body:`, JSON.stringify(body));

        // 1. Initialize Razorpay Server Client
        const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();

        if (!keyId || !keySecret) {
            console.error("[CRITICAL] Razorpay Keys are MISSING from environment variables!");
            return new Response(JSON.stringify({ 
                error: 'Razorpay configuration missing on server.',
                details: 'Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET'
            }), { status: 500 });
        }

        console.log(`[DEBUG] Initializing Razorpay with Key ID: ${keyId.substring(0, 8)}...`);
        
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        // 2. Create Order
        // Razorpay expects amount in smallest currency unit
        const amountInSubunits = Math.round(parseFloat(amount) * 100);
        
        const options = {
            amount: amountInSubunits,
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        console.log(`[DEBUG] Creating Razorpay order with options:`, JSON.stringify(options));

        const order = await razorpay.orders.create(options);
        console.log(`[SUCCESS] Razorpay order created: ${order.id}`);
        
        return new Response(JSON.stringify(order), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error: any) {
        console.error("[ERROR] Razorpay Create Order Failure:", error);
        
        const errorMessage = error.description || error.message || 'Internal Server Error';
        
        return new Response(JSON.stringify({ 
            error: errorMessage,
            details: error
        }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}

