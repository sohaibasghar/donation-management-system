# Donation Management System (DMS)

A web-based application for managing recurring donations, monthly payments, and expenses.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon/Supabase)
- **Deployment**: Vercel

## Architecture

The application follows a clean, layered architecture:

```
UI → Actions → Bloc → Repository → Prisma → DB
```

### Layer Responsibilities

- **UI Layer**: Presentation logic only, uses Tailwind + shadcn
- **Actions Layer**: Server Actions for data mutations, validation
- **Repository Layer**: Database access via Prisma only
- **Prisma Layer**: Database schema and migrations

## Features

### ✅ Implemented

- **Donor Management**
  - Add, edit, delete donors
  - Track donor status (Active/Inactive)
  - View last payment date per donor

- **Monthly Payment Tracking**
  - Auto-generate monthly payment records
  - Mark payments as paid/unpaid
  - View payment status by month
  - Track payment dates

- **Expense Management**
  - Add, edit, delete expenses
  - Categorize expenses
  - View expenses by month

- **Dashboard & Statistics**
  - Monthly donation totals
  - Total expenses
  - Net balance calculation
  - Paid vs Pending donor counts

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon or Supabase recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your `DATABASE_URL` to `.env`

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses Prisma for database management. The schema includes:

- **Donor**: Donor information and monthly amounts
- **MonthlyPayment**: Monthly payment records with status
- **Expense**: Expense records with categories

Run migrations to set up the database:

```bash
npx prisma migrate dev --name init
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── dashboard/    # Dashboard page
│   ├── donors/       # Donors management page
│   ├── payments/     # Payments page
│   └── expenses/     # Expenses page
├── actions/          # Server Actions
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Layout components
│   ├── shared/       # Shared components
│   ├── donor/        # Donor components
│   ├── payment/      # Payment components
│   └── expense/      # Expense components
├── repositories/     # Data access layer
├── lib/              # Utilities and constants
└── types/            # TypeScript types
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to view database

## Future Enhancements

- Authentication and authorization
- Payment gateway integration
- Email/SMS reminders
- PDF/Excel export
- Charts and visualizations
- Multi-organization support

## License

MIT


