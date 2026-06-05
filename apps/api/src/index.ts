import "dotenv/config";
import express from "express";
import cors from "cors";
import { bootstrapStorage } from "./storage/bootstrap.js";
import { initDatabase, saveDatabase } from "./db/schema.js";
import { seedDatabase } from "./db/seed.js";
import { createTemplateRoutes } from "./routes/templates.js";
import { createUploadRoutes } from "./routes/upload.js";
import { createSearchRoutes } from "./routes/search.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function start() {
  const storagePath = bootstrapStorage();
  const db = await initDatabase(storagePath);
  seedDatabase(db, storagePath);
  saveDatabase();

  app.get("/", (_req, res) => {
    res.json({ name: "Deal Knowledge Hub API", version: "0.1.0", docs: "/api/health" });
  });

  app.get("/api/health", (_req, res) => {
    const result = db.exec("SELECT COUNT(*) as count FROM templates");
    const count = result[0]?.values[0]?.[0] ?? 0;
    res.json({ status: "ok", templates: count });
  });

  app.use("/api/templates", createTemplateRoutes(db, storagePath));
  app.use("/api/upload", createUploadRoutes(db, storagePath));
  app.use("/api/search", createSearchRoutes(db));

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
