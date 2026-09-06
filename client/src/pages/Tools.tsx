import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BarChart3,
  Braces,
  BriefcaseBusiness,
  CalendarCheck,
  CheckSquare2,
  ClipboardList,
  FilePenLine,
  FileText,
  Globe2,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  Mail,
  Megaphone,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useLocation } from "wouter";

type Category = "الكل" | "الكتابة" | "البرمجة" | "التحليل" | "العمل" | "التسويق" | "التعلم";

type Workflow = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: Exclude<Category, "الكل">;
  icon: LucideIcon;
  tone: string;
  tag: string;
};

const categories: Category[] = ["الكل", "الكتابة", "البرمجة", "التحليل", "العمل", "التسويق", "التعلم"];

const workflows: Workflow[] = [
  { id: "writing", title: "الكتابة والتحرير", description: "حوّل الملاحظات المبعثرة إلى مسودات واضحة، ورسائل، وخطط، ومحتوى منظم.", prompt: "ساعدني في كتابة مسودة احترافية. ابدأ بتحديد البنية المناسبة، ثم اسألني فقط عن التفاصيل الضرورية أو استخدم افتراضات واضحة.", category: "الكتابة", icon: FilePenLine, tone: "bg-[#fff2e9] text-[#bd653e]", tag: "الأكثر استخدامًا" },
  { id: "email", title: "رسائل احترافية", description: "اكتب بريدًا واضحًا ومقنعًا يحافظ على النبرة المناسبة والطلب الأساسي.", prompt: "اكتب لي رسالة بريد احترافية. استخرج الهدف والجمهور والنبرة، ثم قدّم نسخة جاهزة للإرسال مع عنوان مناسب.", category: "الكتابة", icon: Mail, tone: "bg-[#f4eddd] text-[#967b4e]", tag: "جاهز للبدء" },
  { id: "summary", title: "تلخيص وملاحظات", description: "اختصر مستندًا أو اجتماعًا إلى ملخص تنفيذي وقرارات ونقاط متابعة.", prompt: "لخّص المحتوى الذي سأرسله في ملخص تنفيذي، أهم الأفكار، القرارات، المهام، والأسئلة المفتوحة.", category: "الكتابة", icon: FileText, tone: "bg-[#e8f0ea] text-[#3d7651]", tag: "مفيد يوميًا" },
  { id: "translation", title: "ترجمة محلية", description: "ترجم النصوص مع الحفاظ على المعنى والنبرة والسياق الثقافي للوجهة.", prompt: "ترجم النص الذي سأرسله إلى اللغة المطلوبة مع الحفاظ على النبرة، ثم اشرح أي تعبيرات تحتاج إلى تكييف محلي.", category: "الكتابة", icon: Languages, tone: "bg-[#edf0f8] text-[#536d9d]", tag: "لغات وسياق" },
  { id: "code", title: "البرمجة والبناء", description: "خطط للميزات، راجع الشيفرة، وشخّص الأخطاء بطريقة مرتبة وقابلة للتنفيذ.", prompt: "أريد العمل على مهمة برمجية. ساعدني في فهم المطلوب، تصميم الحل، كتابة أو مراجعة الشيفرة، ثم اقتراح اختبار مناسب.", category: "البرمجة", icon: Braces, tone: "bg-[#e8f0ea] text-[#3d7651]", tag: "للمطورين" },
  { id: "debug", title: "تشخيص الأخطاء", description: "حوّل رسالة الخطأ إلى سبب محتمل وخطوات فحص وإصلاح قابلة للتجربة.", prompt: "شخّص الخطأ الذي سأرسله. تتبّع مسار المشكلة، حدّد السبب المرجح، ثم اقترح إصلاحًا واختبارًا يمنع تكرارها.", category: "البرمجة", icon: ShieldCheck, tone: "bg-[#f9e9e7] text-[#af5f5b]", tag: "حل المشكلات" },
  { id: "review", title: "مراجعة الشيفرة", description: "راجع الجودة والأمان وقابلية الصيانة، ثم اقترح تحسينات مرتبة حسب الأولوية.", prompt: "راجع الشيفرة التي سأرسلها من ناحية الصحة، الأمان، الأداء، قابلية القراءة، والاختبارات. رتّب الملاحظات حسب الأولوية.", category: "البرمجة", icon: CheckSquare2, tone: "bg-[#f4eddd] text-[#967b4e]", tag: "جودة وأمان" },
  { id: "content-analysis", title: "تحليل المحتوى", description: "استخرج الأفكار والقرارات والمخاطر والفرص من النصوص والملفات والملاحظات.", prompt: "حلّل المحتوى الذي سأرسله. نظّم النتيجة في ملخص، أفكار رئيسية، نقاط قابلة للتنفيذ، وأسئلة مفتوحة إن وجدت.", category: "التحليل", icon: BarChart3, tone: "bg-[#edf0f8] text-[#536d9d]", tag: "قراءة أعمق" },
  { id: "data", title: "تحليل البيانات", description: "حوّل جداولك وأرقامك إلى مؤشرات واتجاهات واستنتاجات وقرارات واضحة.", prompt: "حلّل البيانات التي سأرسلها. ابدأ بفهم الأعمدة وجودة البيانات، ثم استخرج الاتجاهات والشذوذ والتوصيات العملية.", category: "التحليل", icon: ListChecks, tone: "bg-[#e7f1f2] text-[#3e7b83]", tag: "أرقام وقرارات" },
  { id: "research", title: "بحث ومقارنة", description: "نظّم سؤالًا معقدًا إلى محاور مقارنة ومعايير قرار ومخرجات قابلة للتوثيق.", prompt: "حوّل موضوعي إلى خطة بحث ومقارنة. حدّد المعايير، الافتراضات، مصادر التحقق، ثم قدّم خلاصة تساعدني على القرار.", category: "التحليل", icon: Globe2, tone: "bg-[#f4eddd] text-[#967b4e]", tag: "استكشاف" },
  { id: "project", title: "خطة مشروع", description: "حوّل الفكرة إلى نطاق ومراحل ومهام ومخاطر ومعايير نجاح قابلة للمتابعة.", prompt: "حوّل هذه الفكرة إلى خطة مشروع عملية تشمل الهدف، النطاق، المراحل، المهام، المخاطر، ومعايير النجاح.", category: "العمل", icon: ClipboardList, tone: "bg-[#fff2e9] text-[#bd653e]", tag: "من الفكرة للتنفيذ" },
  { id: "meeting", title: "اجتماع ذكي", description: "جهّز جدول الأعمال، أسئلة النقاش، قالب المحضر، وخطة متابعة بعد الاجتماع.", prompt: "جهّز اجتماعًا حول هذا الموضوع. أنشئ جدول الأعمال، الأسئلة، القرارات المطلوبة، وقالبًا لمتابعة المهام بعد الاجتماع.", category: "العمل", icon: CalendarCheck, tone: "bg-[#e8f0ea] text-[#3d7651]", tag: "تنظيم" },
  { id: "presentation", title: "عرض تقديمي", description: "ابنِ هيكل عرض مقنعًا من الفكرة إلى الرسالة الرئيسية والنقاط البصرية.", prompt: "أنشئ مخطط عرض تقديمي لهذا الموضوع. حدّد الجمهور والرسالة، ثم وزّع المحتوى على شرائح بعناوين ونقاط واضحة.", category: "العمل", icon: Presentation, tone: "bg-[#edf0f8] text-[#536d9d]", tag: "سرد بصري" },
  { id: "marketing", title: "خطة تسويق", description: "حدّد الجمهور والرسالة والقنوات والمحتوى ومؤشرات القياس لحملة واقعية.", prompt: "أنشئ خطة تسويق عملية لهذا المنتج أو العرض. حدّد الجمهور، الرسالة، القنوات، أنواع المحتوى، والقياسات.", category: "التسويق", icon: Megaphone, tone: "bg-[#f9e9e7] text-[#af5f5b]", tag: "نمو" },
  { id: "content-plan", title: "خطة محتوى", description: "حوّل هدفك إلى تقويم محتوى بأفكار وعناوين وزوايا وقنوات نشر.", prompt: "أنشئ خطة محتوى شهرية لهدفي. اقترح المحاور، العناوين، الزوايا، نوع المنشور، ودعوة الإجراء لكل فكرة.", category: "التسويق", icon: WandSparkles, tone: "bg-[#f4eddd] text-[#967b4e]", tag: "أفكار متجددة" },
  { id: "learning", title: "خطة تعلّم", description: "صمّم مسارًا تدريجيًا للتعلم مع تمارين ومشاريع ونقاط قياس واضحة.", prompt: "صمّم لي خطة تعلم عملية لهذا الموضوع. قسّمها إلى مراحل، مصادر مفاهيم، تمارين، ومشروع تطبيقي مع نقاط تحقق.", category: "التعلم", icon: Lightbulb, tone: "bg-[#fff2e9] text-[#bd653e]", tag: "تقدم واضح" },
  { id: "brief", title: "تحويل الطلب إلى مواصفة", description: "حوّل فكرة غير مكتملة إلى متطلبات وأهداف وحدود وأسئلة تنفيذية.", prompt: "حوّل طلبي إلى مواصفة واضحة. استخرج الهدف، المستخدم، النطاق، القيود، معايير النجاح، والافتراضات الضرورية.", category: "التعلم", icon: BriefcaseBusiness, tone: "bg-[#e8f0ea] text-[#3d7651]", tag: "وضوح أولًا" },
];

