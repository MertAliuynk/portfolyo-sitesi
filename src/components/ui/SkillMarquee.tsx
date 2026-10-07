export function SkillMarquee({ skills }: { skills: readonly string[] }) {
  const items = [...skills, ...skills];

  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="animate-marquee flex w-max gap-3">
        {items.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="glass-panel shrink-0 rounded-full px-4 py-2 text-sm font-medium text-paper/80"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
