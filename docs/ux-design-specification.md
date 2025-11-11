# FinSight UX Design Specification

_Created on 2025-01-27 by Sam_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

FinSight is a personal finance management platform that automates budgeting through intelligent transaction categorization and AI-powered guidance. The UX design prioritizes making users feel **productive**, **clear and focused**, and **relieved** - transforming financial planning from stressful to empowering.

**Core Experience:** Effortless transaction upload → intelligent categorization review → clean dashboard → easy budget management

**Desired Emotional Response:** Users should feel productive (accomplishing something meaningful), clear and focused (understanding finances without confusion), and relieved (planning reduces stress and supports self-improvement).

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Selected System:** shadcn/ui

**Rationale:**
- **Perfect Next.js Integration:** Built specifically for Next.js applications, seamless setup
- **Tailwind CSS Based:** Modern, flexible styling that aligns with clean, minimal aesthetic
- **Copy-Paste Components:** Components are copied into your project (not a dependency), giving full control and customization
- **Accessible by Default:** Built on Radix UI primitives, ensuring WCAG compliance out of the box
- **Customizable:** Easy to theme and modify to match FinSight's brand personality
- **Modern & Clean:** Supports the clean, focused interface inspired by Mint and ChatGPT
- **Developer-Friendly:** TypeScript support, excellent documentation, active community

**What It Provides:**
- Complete component library (buttons, forms, cards, modals, tables, etc.)
- Accessible primitives (Radix UI foundation)
- Theming system (CSS variables for easy color customization)
- Responsive patterns built-in
- Icon library integration (Lucide React recommended)

**Customization Approach:**
- Use shadcn/ui components as foundation
- Customize colors, spacing, and typography to match FinSight's personality
- Build custom components for unique needs (transaction categorization interface, budget editing)
- Maintain consistency while allowing brand expression

**Version:** Latest stable (2025)

---

## 2. Core User Experience

### 2.1 Defining Experience

**The Core Action:** Users upload transactions anytime they want to update their dashboard, review and correct categorization, then view their spending vs budget for the month.

**Critical User Flows:**
1. **Transaction Upload** - Effortless upload with bank-agnostic parsing
2. **Categorization Review** - Easy review and correction of auto-categorized transactions (critical to get right)
3. **Dashboard View** - Clean, simple, easy-to-follow display of category spending and budget status
4. **Budget Management** - Easy editing and saving of monthly budgets

**Platform:** Web Application (responsive design for desktop and mobile)

**The Defining Experience:** "Upload your transactions, review and correct how they're categorized, then see your spending vs budget in a clean dashboard — all effortlessly."

This follows established UX patterns (file upload → review → dashboard), allowing us to use proven patterns rather than inventing novel interactions.

### 2.2 Core Experience Principles

**Speed:** Fast and efficient
- Upload completes quickly
- Categorization review is streamlined
- Dashboard loads instantly

**Guidance:** Clear and helpful
- System guides users through categorization
- Shows what needs attention
- Makes budget status obvious at a glance

**Flexibility:** User control
- Easy to correct categorization
- Simple budget editing
- Users stay in control of their data

**Feedback:** Clear and immediate
- Progress indicators during upload
- Clear categorization status
- Visual budget indicators (green/yellow/red for under/approaching/over budget)

### 2.3 Desired Emotional Response

**Primary Emotions:**
- **Productive** - Users feel they're accomplishing something meaningful
- **Clear and Focused** - Understanding their finances without confusion or overwhelm
- **Relieved** - Planning reduces stress and supports self-improvement

**Design Implications:**
- Calm, supportive, and empowering interface (not overwhelming or judgmental)
- Clear visual hierarchy that guides attention without stress
- Positive reinforcement for taking control of finances
- Simple, focused interactions that reduce cognitive load

### 2.4 Design Inspiration Analysis

**Mint (Intuit) - What Made It Great:**
- **Clean Dashboard:** Simple, uncluttered layout that showed key information at a glance
- **Visual Budget Tracking:** Clear progress bars and color coding (green/yellow/red) for budget status
- **Easy Categorization:** Simple, intuitive transaction categorization workflow
- **Clear Navigation:** Straightforward navigation without overwhelming options
- **Focus on Clarity:** Every element served a purpose - no unnecessary complexity

