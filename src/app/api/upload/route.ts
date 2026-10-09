import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "~/server/session";
import { MAX_UPLOAD_BYTES, sniffImage, UPLOAD_ROOT } from "~/server/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ok = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!ok) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Dosya 8 MB'tan büyük olamaz" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext) {
    return NextResponse.json(
      { error: "Sadece PNG, JPG, WEBP, GIF veya AVIF yüklenebilir" },
      { status: 415 },
    );
  }

  const now = new Date();
  const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const name = `${randomBytes(10).toString("hex")}.${ext}`;
  await mkdir(path.join(UPLOAD_ROOT, folder), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, folder, name), bytes);

  return NextResponse.json({ url: `/uploads/${folder}/${name}` });
}
