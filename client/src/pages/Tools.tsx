import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BarChart3, Braces, Check, FilePenLine, Github, Loader2, Rocket, Sparkles, WandSparkles } from "lucide-react";
import { useLocation } from "wouter";

const GITHUB_REPO = "https://github.com/abdelatizarzori3-sys/smart-assistant-app";

const workflows = [
  { id: "writing", title: "الكتابة والتحرير", description: "حوّل الملاحظات إلى محتوى واضح واحترافي.", icon: FilePenLine },
  { id: "code", title: "البرمجة والبناء", description: "خطط للميزات واكتب وراجع الشيفرة.", icon: Braces },
  { id: "analysis", title: "تحليل المحتوى", description: "استخرج الأفكار والقرارات والمخاطر والفرص.", icon: BarChart3 },
];

export default function Tools() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const createSession = trpc.workspace.sessions.create.useMutation();
  const sendMessage = trpc.workspace.messages.send.useMutation();

  const [appName, setAppName] = useState("");
  const [idea, setIdea] = useState("");
  const [features, setFeatures] = useState("");
  const [appType, setAppType] = useState("تطبيق ويب");
  const [style, setStyle] = useState("مستقبلي واحترافي");
  const [database, setDatabase] = useState("MySQL");
  const [github, setGithub] = useState(GITHUB_REPO);

  const buildPrompt = () => `أنت مهندس منتجات وFull-Stack ومصمم UI/UX. أنشئ خطة تنفيذ كاملة للتطبيق التالي، ثم ابدأ التنفيذ عندما تكون المتطلبات واضحة.

اسم التطبيق: ${appName || "اسم مقترح"}
نوع التطبيق: ${appType}
الفكرة: ${idea || "لم يتم إدخال الفكرة بعد"}
الميزات المطلوبة: ${features || "اقترح أهم الميزات الأساسية"}
الهوية البصرية: ${style}
قاعدة البيانات: ${database}
مستودع GitHub المستهدف: ${github || GITHUB_REPO}

المطلوب:
1. تحليل المنتج وتجربة المستخدم بالعربية.
2. تصميم واجهة مستقبلية Responsive مع حالات التحميل والخطأ والفراغ.
3. تقسيم التطبيق إلى صفحات ومكونات واضحة.
4. بناء Frontend وBackend وAPI وقاعدة البيانات.
5. كتابة مخطط الجداول والعلاقات وواجهات API.
6. إضافة التحقق من المدخلات والأمان ومعالجة الأخطاء.
7. إضافة اختبارات أساسية.
8. تجهيز المشروع لـ GitHub والنشر على Railway أو Vercel.
9. إعطاء الملفات والشيفرة المطلوبة بشكل قابل للتنفيذ، مع عدم اختراع أسرار أو مفاتيح API.
10. إذا كانت هناك معلومة ضرورية فعلًا، اسأل عنها قبل التنفيذ؛ وإلا استخدم افتراضًا منطقيًا واذكره.`;

  const start = (title: string, prompt: string) => {
    createSession.mutate({ title }, {
      onSuccess: session => {
        sendMessage.mutate({ sessionId: session.id, content: prompt, fileIds: [] }, {
          onSuccess: () => {
            void utils.workspace.sessions.list.invalidate();
            void utils.workspace.library.recentResults.invalidate();
            setLocation("/");
          },
          onError: error => toast.error(error.message || "تعذّر تشغيل الأداة."),
        });
      },
      onError: error => toast.error(error.message || "تعذّر إنشاء جلسة."),
    });
  };

  const startBuilder = () => {
    if (!idea.trim()) {
      toast.error("اكتب فكرة التطبيق أولًا.");
      return;
    }
    start(`إنتاج تطبيق: ${appName || "مشروع جديد"}`, buildPrompt());
  };

  const isBusy = createSession.isPending || sendMessage.isPending;

  return (
    <div className="mx-auto max-w-[1240px] pb-12" dir="rtl">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#17241d] px-6 py-8 text-white shadow-[0_30px_90px_-35px_rgba(18,40,28,.9)] sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[#8bd8ad]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 size-80 rounded-full bg-[#b9e9ff]/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-[#bde8cc]">
              <WandSparkles className="size-3.5" /> AI APP FACTORY
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">حوّل فكرتك إلى تطبيق.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[#c9d4cd]">أدخل فكرتك وميزاتك، وسيتولى المسار تخطيط المنتج والواجهة والـAPI وقاعدة البيانات والاختبارات وتجهيز المشروع لـ GitHub والنشر.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-[#aebbb3]">
              {['واجهة مستقبلية', 'Full-Stack', 'Database', 'API', 'Tests', 'GitHub Ready'].map(x => <span key={x} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5">{x}</span>)}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/15 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-[#b9c7bf]"><span>جاهزية المشروع</span><span className="text-[#bde8cc]">LIVE BUILDER</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[88%] rounded-full bg-[#bde8cc]" /></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-[#aebbb3]">
              <div className="rounded-2xl border border-white/10 p-3"><div className="text-lg font-black text-white">01</div>الفكرة</div>
              <div className="rounded-2xl border border-white/10 p-3"><div className="text-lg font-black text-white">02</div>البناء</div>
              <div className="rounded-2xl border border-white/10 p-3"><div className="text-lg font-black text-white">03</div>GitHub</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-[2rem] border border-[#dfe7e1] bg-[#fbfcfa] shadow-[0_24px_70px_-45px_rgba(35,55,44,.35)]">
        <div className="border-b border-[#e5ebe6] px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-[#e4f4ea] text-[#2f7a50]"><Rocket className="size-5" /></span><div><h2 className="text-xl font-black text-[#203129]">مولّد التطبيقات الأضخم</h2><p className="text-xs text-[#77827c]">املأ المدخلات وسنحوّلها إلى مواصفات تنفيذية واضحة.</p></div></div>
        </div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <label className="block"><span className="text-xs font-bold text-[#46534c]">اسم التطبيق</span><input value={appName} onChange={e => setAppName(e.target.value)} placeholder="مثال: منصة نواة للتجارة" className="mt-2 h-12 w-full rounded-2xl border border-[#dce5df] bg-white px-4 text-sm outline-none transition focus:border-[#78b892] focus:ring-4 focus:ring-[#78b892]/10" /></label>
          <label className="block"><span className="text-xs font-bold text-[#46534c]">نوع التطبيق</span><select value={appType} onChange={e => setAppType(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#dce5df] bg-white px-4 text-sm outline-none focus:border-[#78b892]"><option>تطبيق ويب</option><option>لوحة تحكم SaaS</option><option>متجر إلكتروني</option><option>منصة تعليمية</option><option>تطبيق إدارة</option><option>أداة ذكاء اصطناعي</option></select></label>
          <label className="block lg:col-span-2"><span className="text-xs font-bold text-[#46534c]">فكرة التطبيق *</span><textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="صف ما تريد بناءه، لمن هو، وما المشكلة التي يحلها..." rows={4} className="mt-2 w-full resize-none rounded-2xl border border-[#dce5df] bg-white p-4 text-sm leading-7 outline-none transition focus:border-[#78b892] focus:ring-4 focus:ring-[#78b892]/10" /></label>
          <label className="block lg:col-span-2"><span className="text-xs font-bold text-[#46534c]">الميزات المطلوبة</span><textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder="مثال: تسجيل دخول، لوحة تحكم، دفع، إشعارات، رفع ملفات، تقارير..." rows={3} className="mt-2 w-full resize-none rounded-2xl border border-[#dce5df] bg-white p-4 text-sm leading-7 outline-none transition focus:border-[#78b892] focus:ring-4 focus:ring-[#78b892]/10" /></label>
          <label className="block"><span className="text-xs font-bold text-[#46534c]">أسلوب الواجهة</span><select value={style} onChange={e => setStyle(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#dce5df] bg-white px-4 text-sm outline-none focus:border-[#78b892]"><option>مستقبلي واحترافي</option><option>داكن وCyber</option><option>زجاجي Glassmorphism</option><option>فاخر Minimal</option><option>تقني SaaS</option></select></label>
          <label className="block"><span className="text-xs font-bold text-[#46534c]">قاعدة البيانات</span><select value={database} onChange={e => setDatabase(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#dce5df] bg-white px-4 text-sm outline-none focus:border-[#78b892]"><option>MySQL</option><option>PostgreSQL</option><option>SQLite</option><option>MongoDB</option></select></label>
          <label className="block lg:col-span-2"><span className="text-xs font-bold text-[#46534c]">مستودع GitHub</span><div className="relative mt-2"><Github className="absolute right-4 top-3.5 size-4 text-[#78857d]" /><input value={github} onChange={e => setGithub(e.target.value)} className="h-12 w-full rounded-2xl border border-[#dce5df] bg-white py-2 pl-4 pr-11 text-sm outline-none focus:border-[#78b892]" /></div></label>
          <div className="lg:col-span-2 rounded-2xl border border-[#dce5df] bg-[#f4f8f5] p-4"><div className="flex items-start gap-3"><Check className="mt-0.5 size-4 text-[#39815a]" /><p className="text-xs leading-6 text-[#66736b]">سيتم تجهيز المواصفات لتكون قابلة للبناء والنشر، مع مراعاة Responsive والأمان والتحقق من المدخلات ومعالجة الأخطاء. لا يتم اختراع مفاتيح API أو أسرار.</p></div></div>
          <div className="flex flex-wrap gap-3 lg:col-span-2"><Button onClick={startBuilder} disabled={isBusy} className="h-12 rounded-2xl bg-[#24382c] px-7 text-white hover:bg-[#17271e]">{isBusy ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Rocket className="ml-2 size-4" />} ابدأ إنتاج التطبيق</Button><Button asChild variant="outline" className="h-12 rounded-2xl border-[#dce5df]"><a href={GITHUB_REPO} target="_blank" rel="noreferrer"><Github className="ml-2 size-4" /> فتح GitHub</a></Button></div>
        </div>
      </section>

      <section className="mt-7 grid gap-5 md:grid-cols-3">
        {workflows.map(({ id, title, description, icon: Icon }) => <article key={id} className="workspace-card flex min-h-[210px] flex-col p-6 transition-transform hover:-translate-y-1"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf4ef] text-[#3c7653]"><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-black text-[#26372e]">{title}</h3><p className="mt-2 flex-1 text-sm leading-7 text-[#707b74]">{description}</p><Button onClick={() => start(title, `أريد استخدام أداة ${title}. ساعدني في تنفيذ المهمة باحتراف، مع مخرجات واضحة وقابلة للتطبيق.`)} disabled={isBusy} className="mt-5 h-10 rounded-xl bg-[#263a2e] text-white hover:bg-[#18291f]"><Sparkles className="ml-2 size-4" /> بدء المسار</Button></article>)}
      </section>
    </div>
  );
}
