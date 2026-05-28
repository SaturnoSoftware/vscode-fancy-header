import * as path from "path";
import { DEFAULT_TEMPLATE_LINES, HeaderConfig, NamedHeaderTemplate, normalizeConfig } from "./formatting";

// -----------------------------------------------------------------------------
export function slugifyTemplateName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "template";
}

// -----------------------------------------------------------------------------
export function buildTemplateFileName(name: string, index?: number): string {
  const slug = slugifyTemplateName(name);
  return index && index > 1
    ? `_header-${slug}-${index}.txt`
    : `_header-${slug}.txt`;
}

// -----------------------------------------------------------------------------
export function getPreferredTemplateDirectory(config: HeaderConfig, defaultRoot: string): string {
  const normalized = normalizeConfig(config);

  if (normalized.templates.length > 0) {
    return path.dirname(normalized.templates[0].path);
  }

  if (normalized.templateFile) {
    return path.dirname(normalized.templateFile);
  }

  return defaultRoot;
}

// -----------------------------------------------------------------------------
export function resolveUniqueTemplatePath(
  templateName: string,
  config: HeaderConfig,
  defaultRoot: string,
  exists: (candidatePath: string) => boolean
): string {
  const root = getPreferredTemplateDirectory(config, defaultRoot);

  for (let index = 1; index < 1000; index++) {
    const candidate = path.join(root, buildTemplateFileName(templateName, index));
    if (!exists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Saturno FancyHeader: failed to resolve a unique template path for "${templateName}".`);
}

// -----------------------------------------------------------------------------
export function getEditableTemplateCandidates(config: HeaderConfig): NamedHeaderTemplate[] {
  const normalized = normalizeConfig(config);

  if (normalized.templates.length > 0) {
    return normalized.templates;
  }

  if (normalized.templateFile) {
    return [
      {
        name: "Current Template",
        path: normalized.templateFile,
      },
    ];
  }

  return [];
}

// -----------------------------------------------------------------------------
export function buildNewTemplateContent(
  config: HeaderConfig,
  sourceContents?: string | null
): string {
  if (typeof sourceContents === "string" && sourceContents.trim().length > 0) {
    return sourceContents.replace(/\r/g, "");
  }

  const normalized = normalizeConfig(config);
  const lines = normalized.templateLines.length > 0
    ? normalized.templateLines
    : DEFAULT_TEMPLATE_LINES;

  return lines.join("\n");
}

// -----------------------------------------------------------------------------
export function buildUpdatedTemplateList(
  config: HeaderConfig,
  newTemplate: NamedHeaderTemplate
): NamedHeaderTemplate[] {
  const normalized = normalizeConfig(config);

  if (normalized.templates.length > 0) {
    return [...normalized.templates, newTemplate];
  }

  if (normalized.templateFile) {
    return [
      {
        name: "Default",
        path: normalized.templateFile,
      },
      newTemplate,
    ];
  }

  return [newTemplate];
}
