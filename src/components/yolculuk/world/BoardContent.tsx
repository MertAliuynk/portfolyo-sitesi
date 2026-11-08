"use client";

import { mutluRich } from "~/components/mutlu/rich";
import { useDrive } from "~/components/yolculuk/store";
import type { PostView } from "~/lib/posts";
import { projectDoc, type ProjectView } from "~/lib/projects";
import { RichRenderer } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

const DOTS =
  "radial-gradient(#1a1a1a14 1.4px, transparent 1.6px) 0 0 / 18px 18px, #FFF8EA";
const CORK =
  "radial-gradient(#9c6a3a55 1.2px, transparent 1.8px) 0 0 / 11px 11px, radial-gradient(#ffffff22 1px, transparent 1.6px) 5px 6px / 13px 13px, #d39a5e";
const NOTE_COLORS = ["#FFF3A8", "#FFD3EC", "#CDE7FF", "#D3F5DC", "#FFE0C2"];

/** little strip of tape holding a picture on */
function Tape({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute h-7 w-20 rounded-sm bg-[#fff6d6]/80 shadow-sm",
        className,
      )}
    />
  );
}

function Pin({ color = "#FF5A36" }: { color?: string }) {
  return (
    <span
      className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#1A1A1A] shadow-[1px_2px_0_#1A1A1A]"
      style={{ background: color }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* projects                                                             */
/* ------------------------------------------------------------------ */

export function ProjectSummary({
  project,
  color,
}: {
  project: ProjectView;
  color: string;
}) {
  return (
    <div
      className="relative flex h-full gap-7 p-8"
      style={{ background: DOTS }}
    >
      {project.coverImage ? (
        <div className="relative shrink-0 rotate-[-2deg]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.coverImage}
            alt=""
            className="h-[330px] w-[300px] rounded-2xl border-[4px] border-[#1A1A1A] object-cover shadow-[6px_6px_0_#1A1A1A]"
          />
          <Tape className="-top-3 left-6 rotate-[-8deg]" />
          <Tape className="right-4 -bottom-3 rotate-[6deg]" />
        </div>
      ) : (
        <div
          className="grid h-[330px] w-[260px] shrink-0 rotate-[-2deg] place-items-center rounded-2xl border-[4px] border-[#1A1A1A] text-[120px] font-extrabold shadow-[6px_6px_0_#1A1A1A]"
          style={{ background: color }}
        >
          {project.name.charAt(0)}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="w-max rotate-[2deg] rounded-xl border-[3px] border-[#1A1A1A] px-3 py-0.5 text-2xl font-extrabold"
          style={{ background: color }}
        >
          {project.year}
        </span>
        <span className="mt-3 text-[60px] leading-[0.95] font-extrabold tracking-tight">
          {project.name}
        </span>
        {project.subtitle && (
          <span className="mt-2 text-[22px] font-bold opacity-70">
            {project.subtitle}
          </span>
        )}
        <span className="mt-3 line-clamp-2 text-[21px] leading-snug font-medium">
          {project.summary}
        </span>
        <span className="mt-auto flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border-[3px] border-[#1A1A1A] bg-white px-3 text-lg font-bold"
            >
              {t}
            </span>
          ))}
        </span>
      </div>
      <span className="absolute right-6 bottom-6 rotate-[-6deg] rounded-full border-[3px] border-[#1A1A1A] bg-[#FF5A36] px-4 py-1.5 text-lg font-extrabold text-[#FFF1D6] shadow-[3px_3px_0_#1A1A1A]">
        yaklaş, oku ↵
      </span>
    </div>
  );
}

function ProjectFacts({
  project,
  color,
}: {
  project: ProjectView;
  color: string;
}) {
  const meta = [
    ["Rol", project.role],
    ["Süre", project.duration],
    ["Durum", project.status],
  ].filter((m): m is [string, string] => Boolean(m[1]));
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-lg border-[3px] border-[#1A1A1A] px-2.5 text-sm font-extrabold"
          style={{ background: color }}
        >
          {project.year}
        </span>
        {meta.map(([k, v]) => (
          <span
            key={k}
            className="rounded-lg border-[2.5px] border-[#1A1A1A] bg-white px-2.5 text-sm font-bold"
          >
            <span className="opacity-50">{k}:</span> {v}
          </span>
        ))}
      </div>
      <h2 className="mt-3 text-[40px] leading-[0.95] font-extrabold tracking-tight">
        {project.name}
      </h2>
      {project.subtitle && (
        <p className="mt-1.5 text-lg font-bold opacity-70">
          {project.subtitle}
        </p>
      )}
      <p className="mt-3 text-[17px] leading-relaxed font-medium">
        {project.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border-[2.5px] border-[#1A1A1A] bg-white px-2.5 text-sm font-bold"
          >
            {t}
          </span>
        ))}
      </div>
      {(project.liveUrl ?? project.repoUrl) && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border-[3px] border-[#1A1A1A] bg-[#2EC27E] px-4 py-2 text-sm font-extrabold shadow-[3px_3px_0_#1A1A1A] transition hover:-translate-y-0.5"
            >
              Canlı gör ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border-[3px] border-[#1A1A1A] bg-white px-4 py-2 text-sm font-extrabold shadow-[3px_3px_0_#1A1A1A] transition hover:-translate-y-0.5"
            >
              Kodu gör ↗
            </a>
          )}
        </div>
      )}
    </>
  );
}

