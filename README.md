# SpendScope - Intelligent Daily Budget Tracker
<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Production Ready">
</p>
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
## Key Features
The application is production-ready and provides a complete, shared budgeting experience.
- ✅ **Smart Dashboard**: Glassmorphic cards for each category showing real-time remaining balance, spent amount, and animated progress bars for both daily and monthly views.
- ✅ **Monthly Overview**: An aggregate card showing total monthly budget, salary, starting balance, bills due, and net remaining funds with a 30-day spending sparkline.
- ✅ **Quick-Add Transaction Drawer**: A gesture-driven bottom sheet (mobile) or modal (desktop) for instant expense logging with category icons.
- ✅ **Category Management**: A dedicated settings page to add, edit, and delete spending categories, including name, daily/monthly limits, icon, and color.
- ✅ **Fixed Bill Management**: A settings section to manage recurring monthly bills, including name, amount, and a paid/unpaid toggle.
- ✅ **Salary/Income Management**: Set your monthly salary to get a more accurate financial overview.
- ✅ **Multi-Currency Support**: Select from 9 major currencies (USD, EUR, GBP, etc.) for all financial displays.
- ✅ **Transaction History**: A chronological feed of all transactions, grouped by day, with a 30-day spending chart.
- ✅ **Calendar View**: A full-page calendar visualizing daily spending totals with interactive popovers for transaction details.
- ✅ **Data Export**: Export all transaction data to CSV.
- ✅ **Responsive Design**: Flawless mobile-first UI with intuitive navigation.
- ✅ **Persistent Storage**: Cloudflare Durable Objects for atomic, real-time data sync.
- ✅ **Optimistic UI**: State updates are applied instantly on the client for a snappy user experience.
- ✅ **Loading Skeletons**: Smooth, shimmering placeholders provide an elegant loading experience.
## Tech Stack
- **Frontend**: React 18, React Router 6, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Framer Motion, Recharts
- **Backend**: Hono on Cloudflare Workers with Durable Objects
- **Tooling**: Vite, Bun, Wrangler
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
## Performance & Architecture
The application is designed to be lightning-fast, achieving a consistent 60fps experience through several key strategies:
- **Optimistic UI**: When you add a transaction or update a category, the change appears instantly. The app sends the request to the server in the background. If the server request fails, the change is reverted, and a notification is shown.
- **Performant State Management**: Zustand is used for state management. We strictly follow best practices by selecting primitive state slices (`useBudgetStore(s => s.primitive)`), which prevents unnecessary re-renders even with large datasets. Expensive calculations are memoized with `useMemo`.
- **Global Shared Data**: The backend API provides a single, shared data store for all users, seeded with demo data. All changes are persistent and visible to anyone using the application.
- **Client-Side Daily Resets**: The "daily limit" is enforced on the client-side using `date-fns`. The application filters transactions to only include those from the current day. There is no cron job; the view simply recalculates every time you open the app, ensuring accuracy across all timezones.
## Deployment
Deploy to Cloudflare Pages (frontend) + Workers (backend) in one command:
```bash
bun deploy
```
This builds the frontend, bundles the Worker, and deploys via Wrangler.
## Cross-Device Validation
The application has been visually validated across a range of device sizes, from small mobile phones (375px) to large desktops (1920px+), ensuring a pixel-perfect and intuitive experience on all platforms. All interactive elements have appropriate touch targets and respond gracefully to both mouse and touch input.