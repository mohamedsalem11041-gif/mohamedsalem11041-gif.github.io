# Portfolio SPA PRD

## Summary
Cloud/DevOps-focused single-page React + Tailwind site with smooth parallax/3D motion (GSAP/anime.js), mobile-first, SEO/permalink ready. Content managed by a single admin via Supabase (eu-west-2) with AWS S3 (eu-west-2) for all assets. Deploy to Vercel.

## Goals
- Showcase portfolio, projects, reels/graphics, skills, experience, blog, and hobbies with fast, intentional motion.
- Maintain SEO hygiene (permalinks, OG images, sitemap, structured meta) and analytics.
- Provide a secure admin CMS: drafts, preview, publish, S3 uploads via presigned URLs.
- Keep UI clean/minimalist with bluish gradient accents and sans-serif typography.

## Scope
- In: SPA navigation; Home/About/Build Gallery/Creative Studio/Skills & Experience/Fun Zone/Portal Hub/Footer; admin dashboard; S3 uploads; blog/hobby/project/reel/graphic/cert/badge CRUD; OG + sitemap generation; GA instrumentation.
- Out: comments, view counters, multiplayer auth, advanced video transcoding (only simple MP4 planned), ecommerce.

## Roles & Access
- Visitor: read-only on published content.
- Admin (single): login/logout, CRUD, upload to S3, preview drafts, publish/draft toggle.

## Branding & Interaction
- Visual: minimalist, bluish gradient backgrounds/accents; sans-serif family (e.g., Space Grotesk/Manrope/Plus Jakarta Sans); high contrast; clean cards.
- Motion: Parallax/3D on hero/strips; gentle microinteractions; throttle on scroll; reduce motion support; avoid heavy blur/shadow on mobile; hardware-accelerated transforms.

## Architecture & Stack
- Frontend: React SPA (Vite/Next SPA mode), TailwindCSS, React Router; GSAP + ScrollTrigger and anime.js for motion; Zustand/Context for UI state; MD rendering for blog.
- Backend: Supabase (Postgres/Auth/RLS) region eu-west-2; edge/functions for presigned S3 uploads, contact email, OG image generation, sitemap regen.
- Storage: AWS S3 eu-west-2; bucket structure `/portfolio/certs`, `/portfolio/projects`, `/portfolio/reels`, `/portfolio/badges`, `/portfolio/blog`, `/portfolio/graphics`, `/portfolio/hobbies`, `/portfolio/common`.
- Deployment: Vercel for frontend; env vars for Supabase keys, S3 keys, GA ID.
- SOLID: isolate presentation components, use interfaces for data/services, dependency inversion for fetchers/uploaders, small focused hooks/services.

## Technical Constraints
- SPA with clean permalinks (e.g., `/blog/:slug`, `/projects/:slug`, `/reels/:slug`).
- Mobile-first layouts; gestures coexist with scroll; disable heavy 3D on low-power devices.
- Upload limits: images <= 5MB (type: jpeg/png/webp), video <= 40MB (MP4 only); client + server validation.
- Presigned PUT to S3; public-read URLs stored in Supabase; option to use signed URLs for private assets if needed.
- First reel does not autoplay; subsequent may autoplay muted where supported.
- Image auto-optimization on upload if feasible; OG image auto-gen on publish; sitemap.xml regeneration on publish/update.
- SEO: per-page meta + canonical + OG/Twitter cards; robots.txt; XML sitemap; MD content supports images.
- Analytics: Google Analytics pageviews + events (TBD).

## Feature Tables

### Home (Hero/Nav)
| Aspect | Requirements |
| --- | --- |
| Purpose | Introduce profile, highlight AWS SAA-C03 focus, fast routes to Gallery/Contact. |
| Content | Name/role, headline, brief value, current focus, CTAs (Build Gallery, Contact). |
| Interactions | Parallax/3D hero; smooth scroll; nav anchors; CTA buttons track clicks. |
| Data | Settings.hero_copy, socials, availability. |
| Edge/Perf | Reduce motion support; placeholder while settings load. |

