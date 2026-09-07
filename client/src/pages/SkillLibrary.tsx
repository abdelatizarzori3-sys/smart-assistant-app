import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { ArrowRight, FileText, FolderOpen, Loader2, MessageSquare, Plus, Sparkles } from "lucide-react";
import { getWorkflow } from "@/data/skillCatalog";
import { toast } from "sonner";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميغابايت`;
}

function QueryNotice({ label, error, onRetry }: { label: string; error: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e7c8bd] bg-[#fff8f4] p-5 text-center">
      <p className="text-sm font-bold text-[#8c4f3d]">تعذّر تحميل {label}</p>
      <p className="mt-1 text-xs leading-6 text-[#9a766b]">{error || "حدث خطأ غير متوقع. حاول مرة أخرى."}</p>
      <Button variant="outline" onClick={onRetry} className="mt-3 h-9 rounded-xl border-[#e7c8bd] bg-white text-xs text-[#8c4f3d] hover:bg-[#fff1ea]">إعادة المحاولة</Button>
    </div>
  );
}

export default function SkillLibrary() {
  const { skillId = "general" } = useParams<{ skillId: string }>();
  const [, setLocation] = useLocation();
  const workflow = getWorkflow(skillId);
  const sessionsQuery = trpc.workspace.sessions.list.useQuery({ skillId });
  const filesQuery = trpc.workspace.files.listForSkill.useQuery({ skillId });
  const resultsQuery = trpc.workspace.library.recentResults.useQuery({ skillId });
  const createSession = trpc.workspace.sessions.create.useMutation({
    onSuccess: session => setLocation(`/workspace?sessionId=${session.id}`),
    onError: error => toast.error(error.message || "تعذّر إنشاء مساحة المهارة."),
  });

  if (!workflow) {
    return (
      <div className="workspace-card mx-auto max-w-3xl p-8 text-center" dir="rtl">
        <p className="workspace-kicker">مكتبة المهارات</p>
        <h1 className="mt-3 text-2xl font-extrabold text-[#17221c]">لم نعثر على هذه المهارة</h1>
        <Button onClick={() => setLocation("/workspace/tools")} className="mt-6 rounded-xl bg-[#24332b] text-white hover:bg-[#17221c]">العودة إلى الأدوات</Button>
      </div>
    );
  }

  const Icon = workflow.icon;
  const sessions = sessionsQuery.data ?? [];
  const files = filesQuery.data ?? [];
  const results = resultsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-[1550px]" dir="rtl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setLocation("/workspace/tools")} className="rounded-xl text-[#58665c] hover:bg-[#e9eee9]">
          <ArrowRight className="ml-2 size-4" /> العودة إلى مكتبة المهارات
        </Button>
        <Badge variant="outline" className="border-[#d7e4d9] bg-[#f3f8f3] text-[#3f694b]">مكتبة مستقلة</Badge>
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-[#24332b] p-6 text-white shadow-xl shadow-[#24332b]/10 sm:p-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3"><span className={`flex size-12 items-center justify-center rounded-2xl ${workflow.tone}`}><Icon className="size-5" /></span><span className="text-xs font-bold text-[#d9e6dc]">{workflow.category} · {workflow.tag}</span></div>
            <p className="mt-7 text-xs font-bold tracking-wide text-[#bbd1c1]">مكتبة مهارة</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{workflow.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[#d6e2d9]">{workflow.description} كل ما تنشئه هنا يبقى داخل سياق هذه المهارة، منفصلًا عن مكتباتك الأخرى.</p>
          </div>
          <Button onClick={() => createSession.mutate({ title: `جلسة ${workflow.title}`, skillId })} disabled={createSession.isPending} className="h-12 rounded-2xl bg-[#edaa83] px-6 font-extrabold text-[#24332b] hover:bg-[#f5bd9b]">
            {createSession.isPending ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Plus className="ml-2 size-4" />} جلسة جديدة في المكتبة
          </Button>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-black">{sessions.length}</p><p className="mt-1 text-xs text-[#c8d9cd]">جلسات هذه المهارة</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-black">{files.length}</p><p className="mt-1 text-xs text-[#c8d9cd]">ملفات مرتبطة</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-black">{results.length}</p><p className="mt-1 text-xs text-[#c8d9cd]">نتائج حديثة</p></div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="workspace-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3"><div><p className="workspace-kicker">سياق مستمر</p><h2 className="mt-1 text-xl font-extrabold text-[#203027]">جلسات {workflow.title}</h2></div><MessageSquare className="size-5 text-[#68806e]" /></div>
          {sessionsQuery.isLoading ? <div className="flex items-center gap-2 py-10 text-sm text-[#748079]"><Loader2 className="size-4 animate-spin" /> جارٍ تحميل الجلسات…</div> : sessionsQuery.isError ? <QueryNotice label="الجلسات" error={sessionsQuery.error.message} onRetry={() => void sessionsQuery.refetch()} /> : sessions.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d8e1d9] bg-[#f8fbf8] p-8 text-center"><Sparkles className="mx-auto size-6 text-[#68806e]" /><p className="mt-3 font-bold text-[#31513a]">لم تبدأ هذه المكتبة بعد</p><p className="mt-1 text-sm text-[#7a867e]">أنشئ جلسة لتحفظ العمل والملفات والنتائج داخل المهارة.</p></div> : <div className="grid gap-3">{sessions.map(session => <button key={session.id} onClick={() => setLocation(`/workspace?sessionId=${session.id}`)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#e6ebe5] bg-[#fcfdfb] p-4 text-right transition hover:border-[#b8cdbb] hover:bg-[#f4f8f4]"><span className="min-w-0"><span className="block truncate font-bold text-[#2b4032]">{session.title}</span><span className="mt-1 block text-xs text-[#87938b]">آخر تحديث {formatDate(session.updatedAt)} · {session.status === "active" ? "نشطة" : "مؤرشفة"}</span></span><ArrowRight className="size-4 shrink-0 text-[#79917e]" /></button>)}</div>}
        </section>

        <div className="grid gap-5">
          <section className="workspace-card p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="workspace-kicker">المخرجات</p><h2 className="mt-1 text-lg font-extrabold text-[#203027]">النتائج الحديثة</h2></div><FileText className="size-5 text-[#bd653e]" /></div>{resultsQuery.isLoading ? <div className="flex items-center gap-2 py-5 text-sm text-[#748079]"><Loader2 className="size-4 animate-spin" /> جارٍ تحميل النتائج…</div> : resultsQuery.isError ? <QueryNotice label="النتائج" error={resultsQuery.error.message} onRetry={() => void resultsQuery.refetch()} /> : results.length === 0 ? <p className="rounded-xl bg-[#fcfbf8] p-4 text-sm leading-7 text-[#7b867f]">ستظهر هنا الردود والنتائج المحفوظة لهذه المهارة.</p> : <div className="space-y-3">{results.slice(0, 4).map(result => <button key={result.id} onClick={() => setLocation(`/workspace?sessionId=${result.sessionId}`)} className="block w-full rounded-xl bg-[#fcfbf8] p-3 text-right hover:bg-[#f4f7f2]"><span className="line-clamp-1 text-sm font-bold text-[#35483a]">{result.title}</span><span className="mt-1 line-clamp-2 text-xs leading-5 text-[#7c8880]">{result.content}</span></button>)}</div>}</section>
          <section className="workspace-card p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="workspace-kicker">المرفقات</p><h2 className="mt-1 text-lg font-extrabold text-[#203027]">ملفات {workflow.title}</h2></div><FolderOpen className="size-5 text-[#68806e]" /></div>{filesQuery.isLoading ? <div className="flex items-center gap-2 py-5 text-sm text-[#748079]"><Loader2 className="size-4 animate-spin" /> جارٍ تحميل الملفات…</div> : filesQuery.isError ? <QueryNotice label="الملفات" error={filesQuery.error.message} onRetry={() => void filesQuery.refetch()} /> : files.length === 0 ? <p className="rounded-xl bg-[#fcfbf8] p-4 text-sm leading-7 text-[#7b867f]">أرفق ملفات داخل جلسة هذه المهارة لتظهر في مكتبتها.</p> : <div className="space-y-2">{files.slice(0, 5).map(file => <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#fcfbf8] p-3"><span className="min-w-0 truncate text-sm font-bold text-[#4d5b51]">{file.fileName}</span><span className="shrink-0 text-[11px] text-[#8a958e]">{formatBytes(file.sizeBytes)}</span></div>)}</div>}</section>
        </div>
      </div>
    </div>
  );
}
