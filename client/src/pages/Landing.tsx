import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  Check,
  ChevronLeft,
  Code2,
  Copy,
  FileCode2,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Settings2,
  Sparkles,
  WandSparkles,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const capabilities = [
  "البحث والتحقق",
  "الكتابة والتحرير",
  "تحليل البيانات",
  "البرمجة",
  "المستندات والعروض",
  "الأتمتة والوسائط",
];

const files = [
  {
    icon: FileCode2,
    name: "system_instructions.md",
    label: "التعليمات الرئيسية",
    description: "مواصفة تشغيلية جاهزة للنسخ إلى System Prompt أو Custom Instructions.",
    tone: "coral",
  },
  {
    icon: Code2,
    name: "assistant_profile.json",
    label: "ملف التعريف المنظم",
    description: "هوية المساعد وقدراته وقواعد الإخراج والسلامة في صيغة قابلة للمعالجة.",
    tone: "green",
  },
  {
    icon: BookOpen,
    name: "README_AR.md",
    label: "دليل الاستخدام",
    description: "شرح مختصر للتثبيت والتخصيص والحدود مع اختبار سريع للنتيجة.",
    tone: "sand",
  },
];

const defaults = [
  ["اللغة", "لغة المستخدم الأولى، والعربية الفصحى افتراضيًا"],
  ["النبرة", "مهنية، واضحة، مباشرة، ومبادرة"],
  ["التحقق", "مراجعة النتيجة قبل التسليم"],
  ["الأسئلة", "الحد الأدنى فقط عندما تكون ضرورية"],
];

const plans = [
  {
    name: "Free",
    price: "0",
    description: "للمستخدمين الذين يريدون تجربة قوية بدون قيود أساسية.",
    cta: "ابدأ مجانًا",
    featured: false,
    features: ["حتى 5 جلسات نشطة", "محادثات نصية", "رفع ملفات صغيرة", "إمكانيات أساسية"],
  },
  {
    name: "Pro",
    price: "49",
    description: "للمشاريع المتقدمة والفرق التي تحتاج قوة إنتاجية أعلى.",
    cta: "ابدأ Pro",
    featured: true,
    features: ["جلسات غير محدودة", "تصدير ملفات احترافي", "تحليلات ذكية", "أولوية في المعالجة", "مكتبة مهام متقدمة"],
  },
  {
    name: "Enterprise",
    price: "مخصص",
    description: "للبنى المؤسسية مع دعم مخصص وأذونات متقدمة.",
    cta: "تواصل معنا",
    featured: false,
    features: ["أدوار متعددة", "دعم مخصص", "تكامل خاص", "توقيعات داخلية"],
  },
];

