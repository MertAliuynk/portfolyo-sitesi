"use client";

import { useEffect, useRef, useState } from "react";

import { FlagIcon, GlobeIcon } from "~/components/nostaljik/icons";
import { MenuBar, StatusCell } from "~/components/nostaljik/Window";
import { w98Rich } from "~/components/nostaljik/rich";
import { neighbours, type PostView } from "~/lib/posts";
import { RichRenderer } from "~/lib/rich/render";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const HOST = "http://www.mertuyanik.com.tr";
const COUNTER_KEY = "mert:w98-visits";
const times = "font-['Times_New_Roman',Times,serif]";

/** "home" or a post slug */
type Page = string;

function urlOf(page: Page) {
  return page === "home" ? `${HOST}/index.htm` : `${HOST}/yazilar/${page}.htm`;
}

/* ------------------------------------------------------------------ */

function Counter() {
  const [count, setCount] = useState(4213);
  useEffect(() => {
    try {
      const n = Number(window.localStorage.getItem(COUNTER_KEY) ?? "0") + 1;
      window.localStorage.setItem(COUNTER_KEY, String(n));
      setCount(4212 + n);
    } catch {
      // ignore
    }
  }, []);
  return (
    <span className="inline-flex gap-[2px] align-middle">
      {String(count)
        .padStart(6, "0")
        .split("")
        .map((d, i) => (
          <span
            key={i}
            className="inline-block w-[14px] bg-black text-center font-dos text-[18px] leading-[20px] text-[#33ff66]"
          >
            {d}
          </span>
        ))}
    </span>
  );
}

function Hr() {
  return <hr className="my-4 border-t-[#808080] border-b-white border-b" />;
}


/* ------------------------------------------------------------------ */

