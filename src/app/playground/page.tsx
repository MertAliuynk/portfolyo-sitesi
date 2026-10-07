import Link from "next/link";

import { BackHome } from "~/components/ui/BackHome";

const games = [
  {
    slug: "neon-dash",
    title: "Neon Dash",
    tagline: "Şeritler arası kaç, hayatta kal.",
    controls: "← → ya da A D",
    gradient: "from-fuchsia-500 to-cyan-400",
  },
  {
    slug: "orbit-smash",
    title: "Orbit Smash",
    tagline: "Merkezini koru, gelen asteroidleri patlat.",
    controls: "Fare + Tıkla / Boşluk",
    gradient: "from-orange-400 to-rose-500",
  },
  {
    slug: "simon-prism",
    title: "Simon Prism",
    tagline: "Sırayı izle, hafızanı zorla.",
    controls: "Tıkla",
    gradient: "from-violet-500 to-cyan-400",
  },
];

export const metadata = { title: "Gizli Oyun Alanı" };

export default function PlaygroundPage() {
  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-28 sm:py-36">
      <BackHome />
      <p className="font-display text-xs tracking-[0.3em] text-magenta uppercase">
        Bulundu
      </p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        Gizli oyun alanına <span className="text-gradient">hoş geldin</span>.
      </h1>
      <p className="mt-4 max-w-lg text-paper/60">
        Buraya kadar geldiysen bir şeyi doğru yaptın demektir. 3 küçük oyun,
        hepsi Three.js ile kuruldu.
      </p>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/playground/${game.slug}`}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-white/20"
          >
            <div
              className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${game.gradient} opacity-20 blur-2xl transition group-hover:opacity-40`}
            />
            <h2 className="font-display relative text-xl font-bold">
              {game.title}
            </h2>
            <p className="relative mt-2 text-sm text-paper/60">
              {game.tagline}
            </p>
            <p className="relative mt-6 text-xs tracking-widest text-paper/30 uppercase">
              {game.controls}
            </p>
            <span className="relative mt-4 inline-block text-sm font-medium text-cyan">
              OYNA →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
