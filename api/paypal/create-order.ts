import { generateAccessToken, PAYPAL_API_BASE } from './_utils';

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] PayPal Create Order API called.`);
    
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await request.json();
        const amount = '4.99';

        console.log(`[${requestId}] [DEBUG] Generating PayPal access token...`);
        const accessToken = await generateAccessToken();
        const url = `${PAYPAL_API_BASE}/v2/checkout/orders`;

        const payload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: amount,
                    },
                },
            ],
        };

        console.log(`[${requestId}] [DEBUG] Creating PayPal order...`);
        
        // Add timeout to PayPal API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
        
        let response;
        try {
            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
        } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error(`[${requestId}] [TIMEOUT] PayPal API request timed out`);
                return new Response(JSON.stringify({ 
                    error: "PayPal API timed out. Please try again.",
                    type: "TimeoutError"
                }), { 
                    status: 504,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            throw fetchError;
        }

        const data = await response.json();

        if (!response.ok) {
            console.error(`[${requestId}] [PAYPAL ERROR] Status: ${response.status}`, data);
            return new Response(JSON.stringify({ 
                error: data.message || data.error || 'PayPal API rejected the request',
                details: data
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log(`[${requestId}] [SUCCESS] PayPal order created: ${data.id}`);
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        console.error(`[${requestId}] [FATAL ERROR] Failed to create order:`, error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