export function ProjectReading({
  project,
  color,
  portrait,
}: {
  project: ProjectView;
  color: string;
  portrait: boolean;
}) {
  const cover = project.coverImage && (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.coverImage}
      alt=""
      className="w-full rotate-[-1.5deg] rounded-2xl border-[3px] border-[#1A1A1A] object-cover shadow-[5px_5px_0_#1A1A1A]"
    />
  );
  const story = (
    <div className="text-[#1A1A1A] [&_p]:text-[17px]">
      <RichRenderer doc={projectDoc(project)} components={mutluRich} />
    </div>
  );

  if (portrait) {
    return (
      <div
        data-board-scroll
        className="board-scroll h-full touch-pan-y overflow-y-auto overscroll-contain p-5"
        style={{ background: DOTS }}
      >
        {cover && <div className="mb-5">{cover}</div>}
        <ProjectFacts project={project} color={color} />
        <hr className="my-6 border-t-[3px] border-dashed border-[#1A1A1A]/25" />
        {story}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside
        className="board-scroll w-[36%] shrink-0 overflow-y-auto border-r-[3px] border-[#1A1A1A] p-6"
        style={{ background: `color-mix(in oklab, ${color} 30%, #FFF8EA)` }}
      >
        {cover && <div className="mb-5">{cover}</div>}
        <ProjectFacts project={project} color={color} />
      </aside>
      <div
        data-board-scroll
        className="board-scroll flex-1 overflow-y-auto overscroll-contain px-9 py-7"
        style={{ background: DOTS }}
      >
        <p className="font-hand text-2xl text-[#FF5A36]">hikayesi</p>
        {story}
        <p className="mt-6 text-center text-sm font-bold opacity-40">— son —</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* posts                                                                */
/* ------------------------------------------------------------------ */

export function PostsSummary({ posts }: { posts: PostView[] }) {
  const notes = posts.slice(0, 4);
  return (
    <div className="relative h-full p-6" style={{ background: CORK }}>
      <div className="mx-auto w-max -rotate-1 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-6 py-1 text-[34px] font-extrabold tracking-tight shadow-[4px_4px_0_#1A1A1A]">
        YAZI PANOSU
      </div>
      <div className="mt-7 grid grid-cols-4 gap-5 px-2">
        {notes.map((p, i) => (
          <div
            key={p.slug}
            className="relative flex h-[230px] flex-col rounded-md border-[3px] border-[#1A1A1A] p-3.5 shadow-[4px_5px_0_#1A1A1A55]"
            style={{
              background: NOTE_COLORS[i % NOTE_COLORS.length],
              rotate: `${[-3, 2, -1.5, 3][i]}deg`,
            }}
          >
            <Pin color={["#FF5A36", "#4D9FFF", "#2EC27E", "#B79CFF"][i]} />
            <span className="text-[13px] font-extrabold tracking-wide uppercase opacity-60">
              {p.tag}
            </span>
            <span className="mt-1 line-clamp-4 text-[22px] leading-tight font-extrabold">
              {p.title}
            </span>
            <span className="mt-auto text-[14px] font-bold opacity-60">
              {p.date}
            </span>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="col-span-4 text-center text-2xl font-bold">
            Yakında yazılar burada!
          </p>
        )}
      </div>
      <span className="absolute right-5 bottom-4 rotate-[-5deg] rounded-full border-[3px] border-[#1A1A1A] bg-[#4D9FFF] px-4 py-1 text-lg font-extrabold text-white shadow-[3px_3px_0_#1A1A1A]">
        {posts.length} yazı · yaklaş, oku ↵
      </span>
    </div>
  );
}

function PostNote({
  post,
  i,
  active,
  onOpen,
}: {
  post: PostView;
  i: number;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "relative w-full rounded-md border-[3px] border-[#1A1A1A] p-3.5 pt-4 text-left shadow-[3px_4px_0_#1A1A1A55] transition hover:-translate-y-0.5 hover:rotate-0",
        active && "ring-4 ring-[#1A1A1A] ring-offset-2 ring-offset-transparent",
      )}
      style={{
        background: NOTE_COLORS[i % NOTE_COLORS.length],
        rotate: active ? "0deg" : `${i % 2 ? 1.2 : -1.2}deg`,
      }}
    >
      <Pin color={["#FF5A36", "#4D9FFF", "#2EC27E", "#B79CFF"][i % 4]} />
      <span className="block text-[11px] font-extrabold tracking-wide uppercase opacity-60">
        {post.tag} · {post.date} · {post.readingTime} dk
      </span>
      <span className="mt-0.5 block text-[17px] leading-tight font-extrabold">
        {post.title}
      </span>
      <span className="mt-1 line-clamp-2 block text-[13px] font-medium opacity-75">
        {post.excerpt}
      </span>
    </button>
  );
}

function PostBody({ post }: { post: PostView }) {
  return (
    <>
      <p className="text-xs font-extrabold tracking-wide uppercase opacity-60">
        {post.tag} · {post.dateLong} · {post.readingTime} dk okuma
      </p>
      <h2 className="mt-1 text-[34px] leading-[1.05] font-extrabold tracking-tight">
        {post.title}
      </h2>
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="mt-5 w-full rounded-2xl border-[3px] border-[#1A1A1A] object-cover shadow-[5px_5px_0_#1A1A1A]"
        />
      )}
      <div className="mt-6 [&_p]:text-[17px]">
        <RichRenderer doc={post.doc} components={mutluRich} />
      </div>
      <p className="mt-6 text-center text-sm font-bold opacity-40">— son —</p>
    </>
  );
}

