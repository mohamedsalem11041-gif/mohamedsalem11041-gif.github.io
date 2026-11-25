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
    UrlListInput,
    ConfirmDialog,
    Alert,
} from '../../components/admin/FormComponents';
import { hobbiesService, generateSlug, type Hobby, type HobbyInsert } from '../../services/admin';

const initialFormData: Omit<HobbyInsert, 'id'> = {
    title: '',
    slug: '',
    description: '',
    media_urls: [],
    tags: [],
    status: 'draft',
};

export default function HobbiesManager() {
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
    const [formData, setFormData] = useState<Omit<HobbyInsert, 'id'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadHobbies();
    }, []);

    const loadHobbies = async () => {
        try {
            setLoading(true);
            const data = await hobbiesService.getAll();
            setHobbies(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load hobbies');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedHobby(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (hobby: Hobby) => {
        setSelectedHobby(hobby);
        setFormData({
            title: hobby.title,
            slug: hobby.slug,
            description: hobby.description || '',
            media_urls: (hobby.media_urls as string[]) || [],
            tags: hobby.tags || [],
            status: hobby.status,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (hobby: Hobby) => {
        setSelectedHobby(hobby);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedHobby) return;
        try {
            setDeleting(true);
            await hobbiesService.delete(selectedHobby.id);
            setSuccess('Hobby deleted successfully');
            setIsDeleteDialogOpen(false);
            loadHobbies();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete hobby');
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
            const slugExists = await hobbiesService.checkSlugExists(
                formData.slug,
                selectedHobby?.id
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
            if (selectedHobby) {
                await hobbiesService.update(selectedHobby.id, formData);
                setSuccess('Hobby updated successfully');
            } else {
                await hobbiesService.create(formData as HobbyInsert);
                setSuccess('Hobby created successfully');
            }
            setIsModalOpen(false);
            loadHobbies();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save hobby');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (title: string) => {
        setFormData((prev) => ({
            ...prev,
            title,
            slug: !selectedHobby ? generateSlug(title) : prev.slug,
        }));
    };

    const columns: Column<Hobby>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (hobby) => {
                const mediaUrls = (hobby.media_urls as string[]) || [];
                const previewUrl = mediaUrls[0];
                return (
                    <div className="flex items-center gap-3">
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt={hobby.title}
                                className="h-10 w-10 rounded object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                        <div>
                            <p className="font-medium text-white">{hobby.title}</p>
                            <p className="text-xs text-slate-500">/{hobby.slug}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'media',
            header: 'Media',
            render: (hobby) => (
                <span className="text-slate-300">
                    {((hobby.media_urls as string[]) || []).length} items
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (hobby) => <StatusBadge status={hobby.status} />,
        },
        {
            key: 'tags',
            header: 'Tags',
            render: (hobby) => <TagList tags={hobby.tags} />,
        },
        {
            key: 'updated_at',
            header: 'Last Updated',
            render: (hobby) => (
                <span className="text-slate-400">
                    {new Date(hobby.updated_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Hobbies"
                description="Manage your hobby showcase"
                action={
                    <Button onClick={handleCreate}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Hobby
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
                data={hobbies}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRowKey={(hobby) => hobby.id}
                emptyMessage="No hobbies yet. Share what you love doing!"
            />

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedHobby ? 'Edit Hobby' : 'Add Hobby'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Title" htmlFor="title" required error={formErrors.title}>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Photography"
                                error={!!formErrors.title}
                            />
                        </FormField>

                        <FormField label="Slug" htmlFor="slug" required error={formErrors.slug}>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="photography"
                                error={!!formErrors.slug}
                            />
                        </FormField>
                    </div>

                    <FormField label="Description" htmlFor="description">
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe this hobby..."
                            rows={3}
                        />
                    </FormField>

                    <FormField label="Media URLs">
                        <UrlListInput
                            value={(formData.media_urls as string[]) || []}
                            onChange={(urls) => setFormData((prev) => ({ ...prev, media_urls: urls }))}
                            placeholder="Add image or video URL"
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
                            {selectedHobby ? 'Update Hobby' : 'Add Hobby'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Hobby"
                message={`Are you sure you want to delete "${selectedHobby?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
