import { getSupabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

// Type aliases for cleaner code
type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

type Graphic = Database['public']['Tables']['graphics']['Row'];
type GraphicInsert = Database['public']['Tables']['graphics']['Insert'];
type GraphicUpdate = Database['public']['Tables']['graphics']['Update'];

type Reel = Database['public']['Tables']['reels']['Row'];
type ReelInsert = Database['public']['Tables']['reels']['Insert'];
type ReelUpdate = Database['public']['Tables']['reels']['Update'];

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

type Hobby = Database['public']['Tables']['hobbies']['Row'];
type HobbyInsert = Database['public']['Tables']['hobbies']['Insert'];
type HobbyUpdate = Database['public']['Tables']['hobbies']['Update'];

type Cert = Database['public']['Tables']['certs']['Row'];
type CertInsert = Database['public']['Tables']['certs']['Insert'];
type CertUpdate = Database['public']['Tables']['certs']['Update'];

type Badge = Database['public']['Tables']['badges']['Row'];
type BadgeInsert = Database['public']['Tables']['badges']['Insert'];
type BadgeUpdate = Database['public']['Tables']['badges']['Update'];

type Settings = Database['public']['Tables']['settings']['Row'];
type SettingsUpdate = Database['public']['Tables']['settings']['Update'];

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];

