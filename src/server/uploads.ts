import path from "node:path";

/** Uploaded images live outside /public so they are served after a build too. */
export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const IMAGE_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

/**
 * Detects the image type from its first bytes instead of trusting the
 * browser-provided MIME type. SVG is deliberately not accepted (scripts).
 */
export function sniffImage(bytes: Uint8Array): keyof typeof IMAGE_TYPES | null {
  const b = bytes;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "gif";
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 8) === "ftyp" && /avi[fs]/.test(ascii(8, 12))) return "avif";
  return null;
}

/** Resolves a URL path segment list to a file inside UPLOAD_ROOT, or null. */
export function resolveUpload(segments: string[]) {
  if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\\"))) return null;
  const full = path.resolve(UPLOAD_ROOT, ...segments);
  if (!full.startsWith(UPLOAD_ROOT + path.sep)) return null;
  return full;
}
