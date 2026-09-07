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
  Mail,
  Megaphone,
  Presentation,
  ShieldCheck,
  WandSparkles,
  Github,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Category = "الكل" | "الكتابة" | "البرمجة" | "التحليل" | "العمل" | "التسويق" | "التعلم";

export type Workflow = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: Exclude<Category, "الكل">;
  icon: LucideIcon;
  tone: string;
  tag: string;
};

export const categories: Category[] = ["الكل", "الكتابة", "البرمجة", "التحليل", "العمل", "التسويق", "التعلم"];

export const workflows: Workflow[] = [
  { id: "writing", title: "الكتابة والتحرير", description: "حوّل الملاحظات المبعثرة إلى مسودات واضحة، ورسائل، وخطط، ومحتوى منظم.", prompt: "ساعدني في كتابة مسودة احترافية. ابدأ بتحديد البنية المناسبة، ثم اسألني فقط عن التفاصيل الضرورية أو استخدم افتراضات واضحة.", category: "الكتابة", icon: FilePenLine, tone: "bg-[#fff2e9] text-[#bd653e]", tag: "الأكثر استخدامًا" },
  { id: "email", title: "رسائل احترافية", description: "اكتب بريدًا واضحًا ومقنعًا يحافظ على النبرة المناسبة والطلب الأساسي.", prompt: "اكتب لي رسالة بريد احترافية. استخرج الهدف والجمهور والنبرة، ثم قدّم نسخة جاهزة للإرسال مع عنوان مناسب.", category: "الكتابة", icon: Mail, tone: "bg-[#f4eddd] text-[#967b4e]", tag: "جاهز للبدء" },
  { id: "summary", title: "تلخيص وملاحظات", description: "اختصر مستندًا أو اجتماعًا إلى ملخص تنفيذي وقرارات ونقاط متابعة.", prompt: "لخّص المحتوى الذي سأرسله في ملخص تنفيذي، أهم الأفكار، القرارات، المهام، والأسئلة المفتوحة.", category: "الكتابة", icon: FileText, tone: "bg-[#e8f0ea] text-[#3d7651]", tag: "مفيد يوميًا" },
  { id: "translation", title: "ترجمة محلية", description: "ترجم النصوص مع الحفاظ على المعنى والنبرة والسياق الثقافي للوجهة.", prompt: "ترجم النص الذي سأرسله إلى اللغة المطلوبة مع الحفاظ على النبرة، ثم اشرح أي تعبيرات تحتاج إلى تكييف محلي.", category: "الكتابة", icon: Languages, tone: "bg-[#edf0f8] text-[#536d9d]", tag: "لغات وسياق" },
  { id: "code", title: "البرمجة والبناء", description: "خطط للميزات، راجع الشيفرة، وشخّص الأخطاء بطريقة مرتبة وقابلة للتنفيذ.", prompt: "أريد العمل على مهمة برمجية. ساعدني في فهم المطلوب، تصميم الحل، كتابة أو مراجعة الشيفرة، ثم اقتراح اختبار مناسب.", category: "البرمجة", icon: Braces, tone: "bg-[#e8f0ea] text-[#3d7651]", tag: "للمطورين" },
  { id: "github", title: "مهندس GitHub", description: "اقرأ المستودعات، افهم بنية المشروع، تتبّع الملفات والتغييرات، وساعد في تشخيص مشاكل الكود.", prompt: "أريد العمل على مستودع GitHub. افهم بنية المشروع أولًا، حدّد الملفات المتعلقة بالمهمة، ثم أعطني تحليلًا دقيقًا وخطة تنفيذ محافظة على الوظائف.", category: "البرمجة", icon: Github, tone: "bg-[#ececec] text-[#242424]", tag: "وصول للمستودع" },
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

export function getWorkflow(skillId: string) {
  return workflows.find(workflow => workflow.id === skillId);
}
