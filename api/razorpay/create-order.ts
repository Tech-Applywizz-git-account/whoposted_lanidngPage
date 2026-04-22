import Razorpay from 'razorpay';

export default async function handler(req: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] Razorpay Create Order API called.`);
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { amount, currency = "USD" } = body;
        
        console.log(`[${requestId}] [DEBUG] Amount: ${amount}, Currency: ${currency}`);

        // 1. Initialize Razorpay Server Client
        const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();

        if (!keyId || !keySecret) {
            console.error(`[${requestId}] [CRITICAL] Razorpay Keys are MISSING!`);
            return new Response(JSON.stringify({ 
                error: 'Razorpay configuration missing on server.',
                details: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set.'
            }), { status: 500 });
        }

        console.log(`[${requestId}] [DEBUG] Initializing Razorpay Instance...`);
        
        // Handle potential import issues in different environments
        let RazorpayConstructor = Razorpay as any;
        if (RazorpayConstructor.default) {
            RazorpayConstructor = RazorpayConstructor.default;
        }

        const razorpay = new RazorpayConstructor({
            key_id: keyId,
            key_secret: keySecret,
        });

        // 2. Create Order
        const amountInSubunits = Math.round(parseFloat(amount) * 100);
        
        const options = {
            amount: amountInSubunits,
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        console.log(`[${requestId}] [DEBUG] Calling razorpay.orders.create with options:`, options);

        // Manually wrap in a promise to handle SDK versions that might prefer callbacks
        const order = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Razorpay API Timeout")), 15000);
            
            razorpay.orders.create(options, (err: any, order: any) => {
                clearTimeout(timeout);
                if (err) {
                    console.error(`[${requestId}] [SDK ERROR]`, err);
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });
        
        console.log(`[${requestId}] [SUCCESS] Order created: ${(order as any).id}`);
        
        return new Response(JSON.stringify(order), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error: any) {
        console.error(`[${requestId}] [ERROR] Razorpay Failure:`, error);
        
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



