import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();

const projects = [
  {
    slug: "pulse-analytics",
    title: "Pulse — Gerçek Zamanlı Analitik Paneli",
    summary:
      "Web sitesi trafiğini saniyelik gecikmeyle gösteren, WebSocket tabanlı canlı analitik paneli.",
    description:
      "Pulse, klasik analitik araçlarının 24 saatlik gecikmesine kafayı takarak çıktığım bir yan proje olarak başladı. Next.js App Router üzerinde tRPC subscriptions ve WebSocket ile saniyeler içinde güncellenen; ısı haritaları, oturum akışları ve dönüşüm hunilerini tek ekranda toplayan bir panel. Yük altında bile 60fps akıcılığı korumak için sanal listeleme ve olay toplu işleme (batching) teknikleri kullandım.",
    tags: "Next.js,tRPC,WebSocket,PostgreSQL,Redis",
    gradient: "magenta",
    liveUrl: "https://example.com/pulse",
    repoUrl: "https://github.com/mertaliuyanik/pulse",
    year: 2025,
    featured: true,
    order: 1,
  },
  {
    slug: "nova-checkout",
    title: "Nova Checkout — Headless Ödeme Akışı",
    summary:
      "E-ticaret siteleri için 3 adımdan 1 adıma indirilmiş, dönüşüm odaklı headless ödeme deneyimi.",
    description:
      "Nova Checkout, ortalama sepet terk etme oranını düşürmek için tasarlanmış bir headless ödeme kütüphanesi. Stripe ve iyzico entegrasyonlarını tek bir API arkasında birleştirdim, adres/kart bilgisi otomatik doldurma ve iyimser (optimistic) UI güncellemeleriyle ödeme süresini ortalama %38 kısalttım. Tamamen bileşen tabanlı olduğu için herhangi bir tasarım sistemine birkaç saatte entegre edilebiliyor.",
    tags: "Next.js,Stripe,Prisma,TypeScript",
    gradient: "sunset",
    liveUrl: "https://example.com/nova",
    repoUrl: "https://github.com/mertaliuyanik/nova-checkout",
    year: 2024,
    featured: true,
    order: 2,
  },
  {
    slug: "orbit-cms",
    title: "Orbit CMS — Sürükle-Bırak İçerik Yönetimi",
    summary:
      "Geliştiricisi olmayan ekipler için blok tabanlı, sürükle-bırak bir içerik yönetim sistemi.",
    description:
      "Orbit, pazarlama ekiplerinin geliştirici beklemeden sayfa yayınlayabilmesi için kurduğum blok tabanlı bir CMS çekirdeği. Editör tarafı React + dnd-kit ile, içerik modelleme tarafı ise tamamen şemaya dayalı (schema-driven) — yeni bir blok tipi eklemek tek bir JSON tanımı kadar kolay. Sürüm geçmişi, canlı önizleme ve rol tabanlı yetkilendirme dahil.",
    tags: "React,Node.js,PostgreSQL,dnd-kit",
    gradient: "ocean",
    liveUrl: null,
    repoUrl: "https://github.com/mertaliuyanik/orbit-cms",
    year: 2024,
    featured: true,
    order: 3,
  },
  {
    slug: "echoboard",
    title: "EchoBoard — Anonim Ekip Geri Bildirimi",
    summary:
      "Ekiplerin haftalık nabzını anonim, gerçek zamanlı bir panoyla ölçen küçük bir SaaS denemesi.",
    description:
      "EchoBoard, retrospektif toplantılarındaki 'kimse ilk konuşmak istemiyor' sorununu çözmek için hafta sonu projesi olarak doğdu, sonra gerçek bir kullanıcı kitlesi kazandı. Anonim oylama, duygu analizi ile otomatik etiketleme ve Slack entegrasyonu içeriyor.",
    tags: "Next.js,tRPC,WebSocket,SQLite",
    gradient: "forest",
    liveUrl: "https://example.com/echoboard",
    repoUrl: "https://github.com/mertaliuyanik/echoboard",
    year: 2023,
    featured: false,
    order: 4,
  },
  {
    slug: "voxel-playground",
    title: "Voxel Playground — Tarayıcıda Prosedürel Dünya",
    summary:
      "Three.js ile tamamen tarayıcıda çalışan, prosedürel olarak üretilen sonsuz bir voksel dünyası.",
    description:
      "Bu sitenin gizli oyunlar bölümüne olan tutkumun kaynağı: Three.js ve basit bir Perlin gürültü (noise) fonksiyonuyla sonsuz, keşfedilebilir bir voksel arazi üreten deneysel bir proje. Chunk tabanlı yükleme, frustum culling ve instanced mesh render ile mütevazı bir dizüstü bilgisayarda bile 60fps hedefledim.",
    tags: "Three.js,WebGL,TypeScript",
    gradient: "cosmic",
    liveUrl: null,
    repoUrl: "https://github.com/mertaliuyanik/voxel-playground",
    year: 2023,
    featured: false,
    order: 5,
  },
];

