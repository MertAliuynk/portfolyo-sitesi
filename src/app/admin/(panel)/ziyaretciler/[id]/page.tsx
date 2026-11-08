import { VisitDetail } from "~/components/admin/analytics/VisitDetail";

export const metadata = { title: "Ziyaret" };

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VisitDetail id={id} />;
}
