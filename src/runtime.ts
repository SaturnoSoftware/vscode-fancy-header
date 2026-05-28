import * as childProcess from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { HeaderConfig, HeaderTemplateData, calculateCopyrightYear, formatDateYYYYMMDD } from "./formatting";

export interface GitUserInfo {
  name: string;
  email: string;
}

// -----------------------------------------------------------------------------
export function getDefaultUserTemplateRoot(
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
  homeDirectory: string = os.homedir()
): string {
  if (platform === "win32") {
    const appData = env.APPDATA ?? path.join(homeDirectory, "AppData", "Roaming");
    return path.join(appData, "Code", "User", "saturno-fancy-header");
  }

  if (platform === "darwin") {
    return path.posix.join(homeDirectory, "Library", "Application Support", "Code", "User", "saturno-fancy-header");
  }

  return path.posix.join(homeDirectory, ".config", "Code", "User", "saturno-fancy-header");
}

// -----------------------------------------------------------------------------
export function resolveTemplateData(filePath: string, config: HeaderConfig): HeaderTemplateData {
  const gitRoot = getGitRoot(filePath);
  const fileDate = resolveFileDate(filePath);
  const gitUser = gitRoot ? getGitUserInfo(gitRoot) : null;
  const author = resolveAuthorInfo(
    config.authorName,
    config.authorEmail,
    gitUser,
    os.userInfo().username
  );

  return {
    fileName: path.basename(filePath),
    projectName: path.basename(gitRoot ?? filePath),
    date: formatDateYYYYMMDD(fileDate),
    copyrightYear: calculateCopyrightYear(fileDate),
    userName: author.name,
    userEmail: author.email,
  };
}

// -----------------------------------------------------------------------------
export function resolveAuthorInfo(
  authorNameOverride: string,
  authorEmailOverride: string,
  gitUser: GitUserInfo | null,
  fallbackUserName: string
): GitUserInfo {
  const name = authorNameOverride.trim() || gitUser?.name?.trim() || fallbackUserName.trim();
  const email = authorEmailOverride.trim() || gitUser?.email?.trim() || "";

  return { name, email };
}

// -----------------------------------------------------------------------------
export function resolveConfiguredTemplateLines(
  currentFilePath: string,
  workspaceFolderPath: string | null,
  config: HeaderConfig
): string[] {
  if (!config.templateFile) {
    return config.templateLines;
  }

  const templatePath = resolveTemplateFilePath(config.templateFile, currentFilePath, workspaceFolderPath);
  let contents: string;

  try {
    contents = fs.readFileSync(templatePath, "utf8");
  } catch (error) {
    throw new Error(`Saturno FancyHeader: failed to read template file "${templatePath}".`);
  }

  const lines = contents
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/);

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  if (lines.length === 0) {
    throw new Error(`Saturno FancyHeader: template file "${templatePath}" is empty.`);
  }

  return lines;
}

// -----------------------------------------------------------------------------
export function resolveTemplateFilePath(
  configuredPath: string,
  currentFilePath: string,
  workspaceFolderPath: string | null
): string {
  let resolved = configuredPath.trim();
  if (!resolved) {
    throw new Error("Saturno FancyHeader: template file path is empty.");
  }

  if (resolved.includes("${workspaceFolder}")) {
    if (!workspaceFolderPath) {
      throw new Error("Saturno FancyHeader: ${workspaceFolder} requires an opened workspace folder.");
    }
    resolved = resolved.replaceAll("${workspaceFolder}", workspaceFolderPath);
  }

  resolved = resolved.replaceAll("${fileDirname}", path.dirname(currentFilePath));

  if (resolved === "~" || resolved.startsWith(`~${path.sep}`) || resolved.startsWith("~/") || resolved.startsWith("~\\")) {
    resolved = path.join(os.homedir(), resolved.slice(1));
  }

  if (!path.isAbsolute(resolved)) {
    resolved = path.join(workspaceFolderPath ?? path.dirname(currentFilePath), resolved);
  }

  return path.resolve(resolved);
}

// -----------------------------------------------------------------------------
function resolveFileDate(filePath: string): Date {
  return getInitialFileDate(filePath) ?? getFileCreationDate(filePath) ?? new Date();
}

// -----------------------------------------------------------------------------
function getGitRoot(filePath: string): string | null {
  return runGit(path.dirname(filePath), ["rev-parse", "--show-toplevel"]);
}

// -----------------------------------------------------------------------------
function getGitUserInfo(gitRoot: string): GitUserInfo | null {
  const name = runGit(gitRoot, ["config", "user.name"]) ?? "";
  const email = runGit(gitRoot, ["config", "user.email"]) ?? "";

  if (!name && !email) {
    return null;
  }

  return { name, email };
}

// -----------------------------------------------------------------------------
function getInitialFileDate(filePath: string): Date | null {
  const output = runGit(path.dirname(filePath), [
    "log",
    "--follow",
    "--format=%ad",
    "--date=format:%Y-%m-%d",
    "--reverse",
    "--",
    filePath,
  ]);

  if (!output) {
    return null;
  }

  const firstLine = output.split(/\r?\n/, 1)[0]?.trim();
  if (!firstLine) {
    return null;
  }

  return parseDate(firstLine);
}

// -----------------------------------------------------------------------------
function getFileCreationDate(filePath: string): Date | null {
  try {
    return fs.statSync(filePath).birthtime;
  } catch (error) {
    console.error(`[Saturno FancyHeader] Failed to read file creation date for "${filePath}".`, error);
    return null;
  }
}

// -----------------------------------------------------------------------------
function runGit(cwd: string, args: string[]): string | null {
  try {
    return childProcess.execFileSync(
      "git",
      ["-C", cwd, ...args],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
function parseDate(text: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    console.error(`[Saturno FancyHeader] Invalid git date "${text}".`);
    return null;
  }

  const parsed = new Date(`${text}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    console.error(`[Saturno FancyHeader] Failed to parse git date "${text}".`);
    return null;
  }

  return parsed;
}
