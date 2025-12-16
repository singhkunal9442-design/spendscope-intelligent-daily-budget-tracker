# SpendScope - Intelligent Daily Budget Tracker

[cloudflarebutton]

SpendScope is a visually stunning, mobile-first daily budgeting application designed to give users immediate clarity on their financial health for the day. Unlike traditional budgeting apps focused on monthly trends, SpendScope answers: "How much can I spend on coffee/lunch/groceries right now without breaking my budget?"

Customizable "Scopes" (Categories) let users set daily spending limits. The dashboard features elegant, gauge-like visualizations that fill as expenses are logged, shifting from green (safe) to amber (caution) and red (over budget).

## Features

- **Smart Dashboard**: Glassmorphic cards for each category showing real-time remaining balance, spent amount, and animated progress bars.
- **Quick-Add Transaction Drawer**: Gesture-driven bottom sheet (mobile) or modal (desktop) for instant expense logging with category icons.
- **Daily Reset Logic**: Automatic daily resets of spent counters with full transaction history preserved.
- **Visual Analytics**: Sparklines and mini-charts for spending velocity.
- **Responsive Design**: Flawless mobile-first UI with intuitive navigation.
- **Persistent Storage**: Cloudflare Durable Objects for atomic, real-time data sync.

## Tech Stack

### Frontend
- **React 18** with **React Router 6** for routing
- **TypeScript** for type safety
- **Tailwind CSS 3** + **shadcn/ui** for stunning, accessible UI
- **Zustand** for lightweight state management
- **Framer Motion** for smooth animations
- **React Hook Form** + **Zod** for forms
- **Vaul** for drawers/sheets, **Sonner** for toasts
- **Recharts** for charts, **Lucide React** for icons
- **@tanstack/react-query** for data fetching

### Backend
- **Hono** for API routing
- **Cloudflare Workers** with **Durable Objects** for stateful persistence
- **IndexedEntity** pattern for efficient CRUD with indexes

### Tools
- **Vite** for fast development/build
- **Bun** for package management/scripts
- **Cloudflare Pages/Workers** for deployment

## Quick Start

1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd spendscope
   bun install
   ```

2. **Development Server**:
   ```bash
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **Build for Production**:
   ```bash
   bun build
   ```

## Usage

- **Dashboard** (`/`): View category cards with remaining budgets and progress.
- **Add Expense**: Click the FAB (+) to open the drawer, select category, enter amount.
- **Settings**: Manage categories/limits (future phases).
- **History**: View transaction feed (Phase 4).

All interactions use optimistic UI updates with real-time sync via Zustand + API.

## Development

### Scripts
```bash
bun dev          # Start dev server (Vite + Worker proxy)
bun build        # Build frontend
bun lint         # Lint code
bun preview      # Preview production build
cf-typegen       # Generate Worker types
```

### Project Structure
```
├── src/              # React frontend
│   ├── pages/        # Routes (HomePage.tsx primary)
│   ├── components/ui # shadcn/ui primitives
│   └── hooks/        # Custom hooks
├── worker/           # Hono API + Entities
│   ├── user-routes.ts # Add custom routes here
│   └── entities.ts   # Durable Object entities
├── shared/           # Shared types/mock data
└── vite.config.ts    # Vite + Cloudflare plugin
```

### Adding Routes (Frontend)
Edit `src/main.tsx`:
```tsx
const router = createBrowserRouter([
  { path: "/", element: <HomePage />, errorElement: <RouteErrorBoundary /> },
  { path: "/settings", element: <SettingsPage />, errorElement: <RouteErrorBoundary /> },
]);
```

### Adding API Endpoints (Backend)
Edit `worker/user-routes.ts` using `IndexedEntity` helpers:
```ts
import { BudgetEntity } from './entities';
app.post('/api/budgets', async (c) => {
  // Implementation using Entity.create(c.env, data)
});
```

### Key Patterns
- **Entities**: Extend `IndexedEntity<T>` in `worker/entities.ts`.
- **API Calls**: Use `src/lib/api-client.ts` helper.
- **State**: Zustand store with primitive selectors (avoid object destructuring).
- **UI**: shadcn/ui + Tailwind; follow visual excellence guidelines.

## Deployment

Deploy to Cloudflare Pages (frontend) + Workers (backend) in one command:

```bash
bun deploy
```

This builds the frontend, bundles the Worker, and deploys via Wrangler.

### Manual Deployment
1. **Frontend**: `bun build` → Deploy `dist/` to Cloudflare Pages.
2. **Worker**: `wrangler deploy` (uses `wrangler.jsonc`).

**Bindings**: Single `GlobalDurableObject` (DO NOT modify `wrangler.jsonc`).

[cloudflarebutton]

## Architecture

```
Frontend (React/Zustand) ↔ API (Hono) ↔ Entities/Index ↔ Durable Object (GlobalDurableObject)
```

- **Single DO**: All entities share one DO instance via namespacing.
- **Atomic Updates**: CAS (Compare-And-Swap) for concurrency.
- **Indexes**: Prefix-based for efficient listing/pagination.

## Contributing

1. Fork & PR.
2. Use `bun install` for deps.
3. Follow UI non-negotiables and zero-tolerance rules (no render loops).
4. Lint: `bun lint`.

## License

MIT. See [LICENSE](LICENSE) for details.