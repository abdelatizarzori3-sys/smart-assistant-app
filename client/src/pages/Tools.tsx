import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BarChart3, Braces, FilePenLine, Github, Loader2, Rocket, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

const GITHUB_REPO = "https://github.com/abdelatizarzori3-sys/smart-assistant-app";

const workflows = [
  {
    id: "app-builder",
    title: "إنتاج التطبيقات وربط GitHub",
    description: "حوّل فكرتك إلى تطبيق كامل: تحليل المتطلبات، تصميم الواجهة، بناء المكونات والـAPI، إعداد قاعدة البيانات، الاختبارات، ثم تجهيز المشروع وربطه بمستودع GitHub.",
    prompt: "أريد إنشاء تطبيق كامل من فكرة سأعطيك إياها. تعامل معي كمهندس منتج ومطور Full-Stack: ابدأ بتحليل الفكرة والمتطلبات، ثم اقترح المعمارية والتقنيات وقاعدة البيانات والواجهات. بعد موافقتي أنشئ خطة تنفيذية واضحة، واكتب الشيفرة والملفات المطلوبة، وأضف الاختبارات وإعدادات النشر. اجعل المشروع جاهزًا للرفع إلى GitHub والنشر على Railway أو Vercel. عند الحاجة، اطلب مني فقط المعلومات الضرورية.",
    icon: Rocket,
    tone: "bg-[#e7f3ec] text-[#2f7a50]",
  },
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
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold tracking-[0.15em] text-[#f0cbb4]">مركز إنتاج التطبيقات</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">من فكرة إلى تطبيق جاهز للنشر.</h1>
          <p className="mt-4 text-sm leading-8 text-[#c7d1ca]">استخدم مولد التطبيقات لبناء مشروع Full-Stack من الصفر، مع خطة تقنية، قاعدة بيانات، API، واجهة، اختبارات وتجهيز للنشر وربط GitHub.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => startWorkflow(workflows[0])} disabled={isBusy} className="h-11 rounded-xl bg-white px-5 text-[#24332b] hover:bg-[#eef2ef]">
              {isBusy ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Rocket className="ml-2 size-4" />} ابدأ إنتاج تطبيق
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white">
              <a href={GITHUB_REPO} target="_blank" rel="noreferrer"><Github className="ml-2 size-4" /> مستودع GitHub</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

      <section className="mt-7 rounded-2xl border border-[#e4e0d7] bg-[#fbfaf7] px-5 py-4 text-xs leading-6 text-[#717b75]">
        <strong className="text-[#34433b]">مسار GitHub:</strong> بعد توليد التطبيق، يمكن تجهيز الملفات والمشروع ليكون مناسبًا للرفع إلى مستودع GitHub الحالي ثم نشره على Railway أو Vercel. رابط المستودع الحالي محفوظ داخل الأداة.
      </section>
    </div>
  );
}
