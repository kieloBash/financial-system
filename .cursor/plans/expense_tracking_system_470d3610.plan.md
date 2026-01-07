---
name: Expense Tracking System
overview: Build a full-stack expense tracking system with Gmail authentication, expense/category management, quickprice templates, and analytics dashboard using NestJS, Next.js, Prisma, PostgreSQL, Docker, and Supabase.
todos:
  - id: setup-docker
    content: Create Docker Compose configuration with PostgreSQL service and Dockerfiles for server and website
    status: pending
  - id: setup-prisma
    content: Initialize Prisma, create schema with User, Category, Expense, and QuickPrice models, configure database connection
    status: pending
    dependencies:
      - setup-docker
  - id: backend-dependencies
    content: "Install and configure NestJS dependencies: config, JWT, Passport, Prisma, validation packages"
    status: pending
  - id: auth-backend
    content: Implement authentication module with Google OAuth, JWT generation, auth guards, and protected route decorators
    status: pending
    dependencies:
      - backend-dependencies
      - setup-prisma
  - id: categories-backend
    content: Create categories module with CRUD endpoints, user-scoped queries, and validation DTOs
    status: pending
    dependencies:
      - auth-backend
  - id: expenses-backend
    content: Create expenses module with CRUD endpoints, filtering, pagination, and date range queries
    status: pending
    dependencies:
      - auth-backend
      - categories-backend
  - id: quickprices-backend
    content: Create quickprices module with CRUD endpoints and endpoint to create expenses from templates
    status: pending
    dependencies:
      - auth-backend
      - categories-backend
  - id: analytics-backend
    content: Create analytics module with summary, trends, category breakdown, and time period analysis endpoints
    status: pending
    dependencies:
      - expenses-backend
  - id: frontend-dependencies
    content: Install TanStack React Query, Zustand, API client, charting library, and date utilities
    status: pending
  - id: auth-frontend
    content: Implement Google OAuth login page, auth state management with Zustand, protected route middleware, and API client with auth interceptors
    status: pending
    dependencies:
      - frontend-dependencies
      - auth-backend
  - id: categories-frontend
    content: Create categories management UI with list page, create/edit forms, and category selection components
    status: pending
    dependencies:
      - auth-frontend
      - categories-backend
  - id: expenses-frontend
    content: Create expenses UI with list page, filters, add/edit forms, and quick add component
    status: pending
    dependencies:
      - auth-frontend
      - expenses-backend
      - categories-frontend
  - id: quickprices-frontend
    content: Create quickprices UI with list/grid page, create/edit forms, and quick action buttons to create expenses
    status: pending
    dependencies:
      - auth-frontend
      - quickprices-backend
      - categories-frontend
  - id: analytics-frontend
    content: Create dashboard page with analytics cards, charts for trends and category breakdown, and summary statistics
    status: pending
    dependencies:
      - auth-frontend
      - analytics-backend
      - expenses-frontend
  - id: env-config
    content: Create .env.example files, document environment variables, and configure Supabase connection for production
    status: pending
    dependencies:
      - setup-prisma
---

# Expense Tracking System Implementation Plan

## Architecture Overview

The system consists of:

- **Backend**: NestJS REST API with Prisma ORM
- **Frontend**: Next.js 16 with React 19, shadcn/ui, TanStack React Query, and Zustand
- **Database**: PostgreSQL (local) and Supabase (production)
- **Infrastructure**: Docker for local development

## Database Schema (Prisma)

Create `server/prisma/schema.prisma` with the following models:

- **User**: id, email, name, picture, googleId, createdAt, updatedAt
- **Category**: id, userId, name, color, icon, createdAt, updatedAt
- **Expense**: id, userId, categoryId, amount, description, date, createdAt, updatedAt
- **QuickPrice**: id, userId, name, amount, categoryId, description, createdAt, updatedAt

Relations:

- User → Categories (one-to-many)
- User → Expenses (one-to-many)
- User → QuickPrices (one-to-many)
- Category → Expenses (one-to-many)
- Category → QuickPrices (one-to-many)

## Implementation Steps

### 1. Project Setup & Configuration

**Backend (`server/`)**:

