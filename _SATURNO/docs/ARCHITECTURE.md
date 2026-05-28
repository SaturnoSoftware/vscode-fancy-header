# Architecture

## Snapshot

- Runtime: VS Code extension host + TypeScript
- Entry point: `src/extension.ts`
- Pure formatting: `src/formatting.ts`
- Runtime/file metadata: `src/runtime.ts`
- Comment syntax adapter: `src/commentSyntax.ts`
- Shared editor helpers: `libs/Saturno.VSCodeKit/src/EditorUtils.ts`

## Main Flow

1. Command runs from `package.json`
2. Extension resolves the active editor and file path
3. Comment syntax is resolved from VS Code language configuration
4. File/project/date/author metadata is collected
5. Header template lines are resolved from settings or an external template file
6. Header lines are rendered with the active comment syntax
7. Header is inserted at the top of the document

## Boundaries

- **Shared contract:** submodules, wrappers, and editor helper surface
- **Repo-local logic:** placeholder replacement, formatting rules, metadata fallback behavior
