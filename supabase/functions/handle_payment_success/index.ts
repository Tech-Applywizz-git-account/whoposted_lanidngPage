import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MS365_CONFIG = {
    tenant_id: "dd60b066-1b78-4515-84fb-a565c251cb5a",
    client_id: "4116ded8-f37d-4a78-9134-25a39e91bb41",
    client_secret: "R_c8Q~XSSWy2Tk5GkRbkSURzW1zgKIjI1mjVfcS8",
    from_email: "support@applywizz.com",
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getMicrosoftAccessToken() {
    const tokenUrl = `https://login.microsoftonline.com/${MS365_CONFIG.tenant_id}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
        client_id: MS365_CONFIG.client_id,
        scope: 'https://graph.microsoft.com/.default',
        client_secret: MS365_CONFIG.client_secret,
        grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get MS access token: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, transaction_id, full_name } = await req.json()

        // 1. Initialize Supabase Admin Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || "https://davfhscenualgngvedna.supabase.co"
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmZoc2NlbnVhbGduZ3ZlZG5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAxMDQ5NiwiZXhwIjoyMDg1NTg2NDk2fQ.uvYG8A6CWh8rgP0jmWUmqINZ8oYI2Y4h2sq59kLv3wA"
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 2. Create User
        const password = "Applywizz@123"
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: full_name }
        })

        if (userError) {
            console.error('Error creating user (might already exist):', userError.message)
            // Proceed to send email anyway, usually good practice so user gets their info again or similar
        }

        // 3. Send Email using Microsoft Graph API
        try {
            console.log("Attempting to send email via Microsoft Graph. Tenant ID:", MS365_CONFIG.tenant_id);
            const accessToken = await getMicrosoftAccessToken();

            const emailPayload = {
                message: {
                    subject: "Welcome to WhoPosted! Access Details",
                    body: {
                        contentType: "HTML",
                        content: `
                            <h1>Payment Successful!</h1>
                            <p>Hello ${full_name},</p>
                            <p>Thank you for your purchase. Here are your access details:</p>
                            <ul>
                                <li><strong>Email:</strong> ${email}</li>
                                <li><strong>Password:</strong> ${password}</li>
                                <li><strong>Transaction ID:</strong> ${transaction_id}</li>
                            </ul>
                            <p>You can login now to access the verification database.</p>
                        `
                    },
                    toRecipients: [
                        {
                            emailAddress: {
                                address: email
                            }
                        }
                    ]
                },
                saveToSentItems: "true"
            };

            const sendResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${MS365_CONFIG.from_email}/sendMail`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailPayload)
            });

            if (!sendResponse.ok) {
                const errorText = await sendResponse.text();
                console.error("Failed to send email via MS Graph:", errorText);
            } else {
                console.log("Email sent successfully via MS Graph");
            }

        } catch (emailErr) {
            console.error("Email sending process failed:", emailErr);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
