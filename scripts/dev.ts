// Runs the Bun API (watch mode) and the Vite dev server together.
// The API always binds to API_PORT (default 3001); Vite uses the remaining
// PORT (default 5173). We override any inherited PORT so the two never collide.
const API_PORT = process.env.API_PORT ?? "3001";
const WEB_PORT = process.env.PORT ?? "3002";

const BUN = process.argv[0];

const api = Bun.spawn([BUN, "--watch", "server/index.ts"], {
  stdio: ["inherit", "inherit", "inherit"],
  env: { ...process.env, PORT: API_PORT },
});

const web = Bun.spawn([BUN, "x", "vite", "--port", WEB_PORT], {
  stdio: ["inherit", "inherit", "inherit"],
  env: { ...process.env, PORT: WEB_PORT },
});

function shutdown() {
  api.kill();
  web.kill();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await Promise.race([api.exited, web.exited]);
shutdown();
