import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  FolderOpen,
  Loader2,
  Mic,
  Paperclip,
  Plus,
  SendHorizontal,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AttachedFile = {
  id: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  status: "ready" | "processing" | "failed";
};

type PendingFile = Pick<AttachedFile, "fileName" | "mimeType" | "sizeBytes"> & { tempId: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميغابايت`;
}

function formatFileType(mimeType: string) {
  const type = mimeType.split("/")[1] || mimeType;
  return type.replace(/[-_.]/g, " ").toUpperCase();
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذّرت قراءة الملف."));
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result.split(",")[1] : "";
      if (!value) reject(new Error("تعذّرت تجهيز بيانات الملف."));
      else resolve(value);
    };
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const utils = trpc.useUtils();
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [voiceDraft, setVoiceDraft] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sessionsQuery = trpc.workspace.sessions.list.useQuery();
  const messagesQuery = trpc.workspace.messages.list.useQuery(
    { sessionId: activeSessionId ?? 0 },
    { enabled: activeSessionId !== null },
  );
  const sessionFilesQuery = trpc.workspace.files.listForSession.useQuery(
    { sessionId: activeSessionId ?? 0 },
    { enabled: activeSessionId !== null },
  );
  const createSession = trpc.workspace.sessions.create.useMutation({
    onSuccess: session => {
      setActiveSessionId(session.id);
      void utils.workspace.sessions.list.invalidate();
    },
    onError: () => toast.error("تعذّر إنشاء جلسة جديدة. حاول مرة أخرى."),
  });
  const sendMessage = trpc.workspace.messages.send.useMutation({
    onSuccess: () => {
      setOptimisticMessages([]);
      setAttachedFiles([]);
      void utils.workspace.messages.list.invalidate();
      void utils.workspace.sessions.list.invalidate();
      void utils.workspace.library.recentResults.invalidate();
    },
    onError: error => {
      setOptimisticMessages([]);
      toast.error(error.message || "تعذّر إرسال الرسالة.");
    },
  });
  const transcribeVoice = trpc.workspace.voice.transcribe.useMutation({
    onSuccess: result => {
      setVoiceDraft(result.text);
      toast.success("أصبحت الرسالة الصوتية جاهزة كنص.");
    },
    onError: error => toast.error(error.message || "تعذّر تحويل التسجيل إلى نص."),
  });
  const uploadFile = trpc.workspace.files.upload.useMutation({
    onSuccess: file => {
      setAttachedFiles(previous => [...previous, file as AttachedFile]);
      void utils.workspace.files.list.invalidate();
      if (activeSessionId) void utils.workspace.files.listForSession.invalidate({ sessionId: activeSessionId });
    },
    onError: error => toast.error(error.message || "تعذّر رفع الملف."),
  });

  const sessions = sessionsQuery.data?.filter(session => session.status === "active") ?? [];
  const activeSession = sessions.find(session => session.id === activeSessionId);
  const storedMessages: Message[] = (messagesQuery.data ?? []).map(message => ({
    role: message.role,
    content: message.content,
  }));
  const chatMessages = [...storedMessages, ...optimisticMessages];

  useEffect(() => {
    if (activeSessionId === null && sessions[0]) setActiveSessionId(sessions[0].id);
  }, [activeSessionId, sessions]);

  useEffect(() => {
    setOptimisticMessages([]);
    setAttachedFiles([]);
    setPendingFiles([]);
    setVoiceDraft("");
  }, [activeSessionId]);

  const sendPrompt = (content: string) => {
    const sendInSession = (sessionId: number) => {
      setOptimisticMessages([{ role: "user", content }]);
      sendMessage.mutate({ sessionId, content, fileIds: attachedFiles.map(file => file.id) });
    };
    if (activeSessionId) {
      sendInSession(activeSessionId);
      return;
    }
    createSession.mutate(
      { title: "محادثة جديدة" },
      {
        onSuccess: session => sendInSession(session.id),
      },
    );
  };

  const uploadSelectedFile = async (file: File, shouldTranscribe = false) => {
    if (file.size > 16 * 1024 * 1024) {
      toast.error("الحد الأقصى للملف هو 16 ميغابايت.");
      return;
    }
    try {
      const tempId = `upload-${file.name}`;
      setPendingFiles(previous => [
        ...previous.filter(item => item.tempId !== tempId),
        { tempId, fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size },
      ]);
      const dataBase64 = await fileToBase64(file);
      uploadFile.mutate(
        {
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          dataBase64,
          sessionId: activeSessionId,
        },
        {
          onSuccess: uploaded => {
            setPendingFiles(previous => previous.filter(item => item.tempId !== tempId));
            if (shouldTranscribe) transcribeVoice.mutate({ fileId: uploaded.id });
          },
          onError: () => setPendingFiles(previous => previous.filter(item => item.tempId !== tempId)),
        },
      );
    } catch {
      setPendingFiles(previous => previous.filter(item => item.fileName !== file.name));
      toast.error("تعذّر تجهيز الملف للرفع.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void uploadSelectedFile(file);
    event.target.value = "";
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      toast.error("التسجيل الصوتي غير مدعوم في هذا المتصفح.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = event => event.data.size > 0 && chunks.push(event.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const audioFile = new File([blob], `تسجيل-${Date.now()}.webm`, { type: blob.type });
        void uploadSelectedFile(audioFile, true);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast.error("لم يتم السماح بالوصول إلى الميكروفون.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  const isBusy = createSession.isPending || sendMessage.isPending || uploadFile.isPending || transcribeVoice.isPending;

  return (
    <div className="mx-auto max-w-[1550px]" dir="rtl">
      <section className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="workspace-kicker">مساحة العمل</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#17221c] sm:text-4xl">مرحبًا، لننجز شيئًا مهمًا.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#68736d]">رتّب أفكارك، أرفق ملفاتك، وابدأ محادثة تحتفظ بسياق العمل من البداية حتى النتيجة.</p>
        </div>
        <Button
          onClick={() => createSession.mutate({ title: "محادثة جديدة" })}
          disabled={createSession.isPending}
          className="h-11 rounded-xl bg-[#24332b] px-5 text-white shadow-lg shadow-[#24332b]/10 hover:bg-[#17221c]"
        >
          {createSession.isPending ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Plus className="ml-2 size-4" />}
          محادثة جديدة
        </Button>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="workspace-card min-h-[680px] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebe8e0] px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#e5ede7] text-[#34503e]"><Sparkles className="size-4" /></span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-extrabold text-[#203027]">{activeSession?.title || "مساحة جديدة"}</h2>
                <p className="mt-0.5 text-[11px] text-[#85908a]">{activeSession ? "يُحفظ السياق تلقائيًا" : "أنشئ جلسة أو أرسل طلبك للبدء"}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-[#ead5ca] bg-[#fff9f5] text-[11px] font-semibold text-[#a75534]">مساعد ذكي</Badge>
          </div>

          {(attachedFiles.length > 0 || pendingFiles.length > 0) && (
            <div className="flex flex-wrap gap-2 border-b border-[#ebe8e0] bg-[#fcfbf8] px-5 py-3 sm:px-6">
              {pendingFiles.map(file => (
                <span key={file.tempId} className="flex max-w-full items-center gap-2 rounded-xl border border-[#e3d8ce] bg-[#fffbf7] px-3 py-2 text-xs text-[#56635a]">
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-[#bd653e]" />
                  <span className="max-w-32 truncate font-semibold">{file.fileName}</span>
                  <span className="rounded-md bg-[#f4eadf] px-1.5 py-0.5 text-[9px] font-bold text-[#a95c3d]">{formatFileType(file.mimeType)}</span>
                  <span className="text-[#9aa19c]">{formatBytes(file.sizeBytes)}</span>
                  <span className="text-[10px] font-bold text-[#b66c48]">جارٍ الرفع</span>
                </span>
              ))}
              {attachedFiles.map(file => (
                <span key={file.id} className="flex max-w-full items-center gap-2 rounded-xl border border-[#dbe5dc] bg-white px-3 py-2 text-xs text-[#56635a]">
                  <FileText className="size-3.5 shrink-0 text-[#bd653e]" />
                  <span className="max-w-32 truncate font-semibold">{file.fileName}</span>
                  <span className="rounded-md bg-[#edf4ee] px-1.5 py-0.5 text-[9px] font-bold text-[#397048]">{formatFileType(file.mimeType)}</span>
                  <span className="text-[#9aa19c]">{formatBytes(file.sizeBytes)}</span>
                  <span className="text-[10px] font-bold text-[#4b8058]">{file.status === "ready" ? "جاهز" : file.status === "processing" ? "قيد المعالجة" : "تعذّر التحضير"}</span>
                  <button onClick={() => setAttachedFiles(previous => previous.filter(item => item.id !== file.id))} className="rounded-md p-0.5 hover:bg-[#f0eee8]" aria-label={`إزالة ${file.fileName}`}><X className="size-3.5" /></button>
                </span>
              ))}
            </div>
          )}

          {voiceDraft && (
            <div className="m-4 flex flex-col gap-3 rounded-2xl border border-[#dce8de] bg-[#f4faf4] p-4 sm:m-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Mic className="mt-0.5 size-4 shrink-0 text-[#4a7657]" />
                <div><p className="text-xs font-bold text-[#365640]">مسودة من التسجيل الصوتي</p><p className="mt-1 line-clamp-2 text-xs leading-6 text-[#617069]">{voiceDraft}</p></div>
              </div>
              <Button size="sm" onClick={() => { sendPrompt(voiceDraft); setVoiceDraft(""); }} disabled={isBusy} className="rounded-xl bg-[#31513a] text-white hover:bg-[#243f2c]"><SendHorizontal className="ml-1.5 size-3.5" />إرسال كنص</Button>
            </div>
          )}

          {messagesQuery.isError && <p className="mx-5 mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">تعذّر تحميل سجل الرسائل لهذه الجلسة.</p>}
          <AIChatBox
            messages={chatMessages}
            onSendMessage={sendPrompt}
            isLoading={sendMessage.isPending || createSession.isPending}
            height="560px"
            className="m-0 rounded-none border-0 shadow-none"
            placeholder="اكتب طلبك بتفصيل… استخدم Shift + Enter لسطر جديد"
            emptyStateMessage="ابدأ بما تريد إنجازه، وسأساعدك في ترتيب العمل وتنفيذه."
            suggestedPrompts={["حلّل هذه الفكرة وحوّلها إلى خطة تنفيذ.", "اكتب مسودة احترافية بناءً على ملاحظاتي.", "راجع هذا المحتوى واقترح تحسينات عملية."]}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ebe8e0] bg-[#fcfbf8] px-5 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isBusy} className="rounded-xl text-[#5d6b62] hover:bg-[#eceae3] hover:text-[#25372b]"><Paperclip className="ml-1.5 size-4" />إرفاق ملف</Button>
              <Button type="button" variant="ghost" size="sm" onClick={isRecording ? stopRecording : startRecording} disabled={uploadFile.isPending || transcribeVoice.isPending} className={`rounded-xl ${isRecording ? "bg-red-50 text-red-700 hover:bg-red-100" : "text-[#5d6b62] hover:bg-[#eceae3] hover:text-[#25372b]"}`}>
                {isRecording ? <Square className="ml-1.5 size-3.5 fill-current" /> : <Mic className="ml-1.5 size-4" />}
                {isRecording ? "إيقاف التسجيل" : "رسالة صوتية"}
              </Button>
            </div>
            <p className="text-[11px] text-[#919893]">الحد الأقصى للملف: 16 ميغابايت</p>
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <section className="workspace-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#ebe8e0] px-5 py-4">
              <div><p className="text-sm font-extrabold text-[#26372c]">الجلسات</p><p className="mt-0.5 text-[11px] text-[#87908b]">سياق محفوظ لكل مهمة</p></div>
              <span className="rounded-lg bg-[#f0eee8] px-2 py-1 text-[11px] font-bold text-[#718078]">{sessions.length}</span>
            </div>
            <div className="max-h-[300px] space-y-1 overflow-y-auto p-2">
              {sessionsQuery.isLoading ? (
                <div className="flex items-center gap-2 p-4 text-xs text-[#8b948f]"><Loader2 className="size-3.5 animate-spin" />جارٍ تحميل الجلسات…</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center"><FolderOpen className="mx-auto size-6 text-[#c0c5bf]" /><p className="mt-2 text-xs leading-5 text-[#7d8781]">لا توجد جلسات بعد. ابدأ أول محادثة الآن.</p></div>
              ) : sessions.map(session => (
                <button key={session.id} onClick={() => setActiveSessionId(session.id)} className={`w-full rounded-xl px-3 py-3 text-right transition-colors ${activeSessionId === session.id ? "bg-[#e7eee8]" : "hover:bg-[#f4f2ed]"}`}>
                  <p className="truncate text-xs font-bold text-[#2c3b31]">{session.title}</p>
                  <p className="mt-1 text-[10px] text-[#8c948f]">{new Date(session.updatedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.4rem] bg-[#24332b] p-5 text-white shadow-[0_16px_35px_-20px_rgba(36,51,43,0.6)]">
            <p className="text-xs font-bold text-[#edc6ae]">سير عمل أسرع</p>
            <h3 className="mt-2 text-base font-extrabold leading-7">ابدأ من الأدوات عندما يكون هدفك واضحًا.</h3>
            <p className="mt-2 text-xs leading-6 text-[#c6d0c9]">اختر مسارًا للكتابة أو البرمجة أو التحليل، ثم تابع النتيجة داخل جلسة جديدة.</p>
            <a href="/tools" className="mt-4 inline-flex rounded-xl bg-white/12 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20">استعراض الأدوات</a>
          </section>

          <section className="workspace-card p-5">
            <p className="text-xs font-extrabold text-[#34463a]">مرفقات هذه الجلسة</p>
            {sessionFilesQuery.isLoading ? <p className="mt-3 text-xs text-[#8b948f]">جارٍ التحميل…</p> : (sessionFilesQuery.data?.length ?? 0) === 0 ? <p className="mt-3 text-xs leading-6 text-[#89918c]">أرفق ملفًا ليظهر هنا ويصبح جزءًا من سياق عملك.</p> : <div className="mt-3 space-y-2">{sessionFilesQuery.data?.slice(0, 4).map(file => <a href={file.storageUrl} key={file.id} className="flex items-center gap-2 rounded-xl bg-[#f5f3ed] p-2.5 text-xs text-[#4f5e54] hover:bg-[#eceae4]"><FileText className="size-3.5 shrink-0 text-[#bd653e]" /><span className="min-w-0 flex-1"><span className="block truncate font-bold">{file.fileName}</span><span className="mt-1 flex items-center gap-1.5 text-[10px] text-[#8b948f]"><span>{formatFileType(file.mimeType)}</span><span>·</span><span>{file.status === "ready" ? "جاهز للاستخدام" : file.status === "processing" ? "قيد المعالجة" : "تعذّر التحضير"}</span></span></span></a>)}</div>}
          </section>
        </aside>
      </div>
    </div>
  );
}
