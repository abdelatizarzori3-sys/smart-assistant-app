import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useIsMobile } from "@/hooks/useMobile";
import {
  Archive,
  Crown,
  Link2,
  LogOut,
  MessageSquareText,
  PanelRight,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import QuickSkills from "./QuickSkills";
import ThinkingCompanion from "./ThinkingCompanion";

const menuItems = [
  { icon: MessageSquareText, label: "المحادثات", path: "/workspace" },
  { icon: WandSparkles, label: "الأدوات", path: "/workspace/tools" },
  { icon: Link2, label: "الاتصالات", path: "/workspace/integrations" },
  { icon: Archive, label: "المكتبة", path: "/workspace/library" },
  { icon: Crown, label: "Pro", path: "/workspace/pro" },
];

const SIDEBAR_WIDTH_KEY = "smart-assistant-sidebar-width";
const DEFAULT_WIDTH = 292;
const MIN_WIDTH = 220;
const MAX_WIDTH = 420;
const previewMode =
  typeof window !== "undefined" &&
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("preview") === "1";
const previewUser = { name: "معاينة التصميم", email: "preview@local", role: "admin" as const };
const guestUser = { name: "مساحتي في نواة", email: "guest@local", role: "user" as const };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading } = useAuth();
  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);
  if (loading && !previewMode) return <DashboardLayoutSkeleton />;
  return (
    <SidebarProvider className="orbital-workspace" style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
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
  const displayedUser = user ?? (previewMode ? previewUser : guestUser);
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeMenuItem = menuItems.find(
    item => item.path === location || location.startsWith(`${item.path}/`),
  );

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
        <Sidebar
          side="right"
          collapsible="icon"
          className="border-l border-[#dedbd4] bg-[#fbfaf7]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-[84px] justify-center px-3">
            <div className="flex w-full items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#69736d] transition-colors hover:bg-[#eeece6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d17b4d]/50"
                aria-label="تبديل الشريط الجانبي"
              >
                <PanelRight className="size-4" />
              </button>
              {!isCollapsed && (
                <button
                  onClick={() => setLocation("/workspace")}
                  className="flex min-w-0 items-center gap-2.5 text-right"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[14px] bg-[#24332b] text-white shadow-lg shadow-[#24332b]/15">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-extrabold tracking-[0.12em] text-[#8a918a]">
                      نواة
                    </span>
                    <span className="block truncate text-sm font-black text-[#1c2b25]">
                      مساحة العمل
                    </span>
                  </span>
                </button>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 pt-2">
            <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.15em] text-[#9aa19c] group-data-[collapsible=icon]:hidden">
              مساحة العمل
            </p>
            <SidebarMenu>
              {menuItems.map(item => {
                const Icon = item.icon;
                const active = location === item.path || location.startsWith(`${item.path}/`);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={active ? "bg-[#f0e7db] text-[#24332b]" : "text-[#4b5a52] hover:bg-[#f3f0eb]"}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <div className="mb-3 rounded-[1.5rem] border border-[#f0d7c2] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(249,231,216,0.86)_35%,_rgba(243,222,204,0.75)_100%)] p-4 shadow-[0_20px_40px_-28px_rgba(158,96,61,0.5)] group-data-[collapsible=icon]:hidden">
              <p className="text-[10px] font-black tracking-[0.14em] text-[#a75534]">PRO</p>
              <h3 className="mt-2 text-base font-black text-[#1f2b26]">تجربة مستقبلية ومجانية</h3>
              <p className="mt-1 text-[11px] leading-6 text-[#5d6d66]">
                أطلق ميزات متقدمة، وسرعة أعلى، وتحويلات ذكية داخل مساحة العمل.
              </p>
              <Button
                onClick={() => setLocation("/workspace/pro")}
                className="mt-4 h-9 w-full rounded-xl bg-[#24332b] text-xs font-bold text-white hover:bg-[#17221c]"
              >
                Upgrade to Pro
              </Button>
            </div>

            <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#e5e1d8] bg-[#f5f3ee] p-2.5">
              <Avatar className="size-9 border border-[#e7dbce] bg-[#fff9f6] text-[#24332b]">
                <AvatarFallback className="bg-transparent text-xs font-black">
                  {(displayedUser.name?.trim() || "مساحتي").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-extrabold text-[#1d2c27]">{displayedUser.name?.trim() || "مساحتي"}</p>
                <p className="truncate text-[11px] text-[#7a817c]">{displayedUser.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex size-8 items-center justify-center rounded-xl text-[#69736d] transition-colors hover:bg-[#eeece6]">
                    <SidebarTrigger className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onSelect={() => setLocation("/workspace")}>الصفحة الرئيسية</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setLocation("/workspace/pro")}>ترقية Pro</DropdownMenuItem>
                  <DropdownMenuItem onSelect={logout} className="text-red-600">
                    <LogOut className="ml-2 size-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div
          className={`absolute left-0 top-0 z-50 h-full w-1 cursor-col-resize transition-colors hover:bg-[#d17b4d]/30 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => !isCollapsed && setIsResizing(true)}
        />
      </div>

      <SidebarInset dir="rtl" className="bg-transparent">
        {previewMode && (
          <div className="border-b border-[#ead5ca] bg-[#fff7f1] px-4 py-2 text-center text-[11px] font-semibold text-[#a75534]">
            وضع معاينة تطويري — لا يتم حفظ أي بيانات حقيقية
          </div>
        )}
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e0ddd5] bg-[#fbfaf7]/90 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="flex size-9 items-center justify-center rounded-xl text-[#69736d] hover:bg-[#eeece6]"
              >
                <PanelRight className="size-4" />
              </button>
              <button onClick={() => setLocation("/workspace")} className="text-sm font-black text-[#1d2c27]">
                نواة
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5d6d66]">
              <span className="rounded-full border border-[#f0d7c2] bg-[#fffaf5] px-2 py-1 text-[#a75534]">
                Pro
              </span>
            </div>
          </header>
        )}
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
          {location === "/workspace" && <QuickSkills />}
          {children}
        </main>
        <ThinkingCompanion />
      </SidebarInset>
    </>
  );
}
