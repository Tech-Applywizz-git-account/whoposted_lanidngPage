
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"; // Use https://api-m.paypal.com for live

async function generateAccessToken() {
    const clientId = "AcYuhmCAUCY5XhrzPskgsOrYeLxES5qD7n-kBcEhBY6xosFgg79Qijsut0C891NEV8Dso2diLaucZ5ZD";
    const clientSecret = "EAiFPObWbJqFFRKjYwl0WCb6kfIZLu9XxsTHMjqGyT2X1izr7hiA67fQrlVU7u4iugE17-vJTEcWRPDA";

    if (!clientId || !clientSecret) {
        throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = btoa(clientId + ":" + clientSecret);

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const data = await response.json();
    return data.access_token;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    try {
        const { cart } = await req.json();
        const amount = '0.01';

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

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    } catch (error: any) {
        console.error("Failed to create order:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
