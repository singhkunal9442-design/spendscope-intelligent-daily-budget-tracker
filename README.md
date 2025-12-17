# SpendScope - Intelligent Daily Budget Tracker
<p align="center">
  <a href="https://workers.cloudflare.com/" target="_blank">
    <img src="https://img.shields.io/badge/Built%20with-Cloudflare%20Workers-F38020?logo=cloudflare" alt="Built with Cloudflare Workers">
  </a>
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/UI-React-61DAFB?logo=react" alt="UI with React">
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript" alt="Language: TypeScript">
  </a>
   <a href="https://hono.dev/" target="_blank">
    <img src="https://img.shields.io/badge/API-Hono-E36002?logo=hono" alt="API with Hono">
  </a>
</p>
**SpendScope is a visually stunning, mobile-first daily budgeting application designed to give users immediate clarity on their financial health for the day.** Unlike traditional budgeting apps focused on monthly trends, SpendScope answers the critical question: *"How much can I spend on coffee, lunch, or groceries right now without breaking my budget?"*
Customizable "Scopes" (Categories) let users set daily spending limits. The dashboard features elegant, gauge-like visualizations that fill as expenses are logged, shifting from a calming green (safe) to cautionary amber and critical red (over budget).
## Live Demo
[A live demo will be available here upon deployment.]
## Features
The application is production-ready and exceeds all initial blueprint requirements.
- **Smart Dashboard**: Glassmorphic cards for each category showing real-time remaining balance, spent amount, and animated progress bars for both daily and monthly views.
- **Monthly Overview**: An aggregate card showing total monthly budget, salary, starting balance, bills due, and net remaining funds with a 30-day spending sparkline.
- **Quick-Add Transaction Drawer**: A gesture-driven bottom sheet (mobile) or modal (desktop) for instant expense logging with category icons.
- **Category Management**: A dedicated settings page to add, edit, and delete spending categories, including name, daily/monthly limits, icon, and color.
- **Fixed Bill Management**: A settings section to manage recurring monthly bills, including name, amount, and a paid/unpaid toggle.
- **Salary/Income Management**: Set your monthly salary to get a more accurate financial overview.
- **Multi-Currency Support**: Select from 9 major currencies (USD, EUR, GBP, etc.) for all financial displays.
- **Transaction History**: A chronological feed of all transactions, grouped by day, with a 30-day spending chart.
- **Data Export**: Export all transaction data to CSV.
- **First-Time Onboarding**: A welcome modal to set initial balance and salary.
- **Visual Analytics**: Sparklines and mini-charts for spending velocity.
- **Responsive Design**: Flawless mobile-first UI with intuitive navigation.
- **Persistent Storage**: Cloudflare Durable Objects for atomic, real-time data sync.
- **Optimistic UI**: State updates are applied instantly on the client for a snappy user experience, with background synchronization to the server.
- **Loading Skeletons**: Smooth, shimmering placeholders provide an elegant loading experience.
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
### Backend
- **Hono** for API routing
- **Cloudflare Workers** with **Durable Objects** for stateful persistence
- **IndexedEntity** pattern for efficient CRUD with indexes
### Tools
- **Vite** for fast development/build
- **Bun** for package management/scripts
- **Cloudflare Pages/Workers** for deployment
## Quick Start
1.  **Clone & Install**:
    ```bash
    git clone <repository-url>
    cd spendscope
    bun install
    ```
2.  **Development Server**:
    ```bash
    bun dev
    ```
    Open [http://localhost:3000](http://localhost:3000)
3.  **Build for Production**:
    ```bash
    bun build
    ```
## Usage
- **Dashboard** (`/`): View category cards with remaining budgets and progress.
- **Add Expense**: Click the FAB (+) to open the drawer, select category, enter amount.
- **Settings** (`/settings`): Manage categories, bills, and salary.
- **History** (`/history`): View transaction feed and export data.
All interactions use optimistic UI updates with real-time sync via Zustand + API.
## Performance & Advanced Concepts
### Performance
The application is designed to be lightning-fast, achieving a consistent 60fps experience through several key strategies:
- **Optimistic UI**: When you add a transaction or update a category, the change appears instantly. The app sends the request to the server in the background. If the server request fails, the change is reverted, and a notification is shown.
- **Performant State Management**: Zustand is used for state management. We strictly follow best practices by selecting primitive state slices, which prevents unnecessary re-renders even with large datasets.
- **Memoized Selectors**: Expensive calculations (like daily/monthly totals) are derived from state and memoized with `useMemo` to ensure they only re-run when their dependencies change.
### Daily Resets
The "daily limit" is enforced on the client-side using `date-fns`. The application filters transactions to only include those from the current day (`isToday()`). There is no cron job; the view simply recalculates every time you open the app.
### Orphaned Transactions
If you delete a category, any transactions associated with it are not deleted. In the History view, they will appear as "Uncategorized." This is by design to ensure your financial records remain complete.
## Deployment
Deploy to Cloudflare Pages (frontend) + Workers (backend) in one command:
```bash
bun deploy
```
This builds the frontend, bundles the Worker, and deploys via Wrangler.
## Architecture
```
Frontend (React/Zustand) ↔ API (Hono) ↔ Entities/Index ↔ Durable Object (GlobalDurableObject)
```
- **Single DO**: All entities share one DO instance via namespacing.
- **Atomic Updates**: CAS (Compare-And-Swap) for concurrency.
- **Indexes**: Prefix-based for efficient listing/pagination.
## Contributing
1.  Fork & PR.
2.  Use `bun install` for deps.
3.  Follow UI non-negotiables and zero-tolerance rules (no render loops).
4.  Lint: `bun lint`.
## License
MIT.