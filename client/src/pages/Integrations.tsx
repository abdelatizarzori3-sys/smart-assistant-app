import { useEffect, useState } from "react";
import { Check, Cloud, Github, Link2, Loader2, MessageSquare, Puzzle, ShieldCheck, Sparkles, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const providers = [
  { id: "github", name: "GitHub", description: "اربط مستودعاتك ليتمكن المساعد من قراءة الكود والعمل عليه عندما تطلب ذلك.", icon: Github, available: true },
  { id: "google-drive", name: "Google Drive", description: "إتاحة الملفات والمستندات للمساعد من خلال تفويض آمن.", icon: Cloud, available: false },
  { id: "microsoft", name: "Microsoft", description: "ربط خدمات Microsoft بحسابك دون مشاركة كلمة المرور.", icon: Cloud, available: false },
  { id: "slack", name: "Slack", description: "ربط مساحة العمل والقنوات والرسائل عند تفعيل الموصل.", icon: MessageSquare, available: false },
  { id: "notion", name: "Notion", description: "ربط صفحات ومساحات Notion بموافقة المستخدم.", icon: Puzzle, available: false },
];

type IntegrationStatus = { id: string; connected: boolean; accountName: string | null; scopes: string[] };

export default function Integrations() {
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await fetch("/api/integrations", { credentials: "include" });
      if (!response.ok) throw new Error("تعذر تحميل الاتصالات");
      const data = await response.json() as { providers: Array<IntegrationStatus & { name: string }> };
      setStatuses(Object.fromEntries(data.providers.map(item => [item.id, item])));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل الاتصالات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected) {
      toast.success(`تم ربط ${connected === "github" ? "GitHub" : connected} بنجاح.`);
      window.history.replaceState({}, "", "/workspace/integrations");
      void load();
    }
  }, []);

  const connect = (provider: string) => {
    setBusy(provider);
    window.location.assign(`/api/integrations/${provider}/start?redirect=/workspace/integrations`);
  };

  const disconnect = async (provider: string) => {
    setBusy(provider);
    try {
      const response = await fetch(`/api/integrations/${provider}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("تعذر فصل الاتصال");
      toast.success("تم فصل الاتصال بأمان.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر فصل الاتصال");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-[1180px] pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#dfe7e1] bg-[#17241d] p-7 text-white shadow-[0_30px_90px_-45px_rgba(18,40,28,.8)] sm:p-10">
        <div className="absolute -left-16 -top-20 size-56 rounded-full bg-[#bde8cc]/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-[#bde8cc]"><Link2 className="size-3.5" /> مركز الاتصالات</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">كل أدواتك، متصلة بالمساعد.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c9d4cd]">اربط الخدمة مرة واحدة. بعد تسجيل الدخول والتفويض، يعود المسار تلقائيًا إلى العملية التي بدأتَها، وتبقى بيانات التفويض محمية على الخادم.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold text-[#d7e3dc]"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">تسجيل دخول تلقائي عند الحاجة</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">OAuth آمن</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">لا كلمات مرور</span></div>
          </div>
          <div className="flex size-20 shrink-0 items-center justify-center rounded-[1.7rem] border border-white/10 bg-white/5 shadow-inner"><ShieldCheck className="size-9 text-[#bde8cc]" /></div>
        </div>
      </section>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e4e7e1] bg-white p-4"><Sparkles className="size-5 text-[#bd653e]" /><p className="mt-3 text-xs font-black text-[#26342b]">مصمم للمحادثة</p><p className="mt-1 text-[11px] leading-5 text-[#7a847e]">ابدأ الطلب من مساحة العمل ودع النظام يكمل التفويض تلقائيًا.</p></div>
        <div className="rounded-2xl border border-[#e4e7e1] bg-white p-4"><ShieldCheck className="size-5 text-[#4c7a59]" /><p className="mt-3 text-xs font-black text-[#26342b]">تفويض آمن</p><p className="mt-1 text-[11px] leading-5 text-[#7a847e]">الموافقة تتم لدى مزود الخدمة، والتوكنات لا تظهر في الواجهة.</p></div>
        <div className="rounded-2xl border border-[#e4e7e1] bg-white p-4"><Link2 className="size-5 text-[#526d82]" /><p className="mt-3 text-xs font-black text-[#26342b]">عودة تلقائية</p><p className="mt-1 text-[11px] leading-5 text-[#7a847e]">بعد تسجيل الدخول، تستأنف عملية ربط GitHub بدل إرجاع خطأ unauthorized.</p></div>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2">
        {providers.map(provider => {
          const Icon = provider.icon;
          const status = statuses[provider.id];
          const connected = Boolean(status?.connected);
          return (
            <article key={provider.id} className="group rounded-[1.5rem] border border-[#e1e7e2] bg-[#fbfcfa] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9f0eb] text-[#263d30]"><Icon className="size-6" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3"><h2 className="font-black text-[#203129]">{provider.name}</h2>{connected && <span className="inline-flex items-center gap-1 rounded-full bg-[#e4f4ea] px-2.5 py-1 text-[10px] font-bold text-[#2f7a50]"><Check className="size-3" /> متصل</span>}</div>
                  <p className="mt-2 text-xs leading-6 text-[#77827c]">{provider.description}</p>
                  {connected && status?.accountName && <p className="mt-2 text-[11px] font-semibold text-[#435247]">الحساب: {status.accountName}</p>}
                </div>
              </div>
              <div className="mt-5">
                {!provider.available ? <Button variant="outline" disabled className="w-full rounded-xl">قريبًا</Button> : connected ? <Button variant="outline" onClick={() => void disconnect(provider.id)} disabled={busy === provider.id} className="w-full rounded-xl"><Unplug className="ml-2 size-4" /> فصل الاتصال</Button> : <Button onClick={() => connect(provider.id)} disabled={loading || busy === provider.id} className="w-full rounded-xl bg-[#24332b] hover:bg-[#30463a]">{busy === provider.id ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Github className="ml-2 size-4" />} ربط {provider.name}</Button>}
              </div>
            </article>
          );
        })}
      </section>

      <div className="mt-6 rounded-2xl border border-[#e5e2da] bg-[#f6f4ee] p-4 text-xs leading-6 text-[#66726b]"><strong className="text-[#314238]">ملاحظة:</strong> الخدمات غير المفعلة تظهر كـ«قريبًا» دون تغيير أي وظيفة موجودة. يمكن فصل GitHub في أي وقت، وتبقى صلاحياته محصورة بما يوافق عليه المستخدم.</div>
    </div>
  );
}
