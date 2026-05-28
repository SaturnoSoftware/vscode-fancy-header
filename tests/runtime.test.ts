import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { calculateCopyrightYear, formatDateYYYYMMDD } from "../src/formatting";
import { resolveAuthorInfo } from "../src/runtime";

describe("format helpers", () => {
  it("formats dates as YYYY-MM-DD", () => {
    const date = new Date(2026, 4, 28);
    assert.strictEqual(formatDateYYYYMMDD(date), "2026-05-28");
  });

  it("returns a single copyright year for same-year files", () => {
    const fileDate = new Date(2026, 0, 1);
    const currentDate = new Date(2026, 5, 1);
    assert.strictEqual(calculateCopyrightYear(fileDate, currentDate), "2026");
  });

  it("returns a year range for older files", () => {
    const fileDate = new Date(2024, 0, 1);
    const currentDate = new Date(2026, 5, 1);
    assert.strictEqual(calculateCopyrightYear(fileDate, currentDate), "2024 - 2026");
  });
});

describe("resolveAuthorInfo", () => {
  it("prefers explicit overrides", () => {
    const result = resolveAuthorInfo(
      "Override Name",
      "override@example.com",
      { name: "Git Name", email: "git@example.com" },
      "os-user"
    );

    assert.deepStrictEqual(result, {
      name: "Override Name",
      email: "override@example.com",
    });
  });

  it("falls back to git info and then the OS username", () => {
    const fromGit = resolveAuthorInfo("", "", { name: "Git Name", email: "git@example.com" }, "os-user");
    assert.deepStrictEqual(fromGit, {
      name: "Git Name",
      email: "git@example.com",
    });

    const fromOs = resolveAuthorInfo("", "", null, "os-user");
    assert.deepStrictEqual(fromOs, {
      name: "os-user",
      email: "",
    });
  });
});
