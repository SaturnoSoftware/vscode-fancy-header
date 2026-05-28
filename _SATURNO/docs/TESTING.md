# Testing

## Required Local Commands

```powershell
git submodule update --init --recursive
npm test
npm run build
npm run package
```

## Current Strategy

- Unit-test pure formatting and configuration normalization
- Unit-test author/date helper behavior
- Keep tests deterministic and avoid VS Code integration flakiness unless a future bug requires it
