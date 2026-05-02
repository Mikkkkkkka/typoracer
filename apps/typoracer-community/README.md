# Typoracer Community

Backend-web application for a typing community. The project combines server-rendered pages and a REST API for user accounts, quotes, typing attempts, leaderboards, and forum discussions.

## Deployed Application

- Production URL: `https://typoracer.mikkkkkkka.ru`

## Project Description

Typoracer Community is a web application in the typing practice domain. Users can create accounts, browse public quotes, submit new quotes for moderation, discuss typing-related topics on the forum, view user profiles, and compare typing results in leaderboards.

The application is built as a NestJS server with:

- server-side HTML rendering through EJS;
- a REST API documented with Swagger;
- PostgreSQL as the main relational database;
- Prisma as the ORM and migration tool.

## Domain Area

The subject area is an online community built around typing practice and quote-based speed typing.

The main user scenarios are:

- registration and login;
- viewing and editing a user profile;
- browsing approved quotes;
- submitting quotes for moderation;
- storing typing attempts for quotes;
- calculating leaderboards and quote-specific records;
- creating discussions and replying to them.

## Domain Entities

The project currently выделяет следующие основные сущности:

1. `User`
   - Community member with account data, profile information, authored quotes, discussions, replies, and typing attempts.

2. `Quote`
   - Text used for typing practice. A quote has an author, source, optional image, and moderation status.

3. `Attempt`
   - Result of a typing session for a specific quote by a specific user, including `wpm`, `accuracy`, and `maxRawWpm`.

4. `Discussion`
   - Forum thread created by a user with title, excerpt, and full body text.

5. `DiscussionReply`
   - Reply posted by a user inside a discussion thread.

6. `QuoteStatus`
   - Enumeration describing the quote lifecycle: `SUBMITTED` or `APPROVED`.

## ER Diagram

The entity relationship diagram for the data model:

![ER Diagram](docs/er-model.png)

## Main Features

- Authentication and session handling
- User profiles with typing stats
- Quote catalog
- Quote submission for moderation
- Typing attempts API
- Quote records per user
- Leaderboard by average WPM and accuracy
- Forum discussions and replies
- Swagger documentation at `/api/docs`

## Technology Stack

- Node.js
- NestJS
- TypeScript
- EJS
- PostgreSQL
- Prisma
- Swagger / OpenAPI
- Docker / Docker Compose

## Application Structure

Key modules:

- `src/auth` - authentication and current session
- `src/users` - user profiles and leaderboard logic
- `src/quotes` - quotes, records, quote submission
- `src/attempts` - typing attempts
- `src/discussions` - forum discussions and replies
- `src/prisma` - Prisma infrastructure module
- `src/pages` - page rendering controllers
- `views` - EJS templates
- `public` - static assets

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create an environment file and provide at least:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/typoracer
JWT_SECRET=development-jwt-secret
PORT=3000
```

You can use the existing `.env.example` as a base.

### 3. Start PostgreSQL

With Docker Compose:

```bash
docker compose up -d db
```

Or start both the application and the database:

```bash
docker compose up -d
```

### 4. Apply migrations

```bash
npx prisma migrate deploy
```

For local development you can also use:

```bash
npx prisma migrate dev
```

### 5. Seed the database

```bash
npm run prisma:seed
```

### 6. Run the application

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

After startup the application is available at:

- `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`

## Docker

Build image:

```bash
docker build -t typoracer-community:local .
```

Run with Compose:

```bash
docker compose up -d
```

Default local services:

- app: `localhost:3000`
- postgres: `localhost:5432`

## API

The project exposes a REST API for:

- authentication;
- users;
- quotes;
- quote records;
- attempts;
- discussions;
- discussion replies.

Swagger documentation is generated automatically and available at `/api/docs`.

## Database

The application uses PostgreSQL and Prisma migrations.

Important files:

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.ts`

## Notes

- Only approved quotes are visible in the public quote catalog.
- Quote records are recalculated from attempts and streamed to the quote detail page through Server-Sent Events.
- The quote submission page also keeps a local client-side history of submitted items for convenience.

