# Nueva™ Project Management

Nueva™ is a TanStack Start project management app with Supabase auth, database, storage, Kanban delivery views, project tables, member queues, and admin team management.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL`.

4. Apply `supabase/migrations/202605070001_nueva_schema.sql` to your Supabase project.

5. Run the app:

```bash
npm run dev
```

## Supabase Auth

Enable email/password auth with email confirmation. Enable Google OAuth in Supabase Auth providers and add your local and production callback URLs in the Supabase dashboard.

## Deploying Through GitHub and Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL` in Vercel project environment variables.
4. Use `npm run build` as the build command. Vercel reads `vercel.json`, serves `dist/client`, and rewrites app routes to `api/index.ts`.
5. Deploy production. Add the production URL to Supabase Auth redirect URLs for email confirmation and Google OAuth.

The codebase has no Lovable or proprietary hosting dependencies.
