# TempMail - Disposable Email Service

A full-featured temporary email service with custom domain support, built with Next.js, Supabase, and Gmail API.

## Features

- **Instant Email Aliases** - Generate random or custom email addresses
- **Custom Domains** - Use your own domains for receiving emails
- **Realtime Inbox** - Auto-refresh every 10 seconds
- **Message Preview** - View full email details with HTML rendering
- **Smart OTP Detection** - Automatically detects verification codes
- **Theme System** - 5 color themes (Blue, Dark, Green, Rose, Amber)
- **Per-Alias Filtering** - Filter messages by specific aliases
- **Admin Dashboard** - Complete management interface
- **Domain Management** - Add, activate/deactivate, and remove domains
- **Alias Management** - View and manage all email aliases
- **Audit Logs** - Track all admin actions
- **Gmail API Integration** - Receive emails through Gmail
- **Flexible Storage** - Supabase (PostgreSQL) backend
- **Security** - Supabase Auth for admin authentication

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS 4, TypeScript
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Email**: Gmail API
- **Auth**: Supabase Auth
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Google Cloud project with Gmail API enabled

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Run the schema SQL in `supabase/schema.sql` via the SQL Editor
3. Create an admin user in Supabase Auth
4. Add the admin email to `admin_users` table

### 3. Set Up Gmail API

1. Go to Google Cloud Console
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Get a refresh token using the OAuth playground
5. Set up email forwarding from your custom domain to your Gmail

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── aliases/       # Alias CRUD API
│   │   ├── messages/      # Message retrieval API
│   │   ├── domains/       # Domain management API
│   │   ├── gmail/sync/    # Gmail sync endpoint
│   │   └── admin/         # Admin auth & stats API
│   ├── admin/
│   │   ├── login/         # Admin login page
│   │   ├── domains/       # Domain management page
│   │   ├── aliases/       # Alias management page
│   │   └── audit/         # Audit log page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage (inbox)
├── components/
│   ├── ui/                # Reusable UI components
│   ├── theme/             # Theme provider & switcher
│   ├── inbox/             # Inbox components
│   └── admin/             # Admin components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── gmail.ts           # Gmail API integration
│   ├── otp-detector.ts    # OTP detection logic
│   └── utils.ts           # Utility functions
├── store/
│   ├── useMailStore.ts    # Mail state management
│   └── useThemeStore.ts   # Theme state management
└── types/
    └── database.ts        # TypeScript types
```

## Email Flow

1. User generates an alias (e.g., `abc123@yourdomain.com`)
2. Emails sent to that address are forwarded to Gmail (via DNS MX records)
3. The `/api/gmail/sync` endpoint fetches new emails from Gmail
4. Emails are matched to aliases and stored in Supabase
5. OTP codes are automatically detected and highlighted
6. Frontend auto-refreshes inbox every 10 seconds

## Domain Setup

To use a custom domain:

1. Add the domain in Admin Dashboard
2. Configure DNS MX records to forward to Gmail
3. Set up Gmail alias/forwarding for the domain
4. The system will automatically match incoming emails to aliases

## License

MIT
