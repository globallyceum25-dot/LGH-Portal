// Lightweight local reverse proxy to forward traffic from standard port 80 to custom ports
// Usage: sudo bun scripts/local-proxy.ts

import { serve } from "bun";

const PORT = 80;
const VITE_PORT = 5173;
const API_PORT = 3001;

const VITE_TARGET = `http://localhost:${VITE_PORT}`;
const API_TARGET = `http://localhost:${API_PORT}`;

console.log("🌌 Lyceum Local Proxy");
console.log("====================");
console.log(`🚀 Starting reverse proxy on port ${PORT}...`);
console.log(`👉 Routing /api/* requests to ${API_TARGET}`);
console.log(`👉 Routing all other requests to ${VITE_TARGET}`);

try {
  serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);
      const isApi = url.pathname.startsWith("/api/");
      const targetBase = isApi ? API_TARGET : VITE_TARGET;
      const targetUrl = `${targetBase}${url.pathname}${url.search}`;

      console.log(`➡️  Proxying [${req.method}] ${url.pathname} -> ${targetUrl}`);

      const headers = new Headers(req.headers);
      headers.set("host", new URL(targetBase).host);

      try {
        const response = await fetch(targetUrl, {
          method: req.method,
          headers,
          body: req.body,
          redirect: "manual",
        });
        return response;
      } catch (err: any) {
        console.error(`❌ Connection failed to ${targetUrl}: ${err.message}`);
        return new Response(
          `<html>
            <body style="font-family:sans-serif;text-align:center;padding:40px;background:#05070e;color:#e7ecfb">
              <h2>Proxy Target Unreachable</h2>
              <p style="color:#93a0c4">The local development server is not running on port <b>${isApi ? API_PORT : VITE_PORT}</b>.</p>
              <p style="color:#93a0c4">Please start the local dev server using <code>bun run dev</code> and refresh.</p>
            </body>
          </html>`,
          {
            status: 502,
            headers: { "Content-Type": "text/html" },
          }
        );
      }
    }
  });
} catch (e: any) {
  if (e.code === "EACCES") {
    console.error("❌ Permission Denied: Port 80 requires administrative privileges.");
    console.error("\nPlease execute the proxy using sudo:");
    console.error("  sudo bun scripts/local-proxy.ts\n");
  } else {
    console.error(`❌ Failed to start proxy server: ${e.message}`);
  }
  process.exit(1);
}
