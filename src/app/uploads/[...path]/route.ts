import { readFile } from "node:fs/promises";
import path from "node:path";

import { IMAGE_TYPES, resolveUpload } from "~/server/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const file = resolveUpload(segments);
  const ext = file ? path.extname(file).slice(1).toLowerCase() : "";
  const type = IMAGE_TYPES[ext];
  if (!file || !type) return new Response("Bulunamadı", { status: 404 });

  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        // names are random and never reused, so they can be cached forever
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
