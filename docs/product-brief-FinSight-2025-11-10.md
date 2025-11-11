# Product Brief: FinSight

**Date:** 2025-11-10
**Author:** Sam
**Context:** Portfolio Project + Personal Use Tool

---

## Executive Summary

FinSight is a personal finance management platform that automates budgeting through intelligent transaction categorization and AI-powered guidance. The platform solves the critical problem that budgeting is too time-consuming and manual, causing people to abandon the practice entirely.

**The Problem:** Users spend hours each month manually reviewing transactions, editing spreadsheets, and planning budgets. This friction causes most people to give up on budgeting, leading to poor financial awareness.

**The Solution:** FinSight automates the entire workflow - users upload bank transactions (CSV/PDF), the system intelligently categorizes them, displays spending vs budget in a clear dashboard, and AI agents help plan next month's budget proactively.

**Target Users:** Financially conscious individuals who want to budget but don't want to spend time manually wrangling transaction sheets and maintaining spreadsheets.

**Key Differentiators:** 
- Super easy to use - minimal clicks, maximum intelligence
- Bank-agnostic parsing handles any bank's transaction format
- Proactive AI guidance, not just data display
- Intelligent categorization that learns from user corrections

**MVP Scope:** Login, category management, transaction upload with auto-categorization, spending dashboard, next month budget planning, and AI chat interface. Built with TypeScript + Next.js as both a portfolio showcase and personal use tool.

---

## Core Vision

### Initial Vision

FinSight is a personal finance management platform designed to make budgeting effortless through intelligent automation. The core value proposition is simplicity: users upload their bank transactions, the system automatically categorizes them, and AI agents provide proactive guidance for budget planning and spending optimization.

**Project Context:**
- **Dual Purpose:** Portfolio project to showcase technical skills to future employers + personal tool for actual use
- **Tech Stack:** TypeScript + Next.js
- **Core Differentiator:** Super easy to manage - simply upload transactions, smart categorize to personalized categories, show spending, and assist in planning next budget

---

## Problem Statement

Budgeting is too time-consuming and manual, causing people to abandon the practice entirely. The current process requires:

- **Manual Transaction Review:** Users must manually check each transaction from multiple bank accounts
- **Spreadsheet Maintenance:** Constant editing and updating of budget spreadsheets
- **Monthly Planning:** Manual calculation and review required for planning the next month's budget
- **Categorization Decisions:** Users must decide how to categorize each transaction, which is tedious and error-prone

**Impact:** People want to budget and manage their finances effectively, but lack the time and patience for manual work. The friction is so high that most people give up on budgeting entirely, leading to poor financial awareness and missed savings opportunities.

### Problem Impact

- **Time Cost:** Hours spent each month on manual transaction review and spreadsheet updates
- **Abandonment Rate:** High friction causes users to stop budgeting after initial attempts
- **Financial Awareness Gap:** Without consistent budgeting, users lack visibility into spending patterns
- **Missed Opportunities:** Inability to identify areas for savings or optimize spending

---

## Proposed Solution

FinSight automates the entire budgeting workflow, making it effortless for users to track spending and plan budgets. The solution combines intelligent automation with AI-powered guidance:

**Core Workflow:**
1. **Upload Transactions:** Users upload CSV or PDF files from any bank - the system handles different formats automatically
2. **Smart Categorization:** Transactions are automatically categorized using intelligent rules and machine learning, learning from user corrections
3. **Visual Dashboard:** Real-time dashboard shows current spending vs budget, remaining amounts per category, and overall financial picture
4. **AI-Powered Planning:** Conversational AI agents help users understand spending patterns, suggest optimizations, and plan next month's budget

**Key Capabilities:**
- Multi-bank transaction import (CSV/PDF support with bank-agnostic parsing)
- Intelligent auto-categorization (rule-based + ML that learns from corrections)
- Personalized category system (user-defined categories with AI suggestions)
- Budget templates (preset budgets based on income/spending patterns, fully editable)
- Real-time spending dashboard (visual clarity of budget vs actual spending)
- AI chat agents (proactive insights, budget suggestions, next month planning)

### Key Differentiators

