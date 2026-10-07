import { MoodTheme } from "~/components/mood/MoodTheme";

export default function CiddiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MoodTheme
        mood="ciddi"
        bg="#F4F2EE"
        fg="#111111"
        selectionBg="#E5381F"
        selectionFg="#F4F2EE"
        scrollbar="#111111"
      />
      {children}
    </>
  );
}
