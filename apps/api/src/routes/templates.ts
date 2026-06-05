import { Router, Request, Response } from "express";
import { type Database } from "sql.js";
import fs from "fs";
import path from "path";
import { safePath } from "../utils/paths.js";
import { saveDatabase } from "../db/schema.js";

export function createTemplateRoutes(
  db: Database,
  storagePath: string
): Router {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    const { phase, type, sector, q } = req.query;

    let sql = `
      SELECT t.*, tm.inputs_required, tm.assumptions, tm.confirmed_facts
      FROM templates t
      LEFT JOIN template_metadata tm ON tm.template_id = t.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (phase) {
      sql += " AND t.phase = ?";
      params.push(phase as string);
    }
    if (type) {
      sql += " AND t.deliverable_type = ?";
      params.push(type as string);
    }
    if (sector) {
      sql += " AND t.sector = ?";
      params.push(sector as string);
    }
    if (q) {
      sql += " AND (t.title LIKE ? OR t.description LIKE ?)";
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += " ORDER BY t.updated_at DESC";

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const results: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        verified: Boolean(row.verified),
        metadata: row.inputs_required
          ? {
              inputs_required: JSON.parse(row.inputs_required as string),
              assumptions: JSON.parse(row.assumptions as string),
              confirmed_facts: JSON.parse(row.confirmed_facts as string),
            }
          : null,
      });
    }
    stmt.free();

    res.json({ templates: results, total: results.length });
  });

  router.get("/:id", (req: Request, res: Response) => {
    const { id } = req.params;

    const stmt = db.prepare(`
      SELECT t.*, tm.inputs_required, tm.assumptions, tm.confirmed_facts
      FROM templates t
      LEFT JOIN template_metadata tm ON tm.template_id = t.id
      WHERE t.id = ?
    `);
    stmt.bind([id]);

    if (!stmt.step()) {
      stmt.free();
      res.status(404).json({ error: "Template not found" });
      return;
    }

    const row = stmt.getAsObject();
    stmt.free();

    const result = {
      ...row,
      verified: Boolean(row.verified),
      metadata: row.inputs_required
        ? {
            inputs_required: JSON.parse(row.inputs_required as string),
            assumptions: JSON.parse(row.assumptions as string),
            confirmed_facts: JSON.parse(row.confirmed_facts as string),
          }
        : null,
    };

    res.json(result);
  });

  router.get("/:id/download", (req: Request, res: Response) => {
    const { id } = req.params;

    const stmt = db.prepare("SELECT * FROM templates WHERE id = ?");
    stmt.bind([id]);

    if (!stmt.step()) {
      stmt.free();
      res.status(404).json({ error: "Template not found" });
      return;
    }

    const template = stmt.getAsObject();
    stmt.free();

    if (!template.sanitised_filepath) {
      res.status(404).json({ error: "No file available for download" });
      return;
    }

    const filePath = safePath(storagePath, "sanitised", template.sanitised_filepath as string);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found on disk" });
      return;
    }

    db.run("UPDATE templates SET downloads = downloads + 1 WHERE id = ?", [id]);
    saveDatabase();

    res.download(filePath, (template.original_filename as string) || path.basename(filePath));
  });

  return router;
}