**ChatGPT - What Makes It Compelling:**
- **Extreme Simplicity:** Minimal interface with maximum focus on the conversation
- **Clean Typography:** Clear, readable fonts with excellent spacing
- **Distraction-Free:** No unnecessary UI elements competing for attention
- **Lots of White Space:** Breathing room that reduces cognitive load
- **Focused Experience:** Single, clear purpose - just the conversation

**Key Patterns to Apply:**
- Clean, minimal interface with clear visual hierarchy
- Color-coded budget status (green/yellow/red) for instant understanding
- Generous white space for clarity and focus
- Simple, purposeful navigation
- Distraction-free experience that keeps users focused on their financial goals

---

## 3. Visual Foundation

### 3.1 Color System

**Selected Theme:** Calm & Focused

**Rationale:** Soft greens and blues create a calming atmosphere that reduces financial stress. This theme helps users feel relieved and focused while managing their budget, perfectly aligning with the desired emotional response of feeling productive, clear, and relieved.

**Color Palette:**

**Primary Colors:**
- **Primary:** #0d9488 (Teal) - Main actions, key elements, links
- **Secondary:** #0891b2 (Cyan) - Supporting actions, secondary buttons
- **Accent:** #6366f1 (Indigo) - Highlights, special emphasis

**Semantic Colors:**
- **Success:** #14b8a6 (Green-teal) - Under budget, positive states
- **Warning:** #fbbf24 (Amber) - Approaching budget limit
- **Error:** #f87171 (Coral-red) - Over budget, errors
- **Info:** #38bdf8 (Sky blue) - Informational messages

**Neutral Colors:**
- **White:** #ffffff - Background, cards
- **Background:** #f8fafc - Page background, subtle surfaces
- **Border:** #e2e8f0 - Dividers, input borders
- **Text Secondary:** #64748b - Supporting text, labels
- **Text Primary:** #0f172a - Main text, headings

