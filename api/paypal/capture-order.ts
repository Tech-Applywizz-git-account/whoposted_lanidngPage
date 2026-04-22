import { generateAccessToken, PAYPAL_API_BASE } from './_utils';

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] [INFO] PayPal Capture Order API called.`);
    
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { orderID } = await request.json();

        if (!orderID) {
            console.error(`[${requestId}] [ERROR] Missing orderID`);
            return new Response(JSON.stringify({ error: 'Missing orderID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log(`[${requestId}] [DEBUG] Capturing PayPal order: ${orderID}`);
        const accessToken = await generateAccessToken();
        const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`;

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
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
        } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error(`[${requestId}] [TIMEOUT] PayPal capture request timed out`);
                return new Response(JSON.stringify({ 
                    error: "PayPal capture timed out. Please try again.",
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
            console.error(`[${requestId}] [PAYPAL CAPTURE ERROR] Status: ${response.status}`, data);
            return new Response(JSON.stringify({ 
                error: data.message || data.error || 'PayPal capture failed',
                details: data
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log(`[${requestId}] [SUCCESS] PayPal order captured: ${orderID}`);
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        console.error(`[${requestId}] [FATAL ERROR] Failed to capture order:`, error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
