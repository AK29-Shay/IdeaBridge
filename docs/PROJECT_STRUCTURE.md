# Project Structure Guide

## Purpose
This document defines the recommended folder structure for IdeaBridge so new features are easy to place and maintain.

## High-level layout

- app/: Next.js App Router pages and route handlers
- components/: UI and feature components
- backend/: server-side business logic modules, auth middleware, and database integration
- lib/: shared frontend/server utilities and feature data
- types/: shared TypeScript domain models
- docs/: project documentation
- supabase/: schema and migration SQL

## Recommended placement rules

- Route UI pages: app/<feature>/page.tsx
- Route handlers (API): app/api/<feature>/route.ts
- Feature components: components/<feature>/*
- Domain server logic: backend/modules/<domain>/index.ts
- Shared validation/constants/helpers: lib/*
- Domain types/interfaces: types/*

## Backend domain modules

Domain entrypoints are now grouped in backend/modules:

- backend/modules/mentor-application/index.ts
- backend/modules/mentor/index.ts
- backend/modules/notification/index.ts
- backend/modules/otp/index.ts
- backend/modules/profile/index.ts
- backend/modules/rating/index.ts
- backend/modules/request/index.ts

These module entrypoints re-export existing controller/service functions and should be the default import targets for route handlers.

## Import conventions

Prefer:

- import { submitRequest } from "@/backend/modules/request"
- import { notify } from "@/backend/modules/notification"
- import { getProfileByUserId } from "@/backend/modules/profile"

Avoid importing app routes directly from legacy src paths.

## Naming conventions

- File names: camelCase for implementation files, UPPER_SNAKE only for constants files
- Feature folders: kebab-case (mentor-application)
- Component files: PascalCase (ProjectThread.tsx)
- Domain model files: singular nouns where possible (user.ts, mentor.ts)

## Migration note

Legacy folders under src/ may still exist for backward compatibility. New development should use the top-level app/components/lib/backend/modules structure as the source of truth.
