import { plainText, slugify, wordCount } from "~/lib/rich/extract";
import type { RichNode } from "~/lib/rich/types";
import { SITE } from "~/lib/site";

/**
 * A small, honest SEO review for a post, run live in the editor. It checks
 * the things that actually help a tutorial get found: a clear topic phrase
 * used in the right places, a snippet Google can show in full, a real outline,
 * and enough substance to be worth ranking.
 */

export type Level = "baslangic" | "orta" | "ileri";

export const LEVELS: { id: Level; label: string; schema: string }[] = [
  { id: "baslangic", label: "Başlangıç", schema: "Beginner" },
  { id: "orta", label: "Orta", schema: "Intermediate" },
  { id: "ileri", label: "İleri", schema: "Expert" },
];

export const TITLE_SUFFIX = ` — ${SITE.name}`;

/** the title Google and the browser tab show */
export function finalTitle(p: { title: string; seoTitle?: string | null }) {
  const custom = p.seoTitle?.trim();
  if (custom) return custom;
  return `${p.title.trim()}${TITLE_SUFFIX}`;
}

/** the snippet under the link */
export function finalDescription(p: {
  excerpt: string;
  seoDescription?: string | null;
}) {
  const custom = p.seoDescription?.trim();
  if (custom) return custom;
  return p.excerpt.trim();
}

export type CheckState = "good" | "warn" | "bad";
export interface Check {
  id: string;
  state: CheckState;
  text: string;
}

/** case- and accent-tolerant "does this text mention the phrase" */
function mentions(text: string, phrase: string) {
  const norm = (s: string) => ` ${slugify(s).replace(/-/g, " ")} `;
  const p = norm(phrase).trim();
  return p.length > 0 && norm(text).includes(` ${p} `);
}

interface Outline {
  headings: { level: number; text: string }[];
  firstParagraph: string;
  images: number;
  imagesWithoutAlt: number;
  codeBlocks: number;
  codeWithoutLanguage: number;
  internalLinks: number;
  externalLinks: number;
}

function outline(doc: RichNode): Outline {
  const o: Outline = {
    headings: [],
    firstParagraph: "",
    images: 0,
    imagesWithoutAlt: 0,
    codeBlocks: 0,
    codeWithoutLanguage: 0,
    internalLinks: 0,
    externalLinks: 0,
  };
  const walk = (n: RichNode) => {
    if (n.type === "heading")
      o.headings.push({
        level: Number(n.attrs?.level ?? 2),
        text: plainText(n),
      });
    if (n.type === "paragraph" && !o.firstParagraph) {
      const t = plainText(n).trim();
      if (t) o.firstParagraph = t;
    }
    if (n.type === "image") {
      o.images++;
      if (!(typeof n.attrs?.alt === "string" ? n.attrs.alt : "").trim()) o.imagesWithoutAlt++;
    }
    if (n.type === "codeBlock") {
      o.codeBlocks++;
      if (!n.attrs?.language) o.codeWithoutLanguage++;
    }
    n.marks?.forEach((m) => {
      if (m.type !== "link") return;
      const href = typeof m.attrs?.href === "string" ? m.attrs.href : "";
      if (href.startsWith("/")) o.internalLinks++;
      else if (/^https?:/.test(href)) o.externalLinks++;
    });
    n.content?.forEach(walk);
  };
  walk(doc);
  return o;
}

