import { MoodGate } from "~/components/mood/MoodGate";
import { HOME_TITLE, JsonLd, pageMeta, personJsonLd, siteUrl, websiteJsonLd } from "~/lib/seo";

export const metadata = pageMeta({ title: HOME_TITLE, canonical: "/" });

export default async function Home() {
  const url = await siteUrl();
  return (
    <>
      <JsonLd data={personJsonLd(url)} />
      <JsonLd data={websiteJsonLd(url)} />
      <MoodGate />
    </>
  );
}
