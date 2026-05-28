import * as vscode from "vscode";
import { getActiveEditor, getActiveFilePath, showError } from "../libs/Saturno.VSCodeKit/src/EditorUtils";
import { getCommentSyntaxForEditor } from "./commentSyntax";
import { DEFAULT_CONFIG, HeaderConfig, NamedHeaderTemplate, normalizeConfig, buildHeader } from "./formatting";
import { resolveConfiguredTemplateLines, resolveTemplateData } from "./runtime";

const CONFIG_SECTION = "saturno-fancy-header";

// -----------------------------------------------------------------------------
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "saturno-fancy-header.addHeader",
      async () => executeAddHeader()
    )
  );
}

// -----------------------------------------------------------------------------
export function deactivate(): void { }

// -----------------------------------------------------------------------------
function getConfig(): HeaderConfig {
  const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
  return normalizeConfig({
    lineWidth: cfg.get<number>("lineWidth", DEFAULT_CONFIG.lineWidth),
    fillChar: cfg.get<string>("fillChar", DEFAULT_CONFIG.fillChar),
    templateLines: cfg.get<string[]>("templateLines", DEFAULT_CONFIG.templateLines),
    templateFile: cfg.get<string>("templateFile", DEFAULT_CONFIG.templateFile),
    templates: cfg.get<NamedHeaderTemplate[]>("templates", DEFAULT_CONFIG.templates),
    authorName: cfg.get<string>("authorName", DEFAULT_CONFIG.authorName),
    authorEmail: cfg.get<string>("authorEmail", DEFAULT_CONFIG.authorEmail),
  });
}

// -----------------------------------------------------------------------------
async function executeAddHeader(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {
    showError("Saturno FancyHeader: no active editor");
    return;
  }

  const filePath = getActiveFilePath();
  if (!filePath) {
    showError("Saturno FancyHeader: unable to resolve the active file path");
    return;
  }

  const syntax = getCommentSyntaxForEditor(editor);
  if (!syntax) {
    showError(`Saturno FancyHeader: unsupported language "${editor.document.languageId}"`);
    return;
  }

  const config = getConfig();
  const workspaceFolderPath = vscode.workspace.getWorkspaceFolder(editor.document.uri)?.uri.fsPath ?? null;
  const selectedTemplate = await chooseNamedTemplate(config.templates);
  if (selectedTemplate === undefined) {
    return;
  }

  const effectiveConfig = selectedTemplate
    ? { ...config, templateFile: selectedTemplate.path }
    : config;
  let templateLines: string[];

  try {
    templateLines = resolveConfiguredTemplateLines(filePath, workspaceFolderPath, effectiveConfig);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Saturno FancyHeader: failed to load template file");
    return;
  }

  const templateData = resolveTemplateData(filePath, effectiveConfig);
  const header = buildHeader(syntax, templateData, { ...effectiveConfig, templateLines });

  editor.edit((editBuilder) => {
    editBuilder.insert(new vscode.Position(0, 0), header);
  });
}

// -----------------------------------------------------------------------------
async function chooseNamedTemplate(templates: NamedHeaderTemplate[]): Promise<NamedHeaderTemplate | null | undefined> {
  if (templates.length === 0) {
    return null;
  }

  if (templates.length === 1) {
    return templates[0];
  }

  const picked = await vscode.window.showQuickPick(
    templates.map((template) => ({
      label: template.name,
      description: template.path,
      template,
    })),
    {
      placeHolder: "Select a Saturno FancyHeader template",
      ignoreFocusOut: true,
    }
  );

  return picked?.template;
}