export function seoChecks(p: {
  title: string;
  seoTitle: string | null;
  excerpt: string;
  seoDescription: string | null;
  slug: string;
  focusKeyword: string | null;
  coverImage: string | null;
  doc: RichNode;
}) {
  const kw = p.focusKeyword?.trim() ?? "";
  const title = finalTitle(p);
  const desc = finalDescription(p);
  const o = outline(p.doc);
  const words = wordCount(p.doc);
  const h2 = o.headings.filter((h) => h.level === 2);
  const checks: Check[] = [];
  const add = (id: string, state: CheckState, text: string) =>
    checks.push({ id, state, text });

  // the phrase people search for
  if (!kw) {
    add(
      "kw",
      "bad",
      "Bir anahtar kelime seç: insanların Google'a yazacağı ifade (örn. “react useEffect nedir”).",
    );
  } else {
    add(
      "kw-title",
      mentions(p.title, kw) || mentions(title, kw) ? "good" : "bad",
      mentions(p.title, kw) || mentions(title, kw)
        ? "Anahtar kelime başlıkta geçiyor."
        : "Anahtar kelimeyi başlıkta kullan, mümkünse başa yakın.",
    );
    add(
      "kw-slug",
      slugify(p.slug).includes(slugify(kw)) ? "good" : "warn",
      slugify(p.slug).includes(slugify(kw))
        ? "Adres (kısa ad) anahtar kelimeyi içeriyor."
        : `Adrese anahtar kelimeyi ekle: …/blog/${slugify(kw)}`,
    );
    add(
      "kw-desc",
      mentions(desc, kw) ? "good" : "warn",
      mentions(desc, kw)
        ? "Açıklamada anahtar kelime var."
        : "Açıklamada anahtar kelimeyi bir kez geçir.",
    );
    add(
      "kw-intro",
      mentions(o.firstParagraph, kw) ? "good" : "warn",
      mentions(o.firstParagraph, kw)
        ? "İlk paragraf konuyu hemen söylüyor."
        : "İlk paragrafta anahtar kelimeyle neyi anlatacağını söyle.",
    );
    const inHeading = o.headings.some((h) => mentions(h.text, kw));
    add(
      "kw-heading",
      inHeading ? "good" : "warn",
      inHeading
        ? "Bir ara başlıkta anahtar kelime var."
        : "En az bir ara başlıkta anahtar kelimeye yer ver.",
    );
  }

  // what shows on the results page
  const tl = title.length;
  add(
    "title-len",
    tl >= 30 && tl <= 62 ? "good" : tl > 62 && tl <= 75 ? "warn" : "bad",
    tl > 62
      ? `Başlık ${tl} karakter; Google ~60'tan sonrasını kesebilir. Kısalt ya da “SEO başlığı” yaz.`
      : tl < 30
        ? `Başlık ${tl} karakter; biraz daha açıklayıcı olabilir (30–60).`
        : `Başlık uzunluğu iyi (${tl} karakter).`,
  );
  const dl = desc.length;
  add(
    "desc-len",
    dl >= 120 && dl <= 160 ? "good" : dl >= 70 && dl <= 175 ? "warn" : "bad",
    dl === 0
      ? "Açıklama boş: özet ya da meta açıklama yaz."
      : dl < 120
        ? `Açıklama ${dl} karakter; 120–160 arası daha çok tıklanır.`
        : dl > 160
          ? `Açıklama ${dl} karakter; Google 160 civarında keser.`
          : `Açıklama uzunluğu iyi (${dl} karakter).`,
  );

  // substance and structure
  add(
    "words",
    words >= 800 ? "good" : words >= 400 ? "warn" : "bad",
    words >= 800
      ? `${words} kelime: bir ders için doyurucu.`
      : `${words} kelime. Ders yazıları 800+ kelimeyle daha iyi sıralanır; örnek ve açıklama ekle.`,
  );
  add(
    "h2",
    h2.length >= 3 ? "good" : h2.length >= 1 ? "warn" : "bad",
    h2.length >= 3
      ? `${h2.length} ara başlık: içerik iyi bölümlenmiş.`
      : "Dersi adımlara böl: en az 3 tane H2 ara başlık (Giriş, Adım 1, Özet…).",
  );
  const firstLevel = o.headings[0]?.level;
  const skips = o.headings.some(
    (h, i) => i > 0 && h.level > o.headings[i - 1]!.level + 1,
  );
  if (o.headings.length && (firstLevel !== 2 || skips))
    add(
      "h-order",
      "warn",
      "Başlık sırası: H2 ile başla, H3'ü bir H2'nin altında kullan (seviye atlama).",
    );

  if (o.images > 0)
    add(
      "alt",
      o.imagesWithoutAlt === 0 ? "good" : "bad",
      o.imagesWithoutAlt === 0
        ? "Tüm görsellerin açıklaması (alt) var."
        : `${o.imagesWithoutAlt} görselin açıklaması (alt metni) eksik; Google görseli onunla anlar.`,
    );
  add(
    "cover",
    p.coverImage ? "good" : "warn",
    p.coverImage
      ? "Kapak görseli var (paylaşımlarda görünür)."
      : "Kapak görseli ekle: paylaşımlarda ve Google Görseller'de çıkar.",
  );
  if (o.codeBlocks > 0)
    add(
      "code",
      o.codeWithoutLanguage === 0 ? "good" : "warn",
      o.codeWithoutLanguage === 0
        ? "Kod bloklarının dili seçili."
        : `${o.codeWithoutLanguage} kod bloğunun dili seçilmemiş (renklendirme ve okunurluk için seç).`,
    );
  add(
    "links",
    o.internalLinks > 0 ? "good" : "warn",
    o.internalLinks > 0
      ? "Başka bir yazına bağlantı var."
      : "İlgili bir yazına ya da projene bağlantı ver (örn. /blog/…); okuyucu sitede kalır.",
  );

  const score = Math.round(
    (checks.reduce(
      (s, c) => s + (c.state === "good" ? 1 : c.state === "warn" ? 0.5 : 0),
      0,
    ) /
      checks.length) *
      100,
  );
  return { checks, score, title, description: desc, words };
}

/** a lesson skeleton to start a tutorial from */
export const LESSON_TEMPLATE: RichNode = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Bu derste … öğreneceğiz. Yazının sonunda … yapabiliyor olacaksın. (İlk cümlede anahtar kelimeyi kullan.)",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Neler öğreneceğiz?" }],
    },
    {
      type: "bulletList",
      content: ["Birinci kazanım", "İkinci kazanım", "Üçüncü kazanım"].map(
        (t) => ({
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: t }] },
          ],
        }),
      ),
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Başlamadan önce" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Gerekenler: hangi bilgi, hangi araç, hangi sürüm.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "1. Adım: …" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Ne yapıyoruz ve neden? Önce fikri anlat, sonra kodu göster.",
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "typescript" },
      content: [{ type: "text", text: "// örnek kod" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Kodu satır satır açıkla: hangi satır ne işe yarıyor?",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "2. Adım: …" }],
    },
    { type: "paragraph", content: [{ type: "text", text: "…" }] },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Sık yapılan hatalar" }],
    },
    {
      type: "bulletList",
      content: ["Hata ve nasıl düzeltilir"].map((t) => ({
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: t }] }],
      })),
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Özet" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Bu derste … öğrendik. Sıradaki derste … (ilgili yazına bağlantı ver).",
        },
      ],
    },
  ],
};
