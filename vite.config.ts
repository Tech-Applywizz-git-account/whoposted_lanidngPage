// import path from "path"
// import react from "@vitejs/plugin-react"
// import { defineConfig } from "vite"
// import { inspectAttr } from 'kimi-plugin-inspect-react'

// // https://vite.dev/config/
// export default defineConfig({
//   base: './',
//   plugins: [inspectAttr(), react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });


















import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(), 
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/')) {
            console.log(`[Vite API] Incoming request: ${req.method} ${req.url}`);
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filePath = path.resolve(__dirname, `.${url.pathname}.ts`);
            
            try {
              console.log(`[Vite API] Loading handler from: ${filePath}`);
              const module = await server.ssrLoadModule(filePath);
              const handler = module.default;
              
              if (typeof handler === 'function') {
                console.log(`[Vite API] Handler found, processing...`);
                const chunks: any[] = [];
                req.on('data', chunk => {
                    console.log(`[Vite API] Received chunk of size: ${chunk.length}`);
                    chunks.push(chunk);
                });
                req.on('end', async () => {
                  try {
                    console.log(`[Vite API] Request body complete.`);
                    const body = Buffer.concat(chunks).toString();
                    
                    // Merge Vite-loaded env into process.env for the handler
                    Object.assign(process.env, server.config.env);

                    const webReq = new Request(`http://${req.headers.host}${req.url}`, {
                      method: req.method,
                      headers: req.headers as any,
                      body: req.method !== 'GET' && req.method !== 'HEAD' && body.length > 0 ? body : null,
                    });
                    
                    console.log(`[Vite API] Executing handler...`);
                    const response = await handler(webReq);
                    console.log(`[Vite API] Handler finished with status: ${response.status}`);
                    
                    res.statusCode = response.status;
                    response.headers.forEach((value: string, key: string) => {
                      res.setHeader(key, value);
                    });
                    const resBody = await response.text();
                    res.end(resBody);
                    console.log(`[Vite API] Response sent.`);
                  } catch (e: any) {
                    console.error("[Vite API] Error in handler execution:", e);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: e.message || 'Internal Server Error' }));
                  }
                });
                return;
              } else {
                console.warn(`[Vite API] Handler in ${filePath} is not a function!`);
              }
            } catch (e: any) {
              console.error(`[Vite API] Error loading/executing API handler ${filePath}:`, e);
              res.statusCode = 404;
              res.end(JSON.stringify({ error: `API route not found or failed to load: ${e.message}` }));
              return;
            }
          }
          next();
        });
      }

    }
  ],
  envPrefix: ['VITE_', 'PAYPAL_', 'SUPABASE_', 'MS_', 'RAZORPAY_'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
