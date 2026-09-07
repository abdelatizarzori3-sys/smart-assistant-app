import type { Tool } from "./llm";

export type Capability = {
  id: string;
  title: string;
  description: string;
  mode: "llm" | "connected-tool";
  requiresConnection?: string;
};

export const CAPABILITIES: Capability[] = [
  { id: "writing", title: "الكتابة والتحرير", description: "إنشاء وتحسين النصوص والمحتوى.", mode: "llm" },
  { id: "email", title: "الرسائل الاحترافية", description: "إنشاء رسائل وبريد جاهز للإرسال.", mode: "llm" },
  { id: "summary", title: "التلخيص", description: "تلخيص الملفات والمحادثات واستخراج المهام.", mode: "llm" },
  { id: "translation", title: "الترجمة", description: "ترجمة النصوص مع الحفاظ على السياق.", mode: "llm" },
  { id: "code", title: "البرمجة والبناء", description: "تصميم وكتابة ومراجعة الشيفرة.", mode: "llm" },
  { id: "github", title: "مهندس GitHub", description: "تحليل المستودعات والتغييرات عند توفر اتصال GitHub.", mode: "connected-tool", requiresConnection: "GitHub" },
  { id: "debug", title: "تشخيص الأخطاء", description: "تحليل أسباب الأخطاء واقتراح الإصلاحات واختبارها.", mode: "llm" },
  { id: "review", title: "مراجعة الشيفرة", description: "مراجعة الجودة والأمان والأداء والاختبارات.", mode: "llm" },
  { id: "content-analysis", title: "تحليل المحتوى", description: "استخراج الأفكار والمخاطر والفرص والقرارات.", mode: "llm" },
  { id: "data", title: "تحليل البيانات", description: "استخراج المؤشرات والاتجاهات من البيانات المتاحة.", mode: "llm" },
  { id: "research", title: "البحث والمقارنة", description: "تنظيم البحث ومعايير المقارنة والقرار.", mode: "llm" },
  { id: "project", title: "إدارة المشروع", description: "تحويل الأفكار إلى مراحل ومهام ومخاطر ومعايير نجاح.", mode: "llm" },
  { id: "meeting", title: "الاجتماعات", description: "إعداد الاجتماعات والقرارات والمتابعة.", mode: "llm" },
  { id: "presentation", title: "العروض", description: "بناء هيكل عرض ورسالة وسرد بصري.", mode: "llm" },
  { id: "marketing", title: "التسويق", description: "بناء خطط تسويق وقنوات ومؤشرات قياس.", mode: "llm" },
  { id: "content-plan", title: "خطة المحتوى", description: "تخطيط المحتوى والأفكار وقنوات النشر.", mode: "llm" },
  { id: "learning", title: "التعلم", description: "تصميم مسارات تعلم وتمارين ومشاريع.", mode: "llm" },
  { id: "brief", title: "المواصفات", description: "تحويل الطلبات إلى مواصفات قابلة للتنفيذ.", mode: "llm" },
];

export const CAPABILITY_TOOLS: Tool[] = [
  {
    type: "function",
    function: {
      name: "select_capability",
      description: "اختر القدرة الأنسب لطلب المستخدم. لا تنفذ اتصالًا خارجيًا؛ تستخدم فقط لتحديد مسار التنفيذ.",
      parameters: {
        type: "object",
        properties: {
          capabilityId: { type: "string", enum: CAPABILITIES.map(item => item.id) },
          reason: { type: "string" },
        },
        required: ["capabilityId"],
        additionalProperties: false,
      },
    },
  },
];

export function getCapability(id: string) {
  return CAPABILITIES.find(item => item.id === id);
}

export function getCapabilityManifest() {
  return CAPABILITIES.map(({ id, title, description, mode, requiresConnection }) => ({ id, title, description, mode, requiresConnection }));
}
