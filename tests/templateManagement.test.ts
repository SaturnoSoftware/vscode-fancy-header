import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { DEFAULT_CONFIG } from "../src/formatting";
import {
  buildNewTemplateContent,
  buildTemplateFileName,
  buildUpdatedTemplateList,
  deriveTemplateNameFromFilePath,
  getEditableTemplateCandidates,
  getPreferredTemplateDirectory,
  getTemplateSearchDirectories,
  mergeTemplateSources,
  resolveUniqueTemplatePath,
  slugifyTemplateName,
} from "../src/templateManagement";
import { getDefaultUserTemplateRoot } from "../src/runtime";

describe("templateManagement", () => {
  it("slugifies template names into stable file-safe ids", () => {
    assert.strictEqual(slugifyTemplateName("ASCII Galaxy"), "ascii-galaxy");
    assert.strictEqual(slugifyTemplateName("  !!!  "), "template");
  });

  it("builds template file names", () => {
    assert.strictEqual(buildTemplateFileName("ASCII Galaxy"), "_header-ascii-galaxy.txt");
    assert.strictEqual(buildTemplateFileName("ASCII Galaxy", 2), "_header-ascii-galaxy-2.txt");
  });

  it("chooses the preferred template directory from configured templates first", () => {
    const result = getPreferredTemplateDirectory(
      {
        ...DEFAULT_CONFIG,
        templates: [{ name: "Default", path: "D:\\Templates\\_header-default.txt" }],
      },
      "D:\\Fallback"
    );

    assert.strictEqual(result, "D:\\Templates");
  });

  it("builds a unique template path when names collide", () => {
    const seen = new Set([
      "D:\\Templates\\_header-ascii-galaxy.txt",
      "D:\\Templates\\_header-ascii-galaxy-2.txt",
    ]);

    const result = resolveUniqueTemplatePath(
      "ASCII Galaxy",
      DEFAULT_CONFIG,
      "D:\\Templates",
      (candidatePath) => seen.has(candidatePath)
    );

    assert.strictEqual(result, "D:\\Templates\\_header-ascii-galaxy-3.txt");
  });

  it("builds the template search directories from configured paths plus the default root", () => {
    const result = getTemplateSearchDirectories(
      {
        ...DEFAULT_CONFIG,
        templates: [{ name: "Default", path: "D:\\Templates\\_header-default.txt" }],
        templateFile: "D:\\Templates\\_header-default.txt",
      },
      "D:\\UserTemplates"
    );

    assert.deepStrictEqual(result, [
      "D:\\Templates",
      "D:\\UserTemplates",
    ]);
  });

  it("returns editable candidates from templates or templateFile fallback", () => {
    assert.deepStrictEqual(
      getEditableTemplateCandidates({
        ...DEFAULT_CONFIG,
        templates: [{ name: "Default", path: "D:\\Templates\\_header-default.txt" }],
      }),
      [{ name: "Default", path: "D:\\Templates\\_header-default.txt" }]
    );

    assert.deepStrictEqual(
      getEditableTemplateCandidates({
        ...DEFAULT_CONFIG,
        templateFile: "D:\\Templates\\_header-default.txt",
      }),
      [{ name: "Current Template", path: "D:\\Templates\\_header-default.txt" }]
    );
  });

  it("derives friendly names from discovered template files", () => {
    assert.strictEqual(
      deriveTemplateNameFromFilePath("D:\\Templates\\_header-ascii-galaxy.txt"),
      "Ascii Galaxy"
    );
    assert.strictEqual(
      deriveTemplateNameFromFilePath("D:\\Templates\\_header.txt"),
      "Template"
    );
  });

  it("merges configured templates with discovered files without duplicates", () => {
    const result = mergeTemplateSources(
      [{ name: "Default", path: "D:\\Templates\\_header-default.txt" }],
      [
        "D:\\Templates\\_header-default.txt",
        "D:\\Templates\\_header-galaxy.txt",
      ]
    );

    assert.deepStrictEqual(result, [
      { name: "Default", path: "D:\\Templates\\_header-default.txt" },
      { name: "Galaxy", path: "D:\\Templates\\_header-galaxy.txt" },
    ]);
  });

  it("builds new template content from an existing template or templateLines fallback", () => {
    assert.strictEqual(
      buildNewTemplateContent(DEFAULT_CONFIG, "Line 1\r\nLine 2\r\n"),
      "Line 1\nLine 2\n"
    );

    assert.strictEqual(
      buildNewTemplateContent({
        ...DEFAULT_CONFIG,
        templateLines: ["One", "Two"],
      }),
      "One\nTwo"
    );
  });

  it("builds an updated template list preserving the previous single-template fallback", () => {
    const result = buildUpdatedTemplateList(
      {
        ...DEFAULT_CONFIG,
        templateFile: "D:\\Templates\\_header-default.txt",
      },
      {
        name: "Galaxy",
        path: "D:\\Templates\\_header-galaxy.txt",
      }
    );

    assert.deepStrictEqual(result, [
      { name: "Default", path: "D:\\Templates\\_header-default.txt" },
      { name: "Galaxy", path: "D:\\Templates\\_header-galaxy.txt" },
    ]);
  });

  it("computes the default global template root for common platforms", () => {
    assert.strictEqual(
      getDefaultUserTemplateRoot("win32", { APPDATA: "C:\\Users\\Mateus\\AppData\\Roaming" }, "C:\\Users\\Mateus"),
      "C:\\Users\\Mateus\\AppData\\Roaming\\Code\\User\\saturno-fancy-header"
    );
    assert.strictEqual(
      getDefaultUserTemplateRoot("darwin", {}, "/Users/mateus"),
      "/Users/mateus/Library/Application Support/Code/User/saturno-fancy-header"
    );
    assert.strictEqual(
      getDefaultUserTemplateRoot("linux", {}, "/home/mateus"),
      "/home/mateus/.config/Code/User/saturno-fancy-header"
    );
  });
});