export default function Landing() {
  const [copied, setCopied] = useState(false);

  const copyExample = async () => {
    await navigator.clipboard?.writeText("حلّل هذا الهدف، أنشئ خطة تنفيذ عملية، نفّذ ما يمكنك مباشرة، ثم سلّمني النتيجة النهائية مع أولوية الأمان والوضوح.");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div dir="rtl" className="min-h-screen overflow-hidden bg-[#f8f6f0] text-[#17221c]">
      <header className="relative z-10 mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[14px] bg-[#24332b] text-white shadow-lg shadow-[#24332b]/15"><Sparkles className="size-5" /></span>
          <span><span className="block text-sm font-extrabold tracking-tight">نواة</span><span className="block text-[10px] font-semibold text-[#8b918b]">مساعد متعدد المهارات</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-xs font-bold text-[#667269] md:flex">
          <a href="#contents" className="transition-colors hover:text-[#24332b]">المحتويات</a>
          <a href="#setup" className="transition-colors hover:text-[#24332b]">طريقة الاستخدام</a>
          <a href="#pricing" className="transition-colors hover:text-[#24332b]">الخطط</a>
          <a href="#customize" className="transition-colors hover:text-[#24332b]">التخصيص</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="#pricing">
            <Button variant="outline" className="hidden h-10 rounded-xl border-[#e8d5c5] bg-[#fffaf6] px-3 text-[11px] font-extrabold text-[#a75534] hover:bg-[#fff1e8] sm:inline-flex">Pro</Button>
          </Link>
          <Link href="/workspace"><Button className="h-10 rounded-xl bg-[#24332b] px-4 text-xs font-bold text-white shadow-lg shadow-[#24332b]/10 hover:bg-[#17221c]">فتح مساحة العمل <ArrowLeft className="size-3.5" /></Button></Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -left-36 top-0 size-[430px] rounded-full bg-[#dcece0]/70 blur-3xl" />
          <div className="pointer-events-none absolute right-[36%] top-28 size-40 rounded-full bg-[#f1dfd2]/70 blur-3xl" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dbe6dc] bg-[#f0f7f0] px-3 py-1.5 text-[11px] font-extrabold text-[#4b7455]"><span className="size-1.5 rounded-full bg-[#69a97e]" /><span>نسخة احترافية جاهزة للإنتاج</span></div>
              <h1 className="max-w-3xl text-[clamp(2.7rem,6vw,5.7rem)] font-black leading-[1.04] tracking-[-0.055em] text-[#17221c]">اجعل كل طلب<br /><span className="text-[#bd653e]">أقوى، أسرع، وأكثر فاعلية.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#68736d] sm:text-lg">حزمة إعدادات عربية لمساعد ذكي عام، تجمع أسلوب العمل المهني، البيئات المتعددة، والمهام المتكاملة في مساحة واحدة.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#pricing"><Button size="lg" className="h-12 rounded-2xl bg-[#24332b] px-6 text-sm font-bold text-white shadow-xl shadow-[#24332b]/15 hover:bg-[#17221c]">ابدأ مع Pro <ArrowUpLeft className="size-4" /></Button></a>
                <a href="#contents"><Button size="lg" variant="outline" className="h-12 rounded-2xl border-[#dfe6df] bg-white px-6 text-sm font-bold text-[#203027] hover:bg-[#f4f7f2]">استكشف الإمكانيات</Button></a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#e6e2d9] pt-5 text-xs font-bold text-[#8a928b]"><span><strong className="ml-1 text-lg text-[#24332b]">03</strong> ملفات جاهزة</span><span><strong className="ml-1 text-lg text-[#24332b]">06</strong> مهارات أساسية</span><span><strong className="ml-1 text-lg text-[#24332b]">24/7</strong> تيار عمل مستمر</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-[500px] lg:mr-auto">
              <div className="absolute -inset-4 rounded-[2.7rem] border border-[#dfe9df] bg-[#edf5ed]/60 rotate-3" />
              <div className="relative rounded-[2.3rem] border border-[#dce6dc] bg-[#fbfcf8] p-3 shadow-[0_30px_80px_-32px_rgba(35,51,43,.35)]">
                <div className="rounded-[1.7rem] bg-[#24332b] p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold text-[#cfe3d2]">مساعد ذكي</span><span className="rounded-full bg-[#f0dfd1] px-2 py-1 text-[10px] font-black text-[#7a4932]">Pro</span></div>
                  <div className="mt-16"><p className="text-xs font-semibold text-[#9ab5a0]">يبدأ من نيتك</p><h2 className="mt-2 text-3xl font-black leading-tight tracking-tight">يحلل، يفهم، ويخرّج لك تنفيذاً عمليًا.</h2></div>
                  <div className="mt-14 rounded-2xl border border-white/10 bg-white/10 p-3">
                    <div className="flex items-center gap-2 text-[10px] text-[#c4d5c7]"><MessageSquareText className="size-3.5" /><span>طلب جديد</span></div>
                    <p className="mt-3 text-sm leading-7 text-white/95">حلّل الهدف، ثم أعطني خطة تنفيذ واضحة، وأرفق ملاحظات التحسين، وراجع النتيجة قبل التسليم.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2"><div className="rounded-xl bg-[#f1f6ef] p-3"><Layers3 className="size-4 text-[#66846a]" /><p className="mt-3 text-[10px] font-bold text-[#2c4337]">أساسيات</p></div><div className="rounded-xl bg-[#fff3eb] p-3"><WandSparkles className="size-4 text-[#bd653e]" /><p className="mt-3 text-[10px] font-bold text-[#7a4932]">مميزات Pro</p></div><div className="rounded-xl bg-[#eef4ff] p-3"><Workflow className="size-4 text-[#3d669d]" /><p className="mt-3 text-[10px] font-bold text-[#33506d]">أتمتة</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="contents" className="border-y border-[#e9e4da] bg-[#f0eee7] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="max-w-2xl"><p className="text-[11px] font-extrabold tracking-[0.18em] text-[#a75534]">المحتويات</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17221c] sm:text-4xl">كل ما تحتاجه لبدء مشروع ذكي من الصفر.</h2><p className="mt-4 text-base leading-8 text-[#5d6d66]">أنت لا تحتاج إلى بناء كل شيء يدويًا؛ هذه الحزمة توفر لك البنية، النصوص، والتمثيل الجاهز للتطبيق الفعلي.</p></div><div className="mt-10 grid gap-6 lg:grid-cols-3">{files.map(file => { const Icon = file.icon; return <div key={file.name} className={`rounded-[1.6rem] border border-[#e3dfd6] bg-white p-5 shadow-[0_20px_50px_-30px_rgba(31,36,38,.22)] ${file.tone === "coral" ? "ring-1 ring-[#f0d4c3]" : file.tone === "green" ? "ring-1 ring-[#d4ebd8]" : "ring-1 ring-[#f0e5d7]"}`}><div className="mb-4 flex items-center justify-between"><span className={`flex size-12 items-center justify-center rounded-2xl ${file.tone === "coral" ? "bg-[#fff1ea] text-[#bf6844]" : file.tone === "green" ? "bg-[#edf7ef] text-[#4a7c5c]" : "bg-[#f7f1e5] text-[#a57b46]"}`}><Icon className="size-5" /></span><span className="rounded-full border border-[#ebdfd7] bg-[#fffaf7] px-2.5 py-1 text-[10px] font-bold text-[#7c5a47]">ملف</span></div><p className="text-[10px] font-bold tracking-[0.12em] text-[#8e8c86]">{file.label}</p><h3 className="mt-2 text-xl font-black text-[#1f2a22]">{file.name}</h3><p className="mt-3 text-sm leading-7 text-[#5e6b63]">{file.description}</p></div>; })}</div></div></section>

        <section id="setup" className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="text-[11px] font-extrabold tracking-[0.18em] text-[#a75534]">طريقة الاستخدام</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17221c] sm:text-4xl">تهيئة سريعة ومن ثم العمل مباشرة.</h2><div className="mt-6 space-y-4 text-base leading-8 text-[#5d6d66]"><p>يفترض أن تعمل كل أداة في سياق واضح: الهدف، السياق، القاعدة، والنتيجة المنتظرة.</p><p>الملفات الحالية تعطيك نقطة انطلاق ممتازة، ثم يمكنك تحسينها حسب نوع المشروع الذي تنشئه.</p></div></div><div className="grid gap-4 sm:grid-cols-2">{defaults.map(([label, value]) => <div key={label} className="rounded-[1.4rem] border border-[#e7e1d8] bg-[#f9f7f3] p-5 shadow-[0_15px_35px_-28px_rgba(35,51,43,.35)]"><p className="text-[10px] font-extrabold tracking-[0.12em] text-[#908d88]">{label}</p><p className="mt-3 text-base font-bold leading-7 text-[#213128]">{value}</p></div>)}</div></div></section>

        <section id="pricing" className="bg-[#f5f3ee] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[1240px]">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-[#a75534]">خطط الاشتراك</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17221c] sm:text-4xl">اختر الخطة المناسبة لخطتك.</h2>
              <p className="mt-4 text-base leading-8 text-[#5d6d66]">ابدأ بسعر منخفض، ثم ارتقِ إلى Pro عندما تحتاج سرعة أكبر، تحليلات أعمق، ومزايا إنتاجية متقدمة.</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map(plan => (
                <div key={plan.name} className={`rounded-[1.9rem] border p-6 shadow-[0_20px_60px_-35px_rgba(31,36,38,.35)] ${plan.featured ? "border-[#d9b99d] bg-[#24332b] text-white" : "border-[#e7e1d8] bg-white text-[#17221c]"}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] font-extrabold tracking-[0.12em] ${plan.featured ? "text-[#efd6c3]" : "text-[#8c8f8d]"}`}>{plan.name}</p>
                    {plan.featured && <span className="rounded-full bg-[#f5d7bf] px-2.5 py-1 text-[10px] font-black text-[#6d472f]">الأكثر شيوعًا</span>}
                  </div>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-[-0.06em]">{plan.price}</span>
                    {plan.price !== "مخصص" && <span className={`mb-1 text-sm font-bold ${plan.featured ? "text-[#dfeae1]" : "text-[#5d6d66]"}`}>/ شهر</span>}
                  </div>
                  <p className={`mt-3 text-sm leading-7 ${plan.featured ? "text-[#d7eee0]" : "text-[#5f6d67]"}`}>{plan.description}</p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                        <span className={`mt-0.5 flex size-5 items-center justify-center rounded-full ${plan.featured ? "bg-[#f0dfd1] text-[#6d472f]" : "bg-[#edf5ee] text-[#4d7d5f]"}`}><Check className="size-3.5" /></span>
                        <span className={plan.featured ? "text-[#edf3ee]" : "text-[#213128]"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`mt-8 h-11 w-full rounded-xl ${plan.featured ? "bg-[#f1d7c6] text-[#1f2d27] hover:bg-[#e9c7ae]" : "bg-[#24332b] text-white hover:bg-[#17221c]"}`}>{plan.cta}</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="customize" className="bg-[#24332b] px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="text-[11px] font-extrabold tracking-[0.18em] text-[#d6c1af]">التخصيص</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">تحوّل القالب إلى هوية مميزة للمشروع.</h2><p className="mt-4 text-base leading-8 text-[#dce6e0]">يمكنك تعديل اللغة، النبرة، نوع الاحتراف، ألوان التطبيق، وقواعد العمل بسرعة دون التأثير على البنية الأساسية.</p><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-[#e4efe6]">أسلوب محترف</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-[#e4efe6]">ألوان مخصصة</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-[#e4efe6]">تجربة موجهة</span></div></div><div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_22px_55px_-32px_rgba(20,29,24,.85)]"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-[#dfe9df] text-[#1d2c29]"><Settings2 className="size-4" /></span><div><p className="text-[10px] font-bold tracking-[0.12em] text-[#dbe7dd]">الملف الأساسي</p><p className="text-sm font-bold text-white">system_instructions.md</p></div></div><button onClick={copyExample} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-[#eef7ee] hover:bg-white/10">{copied ? "تم النسخ" : "نسخ المثال"} <Copy className="size-3.5" /></button></div><div className="mt-5 rounded-2xl bg-[#1a2a27] p-4 text-sm leading-8 text-[#dfeae2]">حلّل هذا الهدف، أنشئ خطة تنفيذ عملية، نفّذ ما يمكنك مباشرة، ثم سلّمني النتيجة النهائية مع مراعاة السلامة والوضوح.</div></div></div></section>

        <section className="border-y border-[#e5e1d8] bg-[#f0eee7] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="max-w-2xl"><p className="text-[11px] font-extrabold tracking-[0.18em] text-[#a75534]">ملف الرؤية</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17221c] sm:text-4xl">صمم فريقك ليس فقط لعرض المنتج، بل لبناء هوية تستمر.</h2><p className="mt-4 text-base leading-8 text-[#5d6d66]">البنية الحالية قادرة على التطور إلى منتج SaaS كامل بواجهة احترافية، نظام مهام، ومكتبة أدوات، مع خطط اشتراك واضحة.</p></div></div></section>

        <section className="border-t border-[#e9e4da] px-5 py-12 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1240px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] font-extrabold tracking-[0.18em] text-[#a75534]">نواة</p><h3 className="mt-2 text-2xl font-black text-[#17221c]">مساعد ذكي يستوعب أسلوبك ويصنع لك سرعة في التنفيذ.</h3></div><div className="flex flex-wrap items-center gap-3"><Link href="/workspace"><Button className="h-11 rounded-xl bg-[#24332b] px-5 text-sm font-bold text-white hover:bg-[#17221c]">فتح مساحة العمل</Button></Link><Link href="#pricing"><Button variant="outline" className="h-11 rounded-xl border-[#ecd7ca] bg-[#fffaf7] px-5 text-sm font-bold text-[#a75534] hover:bg-[#fff0e8]">عرض Pro</Button></Link></div></div></section>
      </main>
    </div>
  );
}
