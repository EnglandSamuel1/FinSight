# FinSight - Epic Breakdown

**Author:** Sam
**Date:** 2025-11-10
**Project Level:** Low Complexity
**Target Scale:** MVP

---

## Overview

This document provides the complete epic and story breakdown for FinSight, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

This epic breakdown decomposes the FinSight PRD requirements into 7 epics, organized by value delivery and technical dependencies. Each epic contains bite-sized stories designed for single-session completion by development agents.

**Epic Sequencing:**

1. **Foundation & Infrastructure** - Technical foundation enabling all features
2. **Category & Budget Management** - User-defined budget structure
3. **Transaction Import & Processing** - Core data ingestion capability
4. **Intelligent Categorization System** - Automated categorization with learning
5. **Spending Dashboard & Visualization** - Real-time spending visibility
6. **Budget Planning & Goal Setting** - Proactive budget planning
7. **AI Chat Interface** - Proactive AI guidance and insights

**Story Principles:**

- Vertically sliced (complete functionality, not just one layer)
- Sequentially ordered (logical progression, no forward dependencies)
- Independently valuable when possible
- Small enough for single-session completion
- Clear BDD acceptance criteria for testability

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the technical foundation that enables all features. Sets up the development environment, core infrastructure, authentication system, and deployment pipeline.

### Story 1.1: Project Setup & Infrastructure Initialization

As a developer,
I want to initialize the FinSight project with proper structure, build system, and core dependencies,
So that all subsequent development work has a solid foundation.

**Acceptance Criteria:**

**Given** a new project directory
**When** I initialize the project
**Then** the project has:

- Next.js application structure with TypeScript configuration
- Package.json with core dependencies (Next.js, React, TypeScript)
- ESLint and Prettier configuration for code quality
- Git repository initialized with .gitignore
- Basic folder structure (app/, components/, lib/, public/)
- README.md with project overview and setup instructions

**And** the project can be started with `npm run dev`
**And** TypeScript compilation succeeds without errors
**And** linting passes with default configuration

**Prerequisites:** None (this is the first story)

**Technical Notes:**

- Use Next.js 14+ with App Router
- TypeScript strict mode enabled
- Set up Tailwind CSS for styling
- Configure environment variables structure (.env.local.example)
- Include basic project documentation

---

### Story 1.2: Database Schema & Connection Setup

As a developer,
I want to set up the database schema and connection infrastructure,
So that the application can store and retrieve user data, transactions, and categories.

**Acceptance Criteria:**

**Given** the project is initialized
**When** I set up the database infrastructure
**Then** the system has:

- Database connection configuration (PostgreSQL or MongoDB)
- Database client/ORM setup (Prisma, Mongoose, or similar)
- Environment variables for database connection string
- Database schema/models for: User, Category, Transaction, Budget
- Migration system configured (if using SQL database)
- Connection pooling and error handling

**And** the database connection can be tested successfully
**And** schema validation works correctly
**And** database queries execute without errors

**Prerequisites:** Story 1.1 (Project Setup)

**Technical Notes:**

- Choose database based on project needs (PostgreSQL recommended for relational data)
- Use Prisma ORM for type-safe database access (if PostgreSQL)
- Define core models: User (id, email, passwordHash, createdAt), Category (id, userId, name, description, createdAt), Transaction (id, userId, date, amount, merchant, categoryId, createdAt), Budget (id, userId, categoryId, month, amount, createdAt)
- Set up database indexes for common queries (userId, date, categoryId)
- Include seed data script for development

---

### Story 1.3: Authentication System Foundation

As a user,
I want to create an account and securely log in,
So that my financial data is protected and personalized.

**Acceptance Criteria:**

**Given** the database is set up
**When** I implement authentication
**Then** the system has:

- User registration API endpoint (POST /api/auth/register)
- User login API endpoint (POST /api/auth/login)
- Password hashing using bcrypt or similar
- JWT token generation and validation
- Session management (HTTP-only cookies or JWT storage)
- Protected route middleware for authenticated pages
- Logout functionality

**And** passwords are hashed before storage (never plaintext)
**And** login creates a valid session
**And** protected routes redirect unauthenticated users
**And** logout clears session properly

**Prerequisites:** Story 1.2 (Database Schema)

**Technical Notes:**

