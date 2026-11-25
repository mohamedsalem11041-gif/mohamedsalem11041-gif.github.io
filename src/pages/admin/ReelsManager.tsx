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
import { reelsService, generateSlug, type Reel, type ReelInsert } from '../../services/admin';

const initialFormData: Omit<ReelInsert, 'id'> = {
    title: '',
    slug: '',
    description: '',
    tags: [],
    video_url: '',
    poster_url: '',
    duration: null,
    status: 'draft',
};

export default function ReelsManager() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
    const [formData, setFormData] = useState<Omit<ReelInsert, 'id'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadReels();
    }, []);

    const loadReels = async () => {
        try {
            setLoading(true);
            const data = await reelsService.getAll();
            setReels(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load reels');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedReel(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (reel: Reel) => {
        setSelectedReel(reel);
        setFormData({
            title: reel.title,
            slug: reel.slug,
            description: reel.description || '',
            tags: reel.tags || [],
            video_url: reel.video_url,
            poster_url: reel.poster_url || '',
            duration: reel.duration,
            status: reel.status,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (reel: Reel) => {
        setSelectedReel(reel);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedReel) return;
        try {
            setDeleting(true);
            await reelsService.delete(selectedReel.id);
            setSuccess('Reel deleted successfully');
            setIsDeleteDialogOpen(false);
            loadReels();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete reel');
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
            const slugExists = await reelsService.checkSlugExists(
                formData.slug,
                selectedReel?.id
            );
            if (slugExists) {
                errors.slug = 'This slug is already in use';
            }
        }

        if (!formData.video_url.trim()) {
            errors.video_url = 'Video URL is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!(await validateForm())) return;

        try {
            setSaving(true);
            if (selectedReel) {
                await reelsService.update(selectedReel.id, formData);
                setSuccess('Reel updated successfully');
            } else {
                await reelsService.create(formData as ReelInsert);
                setSuccess('Reel created successfully');
            }
            setIsModalOpen(false);
            loadReels();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save reel');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (title: string) => {
        setFormData((prev) => ({
            ...prev,
            title,
            slug: !selectedReel ? generateSlug(title) : prev.slug,
        }));
    };

    const formatDuration = (seconds: number | null): string => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const columns: Column<Reel>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (reel) => (
                <div className="flex items-center gap-3">
                    {reel.poster_url && (
                        <img
                            src={reel.poster_url}
                            alt={reel.title}
                            className="h-10 w-16 rounded object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                    <div>
                        <p className="font-medium text-white">{reel.title}</p>
                        <p className="text-xs text-slate-500">/{reel.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'duration',
            header: 'Duration',
            render: (reel) => (
                <span className="text-slate-300">{formatDuration(reel.duration)}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (reel) => <StatusBadge status={reel.status} />,
        },
        {
            key: 'tags',
            header: 'Tags',
            render: (reel) => <TagList tags={reel.tags} />,
        },
        {
            key: 'updated_at',
            header: 'Last Updated',
            render: (reel) => (
                <span className="text-slate-400">
                    {new Date(reel.updated_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Reels"
                description="Manage your video reels"
                action={
                    <Button onClick={handleCreate}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Reel
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
                data={reels}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRowKey={(reel) => reel.id}
                emptyMessage="No reels yet. Upload your first video!"
            />

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedReel ? 'Edit Reel' : 'Add Reel'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Title" htmlFor="title" required error={formErrors.title}>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Motion Graphics Demo"
                                error={!!formErrors.title}
                            />
                        </FormField>

                        <FormField label="Slug" htmlFor="slug" required error={formErrors.slug}>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="motion-graphics-demo"
                                error={!!formErrors.slug}
                            />
                        </FormField>
                    </div>

                    <FormField label="Video URL (MP4)" htmlFor="video_url" required error={formErrors.video_url}>
                        <Input
                            id="video_url"
                            type="url"
                            value={formData.video_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, video_url: e.target.value }))}
                            placeholder="https://s3.example.com/video.mp4"
                            error={!!formErrors.video_url}
                        />
                    </FormField>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Poster URL" htmlFor="poster_url">
                            <Input
                                id="poster_url"
                                type="url"
                                value={formData.poster_url || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, poster_url: e.target.value }))}
                                placeholder="https://example.com/poster.jpg"
                            />
                        </FormField>

                        <FormField label="Duration (seconds)" htmlFor="duration">
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value ? parseInt(e.target.value) : null }))}
                                placeholder="120"
                            />
                        </FormField>
                    </div>

                    <FormField label="Description" htmlFor="description">
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe this reel..."
                            rows={3}
                        />
                    </FormField>

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
                            {selectedReel ? 'Update Reel' : 'Add Reel'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Reel"
                message={`Are you sure you want to delete "${selectedReel?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
