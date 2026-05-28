import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getActiveEditor, getActiveFilePath, showError } from "../libs/Saturno.VSCodeKit/src/EditorUtils";
import { getCommentSyntaxForEditor } from "./commentSyntax";
import { DEFAULT_CONFIG, HeaderConfig, NamedHeaderTemplate, normalizeConfig, buildHeader } from "./formatting";
import { getDefaultUserTemplateRoot, resolveConfiguredTemplateLines, resolveTemplateData } from "./runtime";
import { buildNewTemplateContent, buildUpdatedTemplateList, getEditableTemplateCandidates, resolveUniqueTemplatePath } from "./templateManagement";

const CONFIG_SECTION = "saturno-fancy-header";

// -----------------------------------------------------------------------------
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "saturno-fancy-header.addHeader",
      async () => executeAddHeader()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "saturno-fancy-header.newTemplate",
      async () => executeNewTemplate()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "saturno-fancy-header.editTemplates",
      async () => executeEditTemplates()
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

// -----------------------------------------------------------------------------
async function executeNewTemplate(): Promise<void> {
  const config = getConfig();
  const templateName = (await vscode.window.showInputBox({
    prompt: "Template name",
    placeHolder: "ASCII Galaxy",
    ignoreFocusOut: true,
    validateInput: (value) => value.trim().length === 0 ? "Template name is required." : undefined,
  }))?.trim();

  if (!templateName) {
    return;
  }

  const templateRoot = getDefaultUserTemplateRoot();
  const templatePath = resolveUniqueTemplatePath(
    templateName,
    config,
    templateRoot,
    (candidatePath) => fs.existsSync(candidatePath)
  );

  const sourceTemplatePath = getEditableTemplateCandidates(config)[0]?.path;
  const sourceContents = tryReadTextFile(sourceTemplatePath);
  const contents = buildNewTemplateContent(config, sourceContents);

  fs.mkdirSync(path.dirname(templatePath), { recursive: true });
  fs.writeFileSync(templatePath, `${contents}\n`, "utf8");

  const updatedTemplates = buildUpdatedTemplateList(config, {
    name: templateName,
    path: templatePath,
  });

  await vscode.workspace
    .getConfiguration(CONFIG_SECTION)
    .update("templates", updatedTemplates, vscode.ConfigurationTarget.Global);

  await openTemplateFile(templatePath);
}

// -----------------------------------------------------------------------------
async function executeEditTemplates(): Promise<void> {
  const config = getConfig();
  const candidates = getEditableTemplateCandidates(config);

  if (candidates.length === 0) {
    await vscode.commands.executeCommand("workbench.action.openSettingsJson");
    showError("Saturno FancyHeader: configure templateFile or templates before editing templates.");
    return;
  }

  let selected = candidates[0];

  if (candidates.length > 1) {
    const picked = await vscode.window.showQuickPick(
      candidates.map((template) => ({
        label: template.name,
        description: template.path,
        template,
      })),
      {
        placeHolder: "Select a Saturno FancyHeader template to edit",
        ignoreFocusOut: true,
      }
    );

    if (!picked) {
      return;
    }

    selected = picked.template;
  }

  await openTemplateFile(selected.path);
}

// -----------------------------------------------------------------------------
async function openTemplateFile(templatePath: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(templatePath));
  await vscode.window.showTextDocument(document, { preview: false });
}

// -----------------------------------------------------------------------------
function tryReadTextFile(filePath: string | undefined): string | null {
  if (!filePath) {
    return null;
  }

  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}
