# AGENTS.md — Backstage GitLab Plugin

This file provides authoritative guidance for AI agents working on this repository. Read it fully before making any changes.

---

## Project Overview

This is a **standalone Backstage plugin monorepo** providing GitLab integration for [Backstage](https://backstage.io). It is published to npm as two separate packages:

| Package                   | npm name                                           | Role               |
| ------------------------- | -------------------------------------------------- | ------------------ |
| `packages/gitlab`         | `@immobiliarelabs/backstage-plugin-gitlab`         | Frontend plugin    |
| `packages/gitlab-backend` | `@immobiliarelabs/backstage-plugin-gitlab-backend` | Backend plugin     |
| `packages/dev-sandbox`    | _(private, not published)_                         | Local dev/test app |

**This is NOT a Backstage app** — it is a plugin that gets installed into other people's Backstage apps. Never use `backstage-cli versions:bump`; bump dependencies manually.

- **License**: Apache 2.0
- **Current version**: 6.13.0 (both packages versioned in sync)
- **Backstage compatibility**: Tracks the latest stable Backstage release (`backstage.json`)
- **Package manager**: Yarn 4 (Berry) with `node-modules` linker — use `yarn`, not `npm`

---

## Repository Structure

```
.
├── packages/
│   ├── gitlab/                  # Frontend plugin
│   │   ├── src/
│   │   │   ├── index.ts         # Classic frontend system exports (PRIMARY)
│   │   │   ├── plugin.ts        # Plugin definition + component extensions
│   │   │   ├── routes.ts        # Route reference
│   │   │   ├── translation.ts   # i18n messages
│   │   │   ├── api/             # GitlabCIApi interface + GitlabCIClient implementation
│   │   │   ├── components/      # React components and widgets
│   │   │   │   ├── GitlabCI/    # Main content page (grid layout)
│   │   │   │   ├── gitlabAppData.tsx  # Entity annotation hooks
│   │   │   │   └── widgets/     # Individual cards and tables
│   │   │   └── alpha/           # New frontend system (EXPERIMENTAL)
│   │   │       ├── index.ts     # New system default export
│   │   │       ├── plugin.ts    # createFrontendPlugin definition
│   │   │       ├── extensions.tsx  # EntityContentBlueprint, ApiBlueprint
│   │   │       └── cards.tsx    # EntityCardBlueprint definitions
│   │   ├── config.d.ts          # Frontend config schema
│   │   └── package.json
│   ├── gitlab-backend/          # Backend plugin
│   │   ├── src/
│   │   │   ├── index.ts         # Public exports
│   │   │   ├── plugin.ts        # Backend plugin + catalog module
│   │   │   ├── annotations.ts   # Entity annotation constants
│   │   │   ├── processor/       # GitlabFillerProcessor (catalog)
│   │   │   └── service/         # Express router (API proxy)
│   │   ├── config.d.ts          # Backend config schema
│   │   └── package.json
│   └── dev-sandbox/             # Local dev app (private, not published)
│       └── src/App.tsx          # Uses new frontend system (createApp from @backstage/frontend-defaults)
├── .github/workflows/           # CI/CD pipelines
├── .eslintrc                    # ESLint config (root:true — important for worktrees)
├── .prettierrc                  # Prettier config
├── tsconfig.json                # Root TypeScript config (covers all packages)
├── backstage.json               # Backstage version compatibility marker
├── commitlint.config.cjs        # Conventional commits enforcement
├── lint-staged.config.cjs       # Pre-commit hook runners
└── .releaserc.json              # Semantic release config
```

---

## Essential Commands

All commands must be run from the **repository root** unless noted otherwise.

### Development

```bash
yarn start          # Start dev-sandbox app (new frontend system)
```

### Build

```bash
yarn build          # tsc (type declarations) + backstage-cli repo build --all
```

The build runs `tsc` first (generates `dist-types/`), then `backstage-cli repo build` for each workspace package.

### Type Checking

```bash
yarn type           # tsc --noEmit (validates all packages via root tsconfig.json)
```

The root `tsconfig.json` includes `packages/*/src` and `packages/*/dev`. Type errors in any package fail this check.

### Testing

```bash
yarn test           # Runs lerna run test:ci across all packages (no watch)
```

Per-package (from the package directory):

```bash
yarn test           # backstage-cli package test (watch mode)
yarn test:ci        # backstage-cli package test --watch false
```

Tests use Jest configured by `@backstage/cli`. There are 5 test suites total:

- `packages/gitlab/src/api/GitlabCIClient.test.ts`
- `packages/gitlab/src/plugin.test.ts`
- `packages/gitlab-backend/src/plugin.test.ts`
- `packages/gitlab-backend/src/processor/processor.test.ts`
- `packages/gitlab-backend/src/service/router.test.ts`

### Linting & Formatting

```bash
yarn style:lint       # eslint packages --ext .ts
yarn style:lint-fix   # eslint packages --ext .ts --fix
yarn style:prettier   # prettier "packages/**/*.ts" --write
```

### Pre-commit Hook

Husky runs `lint-staged` on every commit. The `lint-staged.config.cjs` runs:

1. `prettier --write` on all staged files
2. `npm run style:lint` + `npm run style:prettier` on `.ts` files
3. `tsc -p tsconfig.json --noEmit` (full type check) on `.ts` files

**Important**: The pre-commit hook runs the full type check — a TypeScript error anywhere in the repo will block commits.

### Publishing

Publishing is automated via semantic release. Do not publish manually.

```bash
yarn version:release     # Conventional version bump for main branch
yarn version:prerelease  # Prerelease bump (other branches)
yarn publish:ci          # Lerna publish from-package (CI only)
```

---

## Architecture

### Dual Frontend System Support

The frontend plugin supports **two Backstage frontend systems simultaneously**:

| System                   | Entry point          | API style                                  |
| ------------------------ | -------------------- | ------------------------------------------ |
| Classic (old)            | `src/index.ts`       | `createPlugin`, `createComponentExtension` |
| New (alpha/experimental) | `src/alpha/index.ts` | `createFrontendPlugin`, blueprints         |

**Both must remain working.** Do not remove the classic system.

In `package.json` exports:

```json
{
    ".": "./src/index.ts",
    "./alpha": "./src/alpha/index.ts"
}
```

**New frontend system pattern** (`src/alpha/`): Components from the classic system are wrapped using `compatWrapper` from `@backstage/core-compat-api`:

```tsx
import { compatWrapper } from '@backstage/core-compat-api';

export const gitlabCard = EntityCardBlueprint.make({
    name: 'my-card',
    params: {
        loader: async () =>
            import('../components/widgets/MyCard').then((m) =>
                compatWrapper(<m.MyCard />)
            ),
    },
});
```

Never remove `compatWrapper` calls — they bridge the theming and API contexts between the two systems.

### Frontend API Client

`GitlabCIClient` (`src/api/GitlabCIClient.ts`) implements `GitlabCIApi`:

- Communicates with the backend proxy (via `discoveryApi`)
- Supports **multi-GitLab instance** (reads `gitlab.com/instance` annotation)
- Built-in **localStorage caching** (default TTL: 300s, configurable)
- Two auth modes: **token-based** (default) or **OAuth/OIDC** (`gitlab.useOAuth: true`)
- REST API calls go through `/api/gitlab/rest/{host}/...`
- GraphQL calls go through `/api/gitlab/graphql/{host}`

### Backend Plugin

Two exports from `packages/gitlab-backend`:

**`gitlabPlugin`** — HTTP router plugin:

- Mounts at `/api/gitlab`
- Proxies `/rest/{host}/*` → GitLab REST API
- Proxies `/graphql/{host}` → GitLab GraphQL API
- Strips `Authorization` headers; forwards `gitlab-authorization` as `Authorization`
- Blocks GraphQL mutations (read-only proxy)
- SSL verification configurable via `gitlab.proxySecure`

**`catalogPluginGitlabFillerProcessorModule`** — Catalog processor module:

- Auto-fills `gitlab.com/project-slug` annotation from entity location URL
- Only processes entity kinds in `gitlab.allowedKinds` (default: `['Component']`)
- Registered as a Backstage backend module for the `catalog` plugin

### Entity Annotations

Defined in `packages/gitlab-backend/src/annotations.ts`:

| Annotation                | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `gitlab.com/project-slug` | GitLab project path (e.g. `group/subgroup/project`) |
| `gitlab.com/project-id`   | GitLab numeric project ID                           |
| `gitlab.com/instance`     | GitLab instance hostname (for multi-instance)       |

Frontend hooks for reading these are in `src/components/gitlabAppData.tsx`.

---

## Configuration Schema

### Frontend config (`packages/gitlab/config.d.ts`)

```yaml
gitlab:
    defaultCodeOwnersPath: 'CODEOWNERS' # default
    defaultReadmePath: 'README.md' # default
    useOAuth: false # enable OAuth/OIDC auth
    cache:
        enabled: false
        ttl: 300 # seconds
```

### Backend config (`packages/gitlab-backend/config.d.ts`)

```yaml
gitlab:
    allowedKinds: # catalog kinds to auto-annotate
        - Component
    proxySecure: true # verify SSL certificates
    useOAuth: false # OAuth mode
```

---

## Technology Stack

| Tool        | Version                             | Notes                                                         |
| ----------- | ----------------------------------- | ------------------------------------------------------------- |
| Node.js     | >=24.0.0 (pinned 24.14.1 via Volta) | See `engines` and `volta` in root `package.json`              |
| Yarn        | 4.3.1 (Berry)                       | `node-modules` linker — not PnP                               |
| TypeScript  | ~5.7.0                              | Strict mode; `noUnusedLocals`, `noUnusedParameters` enforced  |
| React       | ^18 (peer dep)                      |                                                               |
| Material UI | v4 (`@material-ui/core` ^4.12.2)    | **Backstage itself uses MUI v4** — see important note below   |
| Backstage   | tracks `backstage.json` version     |                                                               |
| Jest        | via `@backstage/cli`                | Config injected by CLI; `jest` must be explicit devDep        |
| MSW         | see per-package                     | Backend tests use MSW; check the specific version per package |
| Express     | ^4.x                                | Backend router                                                |

### ⚠️ Material UI Version — Critical Note

The plugin uses **`@material-ui/*` (MUI v4)**, which matches what Backstage's own components (`@backstage/core-components`) use. As of Backstage 1.48, Backstage has **not yet migrated to `@mui/*` (MUI v5)**. Migrating this plugin's components to `@mui/*` while Backstage is still on v4 would break theme integration — the Backstage theme context would not reach the plugin's components.

Do **not** replace `@material-ui/*` imports with `@mui/*` until Backstage itself ships its MUI v5 migration.

The only MUI v5 package in use is `@mui/x-charts` (charts component) — this is intentional since no compatible MUI v4 chart library exists. MUI v4 and v5 can technically coexist in separate React subtrees.

---

## Code Conventions

### TypeScript

- **Strict mode** is on. All flags (`strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, etc.) are enforced.
- Do not suppress errors with `// @ts-ignore` without adding a `// @ts-ignore` comment explaining why (lint rule: `@typescript-eslint/ban-ts-comment` is `warn`).
- `@typescript-eslint/no-non-null-assertion` is off — non-null assertions (`!`) are allowed but discourage them in new code.

### Prettier

Config (`.prettierrc`):

- 4-space tab width
- Single quotes
- Trailing commas (`es5`)
- End of line: `auto`

Always run `prettier --write` before committing. The pre-commit hook enforces this.

### Commit Messages

Conventional Commits are **enforced** by `commitlint`. Format:

```
<type>(<scope>): <subject>
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `style`, `perf`, `build`, `revert`

Breaking changes: add `!` after type or `BREAKING CHANGE:` footer.

Examples:

```
feat(frontend): add coverage card to alpha system
fix(backend): resolve SSL verification bypass
chore(deps): bump @backstage/core-components to 0.18.0
```

### Pull Requests

Use the PR template (`.github/pull_request_template.md`). Link related issues. CI runs type check, format check, build, and tests — all must pass.

---

## Testing Guide

### Frontend Tests

Use `@testing-library/react` and `@backstage/test-utils`. Tests use `renderInTestApp` or `renderWithEffects` from Backstage test utils.

```tsx
import { renderInTestApp } from '@backstage/test-utils';
```

### Backend Tests

Use `@backstage/backend-test-utils` and MSW for HTTP mocking. **Check which MSW version a file uses before editing:**

- MSW v1 syntax: `rest.get(...)`, `res(ctx.json(...))`
- MSW v2 syntax: `http.get(...)`, `HttpResponse.json(...)`

Do not mix MSW v1 and v2 syntax in the same file.

When testing HTTP routes, MSW v2 does not support the `TRACE` method — remove it from any method arrays if present.

### Running a Single Test File

```bash
# From a package directory:
yarn test --testPathPattern="router.test"

# Or from root:
yarn workspace @immobiliarelabs/backstage-plugin-gitlab-backend test --testPathPattern="router.test"
```

---

## CI/CD Overview

| Workflow               | Trigger         | Actions                                                |
| ---------------------- | --------------- | ------------------------------------------------------ |
| `merge.yml`            | Pull request    | Runs `test.yml`                                        |
| `test.yml`             | `workflow_call` | Conventional commits, type check, format, build, tests |
| `release.yml`          | Manual          | Build → version bump → publish to npm → GitHub release |
| `backmerge.yml`        | Push to `main`  | Auto-merges `main` → `next`                            |
| `merge-dependabot.yml` | Dependabot PR   | Auto-merges patch bumps                                |
| `stale.yml`            | Schedule        | Closes stale issues (30d) / PRs (45d)                  |

CI uses **Node 24.x** (GitHub Actions `actions/setup-node`). Update `test.yml` when the Node version changes.

---

## Dependency Management

### Upgrading Backstage Packages

1. Update the version in `backstage.json`
2. Manually bump all `@backstage/*` dependencies in each `packages/*/package.json`
3. Do **not** use `backstage-cli versions:bump` — this tool targets full Backstage apps, not standalone plugins
4. Run `yarn install`, then verify with `yarn type`, `yarn build`, `yarn test`

### Adding Dependencies

- **Runtime deps**: go in `dependencies` of the specific package
- **Dev/test deps**: go in `devDependencies`
- **Peer deps**: React and react-router go in `peerDependencies` + `devDependencies` (for local dev)
- `@backstage/cli` must always appear in `devDependencies` of every publishable package

### Pinned Versions to Watch

| Package                             | Reason                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| `@material-ui/lab`                  | Pinned to exact `4.0.0-alpha.61` (no caret) — do not change |
| `@mui/x-charts`                     | Only MUI v5 package; coexists with v4                       |
| `react-router` / `react-router-dom` | Must match Backstage's peer dep version range               |

---

## Working in Worktrees

This repository may be worked on inside a git worktree. The `.eslintrc` has `"root": true` — this is intentional and prevents ESLint from traversing up into the parent repository's config, which would cause duplicate plugin conflicts.

Do not remove `"root": true` from `.eslintrc`.

---

## Known Gotchas

1. **`catalogProcessingExtensionPoint` import path**: In older Backstage versions this was at `@backstage/plugin-catalog-node/alpha`. After Backstage graduated it to stable, it moved to `@backstage/plugin-catalog-node` (no `/alpha`). Check the installed version when this import fails.

2. **`jest` must be an explicit devDependency**: `@backstage/cli` ≥0.36.0 requires `jest` to be listed explicitly in each package's `devDependencies`. Do not rely on transitive resolution.

3. **`SignInPageBlueprint`**: In Backstage ≥1.48, this moved from `@backstage/frontend-plugin-api` to `@backstage/plugin-app-react`. Import it from there in `dev-sandbox/src/App.tsx`.

4. **`makeStyles` type compatibility**: `theme.typography.fontWeightMedium` returns `FontWeight | undefined`, which MUI v4's JSS type system does not accept directly as `fontWeight`. Use a numeric literal (e.g. `500`) or cast with `as number`.

5. **`@backstage/cli` and `@backstage/cli-defaults`**: The root package needs `@backstage/cli-defaults` as a devDependency to suppress a CLI warning about missing defaults configuration.

6. **Dev sandbox uses new frontend system**: `packages/dev-sandbox` uses `createApp` from `@backstage/frontend-defaults` (new system), not `createApp` from `@backstage/core-app-api` (classic). Do not confuse the two.

7. **Volta pins per-package**: Each package has its own `volta` field. The root volta pin takes precedence for repo-wide tooling.

8. **`lint-staged` calls `npm run`**: The `lint-staged.config.cjs` uses `npm run style:lint` (not `yarn`). This is intentional and works correctly even with Yarn 4.