// Generic helper for slug generation
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Projects Service
export const projectsService = {
    async getAll(): Promise<Project[]> {
        const { data, error } = await getSupabase()
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Project | null> {
        const { data, error } = await getSupabase()
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(project: ProjectInsert): Promise<Project> {
        const { data, error } = await getSupabase()
            .from('projects')
            .insert(project as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, project: ProjectUpdate): Promise<Project> {
        const { data, error } = await getSupabase()
            .from('projects')
            .update(project as never)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('projects')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
        let query = getSupabase()
            .from('projects')
            .select('id')
            .eq('slug', slug);
        if (excludeId) {
            query = query.neq('id', excludeId);
        }
        const { data } = await query;
        return (data?.length || 0) > 0;
    }
};

// Graphics Service
export const graphicsService = {
    async getAll(): Promise<Graphic[]> {
        const { data, error } = await getSupabase()
            .from('graphics')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Graphic | null> {
        const { data, error } = await getSupabase()
            .from('graphics')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(graphic: GraphicInsert): Promise<Graphic> {
        const { data, error } = await getSupabase()
            .from('graphics')
            .insert(graphic as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, graphic: GraphicUpdate): Promise<Graphic> {
        const { data, error } = await getSupabase()
            .from('graphics')
            .update(graphic as never)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('graphics')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
        let query = getSupabase()
            .from('graphics')
            .select('id')
            .eq('slug', slug);
        if (excludeId) {
            query = query.neq('id', excludeId);
        }
        const { data } = await query;
        return (data?.length || 0) > 0;
    }
};

// Reels Service
export const reelsService = {
    async getAll(): Promise<Reel[]> {
        const { data, error } = await getSupabase()
            .from('reels')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Reel | null> {
        const { data, error } = await getSupabase()
            .from('reels')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(reel: ReelInsert): Promise<Reel> {
        const { data, error } = await getSupabase()
            .from('reels')
            .insert(reel as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, reel: ReelUpdate): Promise<Reel> {
        const { data, error } = await getSupabase()
            .from('reels')
            .update(reel as never)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('reels')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
        let query = getSupabase()
            .from('reels')
            .select('id')
            .eq('slug', slug);
        if (excludeId) {
            query = query.neq('id', excludeId);
        }
        const { data } = await query;
        return (data?.length || 0) > 0;
    }
};

// Blog Posts Service
export const blogPostsService = {
    async getAll(): Promise<BlogPost[]> {
        const { data, error } = await getSupabase()
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<BlogPost | null> {
        const { data, error } = await getSupabase()
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(post: BlogPostInsert): Promise<BlogPost> {
        const { data, error } = await getSupabase()
            .from('blog_posts')
            .insert(post as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, post: BlogPostUpdate): Promise<BlogPost> {
        const { data, error } = await getSupabase()
            .from('blog_posts')
            .update(post as never)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('blog_posts')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
        let query = getSupabase()
            .from('blog_posts')
            .select('id')
            .eq('slug', slug);
        if (excludeId) {
            query = query.neq('id', excludeId);
        }
        const { data } = await query;
        return (data?.length || 0) > 0;
    }
};

// Hobbies Service
export const hobbiesService = {
    async getAll(): Promise<Hobby[]> {
        const { data, error } = await getSupabase()
            .from('hobbies')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Hobby | null> {
        const { data, error } = await getSupabase()
            .from('hobbies')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(hobby: HobbyInsert): Promise<Hobby> {
        const { data, error } = await getSupabase()
            .from('hobbies')
            .insert(hobby as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, hobby: HobbyUpdate): Promise<Hobby> {
        const { data, error } = await getSupabase()
            .from('hobbies')
            .update(hobby as never)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('hobbies')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
        let query = getSupabase()
            .from('hobbies')
            .select('id')
            .eq('slug', slug);
        if (excludeId) {
            query = query.neq('id', excludeId);
        }
        const { data } = await query;
        return (data?.length || 0) > 0;
    }
};

// Certs Service
export const certsService = {
    async getAll(): Promise<Cert[]> {
        const { data, error } = await getSupabase()
            .from('certs')
            .select('*')
            .order('sort_order', { ascending: true, nullsFirst: false })
            .order('issue_date', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Cert | null> {
        const { data, error } = await getSupabase()
            .from('certs')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(cert: CertInsert): Promise<Cert> {
        const { data, error } = await getSupabase()
            .from('certs')
            .insert(cert as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, cert: CertUpdate): Promise<Cert> {
        const { data, error } = await getSupabase()
            .from('certs')
            .update(cert as never)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('certs')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// Badges Service
export const badgesService = {
    async getAll(): Promise<Badge[]> {
        const { data, error } = await getSupabase()
            .from('badges')
            .select('*')
            .order('sort_order', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Badge | null> {
        const { data, error } = await getSupabase()
            .from('badges')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(badge: BadgeInsert): Promise<Badge> {
        const { data, error } = await getSupabase()
            .from('badges')
            .insert(badge as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, badge: BadgeUpdate): Promise<Badge> {
        const { data, error } = await getSupabase()
            .from('badges')
            .update(badge as never)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('badges')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// Settings Service
export const settingsService = {
    async get(): Promise<Settings | null> {
        const { data, error } = await getSupabase()
            .from('settings')
            .select('*')
            .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
    },

    async upsert(settings: SettingsUpdate): Promise<Settings> {
        const { data, error } = await getSupabase()
            .from('settings')
            .upsert({ id: true, ...settings } as never)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// Contact Submissions Service (Read-only for admin)
export const contactSubmissionsService = {
    async getAll(): Promise<ContactSubmission[]> {
        const { data, error } = await getSupabase()
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<ContactSubmission | null> {
        const { data, error } = await getSupabase()
            .from('contact_submissions')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await getSupabase()
            .from('contact_submissions')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// Dashboard Statistics
export const dashboardService = {
    async getStats(): Promise<{
        projects: { total: number; published: number; draft: number };
        graphics: { total: number; published: number; draft: number };
        reels: { total: number; published: number; draft: number };
        blogPosts: { total: number; published: number; draft: number };
        hobbies: { total: number; published: number; draft: number };
        certs: { total: number; published: number; draft: number };
        badges: { total: number; published: number; draft: number };
        contactSubmissions: number;
    }> {
        const [
            projects,
            graphics,
            reels,
            blogPosts,
            hobbies,
            certs,
            badges,
            contactSubmissions
        ] = await Promise.all([
            getSupabase().from('projects').select('status'),
            getSupabase().from('graphics').select('status'),
            getSupabase().from('reels').select('status'),
            getSupabase().from('blog_posts').select('status'),
            getSupabase().from('hobbies').select('status'),
            getSupabase().from('certs').select('status'),
            getSupabase().from('badges').select('status'),
            getSupabase().from('contact_submissions').select('id')
        ]);

        const countStatuses = (data: { status: string }[] | null) => ({
            total: data?.length || 0,
            published: data?.filter(d => d.status === 'published').length || 0,
            draft: data?.filter(d => d.status === 'draft').length || 0
        });

        return {
            projects: countStatuses(projects.data as { status: string }[] | null),
            graphics: countStatuses(graphics.data as { status: string }[] | null),
            reels: countStatuses(reels.data as { status: string }[] | null),
            blogPosts: countStatuses(blogPosts.data as { status: string }[] | null),
            hobbies: countStatuses(hobbies.data as { status: string }[] | null),
            certs: countStatuses(certs.data as { status: string }[] | null),
            badges: countStatuses(badges.data as { status: string }[] | null),
            contactSubmissions: contactSubmissions.data?.length || 0
        };
    }
};

// Export types for use in components
export type {
    Project, ProjectInsert, ProjectUpdate,
    Graphic, GraphicInsert, GraphicUpdate,
    Reel, ReelInsert, ReelUpdate,
    BlogPost, BlogPostInsert, BlogPostUpdate,
    Hobby, HobbyInsert, HobbyUpdate,
    Cert, CertInsert, CertUpdate,
    Badge, BadgeInsert, BadgeUpdate,
    Settings, SettingsUpdate,
    ContactSubmission
};
