# SpendScope - Intelligent Daily Budget Tracker
[cloudflarebutton]
SpendScope is a visually stunning, mobile-first daily budgeting application designed to give users immediate clarity on their financial health for the day. Unlike traditional budgeting apps focused on monthly trends, SpendScope answers: "How much can I spend on coffee/lunch/groceries right now without breaking my budget?"
Customizable "Scopes" (Categories) let users set daily spending limits. The dashboard features elegant, gauge-like visualizations that fill as expenses are logged, shifting from green (safe) to amber (caution) and red (over budget).
## Live Demo
[A live demo will be available here upon deployment.]
## Features
- **Smart Dashboard**: Glassmorphic cards for each category showing real-time remaining balance, spent amount, and animated progress bars.
- **Monthly Overview**: An aggregate card showing total monthly budget, amount spent, and remaining funds with a 30-day spending sparkline.
- **Quick-Add Transaction Drawer**: A gesture-driven bottom sheet (mobile) or modal (desktop) for instant expense logging with category icons.
- **Category Management**: A dedicated settings page to add, edit, and delete spending categories, including name, daily limit, icon, and color.
- **Transaction History**: A chronological feed of all transactions, grouped by day, with a 30-day spending chart.
- **Data Export**: Export all transaction data to CSV.
- **Daily Reset Logic**: The UI automatically calculates spending for the current day, effectively resetting the "spent" amount daily.
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
- **Settings** (`/settings`): Manage categories and their daily limits.
- **History** (`/history`): View transaction feed and export data.
All interactions use optimistic UI updates with real-time sync via Zustand + API.
## Advanced Concepts & Troubleshooting
### Optimistic UI
When you add a transaction or update a category, the change appears instantly. This is an "optimistic update." The app sends the request to the server in the background. If the server request fails, the change is reverted, and a notification is shown. This makes the app feel incredibly fast.
### Daily Resets
The "daily limit" is enforced on the client-side using `date-fns`. The application filters transactions to only include those from the current day (`isToday()`). There is no cron job; the view simply recalculates every time you open the app.
### Orphaned Transactions
If you delete a category, any transactions associated with it are not deleted. In the History view, they will appear as "Uncategorized." This is by design to ensure your financial records remain complete.
### Performance
The app uses performant state management practices with Zustand, selecting only the necessary data to prevent unnecessary re-renders. Expensive calculations are memoized within components using `useMemo` to ensure a smooth UI.
## Deployment
Deploy to Cloudflare Pages (frontend) + Workers (backend) in one command:
```bash
bun deploy
```
This builds the frontend, bundles the Worker, and deploys via Wrangler.
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
MIT.