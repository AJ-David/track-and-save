# Track & Save (T&S) — Smart Income, Expense & Budget Tracker

**Track & Save (T&S)** is a responsive, modern personal finance web application built to help users take total control of their financial life: real-time income and expense tracking, intelligent monthly budget allocation with overspend alerts, goal-oriented savings milestones, interactive cashflow analytics, multi-currency support, and bank-grade PostgreSQL security.

---

## 🌟 Complete Feature Matrix (Phases 1–5 Completed)

| Feature Module | Capabilities |
| :--- | :--- |
| **Financial Dashboard** | Real-time Net Balance, Total Income, Total Expenses, and Net Savings KPI cards with period filtering ("This Week", "This Month", "Last Month", "Last 3 Months", "This Year"). 6-month Area chart, category donut breakdown, recent transaction ledger, and budget progress. |
| **Transaction Management** | Live searchable, filterable, and sortable ledger. Filter by Type (Income/Expense), Category, Payment Method, and search by description/amount. Pagination (8 items/page) with full Add, Edit, and Delete modals. |
| **Categorical Budgets** | Monthly budget planner with category limits, real-time spent calculation, remaining allowance, and dynamic health badges (**On Track** `<85%`, **Near Limit** `85–99%`, **Over Budget** `≥100%`). |
| **Savings Goals** | Milestone goal cards with target deadlines, progress bars, deposit modal ("+ Add Funds"), and contribution ledger tracking. |
| **Interactive Analytics** | Date range filtering ("Last 30 Days (Weekly)", "Last 3 Months", "Last 6 Months", "This Year", "All Time"). Cashflow bar charts, net margin curves, category distribution bars, and financial KPIs (Savings Rate %, Top Category, Average Expense). |
| **CSV Data Export** | Client-side CSV generator allowing users to export filtered transactions with timestamped filenames for Excel, Google Sheets, or tax filing. |
| **Multi-Currency System** | Default currency set to Nigerian Naira (**NGN ₦**), with instant runtime toggle between **USD ($)**, **EUR (€)**, and **GBP (£)** across all cards, charts, and calculations. |
| **Authentication & RLS** | Supabase Auth (Email & Password, Sign Up, Login, Password Reset, Profile Name Updates). Bank-grade Row-Level Security (RLS) guaranteeing user data isolation. |
| **Zero-Setup Demo Mode** | Instant 1-click test mode with persistent `localStorage` mock stores—test all features immediately with or without a live Supabase backend. |
| **Resilience & Feedback** | Global React `ErrorBoundary` with reload and home recovery buttons. Non-blocking floating `ToastNotification` system for all CRUD and export operations. |
| **Production Ready** | Tailored code-splitting (`vendor-react`, `vendor-charts`, `vendor-supabase`, `vendor-icons`), SPA rewrites for Vercel and Netlify (`_redirects`, `vercel.json`), zero chunk warnings. |

---

## 🏛️ Architecture & Tech Stack

- **Frontend Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 with dark navy/charcoal sidebar (`#1a1f2e` gradient) and emerald green accents (`#10b981`)
- **Data Visualizations**: Recharts (ResponsiveContainer, AreaChart, BarChart, Tooltips)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7 (SPA with protected routes and 404 handler)
- **Backend / Database**: Supabase (PostgreSQL 15, Supabase Auth, Row-Level Security)
- **Client Storage**: `localStorage` fallbacks with real-time state synchronization

---

## 📁 Project Structure

