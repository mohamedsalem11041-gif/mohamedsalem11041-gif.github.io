import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface DocumentMeta {
  title: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://mohamedsalem11041-gif.github.io';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = 'Mohamed Salem';

/**
 * Hook to manage document meta tags for SEO
 * Updates title, description, Open Graph, and Twitter meta tags
 */
export function useDocumentMeta({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
}: DocumentMeta) {
  const location = useLocation();
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath || location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic meta tags
    setMetaTag('title', fullTitle);
    if (description) {
      setMetaTag('description', description);
    }
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Robots directive
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Canonical URL
    setLinkTag('canonical', canonicalUrl);

    // Open Graph tags
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:site_name', SITE_NAME, true);
    if (description) {
      setMetaTag('og:description', description, true);
    }
    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
    }

    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:url', canonicalUrl);
    if (description) {
      setMetaTag('twitter:description', description);
    }
    if (ogImage) {
      setMetaTag('twitter:image', ogImage);
    }

    // Cleanup function - reset to defaults when component unmounts
    return () => {
      document.title = `${SITE_NAME} | Cloud & DevOps Engineer`;
    };
  }, [fullTitle, description, keywords, canonicalUrl, ogType, ogImage, noIndex]);
}

// Predefined SEO configs for each page
export const SEO_CONFIG = {
  home: {
    title: 'Cloud & DevOps Engineer - AWS, Kubernetes',
    description: 'Cloud & DevOps Engineer specializing in AWS, Azure, Kubernetes, and infrastructure automation. View my projects and certifications.',
    keywords: 'Cloud Engineer, DevOps, AWS, Azure, Kubernetes, Docker, Terraform, Infrastructure as Code, CI/CD, Portfolio',
  },
  projects: {
    title: 'Projects & Experiments',
    description: 'A collection of full-stack applications, cloud architectures, and open-source tools. Each project represents a journey from concept to deployment.',
    keywords: 'Projects, Portfolio, Full Stack, Cloud Architecture, Open Source, Web Development, DevOps Projects',
  },
  skills: {
    title: 'Skills & Certifications',
    description: 'Technical skills, certifications, and professional experience in cloud computing, DevOps, cybersecurity, and full-stack development.',
    keywords: 'Skills, Certifications, AWS Certified, Azure, Kubernetes, Experience, Resume, Cloud Certifications',
  },
  studio: {
    title: 'Creative Studio',
    description: 'Creative experiments, design work, and multimedia projects. Exploring the intersection of technology and art.',
    keywords: 'Creative Studio, Design, Graphics, Multimedia, 3D, Animation, Creative Coding',
  },
  blog: {
    title: 'Blog & Articles',
    description: 'Thoughts, tutorials, and behind-the-scenes notes from recent builds. Technical writing on cloud, DevOps, and software engineering.',
    keywords: 'Blog, Articles, Tutorials, Technical Writing, DevOps Blog, Cloud Computing Articles',
    canonicalPath: '/blog',
  },
  contact: {
    title: 'Contact',
    description: 'Get in touch for collaborations, opportunities, or just to say hello. Let\'s build something amazing together.',
    keywords: 'Contact, Hire, Collaborate, Cloud Engineer Contact, DevOps Consultant',
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.',
    noIndex: true,
  },
} as const;
