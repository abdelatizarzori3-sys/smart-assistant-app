export type ExportableWorkspaceSession = {
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ExportableWorkspaceMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
};

export type ExportableWorkspaceFile = {
  fileName: string;
};

const roleLabels: Record<ExportableWorkspaceMessage["role"], string> = {
  user: "المستخدم",
  assistant: "المساعد",
  system: "النظام",
};

function normaliseLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").replace(/\u0000/g, "").trim();
}

function escapeMarkdownPlainText(value: string) {
  return normaliseLine(value)
    .replace(/\\/g, "\\\\")
    .replace(/([`*_[\]<>#])/g, "\\$1");
}

function escapeRawHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatTimestamp(value: Date) {
  return value.toISOString();
}

/**
 * Creates a portable Markdown export without reading, signing, or serialising
 * attachment storage fields. Message bodies remain the user's actual text;
 * raw HTML is escaped so opening the export in a Markdown renderer cannot run it.
 */
export function buildWorkspaceSessionMarkdown(input: {
  session: ExportableWorkspaceSession;
  messages: ExportableWorkspaceMessage[];
  files: ExportableWorkspaceFile[];
  exportedAt?: Date;
}) {
  const exportedAt = input.exportedAt ?? new Date();
  const lines = [
    `# ${escapeMarkdownPlainText(input.session.title) || "محادثة"}`,
    "",
    `- تاريخ التصدير (UTC): ${formatTimestamp(exportedAt)}`,
    `- أُنشئت الجلسة (UTC): ${formatTimestamp(input.session.createdAt)}`,
    `- آخر تحديث (UTC): ${formatTimestamp(input.session.updatedAt)}`,
    "",
    "## الرسائل",
    "",
  ];

  if (input.messages.length === 0) {
    lines.push("لا توجد رسائل محفوظة في هذه الجلسة.", "");
  } else {
    for (const message of input.messages) {
      lines.push(`### ${roleLabels[message.role]} — ${formatTimestamp(message.createdAt)}`, "", escapeRawHtml(message.content).replace(/\r\n?/g, "\n").replace(/\u0000/g, ""), "");
    }
  }

  lines.push("## المرفقات", "");
  if (input.files.length === 0) {
    lines.push("لا توجد مرفقات في هذه الجلسة.");
  } else {
    for (const file of input.files) {
      // Intentionally export names only: never include storage keys, URLs, MIME types, or contents.
      lines.push(`- ${escapeMarkdownPlainText(file.fileName) || "مرفق بدون اسم"}`);
    }
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

export function createWorkspaceMarkdownFilename(exportedAt = new Date()) {
  return `smart-assistant-session-${exportedAt.toISOString().replace(/[:.]/g, "-")}.md`;
}
