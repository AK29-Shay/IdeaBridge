# IdeaBridge

IdeaBridge is a consolidated Next.js 16 project for student project sharing, mentor discovery, structured idea discussion, analytics, profile management, and notifications. The app now uses the top-level `app/` router as the source of truth and follows the home-page peach/black visual system across the active routes.

## What’s Included

- Unified App Router structure under `app/`
- Supabase-backed auth, profiles, ideas, comments, analytics, requests, notifications, and mentor applications
- Public discovery routes for home, search, and mentor browsing
- Auth routes for login, register, forgot password, reset password, and email verification
- Role-aware dashboard routes for students, mentors, and analytics
- Route-based student and mentor dashboard subsections with shared portal navigation
- Cleaned project layout with legacy duplicate folders removed
- Playwright coverage for public navigation, dashboard routing, and auth entry points

## Project Structure

- `app/`: pages and route handlers
- `components/`: UI building blocks and feature components
- `backend/`: server-side controllers, services, middleware, and schemas
- `context/`: client auth provider
- `lib/`: shared utilities, validators, and Supabase helpers
- `types/`: shared domain models
- `supabase/`: SQL migrations
- `docs/`: deployment, structure, and assignment-facing notes
- `scripts/`: helper scripts

## Main Routes

- `/`
- `/ideas/explore`
- `/search`
- `/mentors`
- `/mentors/[id]`
- `/dashboard`
- `/dashboard/student`
- `/dashboard/student/projects`
- `/dashboard/student/requests`
- `/dashboard/student/profile`
- `/dashboard/mentor`
- `/dashboard/mentor/requests`
- `/dashboard/mentor/projects`
- `/dashboard/mentor/blog`
- `/dashboard/mentor/profile`
- `/dashboard/analytics`
- `/profile`
- `/notifications`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/[token]`
- `/verify-email`

## Environment Variables

Create `.env.local` from `.env.local.example` and provide:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

These are required for auth, profile persistence, mentor directory data, ideas, uploads, analytics, and notifications.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run build
```

## E2E Tests

Playwright is configured for lightweight public-route coverage.

```bash
npm run test:e2e
```

The first run may require:

```bash
npx playwright install
```

## Deployment

The app is ready for Vercel deployment once the Supabase environment variables are configured. See [docs/DEPLOYMENT.md](/C:/Users/akshayan/Documents/sliit/itpm/final project/docs/DEPLOYMENT.md) for deployment steps and [docs/PROJECT_STRUCTURE.md](/C:/Users/akshayan/Documents/sliit/itpm/final project/docs/PROJECT_STRUCTURE.md) for the cleaned structure.

## Suggested Next Enhancements

- Admin moderation and mentor approval workspace
- Saved ideas and personalized recommendations
- Real-time notifications or chat
- Mentor booking and scheduling workflows
- Reporting, audit logs, and email digest automation
