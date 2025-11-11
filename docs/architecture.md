# Architecture

## Executive Summary

FinSight is built as a full-stack Next.js application using Supabase for data persistence and authentication. The architecture prioritizes simplicity, type safety, and real-time updates. The tech stack combines Next.js App Router, TypeScript, Tailwind CSS, and Supabase to deliver a modern, scalable personal finance management platform.

## Project Initialization

**First implementation story should execute:**

```bash
npx create-next-app@latest finsight --typescript --tailwind --app --eslint
```

This establishes the base architecture with these decisions:

- **Framework:** Next.js 16.0.1 with App Router
- **Language:** TypeScript (default)
- **Styling:** Tailwind CSS (default)
- **Linting:** ESLint (default)
- **Project Structure:** App Router pattern with `app/` directory

After initialization, install additional dependencies:

```bash
npm install @supabase/supabase-js@2.81.0 papaparse@5.5.3 date-fns@4.1.0 openai
npm install -D @types/papaparse
```

## Decision Summary

| Category              | Decision                   | Version        | Affects Epics            | Rationale                                                                   |
| --------------------- | -------------------------- | -------------- | ------------------------ | --------------------------------------------------------------------------- |
| **Framework**         | Next.js                    | 16.0.1         | All epics                | Full-stack React framework with API routes, perfect for SPA architecture    |
| **Language**          | TypeScript                 | Latest         | All epics                | Type safety, better developer experience, provided by starter               |
| **Styling**           | Tailwind CSS               | Latest         | All UI epics             | Utility-first CSS, works seamlessly with shadcn/ui, provided by starter     |
| **Database**          | Supabase (PostgreSQL)      | Latest         | All data epics           | Relational database perfect for financial data, includes auth and real-time |
| **Database Client**   | @supabase/supabase-js      | 2.81.0         | All data epics           | Official TypeScript SDK, type-safe database access                          |
| **Authentication**    | Supabase Auth              | Built-in       | FR1 (User Management)    | Integrated with Supabase, handles sessions securely                         |
| **API Pattern**       | REST (Next.js API Routes)  | Next.js 16.0.1 | All API epics            | PRD specifies RESTful API, Next.js routes provide this naturally            |
| **CSV Parsing**       | Papa Parse                 | 5.5.3          | FR3 (Transaction Import) | Handles various bank CSV formats, well-maintained, good error handling      |
| **AI Integration**    | OpenAI API (GPT-3.5-turbo) | Latest         | FR7 (AI Chat)            | Cost-effective, sufficient for budget insights and chat functionality       |
| **Date Handling**     | date-fns                   | 4.1.0          | All epics                | Lightweight, TypeScript-friendly date formatting library                    |
| **Real-time Updates** | Supabase Realtime          | Built-in       | FR5 (Dashboard)          | Built into Supabase, perfect for dashboard updates                          |
| **File Storage**      | In-memory processing       | N/A            | FR3 (Transaction Import) | CSV files processed immediately, no persistent storage needed               |
| **Background Jobs**   | Synchronous (MVP)          | N/A            | FR3 (Transaction Import) | MVP processes synchronously, can add async later if needed                  |
| **Deployment**        | Vercel                     | Latest         | All epics                | PRD mentions Vercel, perfect fit for Next.js, easy deployment               |
| **Testing**           | Vitest                     | Latest         | All epics                | Modern, fast testing framework, works great with Next.js                    |

## Project Structure

