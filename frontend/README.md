# Finexus frontend

React 19 + TypeScript + Vite, styled with Tailwind CSS 4, state in Zustand, forms with react-hook-form + zod. See the [main README](../README.md) for the whole system.

## Scripts

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Dev server on http://localhost:5173. API calls are forwarded to the gateway on :8088 |
| `npm run build` | Type-check and build to `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Lint (oxlint) |

## Settings (`.env`, copy from `.env.example`)

| Variable | Purpose |
| :--- | :--- |
| `VITE_API_BASE_URL` | Gateway address for production builds. Leave empty in development |
| `VITE_USE_MOCK_DATA` | `true` = demo mode with built-in sample data, no backend needed. Sign in with `demo@finexus.com` / `password123` |

## Where things are

```
src/
  pages/public/    Landing, Login, Register
  pages/app/       Dashboard, Deposit, Transfer, Transactions, Profile
  components/      layout (shell, sidebar, navbar) and ui (Button, Modal, Input, ...)
  hooks/           useAuth, useAccounts, useTransactions, useDialog (pop-up keyboard behaviour)
  services/        one file per backend service; mock/ holds demo-mode data and rules
  store/           Zustand stores (auth, accounts, transactions, UI)
  utils/           formatting and transaction helpers
```

## Conventions

- Colours come from the CSS variables in `src/index.css`. Dark mode is the `.dark` class on `<html>`.
- Money is shown in ₹ with `formatCurrency`; dates use `en-IN`.
- The backend stores withdrawals and outgoing transfers as negative amounts. Use `isCredit`, `txCategory` and `absAmount` from `utils` rather than reading the sign yourself.
- Use `ButtonLink` for links styled as buttons (never `<Link><Button/></Link>`), and `Modal`/`Drawer` for pop-ups (they handle focus and Escape).
