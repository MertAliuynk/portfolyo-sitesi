/** Neutral workspace colours for every /admin screen (overrides the dark body). */
export function AdminTheme() {
  return (
    <style>{`
      html, body { background: #f6f5f2 !important; color: #1c1917; }
      ::selection { background: #bfdbfe; color: #1c1917; }
      ::-webkit-scrollbar-track { background: #f6f5f2; }
      ::-webkit-scrollbar-thumb { background: #d6d3d1; border-color: #f6f5f2; }
    `}</style>
  );
}
