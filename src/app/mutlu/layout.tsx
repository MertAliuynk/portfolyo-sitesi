import { MoodTheme } from "~/components/mood/MoodTheme";

export default function MutluLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MoodTheme
        mood="mutlu"
        bg="#FFF1D6"
        fg="#1A1A1A"
        selectionBg="#FFC93C"
        selectionFg="#1A1A1A"
        scrollbar="#FF5A36"
      />
      {children}
    </>
  );
}
