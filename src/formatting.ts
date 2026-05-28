import { CommentSyntax } from "./types";

export { CommentSyntax };

export interface HeaderTemplateData {
  fileName: string;
  projectName: string;
  date: string;
  copyrightYear: string;
  userName: string;
  userEmail: string;
}

export interface HeaderConfig {
  lineWidth: number;
  fillChar: string;
  templateLines: string[];
  templateFile: string;
  authorName: string;
  authorEmail: string;
}

export const DEFAULT_TEMPLATE_LINES = [
  "  File      : FILENAME",
  "  Project   : PROJECT",
  "  Date      : DATE",
  "  Copyright : YEAR",
  "  Copyright : USER_NAME <USER_EMAIL>",
];

export const DEFAULT_CONFIG: HeaderConfig = {
  lineWidth: 80,
  fillChar: "-",
  templateLines: DEFAULT_TEMPLATE_LINES,
  templateFile: "",
  authorName: "",
  authorEmail: "",
};

// -----------------------------------------------------------------------------
export function normalizeConfig(config: Partial<HeaderConfig> = {}): HeaderConfig {
  return {
    lineWidth: normalizeLineWidth(config.lineWidth),
    fillChar: normalizeFillChar(config.fillChar),
    templateLines: normalizeTemplateLines(config.templateLines),
    templateFile: (config.templateFile ?? DEFAULT_CONFIG.templateFile).trim(),
    authorName: (config.authorName ?? DEFAULT_CONFIG.authorName).trim(),
    authorEmail: (config.authorEmail ?? DEFAULT_CONFIG.authorEmail).trim(),
  };
}

// -----------------------------------------------------------------------------
export function buildHeader(
  syntax: CommentSyntax,
  data: HeaderTemplateData,
  config: HeaderConfig = DEFAULT_CONFIG
): string {
  const normalized = normalizeConfig(config);
  const edgeLine = buildCommentLine(syntax, "", normalized.fillChar, normalized.lineWidth);
  const contentLines = normalized.templateLines.map((line) => {
    const replaced = replaceTemplateTokens(line, data);
    return buildCommentLine(syntax, replaced, " ", normalized.lineWidth);
  });

  return [edgeLine, ...contentLines, edgeLine].join("\n") + "\n\n";
}

// -----------------------------------------------------------------------------
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// -----------------------------------------------------------------------------
export function calculateCopyrightYear(fileDate: Date, currentDate: Date = new Date()): string {
  const startYear = fileDate.getFullYear();
  const currentYear = currentDate.getFullYear();

  if (startYear === currentYear) {
    return `${startYear}`;
  }

  return `${startYear} - ${currentYear}`;
}

// -----------------------------------------------------------------------------
function normalizeLineWidth(lineWidth: number | undefined): number {
  if (!Number.isFinite(lineWidth)) {
    return DEFAULT_CONFIG.lineWidth;
  }

  return clamp(Math.trunc(lineWidth as number), 40, 200);
}

// -----------------------------------------------------------------------------
function normalizeFillChar(fillChar: string | undefined): string {
  if (!fillChar || fillChar.length === 0) {
    return DEFAULT_CONFIG.fillChar;
  }

  return fillChar[0];
}

// -----------------------------------------------------------------------------
function normalizeTemplateLines(templateLines: string[] | undefined): string[] {
  if (!Array.isArray(templateLines) || templateLines.length === 0) {
    return [...DEFAULT_TEMPLATE_LINES];
  }

  return templateLines
    .filter((line): line is string => typeof line === "string")
    .map((line) => line.replace(/\r/g, ""));
}

// -----------------------------------------------------------------------------
function buildCommentLine(
  syntax: CommentSyntax,
  text: string,
  fillChar: string,
  lineWidth: number
): string {
  const prefix = `${syntax.singleLineStart} `;
  const suffix = syntax.singleLineEnd ? ` ${syntax.singleLineEnd}` : "";
  const fillLength = Math.max(0, lineWidth - prefix.length - text.length - suffix.length);
  return prefix + text + fillChar.repeat(fillLength) + suffix;
}

// -----------------------------------------------------------------------------
function replaceTemplateTokens(line: string, data: HeaderTemplateData): string {
  const replacements: Record<string, string> = {
    FILENAME: data.fileName,
    PROJECT: data.projectName,
    DATE: data.date,
    YEAR: data.copyrightYear,
    USER_NAME: data.userName,
    USER_EMAIL: data.userEmail,
  };

  let result = line;
  for (const [token, value] of Object.entries(replacements)) {
    result = result
      .replaceAll(token, value)
      .replaceAll(`\${${token}}`, value)
      .replaceAll(`{{${token}}}`, value);
  }

  return result;
}

// -----------------------------------------------------------------------------
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
