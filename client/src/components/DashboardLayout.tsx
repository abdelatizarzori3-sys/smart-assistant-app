import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Archive, LogOut, MessageSquareText, PanelRight, Sparkles, WandSparkles } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: MessageSquareText, label: "المحادثات", path: "/" },
  { icon: WandSparkles, label: "الأدوات", path: "/tools" },
  { icon: Archive, label: "المكتبة", path: "/library" },
];

const SIDEBAR_WIDTH_KEY = "smart-assistant-sidebar-width";
const DEFAULT_WIDTH = 292;
const MIN_WIDTH = 220;
const MAX_WIDTH = 420;
const previewMode = typeof window !== "undefined" && import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "1";
const previewUser = { name: "معاينة التصميم", email: "preview@local", role: "admin" as const };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading && !previewMode) return <DashboardLayoutSkeleton />;

  if (!user && !previewMode) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f7f4ee] p-6 text-right">
        <div className="workspace-card w-full max-w-md p-9 text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#24332b] text-white shadow-lg shadow-[#24332b]/15">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17221c]">مرحبًا بك في نواة</h1>
          <p className="mt-3 text-sm leading-7 text-[#647069]">سجّل الدخول لفتح مساحة عملك الذكية والاحتفاظ بسياق محادثاتك وملفاتك.</p>
          <Button onClick={() => startLogin()} size="lg" className="mt-8 w-full bg-[#24332b] text-white hover:bg-[#17221c]">
            تسجيل الدخول للمتابعة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
}) {
  const { user, logout } = useAuth();
  const displayedUser = user ?? (previewMode ? previewUser : null);
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeMenuItem = menuItems.find(item => item.path === location);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;
      const sidebarRight = sidebarRef.current.getBoundingClientRect().right;
      const nextWidth = sidebarRight - event.clientX;
      if (nextWidth >= MIN_WIDTH && nextWidth <= MAX_WIDTH) setSidebarWidth(nextWidth);
    };
    const stopResizing = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div dir="rtl" className="relative" ref={sidebarRef}>
        <Sidebar side="right" collapsible="icon" className="border-l border-[#dedbd4] bg-[#fbfaf7]" disableTransition={isResizing}>
          <SidebarHeader className="h-[84px] justify-center px-3">
            <div className="flex w-full items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#69736d] transition-colors hover:bg-[#eeece6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d17b4d]"
                aria-label="طي لوحة التنقل"
              >
                <PanelRight className="size-4" />
              </button>
              {!isCollapsed && (
                <button onClick={() => setLocation("/")} className="flex min-w-0 items-center gap-2.5 text-right">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#24332b] text-white shadow-md shadow-[#24332b]/15">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold tracking-tight text-[#17221c]">نواة</span>
                    <span className="block truncate text-[11px] text-[#78827d]">مساحة عمل ذكية</span>
                  </span>
                </button>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 pt-2">
            <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.15em] text-[#9aa19c] group-data-[collapsible=icon]:hidden">مساحة العمل</p>
            <SidebarMenu className="gap-1">
              {menuItems.map(item => {
                const active = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className="h-11 rounded-xl px-3 text-[#5f6a63] transition-all data-[active=true]:bg-[#e5ede7] data-[active=true]:font-bold data-[active=true]:text-[#213329]"
                    >
                      <item.icon className={`size-[18px] ${active ? "text-[#bd653e]" : ""}`} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <div className="mb-3 rounded-2xl border border-[#e5e2da] bg-[#f6f4ee] p-3 group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-bold text-[#314238]">جلساتك وملفاتك محفوظة</p>
              <p className="mt-1 text-[11px] leading-5 text-[#78827d]">ابدأ محادثة جديدة أو تابع سياقًا سابقًا.</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl px-1 py-1.5 text-right transition-colors hover:bg-[#f0eee9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d17b4d] group-data-[collapsible=icon]:justify-center">
                  <Avatar className="size-9 shrink-0 border border-[#dedbd4]">
                    <AvatarFallback className="bg-[#e7e2d8] text-xs font-extrabold text-[#435247]">{displayedUser?.name?.charAt(0).toUpperCase() || "م"}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-sm font-bold text-[#26342b]">{displayedUser?.name || "مساحة عملي"}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#89908c]">{previewMode ? "وضع معاينة محلي" : displayedUser?.role === "admin" ? "مالك مساحة العمل" : "عضو مساحة العمل"}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => previewMode ? window.location.assign("/") : logout()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="ml-2 size-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute left-0 top-0 z-50 h-full w-1 cursor-col-resize transition-colors hover:bg-[#d17b4d]/30 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => !isCollapsed && setIsResizing(true)}
        />
      </div>

      <SidebarInset dir="rtl" className="bg-transparent">
        {previewMode && <div className="border-b border-[#ead5ca] bg-[#fff7f1] px-4 py-2 text-center text-[11px] font-semibold text-[#a75534]">وضع معاينة تطويري — لا يتم حفظ البيانات أو تفعيل الأدوات في هذه الشاشة.</div>}
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e0ddd5] bg-[#fbfaf7]/90 px-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="size-9 rounded-xl bg-[#f1efe9]" />
              <span className="text-sm font-bold text-[#26342b]">{activeMenuItem?.label || "نواة"}</span>
            </div>
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#24332b] text-white"><Sparkles className="size-3.5" /></span>
          </header>
        )}
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
