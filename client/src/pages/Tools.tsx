import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BarChart3, Braces, FilePenLine, Loader2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

const workflows = [
  {
    id: "writing",
    title: "الكتابة والتحرير",
    description: "حوّل الملاحظات المبعثرة إلى مسودات واضحة، ورسائل، وخطط، ومحتوى منظم.",
    prompt: "ساعدني في كتابة مسودة احترافية. ابدأ بتحديد البنية المناسبة، ثم اسألني فقط عن التفاصيل الضرورية أو استخدم افتراضات واضحة.",
    icon: FilePenLine,
    tone: "bg-[#fff2e9] text-[#bd653e]",
  },
  {
    id: "code",
    title: "البرمجة والبناء",
    description: "خطط للميزات، راجع الشيفرة، وشخّص الأخطاء بطريقة مرتبة وقابلة للتنفيذ.",
    prompt: "أريد العمل على مهمة برمجية. ساعدني في فهم المطلوب، تصميم الحل، كتابة أو مراجعة الشيفرة، ثم اقتراح اختبار مناسب.",
    icon: Braces,
    tone: "bg-[#e8f0ea] text-[#3d7651]",
  },
  {
    id: "analysis",
    title: "تحليل المحتوى",
    description: "استخرج الأفكار والقرارات والمخاطر والفرص من النصوص والملفات والملاحظات.",
    prompt: "حلّل المحتوى الذي سأرسله. نظّم النتيجة في ملخص، أفكار رئيسية، نقاط قابلة للتنفيذ، وأسئلة مفتوحة إن وجدت.",
    icon: BarChart3,
    tone: "bg-[#edf0f8] text-[#536d9d]",
  },
];

export default function Tools() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const createSession = trpc.workspace.sessions.create.useMutation();
  const sendMessage = trpc.workspace.messages.send.useMutation();

  const startWorkflow = (workflow: (typeof workflows)[number]) => {
    createSession.mutate(
      { title: workflow.title },
      {
        onSuccess: session => {
          sendMessage.mutate(
            { sessionId: session.id, content: workflow.prompt, fileIds: [] },
            {
              onSuccess: () => {
                void utils.workspace.sessions.list.invalidate();
                void utils.workspace.library.recentResults.invalidate();
                setLocation("/");
              },
              onError: error => toast.error(error.message || "تعذّر بدء المسار."),
            },
          );
        },
        onError: () => toast.error("تعذّر إنشاء جلسة جديدة."),
      },
    );
  };

  const isBusy = createSession.isPending || sendMessage.isPending;

  return (
    <div className="mx-auto max-w-[1240px]" dir="rtl">
      <section className="rounded-[2rem] bg-[#24332b] px-6 py-9 text-white shadow-[0_22px_60px_-35px_rgba(36,51,43,0.7)] sm:px-10 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold tracking-[0.15em] text-[#f0cbb4]">مسارات العمل</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">ابدأ من هدف واضح، وليس من صفحة فارغة.</h1>
          <p className="mt-4 text-sm leading-8 text-[#c7d1ca]">تجهّز هذه المسارات جلسة جديدة بإطار عمل عملي، ثم تنقلك إلى المحادثة لمتابعة التفاصيل والملفات والنتائج في مكان واحد.</p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {workflows.map(workflow => {
          const Icon = workflow.icon;
          return (
            <article key={workflow.id} className="workspace-card flex min-h-[300px] flex-col p-6 transition-transform duration-200 hover:-translate-y-1">
              <span className={`flex size-12 items-center justify-center rounded-2xl ${workflow.tone}`}><Icon className="size-5" /></span>
              <h2 className="mt-6 text-lg font-extrabold text-[#223229]">{workflow.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#6b766f]">{workflow.description}</p>
              <Button onClick={() => startWorkflow(workflow)} disabled={isBusy} className="mt-6 h-10 rounded-xl bg-[#263a2e] text-white hover:bg-[#18291f]">
                {isBusy ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Sparkles className="ml-2 size-4" />} بدء المسار
              </Button>
            </article>
          );
        })}
      </section>

      <p className="mt-7 rounded-2xl border border-[#e4e0d7] bg-[#fbfaf7] px-5 py-4 text-xs leading-6 text-[#717b75]">تعمل المسارات كنقطة انطلاق منظمة؛ يمكنك إضافة التفاصيل أو تعديل اتجاه العمل داخل المحادثة في أي وقت.</p>
    </div>
  );
}
