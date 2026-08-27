import { Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function DashboardLayoutSkeleton() {
  return (
    <div dir="rtl" className="flex min-h-screen bg-[#f7f4ee] text-[#24332b]">
      <aside className="hidden w-[292px] shrink-0 border-l border-[#dedbd4] bg-[#fbfaf7] p-5 md:flex md:flex-col">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#24332b] text-white"><Sparkles className="size-4" /></span>
          <span><strong className="block text-sm">نواة</strong><small className="text-[11px] text-[#829088]">مساحة عمل ذكية</small></span>
        </div>
        <div className="mt-11 space-y-3"><Skeleton className="h-11 w-full rounded-xl" /><Skeleton className="h-11 w-full rounded-xl" /><Skeleton className="h-11 w-full rounded-xl" /></div>
        <div className="mt-auto rounded-2xl bg-[#f3f1eb] p-4"><Skeleton className="h-3 w-24" /><Skeleton className="mt-3 h-2 w-full" /></div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col p-5 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#718078]"><Loader2 className="size-3.5 animate-spin text-[#bd653e]" />جارٍ تجهيز مساحة العمل</div>
        <div className="mt-5 flex items-end justify-between"><div className="space-y-3"><Skeleton className="h-9 w-64 max-w-[70vw] rounded-xl" /><Skeleton className="h-4 w-96 max-w-[80vw] rounded-lg" /></div><Skeleton className="hidden h-11 w-32 rounded-xl sm:block" /></div>
        <div className="mt-8 grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><Skeleton className="min-h-[560px] rounded-[1.4rem]" /><div className="hidden space-y-5 xl:block"><Skeleton className="h-64 rounded-[1.4rem]" /><Skeleton className="h-44 rounded-[1.4rem]" /></div></div>
      </main>
    </div>
  );
}
