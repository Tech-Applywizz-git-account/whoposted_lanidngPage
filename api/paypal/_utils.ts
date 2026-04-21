// export const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"; // Use https://api-m.paypal.com for live

// export async function generateAccessToken() {
//     const clientId = process.env.PAYPAL_CLIENT_ID;
//     const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

//     if (!clientId || !clientSecret) {
//         throw new Error("MISSING_API_CREDENTIALS");
//     }

//     const auth = btoa(clientId + ":" + clientSecret);

//     const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
//         method: "POST",
//         body: "grant_type=client_credentials",
//         headers: {
//             Authorization: `Basic ${auth}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//     });

//     const data = await response.json();
//     return data.access_token;
// }
























export const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

export async function generateAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("Missing credentials:", { clientId: !!clientId, clientSecret: !!clientSecret });
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
    if (!data.access_token) {
        console.error("PayPal Auth Error:", data);
        throw new Error("FAILED_TO_GENERATE_PAYPAL_TOKEN");
    }
    return data.access_token;
}






































// export const PAYPAL_API_BASE = "https://api-m.paypal.com"; // Use https://api-m.sandbox.paypal.com for live

// export async function generateAccessToken() {
//     const clientId = process.env.PAYPAL_CLIENT_ID;
//     const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

//     if (!clientId || !clientSecret) {
//         throw new Error("MISSING_API_CREDENTIALS");
//     }

//     const auth = btoa(clientId + ":" + clientSecret);

//     const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
//         method: "POST",
//         body: "grant_type=client_credentials",
//         headers: {
//             Authorization: `Basic ${auth}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//     });

//     const data = await response.json();
//     return data.access_token;
// }



