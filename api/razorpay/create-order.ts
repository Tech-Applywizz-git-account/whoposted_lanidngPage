export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] Razorpay Create Order API called (Fetch Mode).`);
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { amount, currency = "USD" } = body;
        
        const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();

        if (!keyId || !keySecret) {
            console.error(`[${requestId}] [CRITICAL] Razorpay Keys are MISSING!`);
            return new Response(JSON.stringify({ 
                error: 'Razorpay configuration missing on server.',
                details: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set.'
            }), { status: 500 });
        }

        // Razorpay expects amount in smallest currency unit
        const amountInSubunits = Math.round(parseFloat(amount) * 100);
        
        const payload = {
            amount: amountInSubunits,
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        console.log(`[${requestId}] [DEBUG] Sending request to Razorpay API...`);

        const auth = btoa(`${keyId}:${keySecret}`);
        
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error(`[${requestId}] [RAZORPAY ERROR]`, data);
            return new Response(JSON.stringify({ 
                error: data.error?.description || 'Razorpay API Error',
                details: data
            }), { status: response.status });
        }

        console.log(`[${requestId}] [SUCCESS] Order created: ${data.id}`);
        
        return new Response(JSON.stringify(data), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error: any) {
        console.error(`[${requestId}] [FATAL ERROR]`, error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
}




