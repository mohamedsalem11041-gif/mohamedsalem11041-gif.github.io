export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    role: 'admin'
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    role: 'admin'
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin'
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    summary: string | null
                    description_md: string | null
                    demo_url: string | null
                    code_url: string | null
                    tags: string[]
                    images: Json
                    status: 'draft' | 'published'
                    created_at: string
                    updated_at: string
                    published_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    summary?: string | null
                    description_md?: string | null
                    demo_url?: string | null
                    code_url?: string | null
                    tags?: string[]
                    images?: Json
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                    published_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    summary?: string | null
                    description_md?: string | null
                    demo_url?: string | null
                    code_url?: string | null
                    tags?: string[]
                    images?: Json
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                    published_at?: string | null
                }
            }
            graphics: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    client: string | null
                    description: string | null
                    tags: string[]
                    preview_url: string | null
                    asset_urls: Json
                    status: 'draft' | 'published'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    client?: string | null
                    description?: string | null
                    tags?: string[]
                    preview_url?: string | null
                    asset_urls?: Json
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    client?: string | null
                    description?: string | null
                    tags?: string[]
                    preview_url?: string | null
                    asset_urls?: Json
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                }
            }
            reels: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    description: string | null
                    tags: string[]
                    video_url: string
                    poster_url: string | null
                    duration: number | null
                    status: 'draft' | 'published'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    description?: string | null
                    tags?: string[]
                    video_url: string
                    poster_url?: string | null
                    duration?: number | null
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    description?: string | null
                    tags?: string[]
                    video_url?: string
                    poster_url?: string | null
                    duration?: number | null
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                }
            }
            blog_posts: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    summary: string | null
                    content_md: string | null
                    cover_url: string | null
                    tags: string[]
                    status: 'draft' | 'published'
                    created_at: string
                    updated_at: string
                    published_at: string | null
                    og_image_url: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    summary?: string | null
                    content_md?: string | null
                    cover_url?: string | null
                    tags?: string[]
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                    published_at?: string | null
                    og_image_url?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    summary?: string | null
                    content_md?: string | null
                    cover_url?: string | null
                    tags?: string[]
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                    published_at?: string | null
                    og_image_url?: string | null
                }
            }
            hobbies: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    description: string | null
                    media_urls: Json
                    tags: string[]
                    status: 'draft' | 'published'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    description?: string | null
                    media_urls?: Json
                    tags?: string[]
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    description?: string | null
                    media_urls?: Json
                    tags?: string[]
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                }
            }
            certs: {
                Row: {
                    id: string
                    name: string
                    issuer: string | null
                    issue_date: string | null
                    expires_at: string | null
                    badge_url: string | null
                    verify_url: string | null
                    tags: string[]
                    status: 'draft' | 'published'
                    sort_order: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    issuer?: string | null
                    issue_date?: string | null
                    expires_at?: string | null
                    badge_url?: string | null
                    verify_url?: string | null
                    tags?: string[]
                    status?: 'draft' | 'published'
                    sort_order?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    issuer?: string | null
                    issue_date?: string | null
                    expires_at?: string | null
                    badge_url?: string | null
                    verify_url?: string | null
                    tags?: string[]
                    status?: 'draft' | 'published'
                    sort_order?: number | null
                    created_at?: string
                }
            }
            badges: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    image_url: string | null
                    verify_url: string | null
                    status: 'draft' | 'published'
                    sort_order: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    image_url?: string | null
                    verify_url?: string | null
                    status?: 'draft' | 'published'
                    sort_order?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    image_url?: string | null
                    verify_url?: string | null
                    status?: 'draft' | 'published'
                    sort_order?: number | null
                    created_at?: string
                }
            }
            contact_submissions: {
                Row: {
                    id: string
                    name: string
                    email: string
                    message: string
                    source_page: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    message: string
                    source_page?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    message?: string
                    source_page?: string | null
                    created_at?: string
                }
            }
            settings: {
                Row: {
                    id: boolean
                    availability_status: string | null
                    hero_copy: string | null
                    socials: Json
                    cv_url: string | null
                    seo_defaults: Json
                }
                Insert: {
                    id?: boolean
                    availability_status?: string | null
                    hero_copy?: string | null
                    socials?: Json
                    cv_url?: string | null
                    seo_defaults?: Json
                }
                Update: {
                    id?: boolean
                    availability_status?: string | null
                    hero_copy?: string | null
                    socials?: Json
                    cv_url?: string | null
                    seo_defaults?: Json
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            status_state: 'draft' | 'published'
        }
    }
}
