import * as fs from "fs";
import * as path from "path";
import * as JSON5 from "json5";
import * as vscode from "vscode";
import { CommentSyntax } from "./types";

interface LanguageComments {
  lineComment?: string;
  blockComment?: [string, string];
}

// -----------------------------------------------------------------------------
export function getCommentSyntaxForEditor(editor: vscode.TextEditor): CommentSyntax | null {
  return getCommentSyntax(editor.document.languageId);
}

// -----------------------------------------------------------------------------
function getCommentSyntax(languageId: string): CommentSyntax | null {
  const comments = getLanguageComments(languageId);
  if (!comments) {
    return null;
  }

  if (comments.lineComment) {
    const lineComment = comments.lineComment;
    return {
      singleLineStart: lineComment,
      singleLineEnd: "",
      multiLineStart: lineComment,
      multiLineMiddle: lineComment,
      multiLineEnd: lineComment,
    };
  }

  if (comments.blockComment) {
    const [open, close] = comments.blockComment;
    return {
      singleLineStart: open,
      singleLineEnd: close,
      multiLineStart: open,
      multiLineMiddle: open[open.length - 1] ?? open,
      multiLineEnd: close,
    };
  }

  return null;
}

// -----------------------------------------------------------------------------
function getLanguageComments(languageId: string): LanguageComments | null {
  for (const extension of vscode.extensions.all) {
    const contributes = extension.packageJSON?.contributes;
    if (!contributes?.languages) {
      continue;
    }

    const languages: any[] = contributes.languages;
    const languageDefinition = languages.find((entry: any) => entry.id === languageId);

    if (!languageDefinition?.configuration) {
      continue;
    }

    const configPath = path.join(extension.extensionPath, languageDefinition.configuration);
    if (!fs.existsSync(configPath)) {
      continue;
    }

    const config = JSON5.parse(fs.readFileSync(configPath, "utf8"));
    if (config?.comments) {
      return config.comments as LanguageComments;
    }
  }

  return null;
}