```
finsight/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Protected routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── transactions/         # Transaction list/review
│   │   ├── budget/               # Budget management
│   │   ├── categories/           # Category management
│   │   └── chat/                 # AI chat interface
│   ├── api/                      # API routes
│   │   ├── auth/                 # Auth endpoints
│   │   ├── transactions/          # Transaction CRUD
│   │   ├── categories/           # Category CRUD
│   │   ├── budgets/              # Budget CRUD
│   │   ├── upload/               # File upload endpoint
│   │   └── chat/                 # AI chat endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── transactions/              # Transaction components
│   │   ├── TransactionUpload.tsx
│   │   ├── TransactionReviewTable.tsx
│   │   └── TransactionList.tsx
│   ├── budget/                   # Budget components
│   │   ├── BudgetCategoryCard.tsx
│   │   ├── BudgetSummaryCards.tsx
│   │   └── BudgetEditor.tsx
│   ├── categories/               # Category components
│   │   └── CategoryManager.tsx
│   └── chat/                     # AI chat components
│       └── ChatInterface.tsx
├── lib/                          # Utilities and helpers
│   ├── supabase/                 # Supabase client
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── types.ts               # Database types
│   ├── openai/                   # OpenAI integration
│   │   └── client.ts
│   ├── parsers/                  # CSV parsing
│   │   ├── csv-parser.ts
│   │   └── bank-formats.ts
│   ├── categorization/            # Categorization logic
│   │   ├── auto-categorize.ts
│   │   └── learning.ts
│   └── utils/                    # General utilities
│       ├── date.ts
│       └── errors.ts
├── types/                        # TypeScript types
│   ├── transaction.ts
│   ├── category.ts
│   ├── budget.ts
│   └── api.ts
├── hooks/                        # React hooks
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── useBudget.ts
│   └── useRealtime.ts            # Supabase realtime
├── styles/                       # Global styles
│   └── globals.css
├── public/                       # Static assets
├── tests/                        # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local                    # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Epic to Architecture Mapping

| Epic                                | Architecture Components                           | Key Files                                                                          |
| ----------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **FR1: User Management**            | Auth routes, Supabase Auth, API endpoints         | `app/(auth)/`, `app/api/auth/`, `lib/supabase/`                                    |
| **FR2: Category Management**        | Dashboard route, API routes, components           | `app/(dashboard)/categories/`, `app/api/categories/`, `components/categories/`     |
| **FR3: Transaction Import**         | Upload API, CSV parser, upload component          | `app/api/upload/`, `lib/parsers/`, `components/transactions/TransactionUpload.tsx` |
| **FR4: Intelligent Categorization** | Categorization logic, review component            | `lib/categorization/`, `components/transactions/TransactionReviewTable.tsx`        |
| **FR5: Spending Dashboard**         | Dashboard route, budget components, realtime hook | `app/(dashboard)/dashboard/`, `components/budget/`, `hooks/useRealtime.ts`         |
| **FR6: Budget Planning**            | Budget route, API routes, budget components       | `app/(dashboard)/budget/`, `app/api/budgets/`, `components/budget/`                |
| **FR7: AI Chat Interface**          | Chat route, OpenAI client, chat component         | `app/(dashboard)/chat/`, `app/api/chat/`, `lib/openai/`, `components/chat/`        |

## Technology Stack Details

### Core Technologies

**Frontend:**

- **Next.js 16.0.1** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library built on Radix UI
- **React Query / SWR** - Server state management (to be added)

**Backend:**

- **Next.js API Routes** - RESTful API endpoints
- **Supabase** - PostgreSQL database with auth and real-time
- **@supabase/supabase-js 2.81.0** - Database client

**Data Processing:**

- **Papa Parse 5.5.3** - CSV parsing library
- **date-fns 4.1.0** - Date formatting

**External Services:**

- **OpenAI API** - AI chat functionality (GPT-3.5-turbo)
- **Supabase Auth** - Authentication and authorization
- **Supabase Realtime** - Real-time database subscriptions

**Development:**

- **Vitest** - Testing framework
- **ESLint** - Code linting
- **TypeScript** - Type checking

### Integration Points

**Frontend ↔ Backend:**

- Next.js API routes (`app/api/`) handle all backend logic
- Client components call API routes using `fetch()` or React Query

**Backend ↔ Database:**

- Supabase client (`lib/supabase/`) provides type-safe database access
- Server-side client for API routes, browser client for client components

**Backend ↔ AI:**

- OpenAI client (`lib/openai/client.ts`) handles AI chat requests
- API route (`app/api/chat/route.ts`) processes chat requests

**Real-time Updates:**

- Supabase Realtime subscriptions via custom hooks (`hooks/useRealtime.ts`)
- Dashboard automatically updates when transactions change

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Patterns

**API Routes:**

- REST endpoints use plural nouns: `/api/transactions`, `/api/categories`, `/api/budgets`
- Route parameters use `:id` format: `/api/transactions/:id`
- File naming: `route.ts` for API routes (`app/api/transactions/route.ts`)

**Database:**

- Table names: Plural, snake_case (`transactions`, `budget_categories`, `user_budgets`)
- Column names: snake_case (`user_id`, `created_at`, `amount_cents`)
- Foreign keys: `{table}_id` format (`category_id`, `user_id`)

**Frontend Components:**

- Component files: PascalCase (`TransactionUpload.tsx`, `BudgetCategoryCard.tsx`)
- Component names: Match filename exactly
- Hook files: camelCase starting with `use` (`useTransactions.ts`, `useCategories.ts`)

### Structure Patterns

**Test Organization:**

- Location: Co-located with source files or in `tests/` directory
- Naming: `*.test.ts` or `*.spec.ts` (e.g., `csv-parser.test.ts`)
- Structure: `tests/unit/`, `tests/integration/`, `tests/e2e/`

**Component Organization:**

- By feature: Group related components (`components/transactions/`, `components/budget/`)
- Shared components: `components/ui/` (shadcn/ui components)
- Utilities: `lib/utils/` for shared utilities

### Format Patterns

**API Response Format:**

- Success: Direct data (no wrapper)
  - `GET /api/transactions` → `Transaction[]`
  - `GET /api/transactions/:id` → `Transaction`
- Error: Consistent error object
  - `{ error: { message: string, code?: string } }`
  - HTTP status codes: 400, 401, 404, 500

**Date Format:**

- API: ISO 8601 strings (`"2025-01-15T10:30:00Z"`)
- Database: Timestamp with timezone (Supabase handles this)
- UI: Formatted using `date-fns` (e.g., "Jan 15, 2025")

### Communication Patterns

**State Management:**

- Server State: React Query / SWR for API data
- Client State: React `useState` for UI state
- Form State: React Hook Form (if using forms)

**Real-time Updates:**

- Pattern: Supabase Realtime subscriptions via custom hooks
- Hook: `useRealtime(tableName, callback)`
- Cleanup: Always unsubscribe in `useEffect` cleanup

### Lifecycle Patterns

**Loading States:**

- Pattern: Skeleton screens for content, spinners for actions
- Component: Use shadcn/ui Skeleton component
- State: `isLoading` boolean, show skeleton when `true`

**Error Recovery:**

- Pattern: Retry button for failed operations
- Display: Inline error messages below inputs, toast notifications for system errors
- Logging: Log all errors server-side

### Location Patterns

**API Route Structure:**

- Pattern: `app/api/{resource}/route.ts` for REST endpoints
- Example: `app/api/transactions/route.ts` handles GET (list) and POST (create)
- Nested: `app/api/transactions/[id]/route.ts` handles GET (one), PUT (update), DELETE

**Static Assets:**

- Location: `public/` directory
- Organization: `public/images/`, `public/icons/`

### Consistency Patterns

**Date Formatting:**

- Library: `date-fns`
- Pattern: Use `format()` for display, `parseISO()` for API dates
- Example: `format(parseISO(date), 'MMM d, yyyy')`

**Logging Format:**

- Pattern: `console.log('[LEVEL]', message, { context })`
- Levels: `[INFO]`, `[WARN]`, `[ERROR]`
- Example: `console.log('[INFO]', 'Transaction uploaded', { userId, count })`

**Error Messages:**

- User-facing: Clear, actionable, no technical jargon
- Format: Sentence case, specific to the action
- Example: "Unable to upload file. Please check the file format and try again."

## Consistency Rules

### Naming Conventions

**API Routes:**

- Use plural nouns: `/api/transactions`, `/api/categories`
- Use `route.ts` filename for App Router API routes
- Use `[id]` dynamic segments: `/api/transactions/[id]/route.ts`

**Database:**

- Tables: Plural, snake_case (`transactions`, `budget_categories`)
- Columns: snake_case (`user_id`, `created_at`, `amount_cents`)
- Foreign keys: `{table}_id` format

**Components:**

- Files: PascalCase matching component name
- Hooks: camelCase starting with `use`

### Code Organization

**By Feature:**

- Group related components in feature folders
- Keep shared utilities in `lib/utils/`
- Co-locate tests with source files or in `tests/` directory

**Import Order:**

1. External dependencies
2. Internal utilities
3. Components
4. Types
5. Styles

### Error Handling

**API Errors:**

- Return consistent error format: `{ error: { message: string, code?: string } }`
- Use appropriate HTTP status codes (400, 401, 404, 500)
- Log full error details server-side for debugging

**User-Facing Errors:**

- Clear, actionable messages
- No technical jargon
- Provide guidance on how to fix

### Logging Strategy

**Format:**

- Structured logging: `console.log('[LEVEL]', message, { context })`
- Levels: `[INFO]`, `[WARN]`, `[ERROR]`
- Include relevant context (userId, transactionId, etc.)

**What to Log:**

- API calls and responses
- Errors (full details)
- Important user actions (upload, categorization, budget changes)

## Data Architecture

### Database Schema (Supabase/PostgreSQL)

**Tables:**

```sql
-- Users (handled by Supabase Auth)
-- Additional user profile data can be stored in profiles table

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_cents INTEGER NOT NULL, -- Store as cents to avoid floating point issues
  merchant TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_duplicate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets (monthly budgets per category)
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of the month
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- Categorization Learning (merchant → category mappings)
CREATE TABLE categorization_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_pattern TEXT NOT NULL, -- Pattern to match (can be partial)
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  confidence INTEGER DEFAULT 100, -- 0-100 confidence score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, merchant_pattern, category_id)
);