- Install dependencies: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-google-oauth20`, `@prisma/client`, `prisma`, `class-validator`, `class-transformer`, `@nestjs/swagger` (optional)
- Configure Prisma: Initialize Prisma, create schema, generate client
- Set up environment variables: `.env` for database URLs, JWT secrets, Google OAuth credentials
- Configure CORS in `main.ts` for Next.js frontend
- Add global validation pipe and exception filters

**Frontend (`website/`)**:

- Install dependencies: `@tanstack/react-query`, `zustand`, `axios` or `fetch` wrapper, `next-auth` (for Google OAuth) or custom implementation
- Set up React Query provider in `app/layout.tsx`
- Create Zustand stores for auth state
- Configure API client with interceptors for auth tokens

**Docker**:

- Create `docker-compose.yml` at root with PostgreSQL service
- Create `server/Dockerfile` for backend
- Create `website/Dockerfile` for frontend (optional)
- Add `.dockerignore` files

### 2. Authentication Module

**Backend** (`server/src/auth/`):

- Create `auth.module.ts`, `auth.service.ts`, `auth.controller.ts`
- Implement Google OAuth strategy with Passport
- JWT token generation and validation
- Endpoints: `POST /auth/google`, `GET /auth/me`, `POST /auth/refresh`
- Guards: `JwtAuthGuard` for protected routes

**Frontend** (`website/app/auth/`):

- Create login page with Google OAuth button
- Handle OAuth callback
- Store JWT in Zustand store (or httpOnly cookies)
- Create auth context/provider for protected routes
- Middleware for route protection

### 3. Categories Module

**Backend** (`server/src/categories/`):

- Create `categories.module.ts`, `categories.service.ts`, `categories.controller.ts`
- CRUD operations: `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- User-scoped queries (only user's categories)
- DTOs with validation

**Frontend** (`website/app/categories/`):

- Categories list page
- Create/edit category form (with color picker, icon selector)
- Category management UI using shadcn components

### 4. Expenses Module

**Backend** (`server/src/expenses/`):

- Create `expenses.module.ts`, `expenses.service.ts`, `expenses.controller.ts`
- CRUD operations: `GET /expenses`, `POST /expenses`, `PUT /expenses/:id`, `DELETE /expenses/:id`
- Filtering by date range, category, amount
- Pagination support
- User-scoped queries

**Frontend** (`website/app/expenses/`):

- Expenses list page with filters
- Add/edit expense form
- Quick add expense component
- Integration with categories

### 5. QuickPrices Module

**Backend** (`server/src/quickprices/`):

- Create `quickprices.module.ts`, `quickprices.service.ts`, `quickprices.controller.ts`
- CRUD operations: `GET /quickprices`, `POST /quickprices`, `PUT /quickprices/:id`, `DELETE /quickprices/:id`
- Endpoint to create expense from quickprice: `POST /quickprices/:id/create-expense`
- User-scoped queries

**Frontend** (`website/app/quickprices/`):

- QuickPrices list/grid page
- Create/edit quickprice form
- Quick action buttons to create expenses from templates

### 6. Analytics Module

**Backend** (`server/src/analytics/`):

- Create `analytics.module.ts`, `analytics.service.ts`, `analytics.controller.ts`
- Endpoints:
  - `GET /analytics/summary` - Total expenses, by period, by category
  - `GET /analytics/trends` - Spending trends over time
  - `GET /analytics/category-breakdown` - Expenses grouped by category
  - `GET /analytics/time-period` - Filter by date ranges (daily, weekly, monthly, yearly)

**Frontend** (`website/app/dashboard/`):

- Dashboard page with analytics cards
- Charts using a charting library (e.g., `recharts` or `chart.js`)
- Category breakdown visualization
- Spending trends over time
- Summary statistics

### 7. API Integration & State Management

**Frontend**:

- Create API client utilities (`website/lib/api/`)
- Set up TanStack React Query hooks for all endpoints
- Create Zustand stores:
  - `authStore` - User authentication state
  - `expensesStore` - Cached expenses (optional, React Query handles most of this)
- Error handling and loading states

### 8. UI Components

**Frontend** (`website/components/`):

- Reuse existing shadcn components
- Create custom components:
  - `ExpenseForm` - Form for adding/editing expenses
  - `CategoryForm` - Form for categories
  - `QuickPriceCard` - Card component for quickprices
  - `AnalyticsCard` - Reusable analytics display cards
  - `ExpenseList` - List/table of expenses
  - `DateRangePicker` - For filtering expenses

### 9. Environment Configuration

- Create `.env.example` files for both server and website
- Document required environment variables
- Set up different configs for local vs production

### 10. Docker Setup

- `docker-compose.yml` with PostgreSQL service
- Environment variable configuration
- Volume mounts for database persistence
- Network configuration for services to communicate

## File Structure

```
server/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── auth/
│   ├── categories/
│   ├── expenses/
│   ├── quickprices/
│   ├── analytics/
│   ├── common/ (guards, decorators, filters)
│   └── main.ts
├── Dockerfile
└── .env.example

website/
├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── expenses/
│   ├── categories/
│   ├── quickprices/
│   └── layout.tsx
├── components/
│   └── (custom components)
├── lib/
│   ├── api/
│   └── stores/
└── .env.example

docker-compose.yml
```

## Key Dependencies to Install

**Backend**:

- `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-google-oauth20`
- `@prisma/client`, `prisma`
- `class-validator`, `class-transformer`
- `bcrypt` (if needed), `cookie-parser`

**Frontend**:

- `@tanstack/react-query`
- `zustand`
- `axios` or native fetch wrapper
- `next-auth` or custom OAuth implementation
- `recharts` or `chart.js` for analytics
- `date-fns` for date handling

## Notes

- All backend endpoints should be protected with JWT authentication except auth endpoints
- Use Prisma migrations for database schema changes
- Implement proper error handling and validation on both frontend and backend
- Use TypeScript strictly throughout
- Follow NestJS and Next.js best practices for code organization