import { useEffect, useRef, useState } from "react";
import { Brain, CheckCircle2, CircleDot, Sparkles } from "lucide-react";

const moments = [
  "أجمع خيوط طلبك…",
  "أفتّش في الذاكرة عن السياق المفيد…",
  "أرتّب الفكرة إلى خطوات…",
  "أراجع التفاصيل قبل أن أجيب…",
  "أصنع لك أقصر طريق للنتيجة…",
  "لحظة… أريد أن أجعل الجواب أفضل قليلًا ✨",
];

export default function ThinkingCompanion() {
  const [active, setActive] = useState(false);
  const [moment, setMoment] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const originalFetch = window.fetch;
    let pending = 0;
    const watched = (input: RequestInfo | URL) => String(typeof input === "string" ? input : input instanceof URL ? input.href : input.url).includes("/api/trpc/workspace.messages.send");

    window.fetch = async (...args) => {
      const shouldWatch = watched(args[0]);
      if (shouldWatch) {
        pending += 1;
        setActive(true);
      }
      try {
        return await originalFetch(...args);
      } finally {
        if (shouldWatch) {
          pending -= 1;
          if (pending <= 0) setActive(false);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    setMoment(0);
    timerRef.current = window.setInterval(() => setMoment(value => (value + 1) % moments.length), 1900);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-50 w-[min(330px,calc(100vw-2rem))]" dir="rtl" role="status" aria-live="polite">
      <div className="overflow-hidden rounded-2xl border border-[#dedbd4] bg-[#fbfaf7]/95 p-3 shadow-xl shadow-[#24332b]/10 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#24332b] text-white">
            <Brain className="size-5" />
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#e7b08f] text-[#573523]"><Sparkles className="size-2.5" /></span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-extrabold text-[#26342b]">نواة تعمل من أجلك</p>
              <CircleDot className="size-3 animate-pulse text-[#bd653e]" />
            </div>
            <p className="mt-1 truncate text-[10px] text-[#707b74]">{moments[moment]}</p>
          </div>
          <CheckCircle2 className="size-4 shrink-0 text-[#6e9278]" />
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e9e6df]"><div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[#bd653e]" /></div>
      </div>
    </div>
  );
}
