export default async function handler(req: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] Razorpay Create Order API called (Node.js Runtime).`);
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    let amount, currency;
    try {
        const bodyText = await req.text();
        const body = JSON.parse(bodyText);
        amount = body.amount;
        currency = body.currency || "USD";
    } catch (err: any) {
        return new Response(JSON.stringify({ error: `Invalid Request Body: ${err.message}` }), { status: 400 });
    }

    try {
        const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();

        if (!keyId || !keySecret) {
            return new Response(JSON.stringify({ 
                error: 'Razorpay configuration missing on server.',
                details: `KeyId Present: ${!!keyId}, KeySecret Present: ${!!keySecret}`
            }), { status: 500 });
        }

        // Razorpay expects amount in smallest currency unit
        const amountInSubunits = Math.round(parseFloat(amount) * 100);
        
        const payload = {
            amount: amountInSubunits,
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        
        console.log(`[${requestId}] [DEBUG] Fetching Razorpay... Key starts with: ${keyId.substring(0, 8)}`);

        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'WhoPosted-Server-v1'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await rzpResponse.text();
        console.log(`[${requestId}] [DEBUG] Razorpay Raw Response (first 200 chars): ${responseText.substring(0, 200)}`);

        if (!responseText) {
            throw new Error(`Razorpay returned an empty response. Status: ${rzpResponse.status} ${rzpResponse.statusText}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Razorpay returned non-JSON: ${responseText.substring(0, 100)}`);
        }
        
        if (!rzpResponse.ok) {
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






