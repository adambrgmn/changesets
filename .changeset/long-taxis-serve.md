---
"@changesets/cli": minor
---

Allow passing custom packages glob with `--packages=<glob>` flag

This flag can be used in projects which are not following the workspace patterns defined by either `yarn`, `bolt`, `lerna` or `pnpm`. An example of that is `nx`.

The flag can be passed to the following commands:

- `changeset add --packages=<glob>`
- `changeset version --packages=<glob>`
- `changeset publish --packages=<glob>`
- `changeset status --packages=<glob>`
