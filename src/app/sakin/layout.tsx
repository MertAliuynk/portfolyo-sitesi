import { MoodTheme } from "~/components/mood/MoodTheme";

export default function SakinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MoodTheme
        mood="sakin"
        bg="#ECE5D8"
        fg="#2F3A2F"
        selectionBg="#C9D2BC"
        selectionFg="#2F3A2F"
        scrollbar="#8A9A7B"
      />
      {children}
    </>
  );
}
