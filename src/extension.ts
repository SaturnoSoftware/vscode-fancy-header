import * as vscode from "vscode";
import { getActiveEditor, getActiveFilePath, showError } from "../libs/Saturno.VSCodeKit/src/EditorUtils";
import { getCommentSyntaxForEditor } from "./commentSyntax";
import { DEFAULT_CONFIG, HeaderConfig, normalizeConfig, buildHeader } from "./formatting";
import { resolveTemplateData } from "./runtime";

const CONFIG_SECTION = "saturno-fancy-header";

// -----------------------------------------------------------------------------
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "saturno-fancy-header.addHeader",
      () => executeAddHeader()
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
    authorName: cfg.get<string>("authorName", DEFAULT_CONFIG.authorName),
    authorEmail: cfg.get<string>("authorEmail", DEFAULT_CONFIG.authorEmail),
  });
}

// -----------------------------------------------------------------------------
function executeAddHeader(): void {
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
  const templateData = resolveTemplateData(filePath, config);
  const header = buildHeader(syntax, templateData, config);

  editor.edit((editBuilder) => {
    editBuilder.insert(new vscode.Position(0, 0), header);
  });
}
