import { useLocation } from "wouter";
import { ArrowUpLeft, Sparkles } from "lucide-react";
import { workflows } from "@/data/skillCatalog";

const featured = ["github", "code", "research", "writing", "content-analysis", "project", "learning", "debug"];

export default function QuickSkills() {
  const [, setLocation] = useLocation();
  const skills = featured.map(id => workflows.find(item => item.id === id)).filter(Boolean);

  return (
    <section className="mb-5 rounded-2xl border border-[#e5e2da] bg-[#fbfaf7] p-3 shadow-sm" dir="rtl" aria-label="مهارات المساعد">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#e5ede7] text-[#34503e]"><Sparkles className="size-3.5" /></span>
          <div>
            <p className="text-xs font-extrabold text-[#26342b]">مهارات سريعة</p>
            <p className="text-[10px] text-[#8a938e]">اختر طريقة العمل قبل أن تبدأ</p>
          </div>
        </div>
        <button onClick={() => setLocation("/workspace/tools")} className="text-[10px] font-bold text-[#a85e3d] hover:underline">عرض الكل</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {skills.map(skill => skill ? (
          <button
            key={skill.id}
            onClick={() => setLocation(`/workspace/tools/${skill.id}`)}
            className="group flex min-w-[148px] shrink-0 items-center gap-2 rounded-xl border border-[#e7e3db] bg-white px-3 py-2 text-right transition-all hover:-translate-y-0.5 hover:border-[#d8c9bd] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d17b4d]"
            title={skill.description}
          >
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${skill.tone}`}><skill.icon className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-extrabold text-[#334139]">{skill.title}</span>
              <span className="mt-0.5 block truncate text-[9px] text-[#8a938e]">{skill.tag}</span>
            </span>
            <ArrowUpLeft className="size-3 shrink-0 text-[#b0b5b1] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        ) : null)}
      </div>
    </section>
  );
}
