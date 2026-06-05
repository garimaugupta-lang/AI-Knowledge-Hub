import mammoth from "mammoth";
import officeParser from "officeparser";
import fs from "fs";
import path from "path";

export interface ParseResult {
  text: string;
}

export async function parseDocument(filePath: string): Promise<ParseResult> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".docx") {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value };
  }

  if (ext === ".pptx") {
    const text: string = await new Promise((resolve, reject) => {
      officeParser.parseOffice(filePath, (data: any, err: any) => {
        if (err) reject(err);
        else resolve(data.toText());
      });
    });
    return { text };
  }

  throw new Error(`File type ${ext} not yet supported. Supported: .docx, .pptx`);
}
