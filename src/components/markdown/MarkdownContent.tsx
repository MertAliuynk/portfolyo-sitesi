import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="font-display mt-10 mb-4 text-2xl font-bold text-paper sm:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display mt-8 mb-3 text-xl font-bold text-paper">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 leading-relaxed text-paper/75">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-paper">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 list-disc space-y-2 pl-6 text-paper/75">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal space-y-2 pl-6 text-paper/75">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="glass-panel mb-6 overflow-x-auto rounded-xl p-4 font-mono text-sm leading-relaxed text-paper/90">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-cyan underline decoration-cyan/30 underline-offset-4 hover:decoration-cyan"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-magenta/60 pl-4 text-paper/60 italic">
      {children}
    </blockquote>
  ),
};

/**
 * Renders a post body. Each mood passes its own `components` map so the
 * same markdown can look completely different per world; anything it
 * leaves out falls back to the original neon styling.
 */
export function MarkdownContent({
  content,
  components: overrides,
}: {
  content: string;
  components?: Components;
}) {
  return (
    <div className="max-w-none">
      <ReactMarkdown components={{ ...components, ...overrides }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
