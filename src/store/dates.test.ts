import { describe, expect, it } from "vitest";
import { addDays, civilDate, weekDates } from "./dates";

describe("civil dates", () => {
  it("cuts the study day in Asia/Shanghai", () => {
    expect(civilDate(new Date("2026-10-26T16:30:00Z"), "Asia/Shanghai")).toBe("2026-10-27");
    expect(civilDate(new Date("2026-10-26T15:59:00Z"), "Asia/Shanghai")).toBe("2026-10-26");
  });

  it("walks a Monday-first week across the month boundary", () => {
    expect(weekDates("2026-10-27")).toEqual([
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
    ]);
    expect(weekDates("2026-10-25")[0]).toBe("2026-10-19");
    expect(weekDates("2026-10-25")[6]).toBe("2026-10-25");
  });

  it("adds days on the civil calendar", () => {
    expect(addDays("2026-10-27", 4)).toBe("2026-10-31");
    expect(addDays("2026-10-27", -1)).toBe("2026-10-26");
  });
});
