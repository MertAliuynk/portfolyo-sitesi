import Link from "next/link";

import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { RETENTION_DAYS } from "~/server/visits";

export const metadata = pageMeta({
  title: `Gizlilik — ${SITE.name}`,
  description: "Bu sitede hangi ziyaret bilgilerinin neden kaydedildiği.",
  canonical: "/gizlilik",
});

/** plain disclosure of what the visit log keeps (KVKK aydınlatma) */
export default function PrivacyPage() {
  return (
    <main className="font-swiss min-h-screen bg-[#151412] px-5 py-16 text-[#EDE9E1] sm:px-10 sm:py-24">
      <article className="[&_h2]:font-editorial mx-auto max-w-2xl text-[16px] leading-relaxed [&_h2]:mt-10 [&_h2]:text-3xl [&_li]:mt-1.5 [&_p]:mt-4 [&_p]:opacity-80 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:opacity-80">
        <Link href="/" className="text-[13px] opacity-60 hover:opacity-100">
          ← {SITE.name}
        </Link>
        <h1 className="font-editorial mt-6 text-5xl leading-none">Gizlilik</h1>
        <p>
          Bu, {SITE.name}&apos;ın kişisel sitesi. Siteyi kimlerin ziyaret
          ettiğini ve neleri ilginç bulduğunu anlamak için ziyaretleri kendi
          sunucumda kaydediyorum. Reklam yok, veriler kimseyle paylaşılmıyor ya
          da satılmıyor.
        </p>

        <h2>Neler kaydediliyor?</h2>
        <ul>
          <li>
            IP adresin ve ondan çıkarılan yaklaşık konum (şehir, ülke, internet
            sağlayıcı)
          </li>
          <li>Cihaz türü, tarayıcı, işletim sistemi, ekran boyutu ve dil</li>
          <li>
            Siteye nereden geldiğin (örneğin bir arama motoru ya da bağlantı)
          </li>
          <li>
            Açtığın sayfalar, tıkladığın bağlantı ve düğmeler, sayfada ne kadar
            aşağı indiğin
          </li>
        </ul>
        <p>
          Seni tekrar gelen bir ziyaretçi olarak tanıyabilmek için tarayıcında
          rastgele bir kimlik saklanıyor (çerez değil, tarayıcı deposu). Adın,
          e-postan ya da yazdığın hiçbir şey kaydedilmiyor.
        </p>

        <h2>Nerede ve ne kadar süre?</h2>
        <p>
          Kayıtlar bu sitenin kendi veritabanında tutulur ve {RETENTION_DAYS}{" "}
          gün sonra silinir. Konumu bulmak için IP adresi yalnızca ilk ziyarette
          ip-api.com hizmetine sorulur.
        </p>

        <h2>İstemiyorsan</h2>
        <p>
          Tarayıcının site verilerini silmen yeni bir ziyaretçi gibi görünmeni
          sağlar. Kayıtlarının silinmesini istersen{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="underline underline-offset-4"
          >
            {SITE.email}
          </a>{" "}
          adresine yazman yeterli; hepsini silerim.
        </p>
      </article>
    </main>
  );
}