### About
| Aspect | Requirements |
| --- | --- |
| Content | Provided narrative: Welcome, Creative Builder, Problem Solver, Team Player, Current Focus (SAA-C03), Specialty Cloud Engineering, Values (Curiosity, Diverse Knowledge, Growth Mindset), What I Love (Frontend, Cybersecurity, DevOps, Tools). |
| Interactions | Light scroll animations; section permalinks for SEO. |
| Data | Static copy from settings; editable in admin. |
| Edge | Clamp long lines; graceful fallback if settings missing. |

### Build Gallery (Projects)
| Aspect | Requirements |
| --- | --- |
| Content | Cards with title, summary, tags, cover; actions Demo (external), Code. |
| Interactions | Tag filters; card opens modal with description_md, multi-image carousel (1+ pics), tags, links; CTA tracking. |
| Data | projects table with images jsonb, demo_url, code_url, tags[]. |
| States | Draft hidden; published visible; loading skeletons; modal focus trap. |
| Edge | Missing image placeholder; demo/code optional; slug uniqueness. |

### Creative Studio
| Aspect | Requirements |
| --- | --- |
| Tabs | Graphic Design, Reels. |
| Graphic | Cards with preview, tags, client, short description; click opens preview card/lightbox. |
| Reels | Vertical swipe up/down; first video requires tap-to-play; thereafter autoplay muted where allowed; play/pause on center tap; lazy load poster/video; optional quality selector if multiple renditions added later. |
| Data | graphics table (preview_url, asset_urls, client, tags); reels table (video_url MP4, poster_url, duration, tags). |
| Edge | Gesture vs scroll coordination; fallback to tap-to-play if autoplay blocked; clamp long tags. |

### Skills & Experience
| Aspect | Requirements |
| --- | --- |
| Content | Skills grouped (Programming, Design, Tools, Cloud with items given); Experience timeline with roles/dates/descriptions; certifications strip; badges floating (Credly). |
| Interactions | Infinite parallax strip of certs; floating badges on scroll; collapsible skill groups if needed. |
| Data | skills structured via settings; certs table with badge_url/verify_url; badges table with image_url/verify_url. |
| Edge | Lazy load badge images; placeholders if badge missing; respect prefers-reduced-motion. |

### Fun Zone (Blog/Hobbies)
| Aspect | Requirements |
| --- | --- |
| Tabs | Blog (default), Hobbies, All. |
| Blog | MD-rendered posts with title, author (admin), date, cover image, tags, summary, content, share button providing permalink; OG/meta per post. |
| Hobbies | Grid of photos/videos (S3 URLs); tags, description; modal/lightbox. |
| Data | blog_posts (status draft/published, cover_url, tags, og_image_url); hobbies table with media_urls. |
| Edge | Drafts hidden; slug uniqueness; image/video placeholders; tag overflow clamp. |

### Portal Hub (Contact)
| Aspect | Requirements |
| --- | --- |
| Content | Contact form (name, email, message), direct email link, download CV (S3), socials (LinkedIn, GitHub), availability status. |
| Interactions | Form submit via Supabase function (e.g., SES); success/error states; CTA buttons track events. |
| Data | settings (cv_url, socials, availability); contact_submissions table. |
| Edge | Rate limiting/spam protection; validation (email format, required fields); offline retry guidance. |

### Footer
| Aspect | Requirements |
| --- | --- |
| Content | 3 main icons linked to GitHub, Email, LinkedIn; sitemap/permalink support. |
| Edge | Accessible labels; target blank with rel noopener. |

### Admin Dashboard
| Aspect | Requirements |
| --- | --- |
| Auth | Single admin; Supabase email/password; protected routes; logout clears session. |
| Content Types | blog_post, hobby, project, reel, graphic, cert, badge, settings. |
| Forms | Type selector; title; slug (auto-generate/edit with uniqueness check); summary; content_md; tags (comma-to-chip); status (draft/published); upload widgets (S3 via presigned PUT) for media; for blog: og_image_url generated on publish; for projects: images array; for reels: video+poster; for graphics: preview+assets; for certs/badges: image URL + verify link. |
| Workflows | Draft save; preview mode link (tokenized) not indexed; publish sets published_at, triggers OG image generation + sitemap regeneration; delete/archival. |
| Edge | Upload failures retriable; size/type enforcement (5MB img, 40MB video, MP4 only); duplicate slug prevention. |

