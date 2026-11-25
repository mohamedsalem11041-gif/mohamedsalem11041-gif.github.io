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
import { graphicsService, generateSlug, type Graphic, type GraphicInsert } from '../../services/admin';

const initialFormData: Omit<GraphicInsert, 'id'> = {
    title: '',
    slug: '',
    client: '',
    description: '',
    tags: [],
    preview_url: '',
    asset_urls: [],
    status: 'draft',
};

export default function GraphicsManager() {
    const [graphics, setGraphics] = useState<Graphic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGraphic, setSelectedGraphic] = useState<Graphic | null>(null);
    const [formData, setFormData] = useState<Omit<GraphicInsert, 'id'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadGraphics();
    }, []);

    const loadGraphics = async () => {
        try {
            setLoading(true);
            const data = await graphicsService.getAll();
            setGraphics(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load graphics');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedGraphic(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (graphic: Graphic) => {
        setSelectedGraphic(graphic);
        setFormData({
            title: graphic.title,
            slug: graphic.slug,
            client: graphic.client || '',
            description: graphic.description || '',
            tags: graphic.tags || [],
            preview_url: graphic.preview_url || '',
            asset_urls: (graphic.asset_urls as string[]) || [],
            status: graphic.status,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (graphic: Graphic) => {
        setSelectedGraphic(graphic);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedGraphic) return;
        try {
            setDeleting(true);
            await graphicsService.delete(selectedGraphic.id);
            setSuccess('Graphic deleted successfully');
            setIsDeleteDialogOpen(false);
            loadGraphics();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete graphic');
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
            const slugExists = await graphicsService.checkSlugExists(
                formData.slug,
                selectedGraphic?.id
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
            if (selectedGraphic) {
                await graphicsService.update(selectedGraphic.id, formData);
                setSuccess('Graphic updated successfully');
            } else {
                await graphicsService.create(formData as GraphicInsert);
                setSuccess('Graphic created successfully');
            }
            setIsModalOpen(false);
            loadGraphics();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save graphic');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (title: string) => {
        setFormData((prev) => ({
            ...prev,
            title,
            slug: !selectedGraphic ? generateSlug(title) : prev.slug,
        }));
    };

    const columns: Column<Graphic>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (graphic) => (
                <div className="flex items-center gap-3">
                    {graphic.preview_url && (
                        <img
                            src={graphic.preview_url}
                            alt={graphic.title}
                            className="h-10 w-10 rounded object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                    <div>
                        <p className="font-medium text-white">{graphic.title}</p>
                        <p className="text-xs text-slate-500">/{graphic.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'client',
            header: 'Client',
            render: (graphic) => (
                <span className="text-slate-300">{graphic.client || '-'}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (graphic) => <StatusBadge status={graphic.status} />,
        },
        {
            key: 'tags',
            header: 'Tags',
            render: (graphic) => <TagList tags={graphic.tags} />,
        },
        {
            key: 'updated_at',
            header: 'Last Updated',
            render: (graphic) => (
                <span className="text-slate-400">
                    {new Date(graphic.updated_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Graphics"
                description="Manage your graphic design work"
                action={
                    <Button onClick={handleCreate}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Graphic
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
                data={graphics}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRowKey={(graphic) => graphic.id}
                emptyMessage="No graphics yet. Add your first design!"
            />

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedGraphic ? 'Edit Graphic' : 'Add Graphic'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Title" htmlFor="title" required error={formErrors.title}>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Brand Identity Design"
                                error={!!formErrors.title}
                            />
                        </FormField>

                        <FormField label="Slug" htmlFor="slug" required error={formErrors.slug}>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="brand-identity-design"
                                error={!!formErrors.slug}
                            />
                        </FormField>
                    </div>

                    <FormField label="Client" htmlFor="client">
                        <Input
                            id="client"
                            value={formData.client || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
                            placeholder="Client Name"
                        />
                    </FormField>

                    <FormField label="Description" htmlFor="description">
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe this graphic work..."
                            rows={3}
                        />
                    </FormField>

                    <FormField label="Preview URL" htmlFor="preview_url">
                        <Input
                            id="preview_url"
                            type="url"
                            value={formData.preview_url || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, preview_url: e.target.value }))}
                            placeholder="https://example.com/preview.jpg"
                        />
                    </FormField>

                    <FormField label="Asset URLs">
                        <UrlListInput
                            value={(formData.asset_urls as string[]) || []}
                            onChange={(urls) => setFormData((prev) => ({ ...prev, asset_urls: urls }))}
                            placeholder="Add asset URL"
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
                            {selectedGraphic ? 'Update Graphic' : 'Add Graphic'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Graphic"
                message={`Are you sure you want to delete "${selectedGraphic?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