-- AI Chat History (optional, for context)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month DESC);
CREATE INDEX idx_categorization_rules_user ON categorization_rules(user_id);
```

### Data Relationships

- **Users** → **Categories** (one-to-many)
- **Users** → **Transactions** (one-to-many)
- **Users** → **Budgets** (one-to-many)
- **Categories** → **Transactions** (one-to-many)
- **Categories** → **Budgets** (one-to-many)
- **Users** → **Categorization Rules** (one-to-many)
- **Categories** → **Categorization Rules** (one-to-many)

### Data Access Patterns

**Read Patterns:**

- Transactions by user and date range
- Categories by user
- Budgets by user and month
- Spending aggregation by category

**Write Patterns:**

- Bulk transaction insert (from CSV upload)
- Category creation/update
- Budget creation/update
- Categorization rule learning

## API Contracts

### Authentication Endpoints

**POST /api/auth/login**

- Request: `{ email: string, password: string }`
- Response: `{ user: User, session: Session }`
- Errors: 401 (invalid credentials)

**POST /api/auth/signup**

- Request: `{ email: string, password: string }`
- Response: `{ user: User, session: Session }`
- Errors: 400 (validation error), 409 (email exists)

**POST /api/auth/logout**

- Request: None (uses session)
- Response: `{ success: true }`

### Transaction Endpoints

**GET /api/transactions**

- Query params: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&categoryId=uuid`
- Response: `Transaction[]`
- Errors: 401 (unauthorized)

