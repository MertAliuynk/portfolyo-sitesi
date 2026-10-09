import { docFrom } from "~/lib/rich/extract";
import type { RichNode } from "~/lib/rich/types";

/** A project as the mood pages receive it, body parsed on the server. */
export interface ProjectView {
  id: string;
  slug: string;
  title: string;
  /** part before the "—" in the title */
  name: string;
  /** part after the "—", if any */
  subtitle: string | null;
  summary: string;
  description: string;
  tags: string[];
  gradient: string;
  liveUrl: string | null;
  repoUrl: string | null;
  year: number;
  featured: boolean;
  role: string | null;
  duration: string | null;
  status: string | null;
  coverImage: string | null;
  /** null when no case study has been written yet */
  doc: RichNode | null;
}

export function toProjectView(p: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string;
  gradient: string;
  liveUrl: string | null;
  repoUrl: string | null;
  year: number;
  featured: boolean;
  role?: string | null;
  duration?: string | null;
  status?: string | null;
  coverImage?: string | null;
  contentJson?: string | null;
}): ProjectView {
  const [name, ...rest] = p.title.split("—");
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    name: name!.trim(),
    subtitle: rest.join("—").trim() || null,
    summary: p.summary,
    description: p.description,
    tags: p.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    gradient: p.gradient,
    liveUrl: p.liveUrl,
    repoUrl: p.repoUrl,
    year: p.year,
    featured: p.featured,
    role: p.role ?? null,
    duration: p.duration ?? null,
    status: p.status ?? null,
    coverImage: p.coverImage ?? null,
    doc: p.contentJson ? docFrom({ contentJson: p.contentJson }) : null,
  };
}

/** Case study body, or the plain description when none was written. */
export function projectDoc(p: ProjectView): RichNode {
  if (p.doc) return p.doc;
  return {
    type: "doc",
    content: p.description
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((para) => ({ type: "paragraph", content: [{ type: "text", text: para }] })),
  };
}
