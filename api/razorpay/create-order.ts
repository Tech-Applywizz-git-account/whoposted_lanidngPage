export default async function handler(req: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] Razorpay Create Order API called.`);
    
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    let amount, currency;
    try {
        const bodyText = await req.text();
        const body = JSON.parse(bodyText || '{}');
        amount = body.amount;
        currency = body.currency || "USD";
        if (!amount) throw new Error("Amount is required");
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return new Response(JSON.stringify({ error: `Invalid Request: ${message}` }), { status: 400 });
    }

    try {
        const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();

        if (!keyId || !keySecret) {
            console.error(`[${requestId}] [ERROR] Razorpay keys not found`);
            return new Response(JSON.stringify({ 
                error: 'Razorpay keys not found in environment.',
                details: `ID: ${!!keyId}, Secret: ${!!keySecret}`
            }), { status: 500 });
        }

        const amountInSubunits = Math.round(parseFloat(amount) * 100);
        const payload = {
            amount: amountInSubunits,
            currency: currency,
            receipt: `rcpt_${Date.now()}`
        };

        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        
        console.log(`[${requestId}] [DEBUG] Calling Razorpay API for ${amount} ${currency}...`);

        // Add an internal timeout for the fetch call to Razorpay
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
        
        let rzpResponse;
        try {
            rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'WhoPosted-Production-Server'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error(`[${requestId}] [TIMEOUT] Razorpay API request timed out`);
                return new Response(JSON.stringify({ 
                    error: "Razorpay API timed out. Please try again.",
                    type: "TimeoutError"
                }), { status: 504 });
            }
            throw fetchError;
        }

        const responseText = await rzpResponse.text();
        
        if (!rzpResponse.ok) {
            console.error(`[${requestId}] [RAZORPAY ERROR] Status: ${rzpResponse.status}`, responseText);
            let errorData;
            try { errorData = JSON.parse(responseText); } catch { errorData = { raw: responseText }; }
            return new Response(JSON.stringify({ 
                error: errorData.error?.description || 'Razorpay API rejected the request',
                details: errorData
            }), { status: rzpResponse.status });
        }

        const data = JSON.parse(responseText);
        console.log(`[${requestId}] [SUCCESS] Order created: ${data.id}`);
        return new Response(JSON.stringify(data), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error: unknown) {
        console.error(`[${requestId}] [FATAL ERROR]`, error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        const name = error instanceof Error ? error.name : 'UnknownError';
        return new Response(JSON.stringify({ 
            error: message,
            type: name
        }), { status: 500 });
    }
}







