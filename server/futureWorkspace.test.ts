import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");
const landing = readFileSync(new URL("../client/src/pages/Landing.tsx", import.meta.url), "utf8");
const overlay = css.split("/* Future interface: orbital workspace */")[1];

describe("future workspace style isolation", () => {
  it("binds the future identity to the workspace layout, not the landing page", () => {
    expect(overlay).toBeDefined();
    expect(layout).toContain('<SidebarProvider className="orbital-workspace"');
    expect(landing).not.toContain("orbital-workspace");
    expect(overlay).not.toMatch(/(^|\n)\s*(?::root|html|body)(?:\s|[:,{])/);
  });

  it("retains light card surfaces for the existing dark labels", () => {
    const card = overlay.match(/\.orbital-workspace \.workspace-card\s*\{([^}]+)\}/)?.[1];
    expect(card).toBeDefined();
    expect(card).toContain("rgba(255, 255, 255, .96)");
    expect(overlay).not.toMatch(/(^|\n)\s*\.(?:bg-|text-)/);
    expect(overlay).not.toContain("#f0efff");
    expect(overlay).not.toContain("--foreground:");
  });

  it("keeps focus and reduced-motion rules within the workspace", () => {
    expect(overlay).toContain(".orbital-workspace button:focus-visible");
    expect(overlay).toContain(".orbital-workspace a:focus-visible");
    expect(overlay).toContain("@media (prefers-reduced-motion: reduce)");
    expect(overlay).toContain(".orbital-workspace *::after");
  });
});
