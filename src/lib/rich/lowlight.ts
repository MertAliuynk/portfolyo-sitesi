import { common, createLowlight } from "lowlight";

/** One shared instance for the editor and every mood's renderer. */
export const lowlight = createLowlight(common);

export const CODE_LANGUAGES: { id: string; label: string }[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "tsx", label: "TSX / JSX" },
  { id: "bash", label: "Terminal" },
  { id: "json", label: "JSON" },
  { id: "css", label: "CSS" },
  { id: "xml", label: "HTML" },
  { id: "python", label: "Python" },
  { id: "sql", label: "SQL" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "php", label: "PHP" },
  { id: "yaml", label: "YAML" },
  { id: "markdown", label: "Markdown" },
  { id: "diff", label: "Diff" },
  { id: "plaintext", label: "Düz metin" },
];

/** short names people write after ``` mapped to the list above */
const ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  jsx: "tsx",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  html: "xml",
  yml: "yaml",
  py: "python",
  md: "markdown",
  cs: "csharp",
  text: "plaintext",
  txt: "plaintext",
};

export function normalizeLanguage(id: string | null | undefined) {
  if (!id) return null;
  const lower = id.toLowerCase();
  return ALIASES[lower] ?? lower;
}

export function languageLabel(id: string | null | undefined) {
  const norm = normalizeLanguage(id);
  if (!norm) return "Kod";
  return CODE_LANGUAGES.find((l) => l.id === norm)?.label ?? id!;
}
