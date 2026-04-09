# ITP Backend

Express + MongoDB backend scaffold for the student analytics dashboard.

## Setup

1. Copy `.env.example` to `.env`
2. Run `npm install`
3. Start MongoDB locally or update `MONGODB_URI`
4. Run `npm run seed`
5. Run `npm run dev`

## Main Routes

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/projects`
- `GET /api/requests`
- `GET /api/activity`

## Filter Support

`/api/dashboard`, `/api/projects`, and `/api/requests` support:

- `category`
- `dateFrom`
- `dateTo`
