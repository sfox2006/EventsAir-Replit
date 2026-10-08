import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
dotenv.config({ path: path.join(root, ".env"), quiet: true });
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be an integer between 1 and 65535");
const dist = path.join(root, "dist");
if (!existsSync(path.join(dist, "index.html")))
  throw new Error("Missing dist/index.html. Run npm run build first.");
const app = express();
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(express.static(dist));
app.use((req, res) => {
  if (
    ["GET", "HEAD"].includes(req.method) &&
    req.accepts("html") &&
    !/^\/api(?:\/|$)/.test(req.path) &&
    !path.extname(req.path) &&
    !req.path.startsWith("/assets/")
  )
    return res.sendFile(path.join(dist, "index.html"));
  res.status(404).json({ error: "Not found" });
});
app.listen(port, "0.0.0.0", () =>
  console.log(`EventsAir demo listening on port ${port}`),
);
