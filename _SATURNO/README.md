---
tags:
  - workspace/saturnosoftware
  - format/markdown
  - scope/project
  - context/ai
  - note/readme
  - doc/readme
aliases:
  - `_SATURNO`
  - README
---

# `_SATURNO` — Saturno FancyHeader

## Navigation

- **Parent:** [_SATURNO_MASTER](../../../_SATURNO_MASTER/README.md)
- **Policy:** [FOCUS-AREAS](../../../_SATURNO_MASTER/docs/FOCUS-AREAS.md)
- **Agent:** [AGENTS](AGENTS.md)
- **Tasks:** [TASKS](docs/TASKS.md)

This is the durable AI/human working set for `Saturno FancyHeader`.

## Read Order

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

## Current Repo Reality

- This repo ships a VS Code extension, not a generic Node library.
- The public extension surface lives in `package.json` command IDs and configuration keys.
- Compiled output lives under `out/`; source of truth stays in `src/` plus the `Saturno.VSCodeKit` submodule contract.
- Repo-owned packaging logic lives in `Scripts/package-vsix.ps1`.
- Shared Saturno wrapper entrypoints live in `Saturno.CICD/*.ps1`.

## Verified Commands

```powershell
git submodule update --init --recursive
npm test
npm run build
npm run package
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\test.ps1 -ProjectRoot .
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\build.ps1 -ProjectRoot . -BuildNumber 0
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\package.ps1 -ProjectRoot . -BuildNumber 0
```

## Saturno Alignment

- This local `_SATURNO/` owns the repo-specific truth for FancyHeader.
- `_SATURNO_MASTER/` owns the portfolio inventory, tooling policy, and cross-repo rules.
- `Saturno.ProjectBuilder`, `Saturno.CICD`, and `Saturno.VSCodeKit` are the relevant shared-tooling siblings for this repo.
- Keep `README.md`, `package.json`, `Scripts/`, workflows, and `_SATURNO/` docs aligned.
