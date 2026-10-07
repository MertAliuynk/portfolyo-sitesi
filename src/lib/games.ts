/**
 * Plain game metadata per mood. Kept out of the client components so
 * server pages (metadata, static params, 404s) can read it too.
 */
export interface GameMeta {
  slug: string;
  title: string;
  desc: string;
  how: string;
}

export const MUTLU_GAMES: GameMeta[] = [
  {
    slug: "balon",
    title: "Balon Patlat",
    desc: "30 saniye, yüzlerce balon. Seri patlatırsan puanlar katlanır.",
    how: "Balonlara tıkla ya da dokun. Altın yıldızlı olanlar 5 puan!",
  },
  {
    slug: "hafiza",
    title: "Hafıza Kartları",
    desc: "8 çift çıkartma, 16 kart. En az hamlede hepsini bul.",
    how: "İki kart aç; aynıysa açık kalır. Hepsini eşleştir.",
  },
  {
    slug: "kule",
    title: "Kule",
    desc: "Kayan blokları üst üste diz. Taşan kısım kesilip düşer.",
    how: "Tıkla, dokun ya da boşluğa bas. Tam üstüne denk getirirsen kesilmez!",
  },
];

export const CIDDI_GAMES: GameMeta[] = [
  {
    slug: "2048",
    title: "2048",
    desc: "Aynı sayıları birleştirerek 2048'e ulaş. Strateji ve sabır.",
    how: "Yön tuşları ya da kaydırma. Aynı değerli iki karo çarpışınca birleşir.",
  },
  {
    slug: "reaksiyon",
    title: "Reaksiyon testi",
    desc: "Görsel uyarana tepki süreni milisaniye cinsinden ölç.",
    how: "Alan kırmızıya döndüğü an tıkla. Beş deneme, ortalama alınır.",
  },
  {
    slug: "yazma",
    title: "Yazma hızı",
    desc: "Dakikadaki kelime sayın ve doğruluk oranın.",
    how: "Metni olduğu gibi yaz. İlk tuşla süre başlar.",
  },
];

export const SAKIN_GAMES: GameMeta[] = [
  {
    slug: "bahce",
    title: "Zen bahçesi",
    desc: "Kumu tırmıkla, taş yerleştir. Bozulursa yeniden düzlersin.",
    how: "Sürükleyerek tırmıkla, tek dokunuşla taş bırak.",
  },
  {
    slug: "gol",
    title: "Göl",
    desc: "Suya dokun, halkalar yayılsın, yumuşak notalar çalsın.",
    how: "Göle dokun. Soldan sağa notalar inceliyor.",
  },
  {
    slug: "nefes",
    title: "Nefes",
    desc: "Birkaç dakikalık rehberli nefes. Kutu nefesi ya da 4-7-8.",
    how: "Bir ritim seç, daireyi takip et.",
  },
];

export function findGame(list: GameMeta[], slug: string) {
  return list.find((g) => g.slug === slug);
}
