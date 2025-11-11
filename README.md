# FinSight

A personal finance management platform that automates budgeting through intelligent transaction categorization and AI-powered guidance.

## Overview

FinSight solves the problem that budgeting is too time-consuming and manual. Users can upload bank transactions (CSV), and the system intelligently categorizes them, displays spending vs budget in a clear dashboard, and provides AI-powered insights to help plan next month's budget proactively.

**Key Features:**
- Intelligent transaction categorization that learns from user corrections
- Real-time spending dashboard with budget tracking
- AI-powered budget planning and insights
- Bank-agnostic CSV transaction import
- Proactive financial guidance

## Tech Stack

- **Framework:** Next.js 16.0.1 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI Integration:** OpenAI API (GPT-3.5-turbo)
- **CSV Parsing:** Papa Parse 5.5.3
- **Date Handling:** date-fns 4.1.0

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up here](https://app.supabase.com))
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-only)
   - `OPENAI_API_KEY` - Your OpenAI API key (server-only)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
finsight/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components
│   ├── transactions/     # Transaction components
│   ├── budget/           # Budget components
│   ├── categories/       # Category components
│   └── chat/             # AI chat components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client setup
│   ├── openai/           # OpenAI integration
│   ├── parsers/          # CSV parsing logic
│   ├── categorization/   # Auto-categorization logic
│   └── utils/            # General utilities
├── types/                 # TypeScript type definitions
├── hooks/                 # React hooks
└── public/                # Static assets
```

### Code Quality

- **TypeScript:** Strict mode enabled - all code must be type-safe
- **ESLint:** Configured with Next.js recommended rules
- **Prettier:** Code formatting (to be configured)

### Testing

Testing framework: Vitest (to be added in future stories)

For now, manual verification includes:
- TypeScript compilation (`npm run build`)
- ESLint checks (`npm run lint`)
- Manual testing of features

## Documentation

- **[PRD.md](docs/PRD.md)** - Product Requirements Document
- **[architecture.md](docs/architecture.md)** - Technical architecture and design decisions
- **[epics.md](docs/epics.md)** - Feature epics and user stories

## Environment Variables

All environment variables are configured in `.env.local` (not committed to git). See `.env.local.example` for required variables.

**Important:** Never commit `.env.local` to version control. The `.env.local.example` file serves as a template.

## Deployment

The application is designed to be deployed on Vercel, which provides seamless Next.js deployment.

### Quick Start

1. Push your code to a Git repository
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard (see `.env.local.example`)
4. Apply database migrations to production Supabase project
5. Deploy

### Documentation

- **[Deployment Guide](docs/deployment.md)** - Complete deployment instructions including Vercel setup, environment variables, database migrations, and troubleshooting
- **[Deployment Verification Checklist](docs/deployment-verification-checklist.md)** - Post-deployment verification steps
- **[Database Migrations](lib/supabase/migrations/README.md)** - Migration application guide for production

### Key Requirements

- **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- **Supabase Production Project** - Create at [app.supabase.com](https://app.supabase.com)
- **Environment Variables** - Configure in Vercel dashboard (see `.env.local.example`)
- **Database Migrations** - Apply migrations 001-006 in order to production database

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for general Next.js deployment information.

## Contributing

This project follows a structured development workflow. See the documentation in `docs/` for architecture decisions and implementation patterns.

## License

[Add your license here]
