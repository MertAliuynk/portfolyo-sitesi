# Mert Ali Uyanık — Portföy Sitesi

Next.js (App Router) + tRPC + Prisma (SQLite) + Tailwind CSS v4 üzerine
kurulu, klasik navbar/sidebar kullanmayan, kaydırma-odaklı bir portföy
sitesi. Three.js (react-three-fiber) ile 3 gizli oyun içerir.

## Geliştirmeye başlama

```bash
pnpm install
pnpm dev
```

`http://localhost:3000` adresini aç.

## İçeriği düzenleme

- **Kimlik, biyografi, istatistikler, beceriler, iş akışı, sosyal linkler**
  → [src/lib/site.ts](src/lib/site.ts). Tamamı burada, tek dosya.
- **Projeler ve blog yazıları** → veritabanında (SQLite, `prisma/db.sqlite`).
  İçeriği [prisma/seed.ts](prisma/seed.ts) dosyasından düzenleyip
  tekrar tohumla:
  ```bash
  pnpm db:seed
  ```
  Şemayı değiştirirsen önce `pnpm db:push` çalıştır.
- **Renk paleti / tema** → [src/styles/globals.css](src/styles/globals.css)
  içindeki `@theme` bloğu (`--color-magenta`, `--color-cyan` vb.).
- **Proje kartı gradientleri** →
  [src/components/ui/ProjectCard.tsx](src/components/ui/ProjectCard.tsx)
  içindeki `GRADIENTS` sözlüğü (Tailwind sınıfları DB'den değil,
  buradan geliyor — derleme zamanında class üretimi için gerekli).

## Sitenin yapısı

- **Ana sayfa** (`/`) tek parça bir anlatı: Hero → Hakkımda/istatistikler →
  Portföy → **yatay kaydırma bölümü** (dikey scroll bir noktada yatay
  harekete dönüşüyor) → gizli terminal footer.
- **Blog** (`/blog`, `/blog/[slug]`) — görünür bir sayfa, footer'daki
  terminalden linklenir.
- **Oyun alanı** (`/playground`) — **hiçbir yerden linklenmez.** İki gizli
  yoldan biriyle açılır:
  1. Hero'daki küçük "yıldız" görünümlü noktaya 6 kere tıkla
     (`src/components/effects/SecretOrb.tsx`).
  2. Herhangi bir sayfada Konami kodu yaz (↑↑↓↓←→←→BA) — bu da seni
     `/blog`'a ışınlar (`src/components/effects/KonamiListener.tsx`).
- **3 mini oyun** (Three.js, `src/components/games/`):
  Neon Dash (şerit kaçışı), Orbit Smash (merkez savunma), Simon Prism
  (hafıza oyunu).

## Komutlar

| Komut | Ne yapar |
|---|---|
| `pnpm dev` | Geliştirme sunucusu |
| `pnpm build` | Prod build |
| `pnpm typecheck` | TypeScript kontrolü |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Prisma şemasını SQLite'a uygula |
| `pnpm db:seed` | `prisma/seed.ts` içeriğini veritabanına yaz |
| `pnpm db:studio` | Veritabanını görsel arayüzde incele |
