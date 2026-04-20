# Deployment Guide

## Target

Vercel + Supabase

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local Validation Before Deploy

Run:

```bash
npm run lint
npm run build
```

Optional Playwright smoke tests:

```bash
npm run test:e2e
```

## Vercel Steps

1. Import the repository into Vercel.
2. Set the three Supabase environment variables in the Vercel project settings.
3. Keep the default build command:

```bash
npm run build
```

4. Keep the default output from Next.js App Router.
5. Deploy.

## Supabase Preparation

Run the canonical schema from:

- `supabase/unified_migration.sql`

This creates profiles, requests, notifications, posts, comments, mentor applications, ratings, and analytics support.

## Notes

- The top-level `app/` directory is the source of truth.
- Legacy duplicate folders have been removed to keep the deploy surface clean.
- The current build uses Next.js 16.2.2 and Turbopack.