- Use NextAuth.js or custom JWT implementation
- Password requirements: minimum 8 characters
- Implement CSRF protection
- Set secure cookie flags (httpOnly, secure, sameSite)
- Create authentication context/provider for React components
- Add error handling for invalid credentials

---

### Story 1.4: Core API Infrastructure & Error Handling

As a developer,
I want to establish consistent API patterns and error handling,
So that all API endpoints follow the same structure and provide clear error messages.

**Acceptance Criteria:**

**Given** authentication is implemented
**When** I set up API infrastructure
**Then** the system has:

- Consistent API response format (success/error structure)
- Centralized error handling middleware
- Input validation utilities (Zod or similar)
- API route structure following REST conventions
- Request logging and error logging
- CORS configuration (if needed)
- Rate limiting setup (basic)

**And** API errors return consistent format with status codes
**And** validation errors are clear and actionable
**And** API responses include proper HTTP status codes
**And** errors are logged for debugging

**Prerequisites:** Story 1.3 (Authentication System)

**Technical Notes:**

- Create API response helper functions (success, error)
- Set up error types (ValidationError, AuthenticationError, NotFoundError, etc.)
- Use Zod for request validation schemas
- Implement try-catch wrapper for API routes
- Add request ID for tracing
- Set up error boundary for React components

---

### Story 1.5: Deployment Pipeline & Environment Configuration

As a developer,
I want to configure deployment pipeline and environment management,
So that the application can be deployed reliably to production.

**Acceptance Criteria:**

**Given** the application is functional
**When** I set up deployment
**Then** the system has:

- Vercel deployment configuration (vercel.json or similar)
- Environment variable management (.env files for dev/prod)
- Build script that succeeds
- Production build optimization configured
- Database migration strategy for production
- Deployment documentation

**And** the application builds successfully for production
**And** environment variables are properly configured
**And** the application deploys to Vercel without errors
**And** production database migrations run successfully

**Prerequisites:** Story 1.4 (API Infrastructure)

**Technical Notes:**

- Configure Vercel project settings
- Set up environment variables in Vercel dashboard
- Create production database connection
- Add health check endpoint (/api/health)
- Document deployment process
- Set up CI/CD basics (optional for MVP)

---

## Epic 2: Category & Budget Management

**Goal:** Enable users to define and manage their personalized budget structure. Users create categories that match their spending patterns and assign budget amounts to each category.

### Story 2.1: Category Creation & Management

As a user,
I want to create, edit, and delete personalized budget categories,
So that my categories match my actual spending patterns, not generic templates.

**Acceptance Criteria:**

**Given** I am logged in
**When** I create a new category
**Then** I can:

- Enter a category name (required)
- Add an optional description
- Save the category successfully

**And** the category appears in my category list
**And** the category is associated with my user account (not shared)
**And** I can edit the category name and description later
**And** I can delete the category (with confirmation if it has transactions)

**Prerequisites:** Story 1.3 (Authentication System)

**Technical Notes:**

