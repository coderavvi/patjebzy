# PATJEBZY — Reward Yourself 🏆

A production-ready **Inventory Management System** built with Next.js 14, MongoDB, and NextAuth.js v5.

## Features

- 🔐 **Authentication** — Secure login with JWT sessions (admin & sales rep roles)
- 📊 **Admin Dashboard** — Revenue charts, KPI cards, top products, low stock alerts
- 📦 **Inventory Management** — Full CRUD with search, filter, pagination
- 💰 **Sales Tracking** — Multi-item sales with atomic stock validation
- 👥 **Sales Rep Management** — Create/edit/deactivate team members
- 📈 **Charts** — Revenue trends & top products (Recharts)
- 🎨 **Dark UI** — Premium fintech-style design with glassmorphism

## Tech Stack

| Technology    | Purpose                    |
|---------------|----------------------------|
| Next.js 14    | Framework (App Router)     |
| MongoDB       | Database                   |
| Mongoose      | ODM                        |
| NextAuth v5   | Authentication             |
| Tailwind CSS  | Styling                    |
| Recharts      | Data visualization         |
| SWR           | Data fetching              |
| Zod           | Validation                 |
| Lucide React  | Icons                      |

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `MONGODB_URI` — MongoDB connection string
- `NEXTAUTH_SECRET` — Random secret for JWT (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — Your app URL (default: `http://localhost:3000`)
- `AUTH_SECRET` — Same as NEXTAUTH_SECRET

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- **Admin**: `admin@patjebzy.com` / `Admin@1234`
- **Sales Rep**: `john@patjebzy.com` / `Rep@1234`
- 5 categories, 10 products, 3 sample sales

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── (admin)/admin/     # Admin pages (dashboard, inventory, sales, reps, settings)
│   ├── (auth)/login/      # Login page
│   ├── (dashboard)/       # Sales rep pages (dashboard, inventory, record-sale, my-sales)
│   └── api/               # API routes (products, sales, users, categories, dashboard)
├── components/
│   ├── charts/            # Recharts components
│   ├── layout/            # Sidebar, TopBar
│   ├── shared/            # DataTable, StatCard, PageHeader
│   └── ui/                # shadcn-style primitives (Button, Input, Dialog, etc.)
├── lib/                   # DB connection, auth config, utils, validations
├── models/                # Mongoose models (User, Product, Sale, Category)
├── scripts/               # Database seed script
└── types/                 # TypeScript interfaces
```

## License

Private — © PATJEBZY
