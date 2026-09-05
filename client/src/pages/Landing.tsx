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

export default function Landing() {
  const [copied, setCopied] = useState(false);

  const copyExample = async () => {
    await navigator.clipboard?.writeText("حلّل هذا الهدف، أنشئ خطة تنفيذ عملية، نفّذ ما يمكنك مباشرة، ثم سلّمني النتيجة النهائية.");
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
          <a href="#customize" className="transition-colors hover:text-[#24332b]">التخصيص</a>
        </nav>
        <Link href="/workspace"><Button className="h-10 rounded-xl bg-[#24332b] px-4 text-xs font-bold text-white shadow-lg shadow-[#24332b]/10 hover:bg-[#17221c]">فتح مساحة العمل <ArrowLeft className="mr-2 size-3.5" /></Button></Link>
      </header>

      <main>
        <section className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -left-36 top-0 size-[430px] rounded-full bg-[#dcece0]/70 blur-3xl" />
          <div className="pointer-events-none absolute right-[36%] top-28 size-40 rounded-full bg-[#f1dfd2]/70 blur-3xl" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dbe6dc] bg-[#f0f7f0] px-3 py-1.5 text-[11px] font-extrabold text-[#4b7455]"><span className="size-1.5 rounded-full bg-[#6a9a72]" /> حزمة نواة، قابلة للتخصيص</div>
              <h1 className="max-w-3xl text-[clamp(2.7rem,6vw,5.7rem)] font-black leading-[1.04] tracking-[-0.055em] text-[#17221c]">اجعل كل طلب<br /><span className="text-[#bd653e]">بدايةً لشيء أكبر.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#68736d] sm:text-lg">حزمة إعدادات عربية لمساعد ذكي عام، تجمع أسلوب العمل المهني مع قدرات قابلة للتوسعة في مواصفة واضحة ومستقلة عن أي منصة.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3"><a href="#contents"><Button size="lg" className="h-12 rounded-2xl bg-[#24332b] px-6 text-sm font-bold text-white shadow-xl shadow-[#24332b]/15 hover:bg-[#17221c]">استكشف الحزمة <ArrowLeft className="mr-2 size-4" /></Button></a><a href="#setup" className="flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-[#59675d] transition-colors hover:bg-white"><span className="flex size-7 items-center justify-center rounded-full border border-[#d8dfd6]"><ChevronLeft className="size-4" /></span>كيف تعمل؟</a></div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#e6e2d9] pt-5 text-xs font-bold text-[#8a928b]"><span><strong className="ml-1 text-lg text-[#24332b]">03</strong> ملفات أساسية</span><span><strong className="ml-1 text-lg text-[#24332b]">09</strong> مجالات عمل</span><span><strong className="ml-1 text-lg text-[#24332b]">00</strong> مفاتيح سرية</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-[500px] lg:mr-auto">
              <div className="absolute -inset-4 rounded-[2.7rem] border border-[#dfe9df] bg-[#edf5ed]/60 rotate-3" />
              <div className="relative rounded-[2.3rem] border border-[#dce6dc] bg-[#fbfcf8] p-3 shadow-[0_30px_80px_-32px_rgba(35,51,43,.35)]">
                <div className="rounded-[1.7rem] bg-[#24332b] p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold text-[#cfe3d2]">مساعد ذكي عام</span><WandSparkles className="size-5 text-[#d7e8d8]" /></div>
                  <div className="mt-16"><p className="text-xs font-semibold text-[#9ab5a0]">يبدأ من نيتك</p><h2 className="mt-2 text-3xl font-black leading-tight tracking-tight">يفهم السياق.<br />يرتب العمل.<br /><span className="text-[#e8a37f]">يسلّم النتيجة.</span></h2></div>
                  <div className="mt-14 rounded-2xl border border-white/10 bg-white/10 p-3"><div className="flex items-center gap-2 text-[10px] text-[#c4d5c7]"><MessageSquareText className="size-3.5" /> مساحة تنفيذ نشطة</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-[#e8a37f]" /></div></div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2"><div className="rounded-xl bg-[#f1f6ef] p-3"><Layers3 className="size-4 text-[#66846a]" /><p className="mt-3 text-[10px] font-bold text-[#55665a]">سياق منظم</p></div><div className="rounded-xl bg-[#fbf1eb] p-3"><Workflow className="size-4 text-[#b86846]" /><p className="mt-3 text-[10px] font-bold text-[#756158]">مسارات عمل</p></div><div className="rounded-xl bg-[#f5f1e7] p-3"><LockKeyhole className="size-4 text-[#8e7954]" /><p className="mt-3 text-[10px] font-bold text-[#756a59]">قواعد آمنة</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="contents" className="border-y border-[#e9e4da] bg-[#f0eee7] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="max-w-2xl"><p className="site-kicker">داخل الحزمة</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">ثلاثة ملفات، نقطة بداية واحدة.</h2><p className="mt-4 text-sm leading-7 text-[#6f7971]">كل ملف يؤدي دورًا واضحًا؛ معًا يصنعون مواصفة يمكن نقلها وتخصيصها دون الارتباط بمنصة بعينها.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{files.map(file => { const Icon = file.icon; const tone = file.tone === "coral" ? "bg-[#fbede6] text-[#b86140]" : file.tone === "green" ? "bg-[#e6f1e7] text-[#4d7a59]" : "bg-[#f4eddd] text-[#967b4e]"; return <article key={file.name} className="group rounded-[1.6rem] border border-[#e2ded4] bg-[#fbfaf7] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#27372b]/[.06]"><div className={`flex size-11 items-center justify-center rounded-2xl ${tone}`}><Icon className="size-5" /></div><p className="mt-7 text-[11px] font-bold text-[#a0a69f]">{file.name}</p><h3 className="mt-1 text-xl font-black text-[#26362c]">{file.label}</h3><p className="mt-3 text-sm leading-7 text-[#727c74]">{file.description}</p><span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-[#bd653e]">عرض الدور <ArrowUpLeft className="size-3.5 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" /></span></article>; })}</div></div></section>

        <section id="setup" className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="site-kicker">طريقة الاستخدام</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">من ملف تعليمات<br />إلى مساعد يعمل.</h2><p className="mt-5 max-w-md text-sm leading-8 text-[#6f7971]">لا تحتاج إلى إعادة بناء سلوك المساعد من الصفر. انسخ التعليمات، أضف ملف التعريف إن كانت المنصة تدعمه، ثم ابدأ بطلب واضح.</p><div className="mt-8 flex items-center gap-3 rounded-2xl bg-[#f4f7f1] p-4 text-xs font-bold text-[#4c6952]"><Check className="size-4 shrink-0" /> قابل للنقل بين المنصات التي تدعم التعليمات المخصصة</div></div><div className="grid gap-3">{[["01","انسخ التعليمات","ضع محتوى system_instructions.md في خانة System Prompt أو Custom Instructions."],["02","أضف الملف المنظم","استخدم assistant_profile.json كمرجع إضافي للهوية والقدرات وقواعد السلامة."],["03","ابدأ بطلب حقيقي","اختبر المساعد بهدف عملي واضح، ثم راجع النتيجة ووسّع التخصيص عند الحاجة."]].map(([number,title,description]) => <div key={number} className="flex gap-5 rounded-[1.5rem] border border-[#e5e1d8] bg-white p-5 sm:p-6"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#24332b] text-sm font-black text-white">{number}</span><div><h3 className="text-base font-black text-[#2a3a30]">{title}</h3><p className="mt-1 text-sm leading-7 text-[#7a827c]">{description}</p></div></div>)}</div></div></section>

        <section id="customize" className="bg-[#24332b] px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="text-[11px] font-bold tracking-[.18em] text-[#e8a37f]">التخصيص</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">ابدأ من المواصفة،<br /><span className="text-[#c4ddc8]">وأضف لمستك.</span></h2><p className="mt-5 max-w-lg text-sm leading-8 text-[#b8c9ba]">يمكنك تسمية المساعد وتحديد جمهوره وأولوياته ونبرته دون حذف قواعد الدقة والسلامة والخصوصية.</p><div className="mt-8 flex flex-wrap gap-2">{capabilities.map(item => <span key={item} className="rounded-full border border-white/10 bg-white/[.07] px-3 py-2 text-xs font-bold text-[#d6e3d6]">{item}</span>)}</div></div><div className="relative rounded-[1.8rem] border border-white/10 bg-[#17251c] p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><div className="flex gap-1.5"><i className="size-2 rounded-full bg-[#e98b70]" /><i className="size-2 rounded-full bg-[#e7c47d]" /><i className="size-2 rounded-full bg-[#8fc29a]" /></div><button onClick={copyExample} className="flex items-center gap-1.5 text-[10px] font-bold text-[#a9c1ad] transition-colors hover:text-white" aria-label="نسخ مثال التخصيص">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "تم النسخ" : "نسخ المثال"}</button></div><pre dir="ltr" className="overflow-auto whitespace-pre-wrap text-left text-[12px] leading-7 text-[#c8dbc9]"><code><span className="text-[#e8a37f]">## تخصيص المستخدم</span>{"\n"}<span className="text-[#b4d6bd]">اسم المساعد:</span> المساعد التنفيذي.{"\n"}<span className="text-[#b4d6bd]">الجمهور:</span> فريق شركة ناشئة.{"\n"}<span className="text-[#b4d6bd]">الأولوية:</span> تحويل الأفكار إلى خطط قابلة للتنفيذ.{"\n"}<span className="text-[#b4d6bd]">النبرة:</span> مهنية ومختصرة.</code></pre></div></div></section>

        <section className="border-y border-[#e5e1d8] bg-[#f0eee7] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="max-w-2xl"><p className="site-kicker">حدود التشغيل</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">القدرة تتبع<br />المنصة المضيفة.</h2><p className="mt-4 text-sm leading-8 text-[#707971]">هذه المواصفة مستقلة، لكن الأدوات العملية تعتمد على ما توفره المنصة التي تستضيف التعليمات. الوضوح هنا جزء من التصميم، لا هامش إضافي.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2"><article className="rounded-[1.5rem] border border-[#dedbd2] bg-[#fbfaf7] p-6"><div className="flex size-10 items-center justify-center rounded-xl bg-[#e5ede7] text-[#4b7455]"><Settings2 className="size-4" /></div><h3 className="mt-6 text-lg font-black text-[#2a3a30]">الأدوات المتاحة تصنع الفرق</h3><p className="mt-2 text-sm leading-7 text-[#788179]">إذا لم توفر المنصة تصفحًا أو تنفيذ كود أو إنشاء ملفات أو أدوات خارجية، فسيقتصر المساعد على قدراتها المدمجة.</p></article><article className="rounded-[1.5rem] border border-[#ead8cc] bg-[#fff8f3] p-6"><div className="flex size-10 items-center justify-center rounded-xl bg-[#f7e7dc] text-[#b86140]"><LockKeyhole className="size-4" /></div><h3 className="mt-6 text-lg font-black text-[#2a3a30]">احمِ مفاتيحك وبياناتك</h3><p className="mt-2 text-sm leading-7 text-[#788179]">لا تضع مفاتيح سرية أو بيانات حساسة داخل ملفات التعليمات. استخدم أسرار المنصة أو بيئة آمنة عند الحاجة.</p></article></div></div></section>\n\n        <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"><div className="rounded-[2rem] border border-[#eadfd3] bg-[#fbf1eb] p-7 sm:p-10 lg:p-14"><div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="site-kicker">اختبار سريع</p><h2 className="mt-3 text-3xl font-black tracking-tight">لا تكتفِ بالإعداد.<br />جرّب النتيجة.</h2><p className="mt-4 text-sm leading-8 text-[#746f69]">أرسل طلبًا عمليًا وتوقّع من المساعد أن يحدد الهدف، يتخذ افتراضات معقولة، ينفذ ما يستطيع، ويراجع الناتج قبل تسليمه.</p></div><div className="rounded-[1.5rem] border border-[#e9d7c8] bg-[#fffaf6] p-5 shadow-sm"><p className="text-[11px] font-bold text-[#a77054]">طلب مقترح للتجربة</p><p className="mt-3 text-base font-bold leading-8 text-[#4b4c47]">حلّل هذا الهدف، أنشئ خطة تنفيذ عملية، نفّذ ما يمكنك مباشرة، ثم سلّمني النتيجة النهائية.</p><div className="mt-5 flex items-center justify-between border-t border-[#f0dfd2] pt-4 text-[11px] font-bold text-[#a38b7b]"><span>جاهز للنسخ إلى محادثتك</span><Sparkles className="size-4" /></div></div></div></div></section>

        <section className="border-t border-[#e9e4da] px-5 py-12 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1240px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-[#24332b] text-white"><Sparkles className="size-4" /></span><span className="font-black">نواة</span></div><p className="mt-3 max-w-md text-xs leading-6 text-[#8b918b]">حزمة نواة لمساعد مشابه في السلوك والقدرات العامة، وليست استنساخًا لنظام داخلي أو هوية خدمة.</p></div><Link href="/workspace" className="inline-flex items-center gap-2 text-sm font-black text-[#bd653e]">افتح مساحة العمل <ArrowLeft className="size-4" /></Link></div></section>
      </main>
    </div>
  );
}
