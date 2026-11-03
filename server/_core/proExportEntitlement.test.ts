import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock("../db", () => dbMocks);

import { getProExportEntitlement } from "./proExportEntitlement";

function mockSubscriptionLookup(result: Array<{ id: number }> | Error) {
  const limit = result instanceof Error ? vi.fn().mockRejectedValue(result) : vi.fn().mockResolvedValue(result);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  dbMocks.getDb.mockResolvedValue({ select });
  return { select, from, where, limit };
}

describe("getProExportEntitlement", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("grants export only when the server-side verified subscription lookup finds a record", async () => {
    const query = mockSubscriptionLookup([{ id: 12 }]);

    await expect(getProExportEntitlement(7, new Date("2026-10-31T08:00:00Z")))
      .resolves.toEqual({ granted: true, reason: "active" });

    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("denies export when no current verified subscription is found", async () => {
    mockSubscriptionLookup([]);

    await expect(getProExportEntitlement(7, new Date("2026-10-31T08:00:00Z")))
      .resolves.toEqual({ granted: false, reason: "purchase_setup_required" });
  });

  it("fails closed when the database is unavailable or entitlement lookup fails", async () => {
    dbMocks.getDb.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error("database offline"));

    await expect(getProExportEntitlement(7)).resolves.toEqual({ granted: false, reason: "unavailable" });
    await expect(getProExportEntitlement(7)).resolves.toEqual({ granted: false, reason: "unavailable" });
  });
});