## User Flows
- Browse: Land on Home → scroll parallax → navigate via SPA links to About/Gallery/Studio/Skills/Fun Zone/Portal.
- Project: From Build Gallery, filter by tags → open modal → visit demo/code (external).
- Creative Studio: Switch tabs → view graphics or reels; reels swipe; tap to play/pause; first reel requires manual start.
- Blog/Hobbies: Default Blog tab → open post via permalink → share link; switch to Hobbies grid for media.
- Contact: Submit form → success toast; alternative direct email/social; download CV from S3.
- Admin: Login → dashboard → create/edit item → upload to S3 via presigned URL → preview → publish → auto OG + sitemap; logout.

## Data Model (Supabase)
- users: id (uuid), email (text, unique), role enum [admin], created_at.
- projects: id, title, slug unique, summary, description_md, demo_url, code_url, tags text[], images jsonb[{url, alt}], status enum[draft|published], created_at, updated_at, published_at.
- graphics: id, title, slug, client, description, tags text[], preview_url, asset_urls jsonb[], status, created_at, updated_at.
- reels: id, title, slug, description, tags text[], video_url (MP4), poster_url, duration, status, created_at, updated_at.
- blog_posts: id, title, slug unique, summary, content_md, cover_url, tags text[], status enum[draft|published], created_at, updated_at, published_at, og_image_url.
- hobbies: id, title, slug, description, media_urls jsonb[], tags text[], status, created_at, updated_at.
- certs: id, name, issuer, issue_date, expires_at, badge_url (S3), verify_url, tags text[], status, created_at.
- badges: id, name, description, image_url (S3), verify_url, status, created_at.
- contact_submissions: id, name, email, message, source_page, created_at.
- settings (singleton): id, availability_status, hero_copy, socials jsonb, cv_url, seo_defaults jsonb.
RLS: public read only published content; admin full CRUD.

## Storage & Uploads
- S3 eu-west-2 bucket folders per above; public-read assets for site; option for signed URLs on private assets.
- Presigned upload flow: client requests URL from Supabase function → PUT to S3 → store URL in DB record.
- Enforce limits (5MB images, 40MB MP4); MIME whitelist; retries on failure; progress UI.
- Auto image optimization on upload if available; generate OG images on publish; regenerate sitemap on publish/update.

## Motion Guidelines
- GSAP/ScrollTrigger for hero/parallax strips and infinite cert strip; anime.js for buttons/cards; use requestAnimationFrame + throttled scroll listeners.
- Respect `prefers-reduced-motion`; disable heavy effects on low-end devices; avoid layout thrash (transform/opacity only).

## SEO & Analytics
- Clean permalinks; per-route meta + OG/Twitter; canonical tags; robots.txt and sitemap.xml; MD content allows inline images.
- Blog posts auto-generate OG images on publish; share buttons copy permalink.
- Google Analytics: pageviews and events (reel play/pause, project modal open, contact submit, download CV). Additional events can be refined.

## Security & Privacy
- Supabase Auth for admin; RLS to protect drafts; rate-limit contact form; spam honeypot/captcha-lite.
- Validate uploads server-side; strip dangerous HTML from MD rendering; use rel noopener on external links.

## Performance
- Code-splitting by route/section; lazy-load media; skeletons for loading; cache headers for assets; limit shadow/blur on mobile; avoid large blocking scripts.

## Testing/QA
- Mobile gestures vs scroll; reduced-motion compliance; upload failure paths; slug collision handling; draft not public; OG/sitemap generation on publish; LCP/CLS budgets; accessibility (focus order, labels, alt text, captions on reels if needed).

## Open Item
- Confirm any additional GA events beyond pageviews, reel interactions, project modal opens, contact submits, and CV download.
