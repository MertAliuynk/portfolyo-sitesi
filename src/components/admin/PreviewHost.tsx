"use client";

import { useEffect, useState } from "react";

import type { PreviewData } from "~/components/admin/PreviewPanel";
import { CiddiPost } from "~/components/ciddi/CiddiBlog";
import { CiddiProject } from "~/components/ciddi/CiddiProject";
import { NeonPost } from "~/components/home/NeonPost";
import { NeonProject } from "~/components/home/NeonProject";
import { MutluPost } from "~/components/mutlu/MutluBlog";
import { MutluProject } from "~/components/mutlu/MutluProject";
import { PostPage } from "~/components/nostaljik/Browser";
import { GlobeIcon } from "~/components/nostaljik/icons";
import { w98Rich } from "~/components/nostaljik/rich";
import { SakinPost } from "~/components/sakin/SakinBlog";
import { SakinProject } from "~/components/sakin/SakinProject";
import type { MoodId } from "~/lib/moods";
import { projectDoc } from "~/lib/projects";
import { RichRenderer } from "~/lib/rich/render";

/* page colours each mood's layout normally provides */
const THEME: Partial<Record<MoodId, string>> = {
  mutlu: "#FFF1D6;color:#1A1A1A",
  ciddi: "#F4F2EE;color:#111111",
  sakin: "#ECE5D8;color:#2F3A2F",
  nostaljik: "#008080;color:#000000",
};

function W98Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-3 font-win text-[13px] sm:p-8">
      <div className="w98-window mx-auto max-w-3xl">
        <div className="w98-title flex h-[22px] items-center gap-1.5 px-1.5 font-bold">
          <GlobeIcon className="h-4 w-4" /> {title}
        </div>
        <div className="w98-field m-[2px] bg-white p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export function PreviewHost({ mood }: { mood: MoodId }) {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const msg = e.data as ({ type?: string } & PreviewData) | null;
      if (msg?.type === "preview") setData(msg);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const theme = THEME[mood];

  return (
    <>
      {theme && <style>{`html,body{background:${theme} !important;}`}</style>}
      {!data ? (
        <p className="p-10 text-center text-sm opacity-60">Önizleme yükleniyor…</p>
      ) : data.kind === "post" ? (
        mood === "mutlu" ? (
          <MutluPost post={data.post} posts={[data.post]} />
        ) : mood === "ciddi" ? (
          <CiddiPost post={data.post} posts={[data.post]} />
        ) : mood === "sakin" ? (
          <SakinPost post={data.post} posts={[data.post]} />
        ) : mood === "merakli" ? (
          <NeonPost post={data.post} />
        ) : (
          <W98Frame title="Yazılarım - Mert Gezgini">
            <PostPage post={data.post} posts={[data.post]} go={() => undefined} />
          </W98Frame>
        )
      ) : mood === "mutlu" ? (
        <MutluProject project={data.project} others={[]} />
      ) : mood === "ciddi" ? (
        <CiddiProject project={data.project} others={[]} />
      ) : mood === "sakin" ? (
        <SakinProject project={data.project} others={[]} />
      ) : mood === "merakli" ? (
        <NeonProject project={data.project} others={[]} />
      ) : (
        <W98Frame title={`${data.project.slug}.prj Özellikleri`}>
          {data.project.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.project.coverImage} alt="" className="mb-4 max-w-full border-2 border-[#808080]" />
          )}
          <RichRenderer doc={projectDoc(data.project)} components={w98Rich} />
        </W98Frame>
      )}
    </>
  );
}
