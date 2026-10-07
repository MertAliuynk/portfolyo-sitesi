import { MoodTheme } from "~/components/mood/MoodTheme";

export default function NostaljikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MoodTheme
        mood="nostaljik"
        bg="#008080"
        fg="#000000"
        selectionBg="#000080"
        selectionFg="#FFFFFF"
        scrollbar="#C0C0C0"
      />
      {children}
    </>
  );
}