- Create API endpoint: POST /api/categories
- Create API endpoint: PUT /api/categories/[id]
- Create API endpoint: DELETE /api/categories/[id]
- Create API endpoint: GET /api/categories (list user's categories)
- Validate category name is unique per user
- Handle deletion: warn if category has transactions, allow reassignment or deletion
- Create React components: CategoryForm, CategoryList, CategoryItem
- Add category management page/route

---

### Story 2.2: Category Budget Assignment

As a user,
I want to assign monthly budget amounts to each category,
So that I can define spending limits for each category.

**Acceptance Criteria:**

**Given** I have created categories
**When** I set a budget amount for a category
**Then** I can:

- Set a monthly budget amount (numeric, positive)
- Update the budget amount at any time
- View the current month's budget for each category
- See budget amounts displayed clearly in the category list

**And** budget amounts are tracked per month (not overwriting previous months)
**And** the system calculates remaining budget (budget - actual spending)
**And** budget amounts are saved and persist across sessions

**Prerequisites:** Story 2.1 (Category Creation)

**Technical Notes:**

- Extend Category model or create Budget model with month field
- Create API endpoint: POST /api/budgets (create/update monthly budget)
- Create API endpoint: GET /api/budgets?month=YYYY-MM (get budgets for month)
- Budget model: userId, categoryId, month (YYYY-MM format), amount
- Validate budget amount is positive number
- Create React component: BudgetInput, BudgetDisplay
- Add budget assignment to category management UI

---

### Story 2.3: Category Management UI

As a user,
I want an intuitive interface to manage my categories and budgets,
So that I can easily set up my budget structure.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to category management
**Then** I see:

- List of all my categories with their current budget amounts
- Add new category button/form
- Edit and delete actions for each category
- Clear visual indication of categories with budgets set
- Empty state message if no categories exist

**And** I can create a category with a single form submission
**And** I can edit category details inline or via modal
**And** I can set budget amounts directly in the category list
**And** changes are saved immediately with visual feedback

**Prerequisites:** Story 2.2 (Budget Assignment)

**Technical Notes:**

- Create page: /categories or /budget/categories
- Design responsive layout (mobile-friendly)
- Use form validation and error handling
- Add loading states and success/error messages
- Implement optimistic UI updates
- Add keyboard shortcuts for power users (optional)

---

## Epic 3: Transaction Import & Processing

**Goal:** Enable users to upload and process bank transaction files. The system handles different CSV formats from any bank, parses transactions, detects duplicates, and stores them in a centralized location.

### Story 3.1: CSV File Upload Interface

As a user,
I want to upload CSV transaction files from my bank,
So that I can import my transactions without manual data entry.

**Acceptance Criteria:**

**Given** I am logged in
**When** I upload a CSV file
**Then** I can:

- Upload via drag-and-drop or file picker
- See file upload progress indicator
- Upload files up to 10MB in size
- See clear error messages for invalid files

**And** the system validates file format before processing
**And** I receive immediate feedback on upload success/failure
**And** the file is securely stored temporarily for processing

**Prerequisites:** Story 1.3 (Authentication System)

**Technical Notes:**

- Create API endpoint: POST /api/transactions/upload
- Use Next.js API route with multipart/form-data handling
- Implement file size validation (max 10MB)
- Validate file extension (.csv)
- Use file upload library (formidable or similar)
- Create React component: FileUpload with drag-and-drop
- Add upload page/route: /transactions/upload
- Store uploaded file temporarily, process asynchronously if needed

---

### Story 3.2: Bank-Agnostic CSV Parsing

As a user,
I want the system to parse CSV files from any bank,
So that I can use FinSight with any bank without specific integrations.

**Acceptance Criteria:**

**Given** I have uploaded a CSV file
**When** the system processes the file
**Then** the system:

- Detects common CSV formats (Chase, Bank of America, Wells Fargo, etc.)
- Extracts: date, amount, merchant/description, transaction type
- Normalizes data to standard schema
- Handles variations in date formats, number formats, column orders
- Reports parsing errors clearly to the user

**And** transactions are parsed into consistent format
**And** parsing errors don't crash the system
**And** user can see which transactions were successfully parsed

**Prerequisites:** Story 3.1 (File Upload)

**Technical Notes:**

- Use CSV parsing library (Papa Parse or similar)
- Create parser utility that detects format and maps columns
- Normalize date formats to ISO 8601 (YYYY-MM-DD)
- Normalize amounts (handle negative for debits, positive for credits)
- Extract merchant name from description field
- Handle different column names (Date, Transaction Date, Post Date, etc.)
- Create parser configuration for common bank formats
- Log parsing errors for debugging
- Return parsing results with success/failure counts

---

### Story 3.3: Transaction Storage & Normalization

As a user,
I want my transactions stored in a consistent format,
So that all my spending data is in one centralized location.

**Acceptance Criteria:**

**Given** transactions have been parsed
**When** the system stores transactions
**Then** the system:

- Stores transactions with normalized schema (date, amount, merchant, type)
- Associates transactions with my user account
- Preserves original transaction data for reference
- Stores transactions in searchable, filterable format

**And** all transactions are accessible via API
**And** transactions can be queried by date range, category, amount
**And** transaction history is preserved (not deleted)

**Prerequisites:** Story 3.2 (CSV Parsing)

**Technical Notes:**

- Transaction model: id, userId, date, amount, merchant, description, type (debit/credit), originalData (JSON), createdAt
- Create API endpoint: POST /api/transactions (bulk create)
- Create database indexes: userId, date, merchant
- Handle transaction type normalization (debit/credit)
- Store original CSV row data for debugging/reference
- Implement batch insert for performance
- Add transaction validation before storage

---

### Story 3.4: Duplicate Detection & Prevention

As a user,
I want the system to prevent duplicate transactions,
So that my spending data is accurate and I don't need to manually clean it up.

**Acceptance Criteria:**

**Given** I am uploading transactions
**When** the system detects duplicates
**Then** the system:

- Identifies duplicate transactions (same date, amount, merchant)
- Notifies me of duplicates found before importing
- Allows me to choose: skip duplicates or import anyway
- Prevents duplicate detection across multiple uploads

**And** duplicate detection works accurately (doesn't flag false positives)
**And** I can see which transactions are duplicates
**And** duplicates are not imported unless I explicitly allow

**Prerequisites:** Story 3.3 (Transaction Storage)

**Technical Notes:**

- Create duplicate detection algorithm (hash-based or fuzzy matching)
- Compare: date, amount, merchant name (normalized)
- Create API endpoint: POST /api/transactions/check-duplicates
- Return duplicate report before final import
- Store duplicate detection results
- Allow user to review and confirm before import
- Consider fuzzy matching for slight variations (optional for MVP)

---

### Story 3.5: Transaction Import UI & Feedback

As a user,
I want clear feedback during transaction import,
So that I understand what's happening and can see the results.

**Acceptance Criteria:**

**Given** I am importing transactions
**When** the import process runs
**Then** I see:

- Upload progress indicator
- Parsing status updates
- Duplicate detection results
- Summary of imported transactions (count, date range)
- Clear success/error messages

**And** I can see which transactions were imported successfully
**And** I can see any errors or warnings
**And** I am redirected to view imported transactions after completion

**Prerequisites:** Story 3.4 (Duplicate Detection)

**Technical Notes:**

- Create import status component with progress tracking
- Show real-time updates during processing
- Display import summary: total transactions, duplicates found, errors
- Create success page/component showing import results
- Add error handling UI for parsing failures
- Implement retry mechanism for failed imports (optional)
- Add transaction list view after import

---

## Epic 4: Intelligent Categorization System

**Goal:** Automatically categorize transactions using intelligent rules and learning from user corrections. Reduces manual categorization work and improves accuracy over time.

### Story 4.1: Rule-Based Automatic Categorization

As a user,
I want transactions automatically categorized based on merchant names and keywords,
So that I don't have to manually categorize every transaction.

**Acceptance Criteria:**

**Given** I have categories and transactions imported
**When** the system categorizes transactions
**Then** the system:

- Matches transactions to categories using merchant names
- Uses keyword matching for common merchants (e.g., "Starbucks" → "Dining")
- Applies category rules based on transaction descriptions
- Categorizes transactions with >90% accuracy on first pass
- Marks uncategorized transactions clearly

**And** categorization happens automatically during import
**And** I can see categorization confidence level
**And** uncategorized transactions are easy to identify

**Prerequisites:** Story 2.1 (Category Creation), Story 3.3 (Transaction Storage)

**Technical Notes:**

- Create categorization service/utility
- Build merchant name → category mapping rules
- Implement keyword matching algorithm
- Create category rules: merchant patterns, description keywords
- Store categorization results with confidence score
- Create API endpoint: POST /api/transactions/categorize (bulk)
- Add categorization to transaction import flow
- Log categorization accuracy for monitoring

---

### Story 4.2: Manual Categorization & Correction

As a user,
I want to manually categorize or correct mis-categorized transactions,
So that I have full control when automation isn't perfect.

**Acceptance Criteria:**

**Given** I have transactions (categorized or uncategorized)
**When** I change a transaction's category
**Then** I can:

- Assign category to uncategorized transaction
- Change category of any transaction
- See the change saved immediately
- Use bulk edit for similar transactions

**And** category changes are reflected in the dashboard immediately
**And** I can undo recent category changes (optional)
**And** changes persist across sessions

**Prerequisites:** Story 4.1 (Automatic Categorization)

**Technical Notes:**

- Create API endpoint: PUT /api/transactions/[id]/category
- Create API endpoint: POST /api/transactions/bulk-update-category
- Update transaction model: categoryId field
- Create React component: CategorySelector, TransactionCategoryEditor
- Add category change to transaction list/table
- Implement bulk selection and update UI
- Add undo/redo functionality (optional for MVP)
- Update dashboard calculations when category changes

---

### Story 4.3: Categorization Learning System

As a user,
I want the system to learn from my corrections,
So that future similar transactions are categorized correctly automatically.

**Acceptance Criteria:**

**Given** I have corrected transaction categorizations
**When** I import new transactions
**Then** the system:

- Uses learned patterns from my corrections
- Applies corrections to similar merchants/descriptions
- Shows feedback that learning occurred
- Improves categorization accuracy over time

**And** learned patterns are user-specific (not shared)
**And** I can see which transactions were categorized using learned patterns
**And** learning improves future categorization accuracy

**Prerequisites:** Story 4.2 (Manual Categorization)

**Technical Notes:**

- Create learning data model: userId, merchantPattern, categoryId, confidence, learnedAt
- Store user correction patterns when category is changed
- Create learning algorithm: match merchant/description patterns to learned categories
- Apply learned patterns during automatic categorization
- Weight learned patterns higher than default rules
- Create API endpoint: GET /api/categorization/learned-patterns (for debugging)
- Add learning feedback to UI ("System learned from your correction")
- Track learning effectiveness metrics

---

### Story 4.4: Categorization UI & Bulk Operations

As a user,
I want an efficient interface for reviewing and correcting categorizations,
So that I can quickly fix any mis-categorized transactions.

**Acceptance Criteria:**

**Given** I have transactions that need categorization review
**When** I view uncategorized or mis-categorized transactions
**Then** I can:

- See list of uncategorized transactions
- Filter transactions by category
- Change category with single click/action
- Select multiple transactions for bulk category update
- See categorization confidence indicators
- Review learned patterns (optional)

**And** the interface is fast and responsive
**And** bulk operations work smoothly
**And** I can see categorization statistics

**Prerequisites:** Story 4.3 (Learning System)

**Technical Notes:**

- Create page: /transactions/categorize or add to transactions list
- Add filter: "Uncategorized" to transaction list
- Create bulk selection UI with checkboxes
- Add bulk category update modal/form
- Display categorization confidence badges
- Show learning indicators ("Learned from your correction")
- Add categorization statistics dashboard (optional)
- Optimize for performance with large transaction lists

---

## Epic 5: Spending Dashboard & Visualization

**Goal:** Provide real-time visibility into spending vs budget. Users see categorized spending, budget status, and remaining amounts per category in a clear, visual dashboard.

### Story 5.1: Transaction Display & Filtering

As a user,
I want to view all my transactions in a clear, organized table,
So that I have complete visibility into my spending.

**Acceptance Criteria:**

**Given** I have imported transactions
**When** I view the transactions page
**Then** I see:

- Table/list of all transactions
- Sortable by date, amount, category, merchant
- Filterable by category, date range, amount range
- Searchable by merchant name or description
- Pagination for large transaction lists

**And** transactions display with: date, amount, merchant, category, description
**And** sorting and filtering work smoothly
**And** search returns relevant results quickly

**Prerequisites:** Story 4.2 (Manual Categorization)

**Technical Notes:**

- Create API endpoint: GET /api/transactions (with query params: category, dateFrom, dateTo, search, sort, page)
- Create React component: TransactionTable, TransactionList
- Implement client-side or server-side filtering/sorting
- Add pagination component
- Create search input component
- Add filter UI (category dropdown, date range picker)
- Optimize queries with database indexes

---

### Story 5.2: Spending Summary by Category

As a user,
I want to see my current spending broken down by category,
So that I understand where my money is going.

**Acceptance Criteria:**

**Given** I have categorized transactions
**When** I view the spending summary
**Then** I see:

- Total spending displayed prominently
- Spending broken down by category
- Visual representation (bars, charts) of spending per category
- Category spending totals are accurate and up-to-date

**And** spending is calculated for the current month
**And** I can see spending for previous months (optional)
**And** visualizations are clear and easy to understand

**Prerequisites:** Story 5.1 (Transaction Display)

**Technical Notes:**

- Create API endpoint: GET /api/spending/summary?month=YYYY-MM
- Calculate spending totals grouped by category
- Create React component: SpendingSummary, CategorySpendingChart
- Use charting library (Recharts, Chart.js, or similar)
- Display bar chart or pie chart of category spending
- Add month selector for historical view
- Cache spending calculations for performance

---

### Story 5.3: Budget Status & Remaining Budget

As a user,
I want to see my remaining budget per category,
So that I know exactly how much I have left to spend in each category.

**Acceptance Criteria:**

**Given** I have set budgets and spending data
**When** I view the budget status
**Then** I see:

- Remaining budget calculated: Budget - Actual Spending
- Visual indicators: Green (under budget), Yellow (approaching), Red (over budget)
- Percentage of budget used displayed
- Overall monthly budget status summary

**And** budget status updates in real-time as transactions are added
**And** visual indicators are clear and intuitive
**And** I can see both remaining amount and percentage

**Prerequisites:** Story 5.2 (Spending Summary)

**Technical Notes:**

- Create API endpoint: GET /api/budgets/status?month=YYYY-MM
- Calculate: remaining = budget - actual spending
- Calculate percentage: (actual / budget) \* 100
- Create React component: BudgetStatus, BudgetIndicator
- Add color coding logic (green < 80%, yellow 80-100%, red > 100%)
- Display progress bars or visual indicators
- Update calculations when transactions change

---

### Story 5.4: Real-Time Dashboard Updates

As a user,
I want the dashboard to update automatically as transactions are processed,
So that I always see current, accurate data.

**Acceptance Criteria:**

**Given** I have the dashboard open
**When** transactions are imported or categories are changed
**Then** the dashboard:

- Refreshes automatically after transaction import
- Updates budget calculations in real-time
- Shows loading states during updates
- Doesn't require page refresh

**And** updates happen smoothly without flickering
**And** I can see when data is being updated
**And** the dashboard remains responsive during updates

**Prerequisites:** Story 5.3 (Budget Status)

**Technical Notes:**

- Implement real-time updates using React state management
- Use SWR or React Query for data fetching and caching
- Add optimistic UI updates
- Create loading skeleton components
- Implement debouncing for rapid updates
- Add WebSocket or polling for real-time sync (optional for MVP)
- Handle error states gracefully

---

### Story 5.5: Dashboard UI & Layout

As a user,
I want a well-designed dashboard that shows key information at a glance,
So that I can quickly understand my financial situation.

**Acceptance Criteria:**

**Given** I am logged in
**When** I view the dashboard
**Then** I see:

- At-a-glance view: Total spending, remaining budget, top categories
- Visual bars/charts showing budget vs actual spending
- Color coding for budget status
- Click to drill down into category details
- Responsive design (works on mobile)

**And** the layout is clean and uncluttered
**And** key metrics are prominently displayed
**And** navigation to detailed views is intuitive

**Prerequisites:** Story 5.4 (Real-Time Updates)

**Technical Notes:**

- Create dashboard page: /dashboard or /
- Design responsive layout with grid/flexbox
- Create dashboard components: SummaryCards, BudgetChart, CategoryList
- Add navigation to detailed views (transactions, categories)
- Implement mobile-responsive design
- Add empty states for new users
- Follow UX design principles from PRD

---

## Epic 6: Budget Planning & Goal Setting

**Goal:** Help users plan next month's budget proactively using historical spending data. Users can set goals and create budgets based on actual spending patterns.

### Story 6.1: Next Month Budget Creation

As a user,
I want to create a budget for next month,
So that I can plan my spending proactively.

**Acceptance Criteria:**

**Given** I am in the current month
**When** I create next month's budget
**Then** I can:

- Create new monthly budget for upcoming month
- Set budget amounts for each category
- Save the budget before the month starts
- Edit the budget before the month starts

**And** budgets are month-specific (don't overwrite previous months)
**And** I can see which months have budgets set
**And** the budget is ready when the new month begins

**Prerequisites:** Story 2.2 (Budget Assignment)

**Technical Notes:**

- Create API endpoint: POST /api/budgets (with month parameter)
- Create API endpoint: GET /api/budgets?month=YYYY-MM
- Validate month is in the future or current month
- Create React component: BudgetPlanner, MonthSelector
- Add budget creation page/route: /budget/plan
- Display existing budgets for reference
- Add month navigation (previous/next)

---

### Story 6.2: Historical Data Integration

As a user,
I want to use last month's spending as a starting point for next month's budget,
So that planning is easier and based on actual data.

**Acceptance Criteria:**

**Given** I have spending data from previous months
**When** I create next month's budget
**Then** I can:

- Pull previous month's spending as starting point
- Use one-click action to copy spending to budget
- Adjust amounts from historical data
- See suggested budget amounts based on history

**And** historical data is clearly displayed
**And** I can compare multiple months (optional)
**And** suggestions are helpful but not prescriptive

**Prerequisites:** Story 6.1 (Budget Creation)

**Technical Notes:**

- Create API endpoint: GET /api/spending/history?months=N
- Calculate average spending per category across months
- Create React component: HistoricalSpending, BudgetSuggestions
- Add "Copy from last month" button/action
- Display historical spending alongside budget inputs
- Add comparison view (optional)
- Implement suggestion algorithm (average, trend, etc.)

---

### Story 6.3: Goal Setting & Tracking

As a user,
I want to set goals for different categories,
So that I can make intentional spending decisions.

**Acceptance Criteria:**

**Given** I have categories
**When** I set a goal for a category
**Then** I can:

- Set spending goal per category
- Goals can be different from current month's budget
- View goals in the dashboard
- See progress toward goals

**And** goals are tracked and displayed clearly
**And** progress visualization shows how close I am to goals
**And** goals persist across months (optional)

**Prerequisites:** Story 6.2 (Historical Data)

**Technical Notes:**

- Extend Budget model or create Goal model: userId, categoryId, targetAmount, targetMonth
- Create API endpoint: POST /api/goals
- Create API endpoint: GET /api/goals?month=YYYY-MM
- Calculate goal progress: (actual / goal) \* 100
- Create React component: GoalSetter, GoalProgress
- Add goal display to dashboard
- Visualize goal progress with progress bars
- Add goal reminders/notifications (optional)

---

### Story 6.4: Budget Planning UI

As a user,
I want an intuitive interface for planning my budget,
So that I can easily set up next month's spending plan.

**Acceptance Criteria:**

**Given** I want to plan next month's budget
**When** I use the budget planning interface
**Then** I see:

- Visual interface for setting budget amounts
- Previous month's spending displayed for reference
- Sliders or input fields for each category
- Preview of total budget before saving
- Clear save/cancel actions

**And** the interface is easy to use
**And** I can adjust budgets quickly
**And** changes are saved immediately or on confirmation

**Prerequisites:** Story 6.3 (Goal Setting)

**Technical Notes:**

- Create budget planning page: /budget/plan
- Design form with category budget inputs
- Add sliders or number inputs for budget amounts
- Display total budget calculation
- Add "Copy from last month" quick action
- Show historical spending for context
- Implement form validation
- Add confirmation before saving

---

## Epic 7: AI Chat Interface

**Goal:** Provide proactive AI guidance for budget insights and planning. Users can ask questions about spending and receive actionable advice, not just data display.

### Story 7.1: Conversational Chat Interface

As a user,
I want to ask questions about my spending and budget via chat,
So that I can get insights and guidance in a conversational way.

**Acceptance Criteria:**

**Given** I am logged in
**When** I open the AI chat interface
**Then** I can:

- Type questions in natural language
- See chat history preserved
- Access chat from dashboard
- Receive relevant, helpful answers

**And** the interface is conversational and friendly
**And** responses are clear and actionable
**And** chat works smoothly without lag

**Prerequisites:** Story 5.5 (Dashboard UI)

**Technical Notes:**

- Integrate OpenAI API or similar AI service
- Create API endpoint: POST /api/chat
- Create React component: ChatInterface, ChatMessage, ChatInput
- Implement chat history storage (database or session)
- Add chat UI to dashboard or separate page
- Handle streaming responses (optional)
- Add loading states and error handling

---

### Story 7.2: Budget Insights & Analysis

As a user,
I want AI to analyze my spending patterns and provide insights,
So that I get actionable advice, not just numbers.

**Acceptance Criteria:**

**Given** I have spending data
**When** I ask AI about my spending
**Then** AI:

- Analyzes spending patterns
- Suggests optimizations ("You've spent $X on dining, reduce to $Y to save $Z")
- Helps plan next month's budget
- Provides specific, actionable responses (not generic)

**And** insights reference actual spending amounts
**And** suggestions are relevant to my categories
**And** responses are helpful and personalized

**Prerequisites:** Story 7.1 (Chat Interface)

**Technical Notes:**

- Create prompt engineering for budget analysis
- Pass user's transaction data to AI context
- Analyze spending patterns: totals, trends, outliers
- Generate insights: overspending alerts, savings opportunities
- Create budget suggestions based on history
- Format AI responses with clear structure
- Add context about user's categories and budgets

---

### Story 7.3: Context-Aware AI Responses

As a user,
I want AI to understand my current spending context,
So that responses are relevant and personalized.

**Acceptance Criteria:**

**Given** I am chatting with AI
**When** AI responds to my questions
**Then** AI:

- Has access to my transaction data
- References actual spending amounts
- Bases suggestions on my categories and budgets
- Remembers conversation context within session

**And** responses feel personalized, not generic
**And** AI understands my specific financial situation
**And** context is used effectively in responses

**Prerequisites:** Story 7.2 (Budget Insights)

**Technical Notes:**

- Pass user's data to AI: transactions, categories, budgets, spending summary
- Implement context window management
- Create system prompts that include user context
- Track conversation history for context
- Add user data summarization for AI context
- Optimize token usage while maintaining context
- Test with various user scenarios

---

### Story 7.4: AI Chat UI & Integration

As a user,
I want a polished AI chat experience integrated into the app,
So that getting budget guidance feels natural and helpful.

**Acceptance Criteria:**

**Given** I am using FinSight
**When** I interact with AI chat
**Then** I see:

- Conversational, friendly interface
- Quick action buttons for common questions
- Context-aware suggestions based on current spending
- Visual elements in chat (charts, numbers) when relevant

**And** the chat is accessible from key pages
**And** responses include visual data when helpful
**And** the experience feels polished and professional

**Prerequisites:** Story 7.3 (Context Awareness)

**Technical Notes:**

- Design chat UI component with modern styling
- Add quick action buttons: "Analyze spending", "Plan budget", "Find savings"
- Integrate charts/visualizations in chat responses
- Add chat to dashboard, budget planning page
- Implement message formatting (markdown support)
- Add typing indicators and smooth animations
- Test user experience with real scenarios

---

## Epic Breakdown Summary

### Complete Story Count

**Total Epics:** 7
**Total Stories:** 30

**Breakdown by Epic:**

- Epic 1: Foundation & Infrastructure - 5 stories
- Epic 2: Category & Budget Management - 3 stories
- Epic 3: Transaction Import & Processing - 5 stories
- Epic 4: Intelligent Categorization System - 4 stories
- Epic 5: Spending Dashboard & Visualization - 5 stories
- Epic 6: Budget Planning & Goal Setting - 4 stories
- Epic 7: AI Chat Interface - 4 stories

### Story Quality Validation

✅ **All functional requirements from PRD are covered:**

- FR1: User Management → Epic 1 (Story 1.3)
- FR2: Category Management → Epic 2 (Stories 2.1, 2.2, 2.3)
- FR3: Transaction Import & Processing → Epic 3 (Stories 3.1-3.5)
- FR4: Intelligent Categorization → Epic 4 (Stories 4.1-4.4)
- FR5: Spending Dashboard → Epic 5 (Stories 5.1-5.5)
- FR6: Budget Planning → Epic 6 (Stories 6.1-6.4)
- FR7: AI Chat Interface → Epic 7 (Stories 7.1-7.4)

✅ **Epic 1 establishes proper foundation:**

- Story 1.1 is project setup/infrastructure initialization
- Foundation enables all subsequent work

✅ **All stories are vertically sliced:**

- Each story delivers complete functionality (not just one layer)
- Stories include both backend API and frontend UI components

✅ **No forward dependencies exist:**

- All prerequisites reference previous stories only
- Sequential ordering enables incremental value delivery

✅ **Story sizing is appropriate:**

- Stories are small enough for single-session completion
- Clear BDD acceptance criteria for testability
- Technical notes provide implementation guidance

✅ **BDD format provides clarity:**

- All stories use Given/When/Then format
- Acceptance criteria are testable and specific

✅ **Domain/compliance requirements properly distributed:**

- Security requirements in Epic 1 (Story 1.3, 1.4)
- Data handling in Epic 3 (Story 3.3, 3.4)
- User privacy considerations throughout

✅ **Sequencing enables incremental value delivery:**

- Foundation → Categories → Data → Intelligence → Visualization → Planning → AI
- Each epic builds on previous ones
- Each epic delivers independent value

### Ready for Implementation

This epic breakdown is ready for:

1. **Architecture Phase** - Technical design and system architecture
2. **Implementation Phase** - Story-by-story development
3. **Testing Phase** - BDD acceptance criteria provide test cases

**Next Steps:**

- Run `*create-architecture` workflow to design technical architecture
- Begin implementation with Epic 1, Story 1.1 (Project Setup)
- Use individual story files for detailed implementation planning

---
