export default async function handler(req: Request) {
    const results: any = {
        time: new Date().toISOString(),
        env: {
            RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
            RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
            VITE_RAZORPAY_KEY_ID: !!process.env.VITE_RAZORPAY_KEY_ID,
            VITE_RAZORPAY_KEY_SECRET: !!process.env.VITE_RAZORPAY_KEY_SECRET,
        },
        nodeVersion: process.version,
    };

    try {
        const start = Date.now();
        const res = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'GET',
            headers: { 'User-Agent': 'WhoPosted-Diagnostics' },
            signal: AbortSignal.timeout(5000)
        });
        results.razorpay_connectivity = {
            status: res.status,
            duration: Date.now() - start,
            ok: res.ok
        };
    } catch (e: any) {
        results.razorpay_connectivity = { error: e.message };
    }

    return new Response(JSON.stringify(results), { 
        headers: { 'Content-Type': 'application/json' } 
    });
}
