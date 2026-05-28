# Saturno FancyHeader

[![VS Code](https://badgen.net/badge/vscode/%5E1.88.0/blue)](https://code.visualstudio.com/)
[![License: GPL-3.0](https://badgen.net/badge/license/GPL--3.0/orange)](./LICENSE.txt)
[![Tests: local suite](https://badgen.net/badge/tests/node%20suite/green)](./tests)

**Insert consistent file headers with one command.** Language-aware, configurable, and packaged with the Saturno VS Code repo contract.

Saturno FancyHeader adds a file header at the top of the current document using the active language comment syntax plus file, project, date, and author metadata.

Maintained by [Saturno.Software](https://saturno.software/).

---

## Quick Start

### Install from VSIX

```bash
code --install-extension saturno-fancy-header-1.1.0.vsix
```

### Use

1. Open a file in VS Code
2. Open Command Palette (`Ctrl+Shift+P`)
3. Run `Saturno: Add Header`

**Default output:**
```text
// ------------------------------------------------------------------------------
//   File      : example.ts
//   Project   : my-project
//   Date      : 2026-05-28
//   Copyright : 2026
//   Copyright : Mateus <mateus@example.com>
// ------------------------------------------------------------------------------
```

---

## Features

- **Language-aware** -- Uses VS Code language configuration to choose the right comment syntax
- **Metadata-driven** -- Inserts file name, project name, date, and author information
- **Configurable** -- Header template lines, border fill character, width, and author overrides
- **Saturno repo contract** -- Build/package/test flow matches other Saturno VS Code extensions

---

## Configuration

All settings are available in VS Code Settings UI under **Saturno FancyHeader**, or in `settings.json`:

```json
{
  "saturno-fancy-header.lineWidth": 80,
  "saturno-fancy-header.fillChar": "-",
  "saturno-fancy-header.authorName": "",
  "saturno-fancy-header.authorEmail": "",
  "saturno-fancy-header.templateLines": [
    "  File      : FILENAME",
    "  Project   : PROJECT",
    "  Date      : DATE",
    "  Copyright : YEAR",
    "  Copyright : USER_NAME <USER_EMAIL>"
  ]
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `lineWidth` | `80` | Total width of generated header lines |
| `fillChar` | `"-"` | Border fill character |
| `authorName` | `""` | Optional author name override |
| `authorEmail` | `""` | Optional author email override |
| `templateLines` | default list | Header body lines with placeholders |

Supported placeholders:

- `FILENAME`
- `PROJECT`
- `DATE`
- `YEAR`
- `USER_NAME`
- `USER_EMAIL`

---

## Local Development

```bash
git submodule update --init --recursive
npm install
npm test
npm run build
npm run package
```

### Saturno CICD Wrappers

```powershell
git submodule update --init --recursive
 
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\test.ps1 -ProjectRoot .
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\build.ps1 -ProjectRoot . -BuildNumber 0
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\package.ps1 -ProjectRoot . -BuildNumber 0
```

---

## Repository Layout

```text
mdheader/
├── src/                    Extension source
├── libs/                   Shared VS Code utilities (Saturno.VSCodeKit)
├── tests/                  Node.js test suite
├── res/                    Extension icon and resources
├── Scripts/                Build and VSIX packaging
├── Saturno.CICD/           Shared CI/CD contract
├── _SATURNO/               Repo-local documentation
├── out/                    Compiled JavaScript (generated)
├── __BUILD/                Staged build output (generated)
└── __DIST/                 Packaged .vsix artifact (generated)
```

---

## License

GPL-3.0 -- See [LICENSE.txt](./LICENSE.txt) for details.
