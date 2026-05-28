# CI/CD

## Repo Contract

- `Saturno.CICD/test.ps1`
- `Saturno.CICD/build.ps1`
- `Saturno.CICD/package.ps1`

## GitHub Actions

- `.github/workflows/quality-gate.yml`
- `.github/workflows/release.yml`
- `.github/actions/setup/action.yml`

## Expectations

- Local npm commands and shared wrapper commands must stay aligned
- Build output should stage under `__BUILD/`
- Package output should stage under `__DIST/`