**Color Usage Guidelines:**
- **Budget Status Indicators:** 
  - Green (#14b8a6) = Under budget
  - Yellow/Amber (#fbbf24) = Approaching limit (80-100%)
  - Red (#f87171) = Over budget
- **Primary actions:** Use teal (#0d9488) for main CTAs
- **Secondary actions:** Use cyan (#0891b2) for supporting actions
- **Backgrounds:** Use white (#ffffff) for cards, #f8fafc for page background
- **Text:** Use #0f172a for primary text, #64748b for secondary text

**Accessibility:**
- All text meets WCAG AA contrast requirements (4.5:1 minimum)
- Color is never the sole indicator (icons and text accompany colors)

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

### 3.2 Typography System

**Font Families:**
- **Headings & Body:** System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif)
  - Clean, readable, fast-loading
  - Consistent across platforms
- **Monospace:** 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace
  - For code, transaction IDs, technical data

**Type Scale:**
- **H1:** 2rem (32px) / 600 weight / 1.2 line-height - Page titles
- **H2:** 1.5rem (24px) / 600 weight / 1.3 line-height - Section headers
- **H3:** 1.25rem (20px) / 600 weight / 1.4 line-height - Subsection headers
- **H4:** 1.125rem (18px) / 600 weight / 1.4 line-height - Card titles
- **Body:** 1rem (16px) / 400 weight / 1.6 line-height - Main content
- **Small:** 0.875rem (14px) / 400 weight / 1.5 line-height - Supporting text
- **Tiny:** 0.75rem (12px) / 400 weight / 1.4 line-height - Labels, captions

**Font Weights:**
- **400 (Regular):** Body text, descriptions
- **500 (Medium):** Labels, button text
- **600 (Semibold):** Headings, emphasized text

**Line Heights:**
- Headings: 1.2-1.4 (tighter for visual hierarchy)
- Body: 1.6 (comfortable reading)
- Small text: 1.4-1.5 (balanced for smaller sizes)

### 3.3 Spacing & Layout Foundation

**Base Unit:** 4px (all spacing multiples of 4)

**Spacing Scale:**
- **xs:** 4px (0.25rem) - Tight spacing, icon padding
- **sm:** 8px (0.5rem) - Small gaps, compact layouts
- **md:** 16px (1rem) - Standard spacing, element gaps
- **lg:** 24px (1.5rem) - Section spacing, card padding
- **xl:** 32px (2rem) - Large gaps, major sections
- **2xl:** 48px (3rem) - Extra large, page sections
- **3xl:** 64px (4rem) - Maximum spacing, hero sections

**Layout Grid:**
- **Desktop:** 12-column grid with 24px gutters
- **Tablet:** 8-column grid with 16px gutters
- **Mobile:** Single column, 16px side padding

**Container Widths:**
- **Desktop:** Max-width 1280px, centered
- **Tablet:** Max-width 768px
- **Mobile:** Full width with 16px padding

**Component Spacing:**
- **Card padding:** 24px (lg)
- **Button padding:** 12px horizontal, 8px vertical
- **Input padding:** 12px horizontal, 10px vertical
- **Section spacing:** 48px (2xl) between major sections

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Selected Direction:** Hybrid - Dense Information Layout + Summary Cards

**Rationale:** Combines the information-rich, efficient layout of Direction 2 with the clear summary overview from Direction 6. This provides both high-level visibility (summary cards) and detailed category information in a compact, efficient layout.

**Layout Decisions:**

**Navigation Pattern:** Top navigation bar
- Clean, horizontal navigation
- Persistent access to all sections
- Works well on both desktop and mobile

**Content Structure:** Two-tier layout
- **Top Tier:** Summary cards showing Total Spent, Budget, and Remaining (from Direction 6)
- **Main Content:** Dense, multi-column layout showing all categories at once (from Direction 2)

**Content Organization:** 
- Summary cards in a row at the top (3 cards: Spent, Budget, Remaining)
- Main content area split into columns showing category details
- Each category card shows: name, amount spent/budget, progress bar, status

**Visual Hierarchy:**
- **Visual Density:** Dense (information-rich, efficient use of space)
- **Header Emphasis:** Clear but not overwhelming
- **Content Focus:** Data-driven, scannable lists

**Interaction Patterns:**
- **Primary Actions:** Top navigation for main sections
- **Information Disclosure:** All categories visible at once (no progressive disclosure needed)
- **User Control:** Easy to scan and compare categories side-by-side

**Visual Style:**
- **Weight:** Balanced (clear structure, moderate visual weight)
- **Depth Cues:** Subtle elevation on cards, clear borders
- **Border Style:** Subtle borders for definition

**User Reasoning:** 
- Wants to see summary overview (Total Spent, Budget, Remaining) prominently
- Prefers efficient, information-rich layout that shows all categories without scrolling
- Values being able to compare categories side-by-side
- Appreciates compact design that maximizes information visibility

**Interactive Mockups:**

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

#### Journey 1: First-Time User Onboarding & Setup

**User Goal:** Set up account and upload first transactions

**Flow Steps:**

1. **Login/Signup Screen**
   - User sees: Simple login form or signup option
   - User does: Creates account or logs in
   - System responds: Redirects to onboarding

2. **Category Creation (Onboarding)**
   - User sees: "Create Your Budget Categories" screen
   - User does: Creates custom categories (e.g., Groceries, Dining Out, Entertainment)
   - System responds: Saves categories, shows "Next: Upload Transactions"

3. **Transaction Upload**
   - User sees: Upload screen with drag-and-drop area
   - User does: Uploads CSV/PDF files (can upload multiple at once)
   - System responds: Shows parsing progress, then displays uploaded transactions

4. **Review & Correct Categorization**
   - User sees: List of all transactions with:
     - Parsed data (date, amount, merchant) - verify parsing is correct
     - AI-suggested category (dropdown to change)
     - Status indicator (needs review / reviewed)
   - User does: Reviews each transaction, changes category if needed
   - System responds: Saves changes, shows "X transactions reviewed"

5. **Dashboard View**
   - User sees: Complete dashboard with spending vs budget
   - User does: Views their financial overview
   - System responds: Shows all categories with current spending

**Success State:** User sees their complete budget dashboard with categorized transactions

---

#### Journey 2: Returning User - Upload New Transactions

**User Goal:** Add new transactions and update dashboard

**Flow Steps:**

1. **Dashboard View**
   - User sees: Current budget dashboard
   - User does: Clicks "Upload Transactions" button (prominent on dashboard)
   - System responds: Opens upload screen

2. **Transaction Upload**
   - User sees: Upload screen (same as onboarding)
   - User does: Uploads CSV/PDF files (multiple files supported)
   - System responds: Parses files, shows uploaded transactions

3. **Review & Correct Categorization**
   - User sees: List of new transactions with:
     - Parsed data verification (date, amount, merchant)
     - AI-suggested category based on learning from previous corrections
     - Quick category change dropdown
   - User does: Reviews and corrects categories as needed
   - System responds: Saves changes, shows summary

4. **Updated Dashboard**
   - User sees: Dashboard automatically updates with new transactions
   - User does: Views updated spending vs budget
   - System responds: Shows real-time budget calculations

**Success State:** Dashboard reflects new transactions with accurate categorization

---

#### Journey 3: Budget Management

**User Goal:** Edit monthly budget amounts

**Flow Steps:**

1. **Dashboard View**
   - User sees: Current budget dashboard
   - User does: Clicks "Edit Budget" button or clicks on a category
   - System responds: Opens budget editing interface

2. **Budget Editing**
   - User sees: List of all categories with current budget amounts
   - User does: Edits budget amounts (input fields or sliders)
   - System responds: Shows preview of changes, calculates total

3. **Save Budget**
   - User sees: "Save Budget" button with preview
   - User does: Confirms and saves
   - System responds: Updates dashboard with new budget amounts

**Success State:** Budget updated, dashboard reflects new budget limits

---

**Flow Approach:** Single-screen inline editing
- All transactions visible at once
- Inline category editing (dropdown next to each transaction)
- No wizard steps - everything on one screen
- Quick and efficient for power users who want to see everything

**Error States:**
- **Parsing Error:** Clear message showing which file had issues, option to retry
- **Duplicate Detection:** Shows duplicates found, option to skip or import
- **Invalid File:** Clear error message, shows supported formats

**Decision Points:**
- Category creation: User can add categories during onboarding or later
- Transaction review: User can review all or mark as "reviewed later"
- Budget editing: Can edit individual categories or all at once

---

## 6. Component Library

### 6.1 Component Strategy

**Design System Foundation:** shadcn/ui provides base components

**Components Provided by shadcn/ui:**
- Buttons (primary, secondary, outline variants)
- Form inputs (text, number, select, dropdown)
- Cards (base card component)
- Tables (base table structure)
- Modals/Dialogs
- Alerts/Toasts
- Progress bars (base component)
- Badges
- Icons (via Lucide React)

**Custom Components Needed:**

#### 1. Transaction Upload Component
**Purpose:** Allow users to upload CSV/PDF transaction files with drag-and-drop support

**Anatomy:**
- Upload area (drag-and-drop zone)
- File list showing uploaded files
- Progress indicator during parsing
- File removal option

**States:**
- Default: Empty upload area with instructions
- Dragging: Visual feedback (highlighted border)
- Uploading: Progress indicator
- Success: Files listed, ready for review
- Error: Error message with retry option

**Variants:**
- Single file upload
- Multiple file upload (default)

**Behavior:**
- Drag-and-drop or click to browse
- Supports CSV and PDF formats
- Shows file name and size
- Validates file format before upload

**Accessibility:**
- ARIA role: region
- Keyboard navigation: Tab to upload area, Enter to activate
- Screen reader: "File upload area, drag files here or click to browse"

---

#### 2. Transaction Review Table
**Purpose:** Display uploaded transactions with inline category editing

**Anatomy:**
- Table header (Date, Amount, Merchant, Category, Actions)
- Table rows (one per transaction)
- Category dropdown (inline editing)
- Status indicator (needs review / reviewed)
- Bulk actions (select all, bulk category change)

**States:**
- Default: All transactions visible
- Editing: Category dropdown open
- Reviewed: Visual indicator (checkmark or different color)
- Needs Review: Highlighted or badge

**Variants:**
- Compact view (more transactions visible)
- Detailed view (more information per transaction)

**Behavior:**
- Click category dropdown to change
- Auto-save on category change (or manual save button)
- Filter by "needs review" status
- Sort by date, amount, category

**Accessibility:**
- ARIA role: table
- Keyboard navigation: Arrow keys to navigate rows, Enter to edit
- Screen reader: Announces transaction details and category

---

#### 3. Budget Category Card
**Purpose:** Display category spending vs budget with visual progress

**Anatomy:**
- Category name
- Amount spent / Budget amount
- Progress bar (visual indicator)
- Status badge (On Track, Warning, Over Budget)
- Remaining amount

**States:**
- Default: Shows current spending
- Hover: Slight elevation, shows "Edit" option
- Click: Opens budget editing modal

**Variants:**
- Compact card (for dense layout)
- Detailed card (with more information)

**Behavior:**
- Progress bar color changes based on percentage:
  - Green (#14b8a6): Under 80% of budget
  - Yellow/Amber (#fbbf24): 80-100% of budget
  - Red (#f87171): Over budget
- Click to edit budget amount

**Accessibility:**
- ARIA role: article
- Keyboard navigation: Tab to card, Enter to edit
- Screen reader: "Groceries category, $450 spent of $500 budget, $50 remaining"

---

#### 4. Budget Summary Cards
**Purpose:** Show high-level overview (Total Spent, Budget, Remaining)

**Anatomy:**
- Card background (gradient from Calm & Focused theme)
- Label (e.g., "Total Spent")
- Large amount value
- Optional: Trend indicator or percentage

**States:**
- Default: Shows current month's summary
- Hover: Slight scale effect

**Variants:**
- Three cards in a row (Spent, Budget, Remaining)
- Single summary card (all three values)

**Behavior:**
- Updates automatically when transactions are added
- Click to drill down to detailed view

**Accessibility:**
- ARIA role: region
- Keyboard navigation: Tab to card
- Screen reader: "Total spent, $750"

---

#### 5. Category Creation Interface
**Purpose:** Allow users to create custom budget categories during onboarding

**Anatomy:**
- Input field for category name
- Optional: Budget amount input
- Add button
- List of created categories
- Remove option for each category

**States:**
- Default: Empty list, ready to add
- Adding: Input field active
- Has Categories: List displayed with remove options

**Variants:**
- Onboarding flow (required step)
- Settings page (can add anytime)

**Behavior:**
- Add category with name
- Optionally set initial budget amount
- Remove category (with confirmation if it has transactions)
- Validate: No duplicate names

**Accessibility:**
- ARIA role: form
- Keyboard navigation: Tab through inputs, Enter to add
- Screen reader: "Category creation form"

---

**Components Requiring Heavy Customization:**

#### Progress Bars (from shadcn/ui)
**Customization:**
- Custom colors for budget status (green/yellow/red)
- Custom height and styling
- Animated fill on load
- Percentage display

#### Tables (from shadcn/ui)
**Customization:**
- Inline editing capability
- Custom row styling for reviewed/needs review
- Sticky header
- Responsive behavior (card view on mobile)

#### Cards (from shadcn/ui)
**Customization:**
- Budget category card styling
- Summary card gradients
- Hover effects
- Click interactions

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

These patterns ensure consistent UX across the entire FinSight application.

#### Button Hierarchy

**Primary Action:** Teal (#0d9488) button, solid background
- Usage: Main actions (Upload Transactions, Save Budget, Continue)
- Style: Bold, prominent, highest visual weight

**Secondary Action:** Cyan (#0891b2) button, solid background
- Usage: Supporting actions (Cancel, Back, View Details)
- Style: Medium visual weight

**Tertiary Action:** Outline button with teal border
- Usage: Less important actions (Edit, View More)
- Style: Subtle, lower visual weight

**Destructive Action:** Red (#f87171) button
- Usage: Delete, Remove, Clear
- Style: Clear but not overwhelming

---

#### Feedback Patterns

**Success:** Green badge/toast (#14b8a6)
- Pattern: Toast notification (top-right, auto-dismiss after 3 seconds)
- Usage: Transaction uploaded successfully, Budget saved, Category created
- Message: Clear, concise ("Transactions uploaded successfully")

**Error:** Red alert (#f87171)
- Pattern: Inline error message below input or toast for system errors
- Usage: Upload failed, Invalid file format, Network error
- Message: Specific, actionable ("File format not supported. Please upload CSV or PDF")

**Warning:** Amber badge (#fbbf24)
- Pattern: Inline warning or badge
- Usage: Approaching budget limit, Duplicate transactions detected
- Message: Informative ("You're approaching your Entertainment budget limit")

**Info:** Sky blue (#38bdf8)
- Pattern: Subtle info badge or inline message
- Usage: Helpful tips, System status
- Message: Helpful context ("AI categorized 45 of 50 transactions")

**Loading:** Skeleton screens or spinner
- Pattern: Skeleton screens for content loading, spinner for actions
- Usage: Uploading files, Processing transactions, Loading dashboard
- Placement: Where content will appear (not blocking)

---

#### Form Patterns

**Label Position:** Above input
- Rationale: Clear association, works well for mobile
- Style: Small, semibold label (#0f172a)

**Required Field Indicator:** Asterisk (*) + "required" text
- Style: Red asterisk, "required" text in label
- Usage: Only for truly required fields

**Validation Timing:** On blur (when user leaves field)
- Rationale: Not intrusive, allows natural typing
- Exception: Real-time for format validation (email, numbers)

**Error Display:** Inline below input
- Style: Red text (#f87171), clear message
- Shows: Specific error, how to fix

**Help Text:** Below input, smaller gray text
- Usage: Optional guidance, format examples
- Style: #64748b, 0.875rem

---

#### Modal Patterns

**Size Variants:**
- Small: 400px width - Simple confirmations
- Medium: 600px width - Forms, editing (default)
- Large: 800px width - Transaction review table

**Dismiss Behavior:**
- Click outside: Closes modal (with unsaved changes warning)
- Escape key: Closes modal
- Close button: Top-right X button
- Cancel button: Secondary action button

**Focus Management:**
- Auto-focus: First input field when modal opens
- Trap focus: Tab stays within modal
- Return focus: To trigger element when modal closes

**Stacking:** Only one modal at a time (no nested modals)

---

#### Navigation Patterns

**Active State Indication:** Underline + color change
- Style: Teal (#0d9488) underline, teal text
- Usage: Current page/section in top navigation

**Breadcrumb Usage:** Not needed (simple navigation structure)

**Back Button Behavior:** Browser back button (standard web behavior)

**Deep Linking:** Supported for all main sections
- Dashboard: `/dashboard`
- Transactions: `/transactions`
- Budget: `/budget`
- Settings: `/settings`

---

#### Empty State Patterns

**First Use (No Transactions):**
- Message: "Upload your first transactions to get started"
- CTA: "Upload Transactions" button
- Illustration: Simple icon or graphic

**No Results (Filtered Search):**
- Message: "No transactions match your filters"
- CTA: "Clear Filters" button

**Cleared Content:**
- Message: "No transactions in this category"
- CTA: None (informational only)

---

#### Confirmation Patterns

**Delete Category:**
- Always confirm if category has transactions
- Modal: "Delete Groceries category? This will uncategorize 45 transactions."
- Options: Cancel, Delete

**Leave Unsaved Changes:**
- Warn when leaving budget editing with unsaved changes
- Modal: "You have unsaved changes. Are you sure you want to leave?"
- Options: Stay, Leave

**Irreversible Actions:**
- Always confirm destructive actions
- Clear explanation of consequences

---

#### Notification Patterns

**Placement:** Top-right corner
- Rationale: Doesn't block content, standard web pattern

**Duration:** 
- Success: 3 seconds auto-dismiss
- Error: 5 seconds (user needs time to read)
- Info: 4 seconds

**Stacking:** New notifications appear below existing ones
- Max: 3 visible at once, then stack

**Priority Levels:**
- Critical: Red, persistent until dismissed (system errors)
- Important: Amber, 5 seconds (warnings)
- Info: Blue, 3 seconds (success messages)

---

#### Search Patterns

**Trigger:** Manual (search icon/input in navigation)
- Rationale: Not needed on every page, keep UI clean

**Results Display:** Instant (as user types)
- Shows: Matching transactions in dropdown
- Highlights: Search term in results

**Filters:** Separate filter section (not in search)
- Placement: Above transaction list
- Options: Date range, category, amount range

**No Results:** 
- Message: "No transactions found matching 'coffee'"
- Suggestions: "Try a different search term" or "Clear filters"

---

#### Date/Time Patterns

**Format:** Relative for recent, absolute for older
- Recent: "2 days ago", "Last week"
- Older: "January 15, 2025"
- Threshold: 7 days (relative vs absolute)

**Timezone Handling:** User's local timezone
- Display: All dates/times in user's local time
- Storage: UTC in database

**Date Pickers:** Calendar dropdown
- Style: shadcn/ui date picker component
- Usage: Filter by date range, select month for budget

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Target Devices:** Desktop (primary), Tablet, Mobile

**Breakpoint Strategy:**

**Mobile:** Up to 768px
- Single column layout
- Bottom navigation or hamburger menu
- Summary cards stack vertically
- Category cards full width
- Transaction table converts to card view
- Touch-optimized (larger tap targets, 44px minimum)

**Tablet:** 769px - 1024px
- 2-column layout for category cards
- Summary cards remain in row (3 cards)
- Side navigation collapses to hamburger
- Touch-optimized interactions

**Desktop:** 1025px and above
- Multi-column layout (2-3 columns for categories)
- Full top navigation visible
- Summary cards in row (3 cards)
- Hover states enabled
- Maximum content width: 1280px (centered)

**Adaptation Patterns:**

**Navigation:**
- Desktop: Full horizontal top navigation
- Tablet: Collapsible menu icon
- Mobile: Bottom navigation bar or hamburger menu

**Summary Cards:**
- Desktop: 3 cards in a row
- Tablet: 3 cards in a row (smaller)
- Mobile: Stack vertically, full width

**Category Cards:**
- Desktop: 2-3 columns grid
- Tablet: 2 columns grid
- Mobile: Single column, full width

**Transaction Table:**
- Desktop: Full table with all columns
- Tablet: Essential columns only, horizontal scroll for details
- Mobile: Card view (one transaction per card)

**Forms:**
- Desktop: Standard width inputs
- Mobile: Full width inputs, larger touch targets

**Modals:**
- Desktop: Centered modal (600px default)
- Mobile: Full screen modal

**Touch Targets:**
- Minimum size: 44px × 44px
- Spacing between targets: 8px minimum
- Buttons: Adequate padding for easy tapping

---

### 8.2 Accessibility Strategy

**WCAG Compliance Target:** Level AA

**Rationale:** 
- Personal finance application handling sensitive data
- Should be accessible to all users including those with disabilities
- Level AA is the recommended standard and legally required for many public-facing applications
- Achievable without compromising design

**Key Requirements:**

**Color Contrast:**
- Normal text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- All text meets WCAG AA standards
- Color is never the sole indicator (icons and text accompany colors)

**Keyboard Navigation:**
- All interactive elements accessible via keyboard
- Logical tab order (top to bottom, left to right)
- Visible focus indicators on all interactive elements
- Focus trap in modals
- Skip navigation link for main content

**Focus Indicators:**
- Visible focus outline on all interactive elements
- Style: 2px solid teal (#0d9488) outline
- High contrast for visibility
- Consistent across all components

**ARIA Labels:**
- Semantic HTML used where possible
- ARIA labels for icon-only buttons
- ARIA roles for custom components (transaction table, upload area)
- ARIA live regions for dynamic content updates
- Descriptive labels for screen readers

**Screen Reader Support:**
- Semantic HTML structure (headings, lists, tables)
- Alt text for all meaningful images
- Descriptive link text (not "click here")
- Form labels properly associated with inputs
- Error messages announced to screen readers

**Form Accessibility:**
- All inputs have associated labels
- Required fields clearly indicated
- Error messages associated with inputs (aria-describedby)
- Error messages announced when they appear
- Help text available for complex inputs

**Error Identification:**
- Clear, descriptive error messages
- Errors identified both visually and to screen readers
- Suggestions for fixing errors provided
- Errors persist until fixed or dismissed

**Touch Target Size:**
- Minimum 44px × 44px for mobile
- Adequate spacing between targets
- No overlapping interactive elements

**Testing Strategy:**

**Automated Testing:**
- Lighthouse accessibility audit (target: 90+ score)
- axe DevTools for component testing
- WAVE browser extension for page-level testing

**Manual Testing:**
- Keyboard-only navigation (no mouse)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast validation with tools
- Mobile device testing (touch targets, responsive behavior)

**Accessibility Features:**

**Skip Navigation:**
- "Skip to main content" link at top of page
- Visible on keyboard focus
- Allows keyboard users to skip navigation

**Loading States:**
- Loading indicators announced to screen readers
- Skeleton screens maintain layout structure
- Progress indicators have accessible labels

**Dynamic Content:**
- ARIA live regions for transaction updates
- Status changes announced to screen readers
- Toast notifications accessible

**Data Tables:**
- Proper table headers (th elements)
- Scope attributes for header cells
- Caption or aria-label for table purpose
- Responsive: Card view on mobile maintains semantic structure

---

## 9. Implementation Guidance

### 9.1 Completion Summary

**✅ UX Design Specification Complete!**

**What We Created Together:**

- **Design System:** shadcn/ui with 5 custom components (Transaction Upload, Transaction Review Table, Budget Category Card, Budget Summary Cards, Category Creation Interface)
- **Visual Foundation:** Calm & Focused color theme (teal/cyan palette) with system font typography and 4px spacing system
- **Design Direction:** Hybrid approach combining Dense Information Layout with Summary Cards - efficient, information-rich dashboard with clear overview
- **User Journeys:** 3 critical flows designed (First-Time Onboarding, Upload Transactions, Budget Management) with clear navigation paths
- **UX Patterns:** 9 pattern categories established for consistent experience (buttons, feedback, forms, modals, navigation, empty states, confirmations, notifications, search, date/time)
- **Responsive Strategy:** 3 breakpoints (mobile, tablet, desktop) with adaptation patterns for all device sizes
- **Accessibility:** WCAG 2.1 Level AA compliance requirements defined with comprehensive testing strategy

**Your Deliverables:**
- ✅ UX Design Document: `docs/ux-design-specification.md`
- ✅ Interactive Color Themes: `docs/ux-color-themes.html`
- ✅ Design Direction Mockups: `docs/ux-design-directions.html`

**What Happens Next:**
- Designers can create high-fidelity mockups from this foundation
- Developers can implement with clear UX guidance and rationale
- All design decisions are documented with reasoning for future reference

**Key Design Decisions Made:**
1. **Color Theme:** Calm & Focused (teal/cyan) - reduces financial stress, promotes clarity
2. **Design Direction:** Dense Information + Summary Cards - efficient, shows everything at once
3. **User Flow:** Single-screen inline editing - fast, no wizard steps
4. **Design System:** shadcn/ui - perfect Next.js integration, customizable
5. **Accessibility:** WCAG AA - inclusive design for all users

You've made thoughtful choices through visual collaboration that will create a great user experience. Ready for design refinement and implementation!

---

## Appendix

### Related Documents

- Product Requirements: `docs/PRD.md`
- Product Brief: `docs/product-brief-FinSight-2025-11-10.md`
- Brainstorming: `docs/bmm-brainstorming-session-2025-11-10.md`

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: `docs/ux-color-themes.html`
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: `docs/ux-design-directions.html`
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Optional Enhancement Deliverables

_This section will be populated if additional UX artifacts are generated through follow-up workflows._

<!-- Additional deliverables added here by other workflows -->

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

### Version History

| Date       | Version | Changes                         | Author |
| ---------- | ------- | ------------------------------- | ------ |
| 2025-01-27 | 1.0     | Initial UX Design Specification | Sam    |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._
