import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-xs tracking-[0.3em] text-magenta uppercase">
        404
      </p>
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        Burada <span className="text-gradient">gizli bir şey</span> yok.
      </h1>
      <p className="max-w-sm text-paper/60">
        Ya da vardır, ama sen henüz bulamadın. Ana sayfaya dönüp tekrar dene.
      </p>
      <Link
        href="/"
        className="glass-panel mt-4 rounded-full px-6 py-3 text-sm font-semibold text-paper transition hover:bg-white/10"
      >
        Ana sayfaya dön
      </Link>
    </main>
  );
}
