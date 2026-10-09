import { PostEditor } from "~/components/admin/PostEditor";

export const metadata = { title: "Yeni yazı" };

export default function NewPostPage() {
  return <PostEditor id={null} />;
}