export function PostsReading({
  posts,
  portrait,
  selected,
}: {
  posts: PostView[];
  portrait: boolean;
  selected: string | null;
}) {
  const read = useDrive((s) => s.read);
  const open = (slug: string | null) => read({ board: "posts", post: slug });
  const post = posts.find((p) => p.slug === selected) ?? null;

  if (portrait) {
    return post ? (
      <div
        data-board-scroll
        className="board-scroll h-full touch-pan-y overflow-y-auto overscroll-contain bg-[#FFF8EA] p-5"
      >
        <button
          type="button"
          onClick={() => open(null)}
          className="mb-4 rounded-lg border-[2.5px] border-[#1A1A1A] bg-[#FFC93C] px-2.5 py-0.5 text-xs font-extrabold"
        >
          ← panoya dön
        </button>
        <PostBody post={post} />
      </div>
    ) : (
      <div
        data-board-scroll
        className="board-scroll h-full touch-pan-y overflow-y-auto overscroll-contain p-5"
        style={{ background: CORK }}
      >
        <p className="mx-auto mb-5 w-max -rotate-1 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-4 text-2xl font-extrabold">
          YAZI PANOSU
        </p>
        <div className="flex flex-col gap-5">
          {posts.map((p, i) => (
            <PostNote
              key={p.slug}
              post={p}
              i={i}
              active={false}
              onOpen={() => open(p.slug)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside
        className="board-scroll w-[34%] shrink-0 overflow-y-auto border-r-[3px] border-[#1A1A1A] p-5 pt-6"
        style={{ background: CORK }}
      >
        <p className="mx-auto mb-5 w-max -rotate-1 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-4 text-2xl font-extrabold shadow-[3px_3px_0_#1A1A1A]">
          YAZI PANOSU
        </p>
        <div className="flex flex-col gap-5">
          {posts.map((p, i) => (
            <PostNote
              key={p.slug}
              post={p}
              i={i}
              active={p.slug === selected}
              onOpen={() => open(p.slug)}
            />
          ))}
        </div>
      </aside>
      <div
        key={selected ?? "none"}
        data-board-scroll
        className="board-scroll flex-1 overflow-y-auto overscroll-contain bg-[#FFF8EA] px-9 py-7"
      >
        {post ? (
          <PostBody post={post} />
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="font-hand text-4xl text-[#FF5A36]">hoş geldin!</p>
              <p className="mt-2 text-2xl font-extrabold">
                Soldaki notlardan birini seç
              </p>
              <p className="mt-1 font-medium opacity-60">
                Yazı burada, panonun üstünde açılacak.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
