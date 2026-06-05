import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getStoragePath(): string {
  const envPath = process.env.STORAGE_PATH;
  if (envPath) {
    return path.resolve(envPath);
  }
  return path.resolve(__dirname, "../../../../storage");
}

export function safePath(basePath: string, ...segments: string[]): string {
  const resolved = path.resolve(basePath, ...segments);
  if (!resolved.startsWith(basePath)) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}
