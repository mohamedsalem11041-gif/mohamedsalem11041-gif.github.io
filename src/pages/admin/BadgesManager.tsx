import { useState, useEffect } from 'react';
import DataTable, { StatusBadge } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import {
    PageHeader,
    Button,
    Modal,
    FormField,
    Input,
    Textarea,
    Select,
    ConfirmDialog,
    Alert,
} from '../../components/admin/FormComponents';
import { badgesService, type Badge, type BadgeInsert } from '../../services/admin';

const initialFormData: Omit<BadgeInsert, 'id'> = {
    name: '',
    description: '',
    image_url: '',
    verify_url: '',
    status: 'published',
    sort_order: null,
};

export default function BadgesManager() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [formData, setFormData] = useState<Omit<BadgeInsert, 'id'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadBadges();
    }, []);

    const loadBadges = async () => {
        try {
            setLoading(true);
            const data = await badgesService.getAll();
            setBadges(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load badges');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedBadge(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (badge: Badge) => {
        setSelectedBadge(badge);
        setFormData({
            name: badge.name,
            description: badge.description || '',
            image_url: badge.image_url || '',
            verify_url: badge.verify_url || '',
            status: badge.status,
            sort_order: badge.sort_order || null,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (badge: Badge) => {
        setSelectedBadge(badge);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedBadge) return;
        try {
            setDeleting(true);
            await badgesService.delete(selectedBadge.id);
            setSuccess('Badge deleted successfully');
            setIsDeleteDialogOpen(false);
            loadBadges();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete badge');
        } finally {
            setDeleting(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);
            if (selectedBadge) {
                await badgesService.update(selectedBadge.id, formData);
                setSuccess('Badge updated successfully');
            } else {
                await badgesService.create(formData as BadgeInsert);
                setSuccess('Badge created successfully');
            }
            setIsModalOpen(false);
            loadBadges();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save badge');
        } finally {
            setSaving(false);
        }
    };

    const columns: Column<Badge>[] = [
        {
            key: 'name',
            header: 'Badge',
            render: (badge) => (
                <div className="flex items-center gap-3">
                    {badge.image_url && (
                        <img
                            src={badge.image_url}
                            alt={badge.name}
                            className="h-10 w-10 rounded object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                    <div>
                        <p className="font-medium text-white">{badge.name}</p>
                        {badge.description && (
                            <p className="max-w-xs truncate text-xs text-slate-500">
                                {badge.description}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'verify_url',
            header: 'Verification',
            render: (badge) => (
                badge.verify_url ? (
                    <a
                        href={badge.verify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline"
                    >
                        View
                    </a>
                ) : (
                    <span className="text-slate-500">-</span>
                )
            ),
        },
        {
            key: 'sort_order',
            header: 'Sort Order',
            render: (badge) => (
                <span className="text-slate-400">
                    {badge.sort_order ?? '-'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (badge) => <StatusBadge status={badge.status} />,
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (badge) => (
                <span className="text-slate-400">
                    {new Date(badge.created_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Badges"
                description="Manage your skill badges and achievements"
                action={
                    <Button onClick={handleCreate}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Badge
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
                data={badges}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRowKey={(badge) => badge.id}
                emptyMessage="No badges yet. Add your first achievement!"
            />

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedBadge ? 'Edit Badge' : 'Add Badge'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="Name" htmlFor="name" required error={formErrors.name}>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="AWS Community Builder"
                            error={!!formErrors.name}
                        />
                    </FormField>

                    <FormField label="Description" htmlFor="description">
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe this badge..."
                            rows={3}
                        />
                    </FormField>

                    <FormField label="Image URL" htmlFor="image_url">
                        <Input
                            id="image_url"
                            type="url"
                            value={formData.image_url || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                            placeholder="https://example.com/badge.png"
                        />
                    </FormField>

                    <FormField label="Verification URL" htmlFor="verify_url">
                        <Input
                            id="verify_url"
                            type="url"
                            value={formData.verify_url || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, verify_url: e.target.value }))}
                            placeholder="https://credly.com/..."
                        />
                    </FormField>

                    <FormField label="Sort Order" htmlFor="sort_order">
                        <Input
                            id="sort_order"
                            type="number"
                            value={formData.sort_order ?? ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: e.target.value ? parseInt(e.target.value, 10) : null }))}
                            placeholder="Lower numbers appear first"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            Lower numbers appear first. Leave empty to use default ordering.
                        </p>
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
                            {selectedBadge ? 'Update Badge' : 'Add Badge'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Badge"
                message={`Are you sure you want to delete "${selectedBadge?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
