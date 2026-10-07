import type { MoodId } from "~/lib/moods";
import { RememberMood } from "~/components/mood/RememberMood";

/**
 * Each mood route renders this from its layout. The <style> is server
 * rendered, so the page never flashes the default dark body before the
 * mood's own colours kick in, and it disappears with the layout on
 * client-side navigation.
 */
export function MoodTheme({
  mood,
  bg,
  fg,
  selectionBg,
  selectionFg,
  scrollbar,
}: {
  mood: MoodId;
  bg: string;
  fg: string;
  selectionBg: string;
  selectionFg: string;
  scrollbar: string;
}) {
  const css = `
    html, body { background: ${bg} !important; color: ${fg}; }
    ::selection { background: ${selectionBg}; color: ${selectionFg}; }
    ::-webkit-scrollbar-track { background: ${bg}; }
    ::-webkit-scrollbar-thumb { background: ${scrollbar}; border-color: ${bg}; }
  `;

  return (
    <>
      <style>{css}</style>
      <RememberMood mood={mood} />
    </>
  );
}
