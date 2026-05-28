# Lessons

- Keep generated output clean between compile/package runs; stale `out/` content can leak old runtime files into the VSIX.
- When a shared submodule checkout is not yet in sync with a consuming repo, prefer a stable local adapter over depending on uncommitted submodule state.
