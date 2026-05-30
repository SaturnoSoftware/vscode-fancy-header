# Ecosystem

## Shared Dependencies

| Dependency | Role |
| --- | --- |
| `Saturno.VSCodeKit` | Shared VS Code editor helpers and repo-standard library contract |
| `Saturno.CICD` | Shared repo-owned `test` / `build` / `package` wrappers |
| `Saturno.ProjectBuilder` | Higher-level Saturno build/release orchestration |

## Local Ownership

- Header formatting, placeholder handling, and file/git metadata resolution stay local to this repo.
- Shared VS Code helpers should live in `Saturno.VSCodeKit` only when the boundary is clearly reusable.
