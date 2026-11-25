# Mohamed Salem — Portfolio Setup Guide

This is the same system your friend Ghassan built: React + Supabase (database) + AWS S3 (file storage) + Vercel (hosting). All your CV data is already pre-filled in the code where it's hardcoded, and a ready-to-run SQL file is prepared for everything else (projects, certs, contact info).

Total setup time: roughly 30–45 minutes, all free tier.

---

## What's already done for you

- Your name, email, and phone are in the navbar, footer, and e-card
- Your bio, hero text, and "About" section are rewritten with your CV info
- Your skills, AWS internship experience, and education are filled into the Skills & Experience timeline
- A SQL seed file (`db/seed.sql`) has your 5 projects and 5 certifications ready to insert
- SEO tags, sitemap, and metadata are updated (domain is a placeholder — see Step 5)

## What you still need to do

Everywhere you see `REPLACE_WITH_...` in the code or SQL, that's a spot needing your real info (GitHub username, LinkedIn, domain name, or an uploaded file URL).

---

## Step 1 — Create your Supabase project (the database)

1. Go to supabase.com and sign up (free).
2. Click **New Project**. Name it anything (e.g. "mohamed-portfolio"). Pick a strong database password and save it somewhere safe. Choose a region close to you.
3. Wait ~2 minutes for it to provision.
4. In the left sidebar, go to **SQL Editor** → **New query**.
5. Open `db/schema.sql` from this project, copy all of it, paste into the editor, and click **Run**. This creates all your tables.
6. Open `db/seed.sql`, copy all of it, paste into a new query, and click **Run**. This adds your projects, certs, and contact settings. (You can re-edit this data anytime later through the admin dashboard instead of SQL.)
7. Go to **Settings → API** in the sidebar. Copy the **Project URL** and the **anon public** key — you'll need both in Step 4.

## Step 2 — Create your AWS S3 bucket (for images, badges, your CV PDF)

1. Sign into AWS Console → S3 → **Create bucket**.
2. Name it something unique (e.g. `mohamed-salem-portfolio`). Pick a region.
3. Under **Block Public Access settings**, uncheck "Block all public access" (since these are public portfolio images) and confirm.
4. After creating it, go to the bucket's **Permissions** tab → **Bucket Policy**, and add a policy allowing public `GetObject` access (AWS's UI has a copy-paste template for "public read access for bucket objects" — search their docs if needed).
5. Upload your CV PDF and project screenshots into folders, e.g. `/portfolio/common/`, `/portfolio/projects/`, `/portfolio/certs/`.
6. For each uploaded file, click it and copy its **Object URL**.
7. Go back to `db/seed.sql` and replace every `REPLACE_WITH_YOUR_S3_IMAGE_URL/...` and `REPLACE_WITH_YOUR_S3_BUCKET_URL/...` with your real object URLs, then re-run the relevant `insert` statements in Supabase's SQL Editor (or just edit them later through the admin dashboard once it's live — easier).

## Step 3 — Create your admin login (so you can edit content without touching SQL again)

1. In Supabase: **Authentication → Users → Add user**. Enter your email and a password.
2. Copy the generated **User UID**.
3. Run this in the SQL Editor, replacing the UID:
   ```sql
   insert into users (id, email, role)
   values ('YOUR_USER_UID_HERE', 'mohamedsalem11041@gmail.com', 'admin');
   ```
4. Once deployed, you'll log in at `yoursite.com/login` and manage everything (projects, certs, blog posts, settings) through forms — no code or SQL needed after this.

## Step 4 — Connect the code to your Supabase project

1. In this project folder, copy `.env.example` to a new file named `.env.local`.
2. Paste in the Project URL and anon key you copied in Step 1.7:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Never commit `.env.local` to GitHub — it's already in `.gitignore`.

## Step 5 — Fill in the remaining placeholders

Search the project for `REPLACE_WITH` (most editors support "search in files") and update:

| File | What to replace |
|---|---|
| `src/components/Footer.tsx` | Your GitHub and LinkedIn URLs |
| `src/hooks/useDocumentMeta.ts` | Your real domain (once you have one) |
| `index.html` | Same domain + GitHub/LinkedIn URLs |
| `public/sitemap.xml`, `public/robots.txt`, `public/site.webmanifest` | Your domain |
| `db/seed.sql` | S3 URLs, GitHub repo links, Credly verify links |

If you don't have a custom domain yet, Vercel gives you a free `yourproject.vercel.app` URL — use that everywhere instead, and update later if you buy a domain.

## Step 6 — Run it locally to check everything works

```bash
npm install
npm run dev
```

Open the local URL it gives you. Confirm your name, projects, and certs show up correctly.

## Step 7 — Deploy to Vercel

1. Push this project to a new GitHub repository.
2. Go to vercel.com → sign up with GitHub → **Add New Project** → import your repo.
3. Vercel auto-detects Vite. Before deploying, add your environment variables under **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. In a couple minutes your site is live at `yourproject.vercel.app`.
5. Optional: buy a domain and connect it under Vercel's **Domains** settings, then update Step 5's placeholders to match.

---

## How to add new things easily (going forward)

Once deployed and logged in at `/login`:
- **New project** → Admin dashboard → Projects → New → fill the form, upload images, set status to "published"
- **New certification** → same pattern under Certs
- **Update your bio/contact info** → Settings page in the admin dashboard
- **New blog post** → Blog section, write in Markdown, publish

No code changes needed for any of this — that's the whole point of the database-backed setup.

---

## Quick reference — where things live in the code

| What | Where |
|---|---|
| Hero headline & About bio | `src/pages/Home.tsx` |
| Skills, experience, education | `src/pages/SkillsExperience.tsx` (top of file, the arrays) |
| Navbar name | `src/components/Navbar.tsx` |
| Footer links | `src/components/Footer.tsx` |
| Contact page | `src/pages/PortalHub.tsx` (pulls from Supabase `settings` table) |
| Projects, certs, badges | Supabase database (edit via `/admin` once deployed, or SQL) |
