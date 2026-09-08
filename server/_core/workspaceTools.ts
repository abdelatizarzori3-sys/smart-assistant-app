import { z } from "zod";
import { getGithubFile, getGithubRepo, listGithubRepos } from "./github";
import type { Tool, ToolCall } from "./llm";

const githubListReposSchema = z.object({}).strict();
const githubGetRepoSchema = z.object({ owner: z.string().trim().min(1).max(100), repo: z.string().trim().min(1).max(100) }).strict();
const githubGetFileSchema = z.object({ owner: z.string().trim().min(1).max(100), repo: z.string().trim().min(1).max(100), path: z.string().trim().min(1).max(500), ref: z.string().trim().min(1).max(200).optional() }).strict();

export const GITHUB_WORKSPACE_TOOLS: Tool[] = [
  {
    type: "function",
    function: {
      name: "github_list_repos",
      description: "قراءة قائمة مستودعات GitHub المتاحة للمستخدم المتصل فقط. أداة قراءة فقط.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "github_get_repo",
      description: "قراءة معلومات مستودع GitHub محدد. أداة قراءة فقط.",
      parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "github_get_file",
      description: "قراءة ملف من مستودع GitHub محدد مع إمكانية تحديد الفرع أو المرجع. أداة قراءة فقط.",
      parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, path: { type: "string" }, ref: { type: "string" } }, required: ["owner", "repo", "path"], additionalProperties: false },
    },
  },
];

const MAX_TOOL_RESULT_CHARS = 18000;

function bounded(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > MAX_TOOL_RESULT_CHARS ? `${text.slice(0, MAX_TOOL_RESULT_CHARS)}\n[تم اختصار نتيجة الأداة حفاظًا على سياق المحادثة]` : text;
}

function parseArguments(call: ToolCall) {
  try {
    return JSON.parse(call.function.arguments || "{}");
  } catch {
    throw new Error("وسيطات أداة GitHub غير صالحة");
  }
}

export async function executeWorkspaceTool(userId: number, call: ToolCall) {
  const args = parseArguments(call);
  switch (call.function.name) {
    case "github_list_repos":
      githubListReposSchema.parse(args);
      return bounded(await listGithubRepos(userId));
    case "github_get_repo": {
      const input = githubGetRepoSchema.parse(args);
      return bounded(await getGithubRepo(userId, input.owner, input.repo));
    }
    case "github_get_file": {
      const input = githubGetFileSchema.parse(args);
      const file = await getGithubFile(userId, input.owner, input.repo, input.path, input.ref);
      if (file.encoding === "base64" && file.content) {
        const decoded = Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8");
        return bounded({ ...file, content: decoded, encoding: "utf-8" });
      }
      return bounded(file);
    }
    default:
      throw new Error(`أداة غير مسموحة: ${call.function.name}`);
  }
}

export function isWorkspaceToolCall(call: ToolCall) {
  return GITHUB_WORKSPACE_TOOLS.some(tool => tool.function.name === call.function.name);
}