**Simplicity First:** The primary differentiator is making budgeting "super easy" - minimal clicks, maximum intelligence. Unlike existing solutions that require extensive setup or manual work, FinSight eliminates friction at every step.

**Intelligent Automation:** Not just data aggregation, but smart categorization that learns and improves, reducing manual corrections over time.

**Proactive AI Guidance:** AI agents don't just display data - they provide actionable insights ("You've spent $X on dining this month, reduce to $Y to save $Z") and help plan proactively.

**Bank-Agnostic Parsing:** Handles different transaction formats from any bank without requiring specific integrations, demonstrating robust technical problem-solving.

---

## Target Users

### Primary Users

**Primary User Profile: Financially Conscious but Time-Constrained Individuals**

People who want to track their finances and budget effectively, but don't want to spend time manually wrangling transaction sheets, uploading data, and maintaining spreadsheets. These users:

- **Desire:** Want to budget and ensure their money is going where they intend
- **Pain Point:** Find the manual process of creating budgets and marking transactions too time-consuming
- **Current Behavior:** Either don't budget at all (due to friction) or have tried and abandoned manual budgeting methods
- **Technical Comfort:** Comfortable with web applications and file uploads, but don't want complex setup
- **Key Need:** Automation that eliminates manual work while maintaining control and visibility

**User Characteristics:**
- Have multiple bank accounts or credit cards (increasing transaction volume)
- Want financial awareness but lack time for manual tracking
- Value simplicity and ease of use over complex feature sets
- Appreciate proactive guidance rather than just data display
- Want personalized categories that match their actual spending patterns

**The "Magic Moment":** When a user uploads their transactions and immediately sees their spending categorized and visualized, with AI suggesting how to optimize their next month's budget - all without manual data entry or spreadsheet work.

---

## Success Metrics

### Personal Use Success Criteria

**Functional Success:**
- ✅ Can login to FinSight successfully
- ✅ Can create and manage budget categories
- ✅ Can upload transactions and they are automatically categorized correctly
- ✅ Can see spending table showing current spending vs budget
- ✅ Can see remaining budget per category
- ✅ Can plan next month's budget by pulling over last month's spending
- ✅ Can set goals for different categories
- ✅ Can ask questions via AI chat and get reliable answers
- ✅ All transactions in one place, no duplicates, up-to-date, correctly categorized

**User Experience Success:**
- Time to upload and categorize transactions: < 2 minutes
- Categorization accuracy: > 90% correct on first pass
- Dashboard loads and displays data: < 3 seconds
- AI responses are relevant and helpful: > 80% user satisfaction

### Portfolio Showcase Success Criteria

**Technical Demonstration:**
- Working, deployed application accessible to employers
- Demonstrates full-stack capabilities (frontend + backend + database)
- Shows problem-solving skills (bank-agnostic parsing)
- Shows modern tech stack proficiency (TypeScript + Next.js)
- Clean, professional UI/UX design
- Functional AI integration

**Project Quality Indicators:**
- Code is well-structured and maintainable
- Application handles edge cases gracefully
- User authentication and data security implemented
- Responsive design (works on different screen sizes)

---

## MVP Scope

### Core Features (MVP Must-Haves)

**1. User Authentication & Account Management**
- Login system
- User account creation and management
- Secure session handling

**2. Budget Category Management**
- Create personalized budget categories
- Edit and manage categories
- Set budget amounts per category

**3. Transaction Upload & Processing**
- Upload transaction files (CSV/PDF)
- Bank-agnostic parsing (handles different formats)
- Automatic categorization based on user's categories
- Duplicate detection and prevention
- All transactions stored in one centralized location

**4. Spending Dashboard**
- Table/view of all transactions
- Current spending by category
- Remaining budget per category (budget vs actual)
- Monthly budget status overview
- Up-to-date, real-time data

**5. Budget Planning for Next Month**
- Pull over previous month's spending as starting point
- Help set goals for different categories
- Create/edit next month's budget based on historical data

**6. AI Chat Interface (MVP Version)**
- Ask questions about spending and budget
- Get reliable, accurate answers
- Basic budget planning assistance

### MVP Success Criteria

