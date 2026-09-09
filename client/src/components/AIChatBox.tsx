import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { workflows } from "@/data/skillCatalog";
import { Loader2, Send, User, Sparkles, ChevronDown, Paperclip, Mic, Brain } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIChatBoxProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
};

/**
 * Chat-first assistant surface. The complete skill catalog is exposed here,
 * so skills are actionable from the conversation instead of being isolated
 * in a separate tools page.
 */
export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "اكتب طلبك هنا...",
  className,
  height = "600px",
  emptyStateMessage = "ابدأ محادثتك مع المساعد",
  suggestedPrompts,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const [showCapabilities, setShowCapabilities] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayMessages = messages.filter(msg => msg.role !== "system");
  const [minHeightForLastMessage, setMinHeightForLastMessage] = useState(0);

  useEffect(() => {
    if (containerRef.current && inputAreaRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const inputHeight = inputAreaRef.current.offsetHeight;
      const calculatedHeight = containerHeight - inputHeight - 32 - 56;
      setMinHeightForLastMessage(Math.max(0, calculatedHeight));
    }
  }, []);

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
    if (viewport) {
      requestAnimationFrame(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;
    onSendMessage(trimmedInput);
    setInput("");
    scrollToBottom();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const activateSkill = (workflow: (typeof workflows)[number]) => {
    onSendMessage(`أريد استخدام مهارة «${workflow.title}». ${workflow.prompt}`);
    setShowCapabilities(false);
  };

  const githubConnectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/integrations/github/start?redirect=%2Fworkspace`
    : "/api/integrations/github/start?redirect=%2Fworkspace";

  const renderAssistantContent = (content: string) => {
    const hasGitHubBlockedLink = /GitHub[\s\S]{0,160}\[blocked\]/i.test(content) || /\[blocked\][\s\S]{0,160}GitHub/i.test(content);
    if (!hasGitHubBlockedLink) return <Streamdown>{content}</Streamdown>;

    const parts = content.split("[blocked]");
    return (
      <>
        <Streamdown>{parts[0]}</Streamdown>
        <a
          href={githubConnectUrl}
          className="mt-2 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground no-underline shadow-sm transition-opacity hover:opacity-90"
        >
          🔗 ربط حساب GitHub الآن
        </a>
        {parts.slice(1).map((part, index) => (
          <Streamdown key={index}>{part}</Streamdown>
        ))}
      </>
    );
  };

  return (
    <div ref={containerRef} className={cn("flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm", className)} style={{ height }}>
      <div className="flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Brain className="size-4 text-primary" />
          <span>المساعد يعرف مهارات مساحة العمل</span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowCapabilities(value => !value)} className="gap-1.5 text-xs">
          {workflows.length} مهارة
          <ChevronDown className={cn("size-4 transition-transform", showCapabilities && "rotate-180")} />
        </Button>
      </div>

      {showCapabilities && (
        <div className="border-b bg-muted/30 p-3">
          <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border bg-background px-2.5 py-1">ملفات وسياق</span>
            <span className="rounded-full border bg-background px-2.5 py-1">ذاكرة المحادثات</span>
            <span className="rounded-full border bg-background px-2.5 py-1">إدخال صوتي</span>
            <span className="rounded-full border bg-background px-2.5 py-1">تحليل الصور وPDF</span>
          </div>
          <div className="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
            {workflows.map(workflow => (
              <button
                key={workflow.id}
                type="button"
                disabled={isLoading}
                onClick={() => activateSkill(workflow)}
                className="rounded-xl border bg-background p-3 text-right transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-xs font-bold text-foreground">{workflow.title}</div>
                <div className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{workflow.description}</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">هذه القدرات متاحة من داخل المحادثة؛ اختر مهارة أو اكتب طلبك مباشرة.</p>
        </div>
      )}

      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col p-4">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="size-12 opacity-20" />
                <p className="text-sm">{emptyStateMessage}</p>
              </div>
              {suggestedPrompts && suggestedPrompts.length > 0 && (
                <div className="flex max-w-2xl flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button key={index} onClick={() => onSendMessage(prompt)} disabled={isLoading} className="rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col space-y-4 p-4">
              {displayMessages.map((message, index) => {
                const isLastMessage = index === displayMessages.length - 1;
                const shouldApplyMinHeight = isLastMessage && !isLoading && minHeightForLastMessage > 0;
                return (
                  <div key={index} className={cn("flex gap-3", message.role === "user" ? "justify-end items-start" : "justify-start items-start")} style={shouldApplyMinHeight ? { minHeight: `${minHeightForLastMessage}px` } : undefined}>
                    {message.role === "assistant" && <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center"><Sparkles className="size-4 text-primary" /></div>}
                    <div className={cn("max-w-[80%] rounded-lg px-4 py-2.5", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                      {message.role === "assistant" ? <div className="prose prose-sm dark:prose-invert max-w-none">{renderAssistantContent(message.content)}</div> : <p className="whitespace-pre-wrap text-sm">{message.content}</p>}
                    </div>
                    {message.role === "user" && <div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center"><User className="size-4 text-secondary-foreground" /></div>}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex items-start gap-3" style={minHeightForLastMessage > 0 ? { minHeight: `${minHeightForLastMessage}px` } : undefined}>
                  <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center"><Sparkles className="size-4 text-primary" /></div>
                  <div className="rounded-lg bg-muted px-4 py-2.5"><Loader2 className="size-4 animate-spin text-muted-foreground" /></div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <form ref={inputAreaRef} onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-background/50 items-end">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Paperclip className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
          <Mic className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
          <Textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-1 max-h-32 resize-none min-h-9" rows={1} />
        </div>
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 h-[38px] w-[38px]">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
