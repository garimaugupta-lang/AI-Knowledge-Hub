import { Router, Request, Response } from "express";
import { type Database } from "sql.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import JSZip from "jszip";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { AIService, type RedactionReplacement } from "../services/ai.js";
import { parseDocument } from "../services/parser.js";
import { saveDatabase } from "../db/schema.js";
import { safePath } from "../utils/paths.js";

export function createUploadRoutes(
  db: Database,
  storagePath: string
): Router {
  const router = Router();
  const aiService = new AIService();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(storagePath, "originals"));
    },
    filename: (_req, file, cb) => {
      const id = uuid();
      const ext = path.extname(file.originalname);
      cb(null, `${id}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = [".docx", ".xlsx", ".pptx", ".pdf"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${ext} not supported. Allowed: ${allowed.join(", ")}`));
      }
    },
  });

  router.post("/", upload.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filename = req.file.filename;
    const uploadId = path.parse(filename).name;

    res.json({
      upload_id: uploadId,
      filename: req.file.originalname,
    });
  });

  router.post("/sanitise/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const originalsDir = safePath(storagePath, "originals");

    const files = fs.readdirSync(originalsDir).filter((f: string) => f.startsWith(id));

    if (files.length === 0) {
      res.status(404).json({ error: "Upload not found" });
      return;
    }

    const filePath = path.join(originalsDir, files[0]!);
    const ext = path.extname(filePath).toLowerCase();

    if (ext !== ".docx" && ext !== ".pptx") {
      res.status(400).json({ error: `Only .docx and .pptx files are supported for redaction. Got: ${ext}` });
      return;
    }

    try {
      const parsed = await parseDocument(filePath);
      const result = await aiService.sanitiseDocument(parsed.text);

      res.json({
        upload_id: id,
        original_filename: files[0],
        ...result,
        ai_mode: aiService.isConfigured() ? "claude" : "mock",
      });
    } catch (err: any) {
      console.error("Sanitisation error:", err);
      res.status(500).json({ error: err.message || "Sanitisation failed" });
    }
  });

  router.post("/publish/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      title,
      phase,
      deliverable_type,
      sector,
      deal_structure,
      description,
      contributor_name,
      inputs_required,
      assumptions,
      confirmed_facts,
      redacted_text,
      replacements,
    } = req.body;

    if (!title || !redacted_text) {
      res.status(400).json({ error: "title and redacted_text are required" });
      return;
    }

    const originalsDir = safePath(storagePath, "originals");
    const files = fs.readdirSync(originalsDir).filter((f: string) => f.startsWith(id));

    if (files.length === 0) {
      res.status(404).json({ error: "Upload not found" });
      return;
    }

    const originalFilename = files[0]!;
    const originalExt = path.extname(originalFilename).toLowerCase();

    try {
      const sanitisedFilename = `${id}${originalExt}`;
      const sanitisedPath = safePath(storagePath, "sanitised", sanitisedFilename);
      const originalFilePath = path.join(originalsDir, originalFilename);

      if (originalExt === ".pptx" || originalExt === ".docx") {
        // Find/replace directly inside the Office XML zip — preserves all formatting
        const originalBuffer = fs.readFileSync(originalFilePath);
        const zip = await JSZip.loadAsync(originalBuffer);

        const xmlFiles = Object.keys(zip.files).filter(
          (name) => name.endsWith(".xml") || name.endsWith(".rels")
        );

        const repls: RedactionReplacement[] = replacements || [];

        for (const xmlFile of xmlFiles) {
          let content = await zip.files[xmlFile]!.async("string");
          for (const r of repls) {
            // Replace in the XML text nodes (escape XML special chars in search)
            const escaped = r.original.replace(/[&<>"']/g, (c: string) => {
              const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
              return map[c] || c;
            });
            const escapedReplacement = r.replacement.replace(/[&<>"']/g, (c: string) => {
              const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
              return map[c] || c;
            });
            content = content.replaceAll(escaped, escapedReplacement);
          }
          zip.file(xmlFile, content);
        }

        const outputBuffer = await zip.generateAsync({ type: "nodebuffer" });
        fs.writeFileSync(sanitisedPath, outputBuffer);
      } else {
        // Fallback: generate a .docx from the redacted text
        const paragraphs = redacted_text.split("\n").map(
          (line: string) => new Paragraph({ children: [new TextRun(line)] })
        );
        const doc = new Document({ sections: [{ children: paragraphs }] });
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(sanitisedPath, buffer);
      }

      const templateId = id;
      const metadataId = uuid();

      db.run(
        `INSERT INTO templates (id, title, phase, deliverable_type, sector, deal_structure, description, original_filename, sanitised_filepath, contributor_name, downloads, verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`,
        [
          templateId,
          title,
          phase || "diligence",
          deliverable_type || "template",
          sector || "cross_sector",
          deal_structure || "acquisition",
          description || "",
          originalFilename,
          sanitisedFilename,
          contributor_name || "Anonymous",
        ]
      );

      db.run(
        `INSERT INTO template_metadata (id, template_id, inputs_required, assumptions, confirmed_facts)
         VALUES (?, ?, ?, ?, ?)`,
        [
          metadataId,
          templateId,
          JSON.stringify(inputs_required || []),
          JSON.stringify(assumptions || []),
          JSON.stringify(confirmed_facts || []),
        ]
      );

      saveDatabase();

      const sidecar = {
        id: templateId,
        title,
        phase: phase || "diligence",
        deliverable_type: deliverable_type || "template",
        sector: sector || "cross_sector",
        deal_structure: deal_structure || "acquisition",
        description: description || "",
        contributor_name: contributor_name || "Anonymous",
        original_filename: originalFilename,
        inputs_required: inputs_required || [],
        assumptions: assumptions || [],
        confirmed_facts: confirmed_facts || [],
        published_at: new Date().toISOString(),
      };

      const metadataPath = safePath(storagePath, "metadata", `${templateId}.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(sidecar, null, 2));

      res.json({
        id: templateId,
        title,
        message: "Template published successfully",
      });
    } catch (err: any) {
      console.error("Publish error:", err);
      res.status(500).json({ error: err.message || "Publish failed" });
    }
  });

  return router;
}
