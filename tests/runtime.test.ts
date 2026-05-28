import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { calculateCopyrightYear, formatDateYYYYMMDD } from "../src/formatting";
import { DEFAULT_CONFIG } from "../src/formatting";
import { resolveAuthorInfo, resolveConfiguredTemplateLines, resolveTemplateFilePath } from "../src/runtime";

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

  describe("template files", () => {
    it("resolves workspace and file directory tokens", () => {
      const currentFilePath = "D:\\Projects\\repo\\src\\main.ts";
      const workspaceFolderPath = "D:\\Projects\\repo";

      assert.strictEqual(
        resolveTemplateFilePath("${workspaceFolder}\\templates\\header.txt", currentFilePath, workspaceFolderPath),
        path.resolve("D:\\Projects\\repo\\templates\\header.txt")
      );

      assert.strictEqual(
        resolveTemplateFilePath("${fileDirname}\\header.txt", currentFilePath, workspaceFolderPath),
        path.resolve("D:\\Projects\\repo\\src\\header.txt")
      );
    });

    it("loads template lines from a file and trims only trailing empty lines", () => {
      const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fancyheader-template-"));
      const workspaceFolderPath = tempRoot;
      const currentFilePath = path.join(tempRoot, "src", "main.ts");
      const templateFilePath = path.join(tempRoot, "_header-template.txt");

      fs.mkdirSync(path.dirname(currentFilePath), { recursive: true });
      fs.writeFileSync(currentFilePath, "");
      fs.writeFileSync(templateFilePath, "Line 1\n\nLine 3\n");

      const lines = resolveConfiguredTemplateLines(currentFilePath, workspaceFolderPath, {
        ...DEFAULT_CONFIG,
        templateFile: "${workspaceFolder}\\_header-template.txt",
      });

      assert.deepStrictEqual(lines, ["Line 1", "", "Line 3"]);
    });

    it("throws when the configured template file cannot be read", () => {
      const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fancyheader-template-missing-"));
      const currentFilePath = path.join(tempRoot, "main.ts");
      fs.writeFileSync(currentFilePath, "");

      assert.throws(
        () => resolveConfiguredTemplateLines(currentFilePath, tempRoot, {
          ...DEFAULT_CONFIG,
          templateFile: "${workspaceFolder}\\missing.txt",
        }),
        /failed to read template file/
      );
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