**Functional Requirements:**
- ✅ User can login and access their account
- ✅ User can create and manage budget categories
- ✅ User can upload transactions from any bank
- ✅ System automatically categorizes transactions correctly
- ✅ User can see spending table with budget status
- ✅ User can see remaining budget per category
- ✅ User can plan next month's budget using last month's data
- ✅ All transactions are in one place, no duplicates, up-to-date, correctly categorized

**User Experience Requirements:**
- Simple, intuitive interface
- Fast transaction processing
- Clear visual feedback on budget status
- Reliable AI responses

### Out of Scope for MVP

- Advanced AI agents (multiple specialized agents)
- PDF parsing (start with CSV only)
- Mobile app
- Bank API integrations (manual upload only)
- Investment tracking
- Collaborative/shared budgets
- Advanced analytics and trends
- Receipt scanning

### Future Vision Features

- Multiple AI agents (spending analyst, goal planner, savings optimizer)
- PDF transaction parsing with OCR
- Direct bank API integration (Plaid, Yodlee)
- Mobile app (React Native)
- Advanced trend analysis and spending patterns
- Goal tracking with progress visualization
- Predictive budgeting (forecast next month)
- Receipt scanning and matching

---

## Technical Preferences

**Technology Stack:**
- **Frontend:** Next.js (React framework)
- **Language:** TypeScript
- **Backend:** Next.js API routes (full-stack Next.js application)
- **Database:** To be determined (PostgreSQL, MongoDB, or similar)
- **AI Integration:** OpenAI API or similar (for chat agent functionality)
- **File Processing:** CSV parsing library (Papa Parse or similar)
- **UI Framework:** Tailwind CSS or similar component library
- **Deployment:** Vercel (natural fit for Next.js) or similar platform

**Technical Requirements:**
- Bank-agnostic transaction parsing (handles different CSV formats)
- Real-time data processing and dashboard updates
- Secure user authentication and data storage
- Duplicate transaction detection
- Responsive design (mobile-friendly)

**Key Technical Challenges:**
- Parsing multiple bank CSV formats into normalized schema
- Intelligent categorization algorithm (rule-based + learning)
- Real-time budget calculations and updates
- AI prompt engineering for reliable budget insights

---

## Risks and Assumptions

### Key Assumptions

1. **User Behavior:** Users will have access to downloadable CSV transaction files from their banks
2. **Categorization Accuracy:** Rule-based categorization + user corrections will achieve >90% accuracy
3. **AI Integration:** OpenAI API (or similar) will provide reliable, helpful budget insights
4. **Technical Feasibility:** Bank-agnostic CSV parsing is achievable with reasonable effort
5. **User Adoption:** Simplicity will drive adoption over existing manual methods

### Key Risks

1. **Categorization Accuracy:** If initial categorization is too inaccurate, users will lose trust
   - *Mitigation:* Start with robust rule-based system, allow easy corrections, learn from feedback

2. **Bank Format Variations:** Different banks may have significantly different CSV formats
   - *Mitigation:* Research common formats first, build flexible parser, test with multiple banks

3. **AI Response Quality:** AI may provide generic or unhelpful budget advice
   - *Mitigation:* Careful prompt engineering, test with real scenarios, allow user feedback

4. **Data Security:** Handling sensitive financial data requires robust security
   - *Mitigation:* Implement proper authentication, encryption, secure data storage

5. **Scope Creep:** Temptation to add features beyond MVP
   - *Mitigation:* Strict adherence to MVP scope, defer advanced features to future versions

### Open Questions

- Which database solution best fits the data model? (PostgreSQL vs MongoDB)
- What's the optimal approach for duplicate detection? (hash-based, fuzzy matching?)
- How to handle transactions that span multiple categories?
- What's the best UI pattern for budget planning workflow?

---

## Supporting Materials

This Product Brief was informed by:
- **Brainstorming Session:** `docs/bmm-brainstorming-session-2025-11-10.md`
  - Key themes: Simplicity, intelligent automation, multi-bank compatibility, proactive AI guidance
  - Prioritized feature set and technical challenges identified
  - Action plan with top 3 priorities and timelines

---

_This Product Brief captures the vision and requirements for FinSight._

_It was created through collaborative discovery and reflects the unique needs of this Portfolio Project + Personal Use Tool._

_Next: Use this brief to guide MVP development, starting with core transaction import and categorization system._
