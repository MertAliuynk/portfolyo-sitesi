import { ProjectEditor } from "~/components/admin/ProjectEditor";

export const metadata = { title: "Projeyi düzenle" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectEditor id={id} />;
}
