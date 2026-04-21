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
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filePath = path.resolve(__dirname, `.${url.pathname}.ts`);
            
            try {
              const module = await server.ssrLoadModule(filePath);
              const handler = module.default;
              
              if (typeof handler === 'function') {
                // Merge Vite-loaded env into process.env for the handler
                Object.assign(process.env, server.config.env);
                // If they are standard Node handlers (req, res), just call them
                // Most handlers here look like Edge functions: export default async function handler(req: Request)
                
                const chunks: any[] = [];
                req.on('data', chunk => chunks.push(chunk));
                req.on('end', async () => {
                  try {
                    const body = Buffer.concat(chunks).toString();
                    
                    // Simple shim for Request/Response
                    const webReq = new Request(`http://${req.headers.host}${req.url}`, {
                      method: req.method,
                      headers: req.headers as any,
                      body: req.method !== 'GET' && req.method !== 'HEAD' && body.length > 0 ? body : null,
                    });
                    
                    const response = await handler(webReq);
                    res.statusCode = response.status;
                    response.headers.forEach((value: string, key: string) => {
                      res.setHeader(key, value);
                    });
                    const resBody = await response.text();
                    res.end(resBody);
                  } catch (e: any) {
                    console.error("API Error in middleware:", e);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: e.message || 'Internal Server Error' }));
                  }
                });
                return;
              }
            } catch (e) {
              console.error(`Error loading API handler ${filePath}:`, e);
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'API route not found or failed to load' }));
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
