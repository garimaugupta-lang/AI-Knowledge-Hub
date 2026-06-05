import "dotenv/config";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { bootstrapStorage } from "../storage/bootstrap.js";
import { initDatabase, saveDatabase } from "../db/schema.js";

async function reindex() {
  const storagePath = bootstrapStorage();
  const db = await initDatabase(storagePath);
  const metadataDir = path.join(storagePath, "metadata");

  console.log("Re-indexing from metadata files...");

  db.run("DELETE FROM template_metadata");
  db.run("DELETE FROM template_embeddings");
  db.run("DELETE FROM templates");

  const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(metadataDir, file), "utf-8"));
    const templateId = content.id || path.parse(file).name;

    db.run(
      `INSERT INTO templates (id, title, phase, deliverable_type, sector, deal_structure, description, contributor_name, downloads, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, datetime('now'), datetime('now'))`,
      [
        templateId,
        content.title,
        content.phase,
        content.deliverable_type,
        content.sector,
        content.deal_structure,
        content.description || "",
        content.contributor_name || "Anonymous",
      ]
    );

    db.run(
      `INSERT INTO template_metadata (id, template_id, inputs_required, assumptions, confirmed_facts)
       VALUES (?, ?, ?, ?, ?)`,
      [
        uuid(),
        templateId,
        JSON.stringify(content.inputs_required || []),
        JSON.stringify(content.assumptions || []),
        JSON.stringify(content.confirmed_facts || []),
      ]
    );
  }

  saveDatabase();
  console.log(`Re-indexed ${files.length} templates from metadata files.`);
}

reindex().catch((err) => {
  console.error("Reindex failed:", err);
  process.exit(1);
});