const posts = [
  {
    slug: "neden-her-portfoy-birbirine-benziyor",
    title: "Neden Her Portföy Sitesi Birbirine Benziyor?",
    excerpt:
      "Aynı üst menü, aynı 'Hakkımda' bölümü, aynı kartlar. Bu siteyi neden tamamen farklı bir mantıkla kurduğumu anlatıyorum.",
    tag: "Tasarım",
    readingTime: 6,
    content: `Neredeyse her yazılımcı portföyü aynı iskelete sahip: üstte sabit bir menü, altında "Hakkımda", sonra "Projelerim", en sonda "İletişim". Fonksiyonel, tanıdık ve... unutulması bir o kadar kolay.

Bu siteyi kurarken kendime tek bir kural koydum: **hiçbir sayfada geleneksel bir navigasyon menüsü olmayacak.** Bunun yerine sayfa, bir hikaye gibi akacak — aşağı indikçe ton değişecek, bir noktada dikey kaydırma yerini yatay bir geçişe bırakacak ve site boyunca gizlenmiş birkaç "manipülasyon" seni beklenmedik yerlere götürecek.

## Neden?

Çünkü bir portföy sitesi aslında bir CV değil, bir *demo*. Ziyaretçiye "işte butonlar, işte linkler" demek yerine, "izle, bunu ben yaptım" demek istedim. Scroll'un kendisi bir etkileşim biçimi haline geldiğinde, en sıradan bir kaydırma hareketi bile küçük bir sürpriz taşıyabiliyor.

## Teknik taraf

Yatay geçiş bölümü, Framer Motion'ın \`useScroll\` ve \`useTransform\` hook'larıyla, dikey scroll ilerlemesini yatay bir \`translateX\` değerine dönüştürerek çalışıyor. Gizli sayfalar ise klasik bir Konami kodu dinleyicisi ve sahnede gizlenmiş, birkaç kez tıklanması gereken küçük bir nesneyle tetikleniyor.

Sonuç mükemmel değil — bazı ziyaretçiler gizli oyunlar bölümünü hiç bulamayacak. Ama bulanlar için bu, bir "Hakkımda" paragrafından çok daha fazlasını anlatıyor.`,
  },
  {
    slug: "trpc-ile-uctan-uca-tip-guvenligi",
    title: "tRPC ile Uçtan Uca Tip Güvenliği",
    excerpt:
      "REST ya da GraphQL yazmadan, sunucudaki bir fonksiyonu istemcide çağırıyormuş gibi tip güvenli API'ler kurmak.",
    tag: "Mühendislik",
    readingTime: 8,
    content: `tRPC'yi ilk gördüğümde tepkim "bu kadar basit olamaz" oldu. Ne bir şema dili (GraphQL SDL), ne kod üretimi, ne de OpenAPI dosyası. Sadece TypeScript.

## Temel fikir

Sunucuda tanımladığın bir prosedür (\`publicProcedure.query(...)\`), istemcide otomatik olarak tipli bir fonksiyon haline geliyor. Aradaki her şey — serileştirme, hata yönetimi, önbellekleme — React Query üzerinden yönetiliyor.

\`\`\`ts
export const postRouter = createTRPCRouter({
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => ctx.db.post.findUnique({
      where: { slug: input.slug },
    })),
});
\`\`\`

İstemci tarafında bu, otomatik tamamlamalı, tam tipli bir \`api.post.bySlug.useQuery({ slug })\` çağrısına dönüşüyor. Sunucudaki dönüş tipini değiştirdiğinde, istemcide derleme zamanında hata alıyorsun — deploy sonrası değil.

## Ne zaman kullanmam

Herkese açık, üçüncü taraf bir API yazıyorsam tRPC'yi seçmem — orada OpenAPI/REST daha uygun bir sözleşme sağlıyor. Ama kendi frontend'imle kendi backend'im arasında, aynı monorepo içinde konuşuyorsam tRPC'nin sağladığı hız inanılmaz.`,
  },
  {
    slug: "threejs-ilk-3d-sahne",
    title: "Three.js'e Giriş: Tarayıcıda İlk 3D Sahnenizi Kurun",
    excerpt:
      "Bu sitenin gizli oyunlar bölümünü mümkün kılan kütüphaneye kısa ve pratik bir giriş.",
    tag: "3D / WebGL",
    readingTime: 7,
    content: `Three.js'i "karmaşık" olarak görmek çok kolay, ama temelde üç şeye ihtiyacın var: bir **sahne**, bir **kamera** ve bir **render edici**.

\`\`\`ts
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: "#ff2fd0" });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
\`\`\`

React ile çalışıyorsan **@react-three/fiber**, bu imperatif API'yi bildirimsel (declarative) bir React ağacına çeviriyor — sahnendeki her mesh, JSX'te bir bileşen oluyor. Bu sitedeki üç mini oyun da tamamen bu yaklaşımla, oyun döngüsü için \`useFrame\` hook'u kullanılarak yazıldı.

En büyük tavsiyem: performans sorunu yaşamadan önce optimize etmeye çalışma. Önce çalışan, eğlenceli bir şey kur — sonra \`instancedMesh\`, \`frustum culling\` gibi araçlarla darboğazları gerçek profil verisine göre çöz.`,
  },
  {
    slug: "scroll-animasyonlarini-performansli-yapmak",
    title: "Scroll Animasyonlarını Performanslı Yapmanın 5 Yolu",
    excerpt:
      "Kaydırma tabanlı animasyonlar takılmaya en yatkın animasyon türüdür. İşte onları 60fps'te tutmanın yolları.",
    tag: "Performans",
    readingTime: 5,
    content: `1. **\`scroll\` event'ini asla ham haliyle dinleme.** Her scroll event'inde state güncellemek yerine, Framer Motion'ın \`useScroll\` gibi \`requestAnimationFrame\` tabanlı çözümlerini kullan.

2. **\`transform\` ve \`opacity\` dışına çıkma.** \`width\`, \`top\`, \`left\` gibi layout tetikleyen özellikleri animasyonlarda kullanmak, tarayıcıyı her karede yeniden düzen hesaplamaya (reflow) zorlar.

3. **\`will-change\` ile GPU'ya ipucu ver — ama aşırıya kaçma.** Her elementte kullanmak, tarayıcının bellek yönetimini bozabilir.

4. **Görünür alan dışındaki animasyonları durdur.** \`IntersectionObserver\` ile ekran dışına çıkan sahneler (özellikle Three.js canvas'ları) için render döngüsünü tamamen duraklat.

5. **Ölç, tahmin etme.** Chrome DevTools Performance panelinde bir scroll oturumu kaydet, "Layout Shift" ve "Long Task" uyarılarını takip et.

Bu sitenin yatay kaydırma bölümü bu beş kuralın hepsini takip ediyor — ve düşük seviye bir cihazda bile takılmadan çalışıyor (umarım!).`,
  },
  {
    slug: "junior-dan-bugune-10-ders",
    title: "Junior'dan Bugüne: Kod Yazarken Öğrendiğim 10 Ders",
    excerpt:
      "Geriye dönüp baktığımda kariyerimin başında bilmek isteyeceğim, biraz ego biraz da tevazu içeren notlar.",
    tag: "Kariyer",
    readingTime: 9,
    content: `1. **"Çalışıyor" ile "doğru" farklı şeyler.** İlki seni bugün kurtarır, ikincisi altı ay sonra.

2. **En iyi kod, hiç yazılmayan koddur.** Bir kütüphane, bir yerleşik API ya da basitçe "buna gerek yok" demek genelde en hızlı çözümdür.

3. **İsimlendirme, tasarımın kendisidir.** Bir değişkene doğru ismi bulamıyorsan, muhtemelen o değişkenin ne olduğunu tam olarak anlamamışsındır.

4. **Code review bir savunma değil, bir öğrenme fırsatıdır.** Ego'yu koddan ayırabilmek zaman alıyor ama öğrenilebilir bir beceri.

5. **Erken optimizasyon, gerçek bir sorundan çok daha pahalıya patlar.** Önce ölç.

6. **Dokümantasyon yazmayı sevmesen de, gelecekteki sana bir mektup yazdığını düşün.**

7. **"Basit" her zaman "kolay" demek değildir.** Basit bir API tasarlamak genelde en zor iştir.

8. **Test yazmak yavaşlatmaz, güven verir.** Refactor etmekten korkmayan bir kod tabanı, hıza dönüşür.

9. **En iyi mühendisler en çok soru sorar**, en az değil.

10. **Bazen en iyi kod, ekranın dışında yaşanır.** İyi bir gece uykusu, temiz bir masa, net bir problem tanımı — bunlar da mühendisliğin parçası.`,
  },
];

async function main() {
  console.log("Seed başlıyor...");

  for (const project of projects) {
    await db.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
  console.log(`${projects.length} proje eklendi.`);

  for (const post of posts) {
    await db.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  console.log(`${posts.length} blog yazısı eklendi.`);

  console.log("Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