**POST /api/transactions**

- Request: `Transaction[]` (bulk create)
- Response: `{ created: number, duplicates: number }`
- Errors: 400 (validation error), 401 (unauthorized)

**GET /api/transactions/[id]**

- Response: `Transaction`
- Errors: 404 (not found), 401 (unauthorized)

**PUT /api/transactions/[id]**

- Request: `{ categoryId?: uuid, merchant?: string, ... }`
- Response: `Transaction`
- Errors: 404 (not found), 400 (validation error)

**DELETE /api/transactions/[id]**

- Response: `{ success: true }`
- Errors: 404 (not found), 401 (unauthorized)

### Upload Endpoint

**POST /api/upload**

- Request: `FormData` with `file: File`
- Response: `{ transactions: Transaction[], duplicates: number }`
- Errors: 400 (invalid file), 413 (file too large), 500 (parsing error)

### Category Endpoints

**GET /api/categories**

- Response: `Category[]`
- Errors: 401 (unauthorized)

**POST /api/categories**

- Request: `{ name: string, description?: string }`
- Response: `Category`
- Errors: 400 (validation error), 409 (duplicate name)

**PUT /api/categories/[id]**

- Request: `{ name?: string, description?: string }`
- Response: `Category`
- Errors: 404 (not found), 400 (validation error)

