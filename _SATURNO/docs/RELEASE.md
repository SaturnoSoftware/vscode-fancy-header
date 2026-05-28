# Release

## Release Surface

- Build output: `__BUILD/<release-name>/`
- Package output: `__DIST/<release-name>/`
- npm VSIX artifact: `__DIST/*.vsix`
- Saturno.CICD VSIX artifact: `__DIST/**/*.vsix`

## Commands

```powershell
git submodule update --init --recursive
npm run build
npm run package
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\build.ps1 -ProjectRoot . -BuildNumber 0
pwsh -NoLogo -NoProfile -File .\Saturno.CICD\package.ps1 -ProjectRoot . -BuildNumber 0
```

## Notes

- Package metadata comes from `package.json`
- Saturno release metadata comes from `package.json -> saturno.cicd`
- VSIX packaging is owned by `Scripts/package-vsix.ps1`
