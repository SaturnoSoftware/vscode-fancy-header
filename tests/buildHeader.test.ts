import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { buildHeader, CommentSyntax, DEFAULT_CONFIG, HeaderTemplateData } from "../src/formatting";

const cStyleSyntax: CommentSyntax = {
  singleLineStart: "//",
  singleLineEnd: "",
  multiLineStart: "/*",
  multiLineMiddle: "*",
  multiLineEnd: "*/",
};

const htmlStyleSyntax: CommentSyntax = {
  singleLineStart: "<!--",
  singleLineEnd: "-->",
  multiLineStart: "<!--",
  multiLineMiddle: " ",
  multiLineEnd: "-->",
};

const sampleData: HeaderTemplateData = {
  fileName: "feature.ts",
  projectName: "saturno-project",
  date: "2026-05-28",
  copyrightYear: "2024 - 2026",
  userName: "Mateus",
  userEmail: "mateus@saturno.software",
};

describe("buildHeader", () => {
  it("builds the default C-style header with border and body lines", () => {
    const result = buildHeader(cStyleSyntax, sampleData, DEFAULT_CONFIG);
    const lines = result.trimEnd().split("\n");

    assert.strictEqual(lines.length, 7);
    assert.strictEqual(lines[0].length, 80);
    assert.strictEqual(lines[0], "// " + "-".repeat(77));
    assert.match(lines[1], /File\s+: feature\.ts\s*$/);
    assert.match(lines[2], /Project\s+: saturno-project\s*$/);
    assert.match(lines[5], /Mateus <mateus@saturno\.software>\s*$/);
    assert.strictEqual(lines[6], lines[0]);
  });

  it("supports custom template lines, width, and fill character", () => {
    const result = buildHeader(cStyleSyntax, sampleData, {
      ...DEFAULT_CONFIG,
      lineWidth: 60,
      fillChar: "=",
      templateLines: [" Header : FILENAME", " Author : USER_NAME"],
    });
    const lines = result.trimEnd().split("\n");

    assert.strictEqual(lines.length, 4);
    assert.strictEqual(lines[0], "// " + "=".repeat(57));
    assert.strictEqual(lines[0].length, 60);
    assert.match(lines[1], /Header : feature\.ts\s*$/);
    assert.match(lines[2], /Author : Mateus\s*$/);
  });

  it("supports languages that require a closing single-line suffix", () => {
    const result = buildHeader(htmlStyleSyntax, sampleData, DEFAULT_CONFIG);
    const lines = result.trimEnd().split("\n");

    assert.ok(lines[0].startsWith("<!-- "));
    assert.ok(lines[0].endsWith(" -->"));
    assert.ok(lines[1].endsWith(" -->"));
    assert.strictEqual(lines[0].length, 80);
  });
});
