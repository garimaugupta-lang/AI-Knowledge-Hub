import initSqlJs, { type Database } from "sql.js";
import fs from "fs";
import path from "path";

export type { Database } from "sql.js";

let db: Database;
let dbPath: string;

export async function initDatabase(storagePath: string): Promise<Database> {
  dbPath = path.join(storagePath, "hub.db");
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      phase TEXT NOT NULL,
      deliverable_type TEXT NOT NULL,
      sector TEXT NOT NULL,
      deal_structure TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      original_filename TEXT,
      sanitised_filepath TEXT,
      contributor_name TEXT NOT NULL DEFAULT 'Anonymous',
      downloads INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS template_metadata (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL UNIQUE,
      inputs_required TEXT NOT NULL DEFAULT '[]',
      assumptions TEXT NOT NULL DEFAULT '[]',
      confirmed_facts TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS template_embeddings (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL UNIQUE,
      embedding BLOB,
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    )
  `);

  db.run("CREATE INDEX IF NOT EXISTS idx_templates_phase ON templates(phase)");
  db.run("CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(deliverable_type)");
  db.run("CREATE INDEX IF NOT EXISTS idx_templates_sector ON templates(sector)");

  saveDatabase();
  console.log(`Database initialized at: ${dbPath}`);
  return db;
}

export function saveDatabase(): void {
  if (db && dbPath) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}
