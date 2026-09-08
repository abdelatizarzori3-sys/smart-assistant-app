import { getUserIntegration } from "../integrationsDb";
import { decryptSecret } from "../_core/secrets";

const GITHUB_API = "https://api.github.com";

async function getAccessToken(userId: number) {
  const integration = await getUserIntegration(userId, "github");
  if (!integration?.accessTokenEncrypted) throw new Error("GitHub غير متصل");
  return decryptSecret(integration.accessTokenEncrypted);
}

async function githubRequest<T>(userId: number, path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken(userId);
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 500)}`);
  }
  return response.json() as Promise<T>;
}

export async function listGithubRepos(userId: number) {
  return githubRequest<Array<{ id: number; full_name: string; private: boolean; html_url: string; default_branch: string }>>(
    userId,
    "/user/repos?sort=updated&per_page=30",
  );
}

export async function getGithubRepo(userId: number, owner: string, repo: string) {
  return githubRequest<{ full_name: string; private: boolean; html_url: string; default_branch: string }>(
    userId,
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
}

export async function getGithubFile(userId: number, owner: string, repo: string, path: string, ref?: string) {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return githubRequest<{ name: string; path: string; sha: string; size: number; encoding?: string; content?: string; html_url?: string }>(
    userId,
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}${query}`,
  );
}

export async function getGithubFileText(userId: number, owner: string, repo: string, path: string, ref?: string) {
  const file = await getGithubFile(userId, owner, repo, path, ref);
  if (!file.content || file.encoding !== "base64") return { ...file, text: "" };
  const text = Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8").slice(0, 120_000);
  return { ...file, text };
}
