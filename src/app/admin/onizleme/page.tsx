import { PreviewHost } from "~/components/admin/PreviewHost";
import { isMoodId } from "~/lib/moods";

export const metadata = {
  title: "Önizleme",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ mod?: string }>;
}) {
  const { mod } = await searchParams;
  return <PreviewHost mood={isMoodId(mod) ? mod : "mutlu"} />;
}
