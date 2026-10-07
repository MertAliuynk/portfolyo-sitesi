"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useBest } from "~/lib/highscore";
import { cn } from "~/lib/utils";

const PASSAGES = [
  "Basit olan her zaman kolay değildir. İyi bir yazılım, karmaşıklığı kullanıcıdan saklar ama geliştiriciden saklamaz.",
  "Önce çalışır hale getir, sonra doğru hale getir, en son hızlı hale getir. Sıralamayı değiştirmek genellikle pahalıya patlar.",
  "Kod bir kez yazılır ama defalarca okunur. Bu yüzden isimlendirmeye harcanan her dakika, ileride saatler kazandırır.",
  "Performans bir özellik değil, bir sorumluluktur. Kullanıcı beklediği her saniyede ürüne olan güvenini biraz daha kaybeder.",
  "Bir sistemin sınırlarını net çizmek, içini mükemmel yazmaktan daha değerlidir. Sınırlar doğruysa iç kısım sonra düzelir.",
];

export function Typing() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [focused, setFocused] = useState(false);
  const [record, setRecord] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { best, submit } = useBest("ciddi-yazma");

  const text = PASSAGES[index]!;
  const done = finishedAt !== null;

  useEffect(() => {
    setIndex(Math.floor(Math.random() * PASSAGES.length));
  }, []);

  useEffect(() => {
    if (!startedAt || done) return;
    const id = setInterval(() => setNow(performance.now()), 200);
    return () => clearInterval(id);
  }, [startedAt, done]);

  const correct = useMemo(
    () => typed.split("").filter((ch, i) => ch === text[i]).length,
    [typed, text],
  );
  const elapsed = startedAt ? ((finishedAt ?? now) - startedAt) / 1000 : 0;
  const wpm = elapsed > 1 ? Math.round(correct / 5 / (elapsed / 60)) : 0;
  const accuracy = strokes ? Math.round(((strokes - errors) / strokes) * 100) : 100;

  function onChange(value: string) {
    if (done) return;
    if (value.length > text.length) value = value.slice(0, text.length);
    if (!startedAt && value.length) setStartedAt(performance.now());
    if (value.length > typed.length) {
      setStrokes((n) => n + 1);
      const i = value.length - 1;
      if (value[i] !== text[i]) setErrors((e) => e + 1);
    }
    setTyped(value);
    if (value.length === text.length) {
      const end = performance.now();
      setFinishedAt(end);
      const secs = (end - (startedAt ?? end)) / 1000;
      const finalCorrect = value.split("").filter((ch, i) => ch === text[i]).length;
      const finalWpm = Math.round(finalCorrect / 5 / (secs / 60));
      setRecord(submit(finalWpm));
    }
  }

  function next() {
    setIndex((i) => (i + 1) % PASSAGES.length);
    setTyped("");
    setErrors(0);
    setStrokes(0);
    setStartedAt(null);
    setFinishedAt(null);
    setRecord(false);
    inputRef.current?.focus();
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 border-y border-[#111]">
        {[
          ["Kelime / dk", wpm],
          ["Doğruluk", `%${accuracy}`],
          ["Süre", `${elapsed.toFixed(0)} sn`],
        ].map(([k, v], i) => (
          <div key={k} className={cn("py-3", i > 0 && "border-l border-[#111]/20 pl-4")}>
            <p className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">{k}</p>
            <p className="font-editorial text-4xl leading-none tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "relative cursor-text border bg-[#FAF9F6] p-6 sm:p-8",
          focused ? "border-[#111]" : "border-[#111]/30",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <p className="font-swiss text-[22px] leading-[1.7] break-words sm:text-[26px]" aria-hidden>
          {text.split("").map((ch, i) => {
            const t = typed[i];
            const isCursor = i === typed.length && !done;
            return (
              <span
                key={i}
                className={cn(
                  t === undefined && "text-[#A8A39A]",
                  t !== undefined && t === ch && "text-[#111]",
                  t !== undefined && t !== ch && "bg-[#E5381F]/15 text-[#E5381F]",
                  isCursor && focused && "shadow-[inset_2px_0_0_#E5381F] animate-pulse",
                )}
              >
                {ch}
              </span>
            );
          })}
        </p>
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Metni buraya yaz"
          className="absolute inset-0 h-full w-full resize-none opacity-0"
        />
        {!focused && !done && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">
            Başlamak için metne tıkla ve yazmaya başla
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-swiss text-[14px] text-[#4A4A4A]">
          {done ? (
            <>
              Tamamlandı: <strong className="font-semibold text-[#111]">{wpm} kelime/dk</strong>, %{accuracy} doğruluk.
              {record && <span className="ml-2 text-[#E5381F]">Yeni kişisel rekor.</span>}
            </>
          ) : (
            <>En iyi sonucun: {best !== null ? `${best} kelime/dk` : "henüz yok"}</>
          )}
        </p>
        <button
          type="button"
          onClick={next}
          className="border border-[#111] px-4 py-2 font-plex text-[12px] tracking-[0.06em] uppercase transition-colors hover:bg-[#111] hover:text-[#F4F2EE]"
        >
          {done ? "Sonraki metin →" : "Metni değiştir"}
        </button>
      </div>
    </div>
  );
}
