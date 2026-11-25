-- ============================================================
-- SEED DATA FOR MOHAMED SALEM'S PORTFOLIO
-- ============================================================
-- HOW TO USE:
-- 1. Run db/schema.sql FIRST in your Supabase SQL Editor (creates tables).
-- 2. Then run this file (db/seed.sql) to populate your content.
-- 3. Search this file for "REPLACE_WITH" and fill in real URLs once
--    you've uploaded images/CV to your S3 bucket.
-- ============================================================

-- ----------------------------------------------------------
-- 1. SETTINGS (singleton row — your contact info, CV link, availability)
-- ----------------------------------------------------------
insert into settings (id, availability_status, hero_copy, socials, cv_url, seo_defaults)
values (
  true,
  'Available',
  'Building resilient cloud infrastructure that deploys as smoothly as it scales.',
  '{
    "email": "mohamedsalem11041@gmail.com",
    "github": "https://github.com/mohamedsalem11041-gif",
    "linkedin": "https://linkedin.com/in/REPLACE_WITH_YOUR_LINKEDIN_USERNAME"
  }'::jsonb,
  'https://REPLACE_WITH_YOUR_S3_BUCKET_URL/portfolio/common/Mohamed_Salem_Cloud_Engineer_CV.pdf',
  '{}'::jsonb
)
on conflict (id) do update set
  availability_status = excluded.availability_status,
  hero_copy = excluded.hero_copy,
  socials = excluded.socials,
  cv_url = excluded.cv_url;


-- ----------------------------------------------------------
-- 2. PROJECTS (Build Gallery) — from your CV
-- ----------------------------------------------------------

insert into projects (title, slug, summary, description_md, demo_url, code_url, tags, images, status, published_at)
values (
  'MediGuide Voice',
  'mediguide-voice',
  'Accessibility-first medication management app for blind and low-vision users, built with AWS Cloud & AI services. 3rd place at the GenAI Hackathon powered by AWS.',
  E'MediGuide is an accessibility-first application designed to empower blind and low-vision individuals to manage their medications with confidence and independence.\n\nBy combining intelligent image recognition, a voice-first interface, and a secure medication verification system, MediGuide eliminates guesswork and prevents common errors such as taking the wrong drug or an incorrect dose.\n\nBuilt using AWS Cloud and AI services. Won 3rd place in the GenAI Hackathon powered by AWS.',
  null,
  'https://REPLACE_WITH_YOUR_GITHUB_REPO_URL',
  array['AWS', 'AI/ML', 'Voice UI', 'Accessibility', 'Python'],
  '[{"url": "REPLACE_WITH_YOUR_S3_IMAGE_URL/mediguide-cover.jpg", "alt": "MediGuide Voice app screenshot"}]'::jsonb,
  'published',
  now()
);

insert into projects (title, slug, summary, description_md, demo_url, code_url, tags, images, status, published_at)
values (
  'Dockerized Web App Deployment Pipeline',
  'dockerized-deployment-pipeline',
  'A fully automated pipeline that builds and pushes a Docker image whenever code changes, using Jenkins and Docker Hub.',
  E'A fully automated application pipeline: when a change occurs in the code, Jenkins retrieves it from GitHub, builds a Docker image, and pushes it to Docker Hub.\n\nThis project demonstrates end-to-end CI automation without any manual intervention.',
  null,
  'https://REPLACE_WITH_YOUR_GITHUB_REPO_URL',
  array['Jenkins', 'Docker', 'EC2', 'Docker Hub', 'GitHub'],
  '[{"url": "REPLACE_WITH_YOUR_S3_IMAGE_URL/docker-pipeline-cover.jpg", "alt": "Dockerized deployment pipeline diagram"}]'::jsonb,
  'published',
  now()
);

insert into projects (title, slug, summary, description_md, demo_url, code_url, tags, images, status, published_at)
values (
  'Secure Web Application on AWS',
  'secure-web-application-aws',
  'A highly secured web application using AWS WAF, with custom CloudWatch metrics for memory, Apache logs, and disk usage.',
  E'A highly secured web application using WAF, where you can monitor custom metrics such as memory, Apache logs, and disk usage via CloudWatch after installing the CW agent.\n\nUses Parameter Store to securely store the CloudWatch agent configuration file. Backed by an Application Load Balancer with Auto Scaling Groups for resilience.',
  null,
  'https://REPLACE_WITH_YOUR_GITHUB_REPO_URL',
  array['WAF', 'RDS', 'CloudWatch', 'Systems Manager', 'Apache', 'Load Balancer', 'Auto Scaling'],
  '[{"url": "REPLACE_WITH_YOUR_S3_IMAGE_URL/secure-web-app-cover.jpg", "alt": "Secure web application architecture diagram"}]'::jsonb,
  'published',
  now()
);