```
spendwise/
├── public/
│   ├── favicon.svg                   # Brand favicon
│   ├── icons.svg                     # Vector assets
│   └── _redirects                    # Netlify & Cloudflare SPA rewrite rule
├── src/
│   ├── assets/                       # Static images & hero graphics
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx    # Route guard redirecting to /login
│   │   ├── budgets/
│   │   │   ├── BudgetModal.jsx       # Add & edit budget limits
│   │   │   └── DeleteBudgetModal.jsx # Confirmation dialog
│   │   ├── dashboard/
│   │   │   ├── BudgetOverview.jsx    # Dashboard budget preview widget
│   │   │   ├── CategoryBreakdown.jsx # SVG categorical donut breakdown
│   │   │   ├── IncomeExpenseChart.jsx# 6-month area chart
│   │   │   ├── RecentTransactions.jsx# Latest 5 transactions
│   │   │   ├── SavingsOverview.jsx   # Goal progress widget
│   │   │   └── StatCards.jsx         # KPI summary cards
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx         # Persistent sidebar + header container
│   │   │   ├── Header.jsx            # Currency selector, notifications, user avatar
│   │   │   └── Sidebar.jsx           # Dark charcoal navigation drawer
│   │   ├── savings/
│   │   │   ├── ContributionModal.jsx # Add funds / deposit modal
│   │   │   ├── DeleteSavingsGoalModal.jsx
│   │   │   └── SavingsGoalModal.jsx  # Create & edit savings goals
│   │   ├── transactions/
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   └── TransactionModal.jsx  # Income / expense entry form
│   │   └── ui/
│   │       ├── Badge.jsx             # Status and categorical pills
│   │       ├── Button.jsx            # Reusable button with loading states
│   │       ├── Card.jsx              # Rounded container card
│   │       ├── EmptyState.jsx        # Illustrated zero-data states
│   │       ├── ErrorBoundary.jsx     # Global error boundary fallback UI
│   │       ├── ProgressBar.jsx       # Multi-color progress indicators
│   │       ├── Spinner.jsx           # Animated loading spinner
│   │       └── Toast.jsx             # Toast notification component & container
│   ├── contexts/
│   │   ├── AppContext.jsx            # Multi-currency state & mobile sidebar toggle
│   │   ├── AuthContext.jsx           # Supabase auth session & demo session provider
│   │   └── ToastContext.jsx          # Toast dispatch and auto-dismiss hook
│   ├── data/
│   │   └── demoData.js               # Multi-month mock dataset for demo mode
│   ├── hooks/
│   │   ├── useBudgets.js             # Budget spending & threshold calculations
│   │   ├── useSavings.js             # Savings goal progress & deposit tracking
│   │   └── useTransactions.js        # Transaction CRUD & cashflow totals
│   ├── lib/
│   │   ├── constants.js              # Currencies, categories, payment methods
│   │   ├── csvExport.js              # CSV generator & download trigger
│   │   ├── formatters.js             # Currency & date formatters
│   │   ├── supabase.js               # Supabase JS client initializer
│   │   └── utils.js                  # Tailwind class merger & date utilities
│   ├── pages/
│   │   ├── AnalyticsPage.jsx         # Cashflow charts, margins, and CSV export
│   │   ├── BudgetsPage.jsx           # Monthly category budgets & alerts
│   │   ├── DashboardPage.jsx         # Executive financial dashboard
│   │   ├── ForgotPasswordPage.jsx    # Supabase password recovery
│   │   ├── LandingPage.jsx           # Marketing landing page
│   │   ├── LoginPage.jsx             # Sign in & 1-click Demo mode
│   │   ├── NotFoundPage.jsx          # 404 page with return action
│   │   ├── RegisterPage.jsx          # New user registration
│   │   ├── ResetPasswordPage.jsx     # New password form
│   │   ├── SavingsPage.jsx           # Savings targets & deposit tracker
│   │   ├── SettingsPage.jsx          # Currency selection & profile name update
│   │   └── TransactionsPage.jsx      # Filterable & searchable transaction ledger
│   ├── services/
│   │   ├── budgetService.js          # Supabase queries for budgets
│   │   ├── savingsService.js         # Supabase queries for savings & contributions
│   │   └── transactionService.js     # Supabase queries for transactions
│   ├── App.jsx                       # Provider roots & React Router routes
│   ├── index.css                     # Tailwind CSS directives
│   └── main.jsx                      # App entry with ErrorBoundary
├── supabase/
│   └── schema.sql                    # Production PostgreSQL DDL with RLS
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore with protected .env
├── package.json                      # Project dependencies & build scripts
├── vercel.json                       # Vercel SPA routing rewrite
└── vite.config.js                    # Vite bundler with Rolldown chunk splitting
```

---

## 🗄️ Supabase Database Setup

1. **Create a Free Supabase Project**:
   - Navigate to [supabase.com](https://supabase.com) and create a project.
2. **Execute Database Schema**:
   - In your Supabase dashboard, click **SQL Editor**.
   - Copy the entire SQL contents from [`supabase/schema.sql`](./supabase/schema.sql), paste into the editor, and click **Run**.
   - This sets up all 5 tables (`profiles`, `transactions`, `budgets`, `savings_goals`, `savings_contributions`), creates foreign keys with cascade deletion, enables Row-Level Security (RLS) on each table, and creates the automatic profile trigger for new users.
3. **Connect API Keys**:
   - In Supabase, navigate to **Project Settings** > **API**.
   - Copy your **Project URL** and **Publishable/Anon key**.
   - In the `spendwise` folder, create or edit `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
     ```
   - Restart the dev server or rebuild.

---

## 🚀 Deployment Guide

SpendWise is configured for one-click deployment across all major static hosting platforms.

### Option A: Deploy on Vercel

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and import your repository.
3. Set the **Root Directory** to `spendwise` (if in a monorepo or subfolder) or leave default.
4. Framework Preset: **Vite**.
5. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-publishable-key`
6. Click **Deploy**. Vercel will detect `vercel.json` and ensure all SPA client-side routes (`/dashboard`, `/transactions`, etc.) resolve properly without 404 errors.

### Option B: Deploy on Netlify

1. In [Netlify](https://netlify.com), click **Add new site** > **Import an existing project**.
2. Select your GitHub repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. In **Site configuration** > **Environment variables**, set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy Site**. The bundled `public/_redirects` file is copied to `dist/_redirects` automatically during build, ensuring 100% reliable SPA routing.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Production Build
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🔒 Security Best Practices

- **Zero Secret Leakage**: The backend uses Supabase's client-safe anon key. Service role keys are never stored in client code.
- **Strict Row-Level Security (RLS)**: Users can never read, modify, or delete another user's financial records, enforced at the PostgreSQL engine level.
- **Protected Environment Files**: `.env` and `.env.*` are excluded from version control via `.gitignore`.
- **Defensive Error Boundary**: Prevents entire application crashes from uncaught runtime exceptions and provides instant recovery buttons.
