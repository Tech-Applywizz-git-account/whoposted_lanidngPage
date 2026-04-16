
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
        const { orderID, user_email, full_name, mobile_number, country_code } = await req.json();

        if (!orderID) {
            return new Response(JSON.stringify({ error: 'Missing orderID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        const accessToken = await generateAccessToken();
        const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        // If capture successful, save to Supabase
        if (response.ok && data.status === 'COMPLETED') {
            try {
                // Initialize Supabase Client with HARDCODED credentials
                // Use the SERVICE_ROLE_KEY (not anon key) to bypass RLS for server-side writes
                const supabaseUrl = "https://davfhscenualgngvedna.supabase.co";
                const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmZoc2NlbnVhbGduZ3ZlZG5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAxMDQ5NiwiZXhwIjoyMDg1NTg2NDk2fQ.uvYG8A6CWh8rgP0jmWUmqINZ8oYI2Y4h2sq59kLv3wA";
                const supabase = createClient(supabaseUrl, supabaseKey);

                const purchaseUnit = data.purchase_units?.[0];
                const capture = purchaseUnit?.payments?.captures?.[0];
                const payer = data.payer;

                console.log("Attempting to insert transaction for:", user_email);

                const { error } = await supabase.from('transactions').insert({
                    user_email: user_email || 'unknown@example.com',
                    order_id: data.id,
                    transaction_id: capture?.id,
                    transaction_status: data.status,
                    amount: capture?.amount?.value,
                    currency: capture?.amount?.currency_code,
                    payer_email: payer?.email_address,
                    payer_name: `${payer?.name?.given_name} ${payer?.name?.surname}`,
                    full_response: data,
                    full_name: full_name,
                    mobile_number: mobile_number,
                    country_code: country_code
                });

                if (error) {
                    console.error('Supabase Insert Error:', JSON.stringify(error));
                } else {
                    console.log('Transaction saved successfully');

                    // Call the handle_payment_success function
                    try {
                        const functionUrl = `${supabaseUrl}/functions/v1/handle_payment_success`;
                        await fetch(functionUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${supabaseKey}`
                            },
                            body: JSON.stringify({
                                email: user_email,
                                transaction_id: capture?.id,
                                full_name: full_name
                            })
                        });
                        console.log('Triggered payment success handler');
                    } catch (fnError) {
                        console.error('Failed to trigger success handler:', fnError);
                    }
                }
            } catch (dbError) {
                console.error('Database Operation Failed:', dbError);
            }
        }

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    } catch (error: any) {
        console.error("Failed to capture order:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