**DELETE /api/categories/[id]**

- Response: `{ success: true }`
- Errors: 404 (not found), 400 (has transactions)

### Budget Endpoints

**GET /api/budgets**

- Query params: `?month=YYYY-MM-DD`
- Response: `Budget[]`
- Errors: 401 (unauthorized)

**POST /api/budgets**

- Request: `{ categoryId: uuid, month: YYYY-MM-DD, amountCents: number }`
- Response: `Budget`
- Errors: 400 (validation error), 409 (duplicate)

**PUT /api/budgets/[id]**

- Request: `{ amountCents: number }`
- Response: `Budget`
- Errors: 404 (not found), 400 (validation error)

### Chat Endpoint

**POST /api/chat**

- Request: `{ message: string, history?: ChatMessage[] }`
- Response: `{ message: string }`
- Errors: 400 (invalid request), 401 (unauthorized), 500 (AI service error)

## Security Architecture

### Authentication

**Method:** Supabase Auth

- Email/password authentication
- Secure session management (HTTP-only cookies)
- Password hashing handled by Supabase
- Session timeout: 30 minutes inactivity (configurable)

### Authorization

**Row Level Security (RLS):**

- All tables enforce RLS policies
- Users can only access their own data
- Policies check `user_id` matches authenticated user

**API Route Protection:**

- Middleware checks authentication before processing
- Returns 401 if user not authenticated
- Validates user ownership of resources

### Data Protection

**Encryption:**

- Data encrypted in transit (HTTPS/TLS)
- Data encrypted at rest (Supabase handles this)
- Passwords hashed using bcrypt (Supabase handles this)

**Input Validation:**

- All user inputs validated and sanitized
- File uploads validated for type and size (max 10MB)
- SQL injection protection via Supabase parameterized queries
- XSS protection via React's built-in escaping

### Privacy

**Data Isolation:**

- User data isolated per account
- No cross-user data access
- User can export their data
- User can delete account and all associated data

## Performance Considerations

### Frontend Performance

**Code Splitting:**

- Next.js automatic code splitting by route
- Lazy load heavy components (charts, large tables)
- Dynamic imports for non-critical features

**Optimization:**

- Image optimization via Next.js Image component
- CSS optimization via Tailwind CSS purging
- Bundle size monitoring

### Backend Performance

**Database Optimization:**

- Indexes on frequently queried columns
- Efficient queries (avoid N+1 problems)
- Pagination for large result sets

**API Optimization:**

- Response caching where appropriate
- Efficient data aggregation
- Batch operations for bulk inserts

### Real-time Performance

**Supabase Realtime:**

- Subscribe only to necessary tables
- Unsubscribe when components unmount
- Debounce rapid updates if needed

## Deployment Architecture

### Platform: Vercel

**Why Vercel:**

- Native Next.js integration
- Automatic deployments from Git
- Built-in CI/CD
- Edge network for fast global performance
- Environment variable management
- Preview deployments for PRs

### Environment Setup

**Environment Variables:**

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase key (server-only)
- `OPENAI_API_KEY` - OpenAI API key (server-only)

**Deployment Process:**

1. Push to main branch triggers deployment
2. Vercel builds Next.js application
3. Environment variables injected at build time
4. Application deployed to edge network

### Database Hosting

**Supabase Cloud:**

- Managed PostgreSQL database
- Automatic backups
- Point-in-time recovery
- Scalable infrastructure

## Development Environment

### Prerequisites

- **Node.js:** v20.17.0 or later
- **npm:** Latest version
- **Git:** For version control

