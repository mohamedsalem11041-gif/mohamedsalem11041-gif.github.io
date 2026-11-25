import { useState, useEffect } from 'react';
import DataTable, { StatusBadge, TagList } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import {
    PageHeader,
    Button,
    Modal,
    FormField,
    Input,
    Textarea,
    Select,
    TagInput,
    ConfirmDialog,
    Alert,
} from '../../components/admin/FormComponents';
import { blogPostsService, generateSlug, type BlogPost, type BlogPostInsert } from '../../services/admin';

const initialFormData: Omit<BlogPostInsert, 'id'> = {
    title: '',
    slug: '',
    summary: '',
    content_md: '',
    cover_url: '',
    tags: [],
    status: 'draft',
    og_image_url: '',
};

export default function BlogManager() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<Omit<BlogPostInsert, 'id'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await blogPostsService.getAll();
            setPosts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedPost(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            summary: post.summary || '',
            content_md: post.content_md || '',
            cover_url: post.cover_url || '',
            tags: post.tags || [],
            status: post.status,
            og_image_url: post.og_image_url || '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (post: BlogPost) => {
        setSelectedPost(post);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedPost) return;
        try {
            setDeleting(true);
            await blogPostsService.delete(selectedPost.id);
            setSuccess('Blog post deleted successfully');
            setIsDeleteDialogOpen(false);
            loadPosts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete blog post');
        } finally {
            setDeleting(false);
        }
    };

    const validateForm = async (): Promise<boolean> => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }

        if (!formData.slug.trim()) {
            errors.slug = 'Slug is required';
        } else {
            const slugExists = await blogPostsService.checkSlugExists(
                formData.slug,
                selectedPost?.id
            );
            if (slugExists) {
                errors.slug = 'This slug is already in use';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!(await validateForm())) return;

        try {
            setSaving(true);
            const dataToSave = {
                ...formData,
                published_at: formData.status === 'published' && !selectedPost?.published_at
                    ? new Date().toISOString()
                    : selectedPost?.published_at,
            };

            if (selectedPost) {
                await blogPostsService.update(selectedPost.id, dataToSave);
                setSuccess('Blog post updated successfully');
            } else {
                await blogPostsService.create(dataToSave as BlogPostInsert);
                setSuccess('Blog post created successfully');
            }
            setIsModalOpen(false);
            loadPosts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save blog post');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (title: string) => {
        setFormData((prev) => ({
            ...prev,
            title,
            slug: !selectedPost ? generateSlug(title) : prev.slug,
        }));
    };

    const columns: Column<BlogPost>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (post) => (
                <div className="flex items-center gap-3">
                    {post.cover_url && (
                        <img
                            src={post.cover_url}
                            alt={post.title}
                            className="h-10 w-14 rounded object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                    <div>
                        <p className="font-medium text-white">{post.title}</p>
                        <p className="text-xs text-slate-500">/blog/{post.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (post) => <StatusBadge status={post.status} />,
        },
        {
            key: 'tags',
            header: 'Tags',
            render: (post) => <TagList tags={post.tags} />,
        },
        {
            key: 'published_at',
            header: 'Published',
            render: (post) => (
                <span className="text-slate-400">
                    {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : '-'}
                </span>
            ),
        },
        {
            key: 'updated_at',
            header: 'Last Updated',
            render: (post) => (
                <span className="text-slate-400">
                    {new Date(post.updated_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Blog Posts"
                description="Manage your blog content"
                action={
                    <Button onClick={handleCreate}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Post
                    </Button>
                }
            />

            {error && (
                <div className="mb-6">
                    <Alert type="error" message={error} onClose={() => setError(null)} />
                </div>
            )}

            {success && (
                <div className="mb-6">
                    <Alert type="success" message={success} onClose={() => setSuccess(null)} />
                </div>
            )}

            <DataTable
                data={posts}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRowKey={(post) => post.id}
                emptyMessage="No blog posts yet. Write your first article!"
            />

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPost ? 'Edit Blog Post' : 'Create Blog Post'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Title" htmlFor="title" required error={formErrors.title}>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="My First Blog Post"
                                error={!!formErrors.title}
                            />
                        </FormField>

                        <FormField label="Slug" htmlFor="slug" required error={formErrors.slug}>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="my-first-blog-post"
                                error={!!formErrors.slug}
                            />
                        </FormField>
                    </div>

                    <FormField label="Summary" htmlFor="summary">
                        <Textarea
                            id="summary"
                            value={formData.summary || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                            placeholder="A brief summary of this post..."
                            rows={2}
                        />
                    </FormField>

                    <FormField label="Content (Markdown)" htmlFor="content">
                        <Textarea
                            id="content"
                            value={formData.content_md || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, content_md: e.target.value }))}
                            placeholder="# Introduction\n\nWrite your blog post content in Markdown..."
                            rows={12}
                            className="font-mono text-sm"
                        />
                    </FormField>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Cover Image URL" htmlFor="cover_url">
                            <Input
                                id="cover_url"
                                type="url"
                                value={formData.cover_url || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, cover_url: e.target.value }))}
                                placeholder="https://example.com/cover.jpg"
                            />
                        </FormField>

                        <FormField label="OG Image URL" htmlFor="og_image_url">
                            <Input
                                id="og_image_url"
                                type="url"
                                value={formData.og_image_url || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, og_image_url: e.target.value }))}
                                placeholder="https://example.com/og.jpg"
                            />
                        </FormField>
                    </div>

                    <FormField label="Tags">
                        <TagInput
                            value={formData.tags || []}
                            onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                        />
                    </FormField>

                    <FormField label="Status" htmlFor="status">
                        <Select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                            options={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'published', label: 'Published' },
                            ]}
                        />
                    </FormField>

                    <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving}>
                            {selectedPost ? 'Update Post' : 'Create Post'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Blog Post"
                message={`Are you sure you want to delete "${selectedPost?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
