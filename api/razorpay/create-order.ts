export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] Razorpay Create Order API called.`);
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    let amount, currency;
    try {
        const bodyText = await req.text();
        if (!bodyText) {
            throw new Error("Request body is empty");
        }
        const body = JSON.parse(bodyText);
        amount = body.amount;
        currency = body.currency || "USD";
    } catch (err: any) {
        console.error(`[${requestId}] [ERROR] Failed to parse request body:`, err);
        return new Response(JSON.stringify({ error: `Invalid Request Body: ${err.message}` }), { status: 400 });
    }

    try {
        const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();

        if (!keyId || !keySecret) {
            return new Response(JSON.stringify({ 
                error: 'Razorpay configuration missing on server.',
                details: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set.'
            }), { status: 500 });
        }

        const amountInSubunits = Math.round(parseFloat(amount) * 100);
        
        const payload = {
            amount: amountInSubunits,
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        const auth = btoa(`${keyId}:${keySecret}`);
        
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await rzpResponse.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error(`[${requestId}] [ERROR] Failed to parse Razorpay response:`, responseText);
            throw new Error(`Razorpay returned non-JSON response: ${responseText.substring(0, 100)}`);
        }
        
        if (!rzpResponse.ok) {
            console.error(`[${requestId}] [RAZORPAY ERROR]`, data);
            return new Response(JSON.stringify({ 
                error: data.error?.description || 'Razorpay API Error',
                details: data
            }), { status: rzpResponse.status });
        }

        return new Response(JSON.stringify(data), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error: any) {
        console.error(`[${requestId}] [FATAL ERROR]`, error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
}





