import { Router, Request, Response } from "express";
import { type Database } from "sql.js";

export function createSearchRoutes(db: Database): Router {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ error: "Query parameter 'q' is required" });
      return;
    }

    const searchTerm = `%${q}%`;
    const stmt = db.prepare(`
      SELECT t.*, tm.inputs_required, tm.assumptions, tm.confirmed_facts
      FROM templates t
      LEFT JOIN template_metadata tm ON tm.template_id = t.id
      WHERE t.title LIKE ? OR t.description LIKE ?
      ORDER BY t.downloads DESC
      LIMIT 20
    `);
    stmt.bind([searchTerm, searchTerm]);

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

    res.json({ templates: results, total: results.length, query: q });
  });

  return router;
}
