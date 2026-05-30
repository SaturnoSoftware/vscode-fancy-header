---
tags:
  - saturno
  - saturno/ai
  - saturno/repo/saturno-fancyheader
  - saturno/type/product-app
  - saturno/doc/agents
  - saturno/area/agents
aliases:
  - Project Instructions
  - AGENTS
  - Saturno FancyHeader AGENTS
---

# Project Instructions

These notes are the repo-specific working rules for `Saturno FancyHeader`.

## Navigation

- **Parent:** [_SATURNO README](README.md)
- **Master:** [_SATURNO_MASTER](../../../_SATURNO_MASTER/README.md)
- **Policy:** [Master AGENTS](../../../_SATURNO_MASTER/AGENTS.md)
- **Tasks:** [TASKS](docs/TASKS.md)

## First Read For Every Session

1. [_SATURNO/AGENTS.md](AGENTS.md)
2. [_SATURNO/docs/PRODUCT.md](docs/PRODUCT.md)
3. [_SATURNO/docs/RELEASE.md](docs/RELEASE.md)
4. [_SATURNO/docs/ECOSYSTEM.md](docs/ECOSYSTEM.md)
5. [_SATURNO/docs/QUESTIONS.md](docs/QUESTIONS.md)
6. [_SATURNO/docs/TASKS.md](docs/TASKS.md)
7. [_SATURNO/docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
8. [_SATURNO/docs/CODESTYLE.md](docs/CODESTYLE.md)
9. [_SATURNO/docs/TESTING.md](docs/TESTING.md)
10. [_SATURNO/docs/CICD.md](docs/CICD.md)
11. [_SATURNO/lessons.md](lessons.md)

Then inspect the live repo:

- `package.json`
- `src/`
- `tests/`
- `Scripts/build.ps1`
- `Scripts/package-vsix.ps1`
- `Saturno.CICD/`
- `libs/Saturno.VSCodeKit/`

## Repo Reality

- This is a VS Code extension with one command plus configuration defined in `package.json`.
- Backward compatibility of command IDs and configuration keys matters unless a change explicitly updates extension-facing behavior.
- `out/` and packaged `.vsix` artifacts are generated outputs, not the source of truth.
- Build/package behavior is split between repo-owned scripts and shared `Saturno.CICD` wrappers.

## Verified Commands

- `npm test`
- `npm run build`
- `npm run package`
- `pwsh -NoLogo -NoProfile -File ./Saturno.CICD/test.ps1 -ProjectRoot .`
- `pwsh -NoLogo -NoProfile -File ./Saturno.CICD/build.ps1 -ProjectRoot . -BuildNumber 0`
- `pwsh -NoLogo -NoProfile -File ./Saturno.CICD/package.ps1 -ProjectRoot . -BuildNumber 0`

## Working Rules

- Do not change command IDs or configuration keys casually; they are the extension's public surface.
- Prefer deterministic tests around header formatting, placeholder expansion, and config handling.
- Keep the root `README.md`, `package.json`, and `_SATURNO/` docs aligned when commands, settings, or packaging change.
- Preserve the current header template as the default behavior unless a task explicitly changes product behavior.

## Review Priorities

- broken header formatting
- placeholder/config drift
- incorrect comment syntax resolution
- missing VSIX packaging updates
- stale shared-wrapper documentation
