# Codestyle

- Keep `src/extension.ts` thin and command-focused
- Prefer pure functions in `src/formatting.ts` for anything testable without VS Code
- Keep metadata collection explicit; do not hide failures behind broad catches
- Use concise, behavior-focused tests with `node:test`
