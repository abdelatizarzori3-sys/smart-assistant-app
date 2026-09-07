import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, workflows, type Category, type Workflow } from "@/data/skillCatalog";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Tools() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("الكل");

  const filteredWorkflows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return workflows.filter(workflow => {
      const matchesCategory = activeCategory === "الكل" || workflow.category === activeCategory;
      const matchesQuery = !normalized || `${workflow.title} ${workflow.description} ${workflow.category}`.toLocaleLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const openLibrary = (workflow: Workflow) => setLocation(`/workspace/tools/${workflow.id}`);

  return (
    <div className="mx-auto max-w-[1240px]" dir="rtl">
      <section className="rounded-[2rem] bg-[#24332b] px-6 py-8 text-white shadow-[0_22px_60px_-35px_rgba(36,51,43,0.7)] sm:px-10 sm:py-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="text-[11px] font-bold tracking-[0.15em] text-[#f0cbb4]">مكتبة المهارات</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">كل مهارة لها مكتبتها وسياقها.</h1><p className="mt-4 text-sm leading-8 text-[#c7d1ca]">افتح مكتبة المهارة أولًا، ثم اجمع داخلها جلساتك وملفاتك ونتائجك دون أن تختلط مع باقي أعمالك.</p></div>
          <div className="flex shrink-0 gap-5 text-right"><div><strong className="block text-2xl font-black text-[#f0cbb4]">{workflows.length}</strong><span className="text-[11px] text-[#b5c4b8]">مكتبة مهارة</span></div><div><strong className="block text-2xl font-black text-[#c7e0ca]">{categories.length - 1}</strong><span className="text-[11px] text-[#b5c4b8]">مجالات عمل</span></div></div>
        </div>
      </section>

      <section className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#89938c]" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث عن مكتبة أو مهارة..." className="h-11 rounded-xl border-[#e2e0d8] bg-white pr-10 text-right text-sm" /></div><p className="text-xs font-bold text-[#78837b]">عرض {filteredWorkflows.length} من {workflows.length} مكتبة</p></section>
      <section className="mt-4 flex gap-2 overflow-x-auto pb-1">{categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${activeCategory === category ? "bg-[#24332b] text-white" : "bg-[#f0eee7] text-[#6f7a71] hover:bg-[#e5ebe4]"}`}>{category}</button>)}</section>

      {filteredWorkflows.length > 0 ? <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredWorkflows.map(workflow => { const Icon = workflow.icon; return <article key={workflow.id} className="workspace-card group flex min-h-[286px] flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#24332b]/[.06]"><div className="flex items-start justify-between"><span className={`flex size-11 items-center justify-center rounded-2xl ${workflow.tone}`}><Icon className="size-5" /></span><span className="rounded-full bg-[#f7f5ef] px-2.5 py-1 text-[10px] font-bold text-[#8a928a]">{workflow.tag}</span></div><h2 className="mt-5 text-lg font-extrabold text-[#223229]">{workflow.title}</h2><p className="mt-2 flex-1 text-sm leading-7 text-[#6b766f]">{workflow.description}</p><Button onClick={() => openLibrary(workflow)} className="mt-5 h-10 rounded-xl bg-[#263a2e] text-white hover:bg-[#18291f]"><Sparkles className="ml-2 size-4" /> فتح مكتبة المهارة</Button></article>; })}</section> : <div className="workspace-card mt-6 flex min-h-56 flex-col items-center justify-center p-8 text-center"><Search className="size-8 text-[#a6aea7]" /><h2 className="mt-4 font-extrabold text-[#2b3b31]">لم نجد مكتبة بهذا الاسم</h2><p className="mt-2 text-sm text-[#78837b]">جرّب كلمة أخرى أو اختر تصنيف «الكل».</p><Button variant="outline" onClick={() => { setQuery(""); setActiveCategory("الكل"); }} className="mt-5 rounded-xl">مسح البحث</Button></div>}
      <p className="mt-7 rounded-2xl border border-[#e4e0d7] bg-[#fbfaf7] px-5 py-4 text-xs leading-6 text-[#717b75]">كل مكتبة تحفظ سياقها بشكل مستقل. افتح واحدة، أنشئ جلسة داخلها، ثم أرفق ملفاتك لتبقى النتائج مرتبطة بالمهارة المناسبة.</p>
    </div>
  );
}