function HomePage({
  posts,
  go,
}: {
  posts: PostView[];
  go: (p: Page) => void;
}) {
  return (
    <div className={times}>
      <h1 className="text-center text-[30px] font-bold text-[#000080] [text-shadow:2px_2px_0_#c0c0c0]">
        Mert&apos;in Kişisel Ana Sayfası
      </h1>
      <div className="mt-2 overflow-hidden border-y-2 border-[#000080] bg-[#ffffcc] py-1 text-[15px]">
        <div className="animate-marquee flex w-max gap-16 whitespace-nowrap">
          {[0, 1].map((k) => (
            <span key={k}>
              *** Siteme hoş geldiniz! *** Yeni yazılar eklendi, aşağıdan
              okuyabilirsiniz *** Beni yer imlerinize eklemeyi unutmayın ***
              Bu sayfa Not Defteri ile elle yazılmıştır ***
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-4 w-max max-w-full border-2 border-black bg-[repeating-linear-gradient(-45deg,#ffd21e_0_12px,#000_12px_24px)] p-1">
        <p className="bg-[#ffd21e] px-3 py-0.5 text-center text-[13px] font-bold tracking-wider">
          BU SİTE YAPIM AŞAMASINDADIR
        </p>
      </div>

      <Hr />
      <h2 className="text-[22px] font-bold">
        <FlagIcon className="mr-2 inline h-5 w-5 align-[-3px]" />
        Yazılarım
      </h2>
      <ul className="mt-2 space-y-3 pl-1">
        {posts.map((p, i) => (
          <li key={p.slug} className="flex gap-2 text-[16px] leading-[1.35]">
            <span className="text-[#ff0000]">★</span>
            <span>
              <button
                type="button"
                onClick={() => go(p.slug)}
                className="text-left text-[#0000ee] underline"
              >
                {p.title}
              </button>
              {i === 0 && (
                <span className="animate-blink ml-2 bg-[#ff0000] px-1 text-[11px] font-bold text-white">
                  YENİ!
                </span>
              )}
              <span className="text-[13px] text-[#606060]"> ({p.date})</span>
              <br />
              <span className="text-[14px] text-[#303030]">{p.excerpt}</span>
            </span>
          </li>
        ))}
      </ul>

      <Hr />
      <p className="text-center text-[15px]">
        Siz bu sayfanın <Counter />. ziyaretçisisiniz!
      </p>
      <p className="mt-3 text-center text-[14px]">
        Bana{" "}
        <a href={`mailto:${SITE.email}`} className="text-[#0000ee] underline">
          e-posta gönderin
        </a>{" "}
        · Ziyaretçi defterimi imzalayın
      </p>
      <Hr />
      <p className="text-center text-[12px] text-[#606060]">
        Bu site en iyi <b>Mert Gezgini 4.0</b> ile 800x600 çözünürlükte
        görüntülenir.
        <br />© 1998-{new Date().getFullYear()} {SITE.name}
      </p>
    </div>
  );
}

export function PostPage({
  post,
  posts,
  go,
}: {
  post: PostView;
  posts: PostView[];
  go: (p: Page) => void;
}) {
  const { prev, next } = neighbours(posts, post.slug);
  const navRow = (
    <p className={cn(times, "text-center text-[14px]")}>
      [{" "}
      <button type="button" onClick={() => go("home")} className="text-[#0000ee] underline">
        Ana Sayfa
      </button>{" "}
      ]{" "}
      {prev && (
        <>
          [{" "}
          <button type="button" onClick={() => go(prev.slug)} className="text-[#0000ee] underline">
            &lt;&lt; Daha yeni
          </button>{" "}
          ]{" "}
        </>
      )}
      {next && (
        <>
          [{" "}
          <button type="button" onClick={() => go(next.slug)} className="text-[#0000ee] underline">
            Daha eski &gt;&gt;
          </button>{" "}
          ]
        </>
      )}
    </p>
  );

  return (
    <div className={times}>
      {navRow}
      <Hr />
      <h1 className="text-[26px] leading-tight font-bold">{post.title}</h1>
      <p className="mt-1 text-[13px] text-[#606060]">
        Yayın tarihi: {post.dateLong} · Kategori: {post.tag} · Okuma süresi:{" "}
        {post.readingTime} dk
      </p>
      <Hr />
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt="" className="mb-4 max-w-full border-2 border-[#808080]" />
      )}
      <RichRenderer doc={post.doc} components={w98Rich} />
      <Hr />
      {navRow}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function BrowserApp({ posts }: { posts: PostView[] }) {
  const [history, setHistory] = useState<Page[]>(["home"]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reloads, setReloads] = useState(0);
  const [address, setAddress] = useState(urlOf("home"));
  const scrollRef = useRef<HTMLDivElement>(null);
  const page = history[index] ?? "home";
  const post = posts.find((p) => p.slug === page);

  // dial-up era: every page takes a moment
  useEffect(() => {
    setLoading(true);
    setAddress(urlOf(page));
    scrollRef.current?.scrollTo(0, 0);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [page, index, reloads]);

  function go(next: Page) {
    const h = [...history.slice(0, index + 1), next];
    setHistory(h);
    setIndex(h.length - 1);
  }

  function goAddress() {
    const match = /\/yazilar\/([^/.]+)/.exec(address);
    const slug = match?.[1];
    go(slug && posts.some((p) => p.slug === slug) ? slug : "home");
  }

  const toolbar = [
    { label: "Geri", glyph: "←", disabled: index === 0, on: () => setIndex((i) => i - 1) },
    { label: "İleri", glyph: "→", disabled: index >= history.length - 1, on: () => setIndex((i) => i + 1) },
    { label: "Durdur", glyph: "✕", disabled: !loading, on: () => setLoading(false) },
    { label: "Yenile", glyph: "↻", disabled: false, on: () => setReloads((r) => r + 1) },
    { label: "Giriş", glyph: "⌂", disabled: false, on: () => go("home") },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MenuBar items={["Dosya", "Düzen", "Görünüm", "Git", "Sık Kullanılanlar", "Yardım"]} />
      <div className="flex shrink-0 items-stretch gap-0.5 border-y border-y-[#808080] py-1 shadow-[inset_0_1px_0_#fff]">
        {toolbar.map((b) => (
          <button
            key={b.label}
            type="button"
            disabled={b.disabled}
            onClick={b.on}
            className="flex min-w-12 flex-col items-center px-1.5 text-[12px] hover:shadow-[inset_-1px_-1px_#808080,inset_1px_1px_#fff] disabled:text-[#808080] disabled:[text-shadow:1px_1px_0_#fff] disabled:hover:shadow-none"
          >
            <span className="text-[18px] leading-none">{b.glyph}</span>
            {b.label}
          </button>
        ))}
        <span className="flex-1" />
        <span className="w98-sunken grid w-11 place-items-center bg-black">
          <FlagIcon className={cn("h-7 w-7", loading && "animate-pulse")} />
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goAddress();
        }}
        className="flex shrink-0 items-center gap-2 py-1"
      >
        <span className="text-[#404040]">Adres</span>
        <span className="w98-field flex min-w-0 flex-1 items-center gap-1.5 px-1.5 py-[2px]">
          <GlobeIcon className="h-4 w-4 shrink-0" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            spellCheck={false}
            aria-label="Adres"
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </span>
        <button type="submit" className="w98-btn !min-w-0 !px-3">
          Git
        </button>
      </form>

      <div ref={scrollRef} className="w98-field min-h-0 flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className={cn(times, "p-6 text-[15px] text-[#606060]")}>
            {urlOf(page).replace("http://", "")} bekleniyor...
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            {post ? (
              <PostPage post={post} posts={posts} go={go} />
            ) : (
              <HomePage posts={posts} go={go} />
            )}
          </div>
        )}
      </div>

      <div className="mt-[2px] flex shrink-0 gap-[2px] text-[12px]">
        <StatusCell className="flex flex-1 items-center gap-1.5">
          <GlobeIcon className="h-3.5 w-3.5" />
          {loading ? "Bağlanılıyor: www.mertuyanik.com.tr" : "Bitti"}
        </StatusCell>
        <StatusCell className="flex w-28 items-center gap-[2px] !px-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "block h-2.5 flex-1",
                loading ? (i < 6 ? "bg-[#000080]" : "") : "bg-[#000080]",
              )}
            />
          ))}
        </StatusCell>
        <StatusCell className="hidden w-32 sm:block">Internet bölgesi</StatusCell>
      </div>
    </div>
  );
}
