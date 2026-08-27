import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Archive, Clock3, FileText, FolderOpen, Loader2, MessageSquareText, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

function dateLabel(value: Date | string) {
  return new Date(value).toLocaleString("ar-SA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Library() {
  const [, setLocation] = useLocation();
  const sessionsQuery = trpc.workspace.sessions.list.useQuery();
  const filesQuery = trpc.workspace.files.list.useQuery();
  const resultsQuery = trpc.workspace.library.recentResults.useQuery();
  const isLoading = sessionsQuery.isLoading || filesQuery.isLoading || resultsQuery.isLoading;
  const hasError = sessionsQuery.isError || filesQuery.isError || resultsQuery.isError;

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-[#738078]"><Loader2 className="size-5 animate-spin" />جارٍ ترتيب مكتبتك…</div>;
  }

  if (hasError) {
    return <div className="workspace-card mx-auto max-w-xl p-8 text-center"><Archive className="mx-auto size-8 text-[#bd653e]" /><h1 className="mt-4 text-lg font-extrabold">تعذّر تحميل المكتبة</h1><p className="mt-2 text-sm leading-7 text-[#748078]">تحقق من اتصالك ثم أعد المحاولة. لم يتم حذف أي من محتواك.</p><Button onClick={() => { void sessionsQuery.refetch(); void filesQuery.refetch(); void resultsQuery.refetch(); }} className="mt-5 rounded-xl bg-[#24332b] text-white">إعادة المحاولة</Button></div>;
  }

  const sessions = sessionsQuery.data ?? [];
  const files = filesQuery.data ?? [];
  const results = resultsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-[1320px]" dir="rtl">
      <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="workspace-kicker">المكتبة</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#17221c] sm:text-4xl">كل سياقك، في مكانه.</h1><p className="mt-3 text-sm leading-7 text-[#68736d]">راجع الجلسات السابقة، الملفات المرفوعة، والنتائج التي أنشأتها خلال عملك.</p></div>
        <Button onClick={() => setLocation("/")} className="rounded-xl bg-[#24332b] text-white hover:bg-[#17221c]"><MessageSquareText className="ml-2 size-4" />العودة للمحادثات</Button>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="workspace-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#ebe8e0] px-5 py-4"><div><h2 className="text-base font-extrabold text-[#27382e]">النتائج الحديثة</h2><p className="mt-0.5 text-[11px] text-[#8a938e]">مخرجات المساعد المحفوظة تلقائيًا</p></div><Sparkles className="size-4 text-[#bd653e]" /></div>
          {results.length === 0 ? <div className="p-10 text-center"><Sparkles className="mx-auto size-7 text-[#c8cec8]" /><p className="mt-3 text-sm font-bold text-[#526057]">لا توجد نتائج بعد</p><p className="mt-1 text-xs leading-6 text-[#8a938e]">أرسل أول طلب في المحادثة لتظهر نتائجك هنا.</p></div> : <div className="divide-y divide-[#eeeae2]">{results.map(result => <button key={result.id} onClick={() => setLocation("/")} className="w-full px-5 py-4 text-right transition-colors hover:bg-[#fcfbf8]"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-bold text-[#314238]">{result.title}</p><p className="mt-1 line-clamp-2 text-xs leading-6 text-[#718078]">{result.content}</p></div><span className="shrink-0 text-[10px] text-[#a0a7a2]">{dateLabel(result.createdAt)}</span></div><p className="mt-2 text-[10px] font-semibold text-[#bd653e]">{result.sessionTitle}</p></button>)}</div>}
        </section>

        <section className="workspace-card p-5"><div className="flex items-center gap-2"><FileText className="size-4 text-[#bd653e]" /><h2 className="text-base font-extrabold text-[#27382e]">الملفات</h2><span className="mr-auto rounded-lg bg-[#f1eee7] px-2 py-1 text-[11px] font-bold text-[#748078]">{files.length}</span></div>{files.length === 0 ? <div className="py-10 text-center"><FolderOpen className="mx-auto size-7 text-[#c8cec8]" /><p className="mt-3 text-xs leading-6 text-[#84908a]">لم ترفع ملفات إلى مساحة العمل بعد.</p></div> : <div className="mt-4 space-y-2">{files.slice(0, 7).map(file => <a key={file.id} href={file.storageUrl} className="flex items-center gap-3 rounded-xl bg-[#f7f5ef] p-3 transition-colors hover:bg-[#eceae4]"><span className="flex size-8 items-center justify-center rounded-lg bg-white text-[#bd653e]"><FileText className="size-3.5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[#46564b]">{file.fileName}</span><span className="mt-0.5 block text-[10px] text-[#929a95]">{Math.ceil(file.sizeBytes / 1024)} كيلوبايت</span></span></a>)}</div>}</section>
      </div>

      <section className="workspace-card mt-5 overflow-hidden"><div className="flex items-center gap-2 border-b border-[#ebe8e0] px-5 py-4"><Clock3 className="size-4 text-[#5e7d67]" /><div><h2 className="text-base font-extrabold text-[#27382e]">سجل الجلسات</h2><p className="mt-0.5 text-[11px] text-[#8a938e]">حافظ على استمرارية العمل عبر الجلسات</p></div></div>{sessions.length === 0 ? <div className="p-8 text-center text-sm text-[#84908a]">لا توجد جلسات محفوظة حتى الآن.</div> : <div className="grid divide-y divide-[#eeeae2] md:grid-cols-2 md:divide-x md:divide-y-0">{sessions.map(session => <button key={session.id} onClick={() => setLocation("/")} className="flex items-center gap-3 p-4 text-right transition-colors hover:bg-[#fcfbf8]"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f0ea] text-[#3d7651]"><MessageSquareText className="size-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-bold text-[#415047]">{session.title}</span><span className="mt-1 block text-[10px] text-[#919994]">آخر تحديث {dateLabel(session.updatedAt)}</span></span></button>)}</div>}</section>
    </div>
  );
}
