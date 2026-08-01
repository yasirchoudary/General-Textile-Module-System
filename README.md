# General Textile Module System

ERP shell for the textile / yarn industry. Frontend is Next.js; backend and auth provider are intentionally undecided and isolated behind adapters.

## Monorepo layout

```text
apps/
  web/          Next.js login + dashboard shell
  api/          Backend placeholder (undecided)
packages/
  types/        Shared TypeScript models
  auth-contracts/  AuthProvider interface
  config/       Module / navigation config
  ui/           Shared presentational UI
docs/           PRDs and planning docs
```

## Getting started

```bash
pnpm install
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Demo logins (mock auth)

| Username | Password   | Access                         |
|----------|------------|--------------------------------|
| admin    | admin123   | All modules                    |
| finance  | finance123 | Finance                        |
| store    | store123   | Inventory                      |
| weaving  | weaving123 | Weaving                        |
| hr       | hr123      | HR                             |

## Branching

- Never push directly to `main`
- Work on `feat/*` or `chore/*` branches and merge via Pull Request