### Setup Commands

```bash
# Initialize project
npx create-next-app@latest finsight --typescript --tailwind --app --eslint

# Install dependencies
npm install @supabase/supabase-js@2.81.0 papaparse@5.5.3 date-fns@4.1.0 openai
npm install -D @types/papaparse

# Install shadcn/ui (run in project root)
npx shadcn-ui@latest init

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and OpenAI keys to .env.local

# Run development server
npm run dev
```

### Development Workflow

1. Create feature branch from main
2. Implement feature following architecture patterns
3. Write tests for new functionality
4. Test locally with `npm run dev`
5. Create pull request
6. Review and merge to main
7. Vercel automatically deploys

## Architecture Decision Records (ADRs)

### ADR-001: Next.js App Router

**Decision:** Use Next.js App Router (not Pages Router)

**Rationale:**

- Modern Next.js pattern, better performance
- Better TypeScript support
- Server Components by default
- Simpler API route structure

**Alternatives Considered:**

- Pages Router (older pattern, still supported)
- Remix (different framework)

**Consequences:**

- Must use `app/` directory structure
- Server Components are default (good for performance)
- API routes use `route.ts` files

---

### ADR-002: Supabase for Database and Auth

**Decision:** Use Supabase for PostgreSQL database and authentication

**Rationale:**

- Relational database perfect for financial data
- Built-in authentication (one less service to manage)
- Real-time subscriptions for dashboard updates
- Generous free tier
- TypeScript SDK with type generation

**Alternatives Considered:**

- Firebase (NoSQL, less suitable for relational data)
- Separate PostgreSQL + NextAuth (more setup complexity)
- MongoDB (NoSQL, less suitable for financial queries)

**Consequences:**

- Must use Supabase client library
- Authentication handled by Supabase
- Real-time features available out of the box

---

### ADR-003: Papa Parse for CSV Parsing

**Decision:** Use Papa Parse library for CSV file parsing

**Rationale:**

- Handles various bank CSV formats
- Well-maintained and popular
- Good error handling
- Works in browser and Node.js

**Alternatives Considered:**

- Native JavaScript parsing (more error-prone)
- csv-parse (less popular, fewer features)

**Consequences:**

- Must handle Papa Parse's callback/stream API
- Need to normalize different bank formats

---

### ADR-004: OpenAI GPT-3.5-turbo for AI Chat

**Decision:** Use OpenAI GPT-3.5-turbo for AI chat functionality

**Rationale:**

- Cost-effective for MVP
- Sufficient capability for budget insights
- Easy to upgrade to GPT-4 later if needed
- Well-documented API

**Alternatives Considered:**

- GPT-4 (more expensive, overkill for MVP)
- Anthropic Claude (less established ecosystem)
- Local LLM (more complex setup)

**Consequences:**

- Requires OpenAI API key
- API costs scale with usage
- Can upgrade to GPT-4 easily if needed

---

### ADR-005: Synchronous CSV Processing for MVP

**Decision:** Process CSV files synchronously in API route for MVP

**Rationale:**

- Simpler implementation
- Sufficient for MVP scale (100-500 transactions)
- Can move to async processing later if needed

**Alternatives Considered:**

- Background job queue (BullMQ, Inngest) - more complex, not needed for MVP
- Webhook-based processing - overkill for MVP

**Consequences:**

- API route may take longer for large files
- User waits for processing to complete
- Can refactor to async later if performance becomes issue

---

### ADR-006: Direct API Response Format (No Wrapper)

**Decision:** Return data directly from API routes (no `{ data: ... }` wrapper)

**Rationale:**

- Simpler, less boilerplate
- Standard REST pattern
- Easier to consume on frontend

**Alternatives Considered:**

- Wrapped format `{ data: ..., success: true }` - more consistent but more verbose
- GraphQL - overkill for this use case

**Consequences:**

- Errors use different format than success responses
- Frontend must handle both data and error cases

---

_Generated by BMAD Decision Architecture Workflow v1.3.2_  
_Date: 2025-11-10_  
_For: Sam_