insert into projects (title, slug, summary, description_md, demo_url, code_url, tags, images, status, published_at)
values (
  'CI/CD Pipeline on AWS',
  'cicd-pipeline-aws',
  'A continuous integration and deployment pipeline using native AWS developer tools, deploying automatically to EC2.',
  E'A continuous integration and continuous deployment pipeline where code changes are automatically tested and deployed to an EC2 instance, with the web application starting automatically post-deploy.\n\nBuilt entirely with native AWS developer tools for a fully managed CI/CD experience.',
  null,
  'https://REPLACE_WITH_YOUR_GITHUB_REPO_URL',
  array['CodeCommit', 'CodeBuild', 'CodeDeploy', 'CodePipeline', 'EC2', 'Apache'],
  '[{"url": "REPLACE_WITH_YOUR_S3_IMAGE_URL/cicd-pipeline-cover.jpg", "alt": "AWS CI/CD pipeline diagram"}]'::jsonb,
  'published',
  now()
);

insert into projects (title, slug, summary, description_md, demo_url, code_url, tags, images, status, published_at)
values (
  'Static Website on AWS',
  'static-website-aws',
  'A static website hosted on S3 with CloudFront for low-latency global delivery and Route 53 for DNS routing.',
  E'A static website where all the code files are hosted on S3, using CloudFront for caching and low-latency delivery, and Route 53 for domain routing.\n\nA fully serverless, cost-effective hosting setup with global CDN distribution.',
  null,
  'https://REPLACE_WITH_YOUR_GITHUB_REPO_URL',
  array['S3', 'CloudFront', 'Route 53'],
  '[{"url": "REPLACE_WITH_YOUR_S3_IMAGE_URL/static-website-cover.jpg", "alt": "Static website on AWS architecture"}]'::jsonb,
  'published',
  now()
);


-- ----------------------------------------------------------
-- 3. CERTIFICATIONS — from your CV
-- ----------------------------------------------------------

insert into certs (name, issuer, issue_date, badge_url, verify_url, tags, status, sort_order)
values (
  'AWS Certified Solutions Architect – Associate',
  'Amazon Web Services',
  '2026-01-01',
  'REPLACE_WITH_YOUR_S3_IMAGE_URL/aws-saa-badge.png',
  'REPLACE_WITH_YOUR_CREDLY_VERIFY_URL',
  array['AWS', 'Cloud Architecture'],
  'published',
  1
);

insert into certs (name, issuer, issue_date, badge_url, verify_url, tags, status, sort_order)
values (
  'AWS Certified Cloud Practitioner',
  'Amazon Web Services',
  '2024-01-01',
  'REPLACE_WITH_YOUR_S3_IMAGE_URL/aws-cp-badge.png',
  'REPLACE_WITH_YOUR_CREDLY_VERIFY_URL',
  array['AWS', 'Cloud Fundamentals'],
  'published',
  2
);

insert into certs (name, issuer, issue_date, badge_url, verify_url, tags, status, sort_order)
values (
  'RHCSA — Admin I & II',
  'NTI / Red Hat Academy',
  null,
  'REPLACE_WITH_YOUR_S3_IMAGE_URL/rhcsa-badge.png',
  'REPLACE_WITH_YOUR_VERIFY_URL',
  array['Linux', 'System Administration'],
  'published',
  3
);

insert into certs (name, issuer, issue_date, badge_url, verify_url, tags, status, sort_order)
values (
  'CCNA 200-301',
  'Cairo University · Cisco Academy',
  null,
  'REPLACE_WITH_YOUR_S3_IMAGE_URL/ccna-badge.png',
  'REPLACE_WITH_YOUR_VERIFY_URL',
  array['Networking', 'Cisco'],
  'published',
  4
);

insert into certs (name, issuer, issue_date, badge_url, verify_url, tags, status, sort_order)
values (
  'HCIA — Cloud Computing',
  'NTI · Huawei Egyptian Talents Academy',
  null,
  'REPLACE_WITH_YOUR_S3_IMAGE_URL/hcia-badge.png',
  'REPLACE_WITH_YOUR_VERIFY_URL',
  array['Huawei Cloud'],
  'published',
  5
);


-- ----------------------------------------------------------
-- 4. BADGES (Credly-style) — optional, add if you have Credly badges
-- ----------------------------------------------------------
-- Uncomment and fill in once you have real Credly badge URLs:
--
-- insert into badges (name, description, image_url, verify_url, status, sort_order)
-- values (
--   'AWS Certified Solutions Architect',
--   'Earners of this certification have a comprehensive understanding of AWS architecture.',
--   'REPLACE_WITH_YOUR_S3_IMAGE_URL/aws-saa-credly.png',
--   'REPLACE_WITH_YOUR_CREDLY_BADGE_URL',
--   'published',
--   1
-- );


-- ----------------------------------------------------------
-- 5. ADMIN USER (so you can log into /admin and edit content yourself)
-- ----------------------------------------------------------
-- IMPORTANT: This step is done in two parts:
--
-- PART A — In the Supabase Dashboard (not SQL):
--   Go to Authentication > Users > Add User
--   Email: mohamedsalem11041@gmail.com
--   Password: (choose a strong password)
--   Copy the generated User UID.
--
-- PART B — Run this SQL, replacing YOUR_USER_UID_HERE with that UID:
--
-- insert into users (id, email, role)
-- values ('YOUR_USER_UID_HERE', 'mohamedsalem11041@gmail.com', 'admin');
