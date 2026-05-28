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
- Unit-test editable template file loading and path resolution
- Unit-test template management helpers for file names, directories, and template-list updates
- Keep tests deterministic and avoid VS Code integration flakiness unless a future bug requires it