export default function Tools() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const createSession = trpc.workspace.sessions.create.useMutation();
  const sendMessage = trpc.workspace.messages.send.useMutation();
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

  const startWorkflow = (workflow: Workflow) => {
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
                setLocation("/workspace");
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
      <section className="rounded-[2rem] bg-[#24332b] px-6 py-8 text-white shadow-[0_22px_60px_-35px_rgba(36,51,43,0.7)] sm:px-10 sm:py-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="text-[11px] font-bold tracking-[0.15em] text-[#f0cbb4]">مكتبة المهارات</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">ابدأ من هدف واضح، وأنجز عملًا حقيقيًا.</h1><p className="mt-4 text-sm leading-8 text-[#c7d1ca]">اختر مسارًا جاهزًا، اكتب طلبك، واترك للمحادثة ترتيب التفاصيل والملفات والنتائج في مكان واحد.</p></div>
          <div className="flex shrink-0 gap-5 text-right"><div><strong className="block text-2xl font-black text-[#f0cbb4]">{workflows.length}</strong><span className="text-[11px] text-[#b5c4b8]">مهارة عملية</span></div><div><strong className="block text-2xl font-black text-[#c7e0ca]">{categories.length - 1}</strong><span className="text-[11px] text-[#b5c4b8]">مجالات عمل</span></div></div>
        </div>
      </section>

      <section className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#89938c]" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث عن مهارة أو نتيجة..." className="h-11 rounded-xl border-[#e2e0d8] bg-white pr-10 text-right text-sm" /></div><p className="text-xs font-bold text-[#78837b]">عرض {filteredWorkflows.length} من {workflows.length} مهارة</p></section>

      <section className="mt-4 flex gap-2 overflow-x-auto pb-1">{categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${activeCategory === category ? "bg-[#24332b] text-white" : "bg-[#f0eee7] text-[#6f7a71] hover:bg-[#e5ebe4]"}`}>{category}</button>)}</section>

      {filteredWorkflows.length > 0 ? <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredWorkflows.map(workflow => { const Icon = workflow.icon; return <article key={workflow.id} className="workspace-card group flex min-h-[286px] flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#24332b]/[.06]"><div className="flex items-start justify-between"><span className={`flex size-11 items-center justify-center rounded-2xl ${workflow.tone}`}><Icon className="size-5" /></span><span className="rounded-full bg-[#f7f5ef] px-2.5 py-1 text-[10px] font-bold text-[#8a928a]">{workflow.tag}</span></div><h2 className="mt-5 text-lg font-extrabold text-[#223229]">{workflow.title}</h2><p className="mt-2 flex-1 text-sm leading-7 text-[#6b766f]">{workflow.description}</p><Button onClick={() => startWorkflow(workflow)} disabled={isBusy} className="mt-5 h-10 rounded-xl bg-[#263a2e] text-white hover:bg-[#18291f]">{isBusy ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Sparkles className="ml-2 size-4" />} بدء المسار</Button></article>; })}</section> : <div className="workspace-card mt-6 flex min-h-56 flex-col items-center justify-center p-8 text-center"><Search className="size-8 text-[#a6aea7]" /><h2 className="mt-4 font-extrabold text-[#2b3b31]">لم نجد مهارة بهذا الاسم</h2><p className="mt-2 text-sm text-[#78837b]">جرّب كلمة أخرى أو اختر تصنيف «الكل».</p><Button variant="outline" onClick={() => { setQuery(""); setActiveCategory("الكل"); }} className="mt-5 rounded-xl">مسح البحث</Button></div>}

      <p className="mt-7 rounded-2xl border border-[#e4e0d7] bg-[#fbfaf7] px-5 py-4 text-xs leading-6 text-[#717b75]">كل مسار هو نقطة انطلاق منظمة. بعد البدء، يمكنك إضافة التفاصيل أو إرفاق الملفات أو تغيير اتجاه العمل داخل المحادثة في أي وقت.</p>
    </div>
  );
}
