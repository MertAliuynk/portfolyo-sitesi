import { PostEditor } from "~/components/admin/PostEditor";

export const metadata = { title: "Yazıyı düzenle" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditor id={id} />;
}
