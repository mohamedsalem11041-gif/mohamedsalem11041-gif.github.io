import { useState, useEffect } from 'react';
import DataTable, { StatusBadge, TagList } from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import {
    PageHeader,
    Button,
    Modal,
    FormField,
    Input,
    Select,
    TagInput,
    ConfirmDialog,
    Alert,
} from '../../components/admin/FormComponents';
import { certsService, type Cert, type CertInsert } from '../../services/admin';

const initialFormData: Omit<CertInsert, 'id'> = {
    name: '',
    issuer: '',
    issue_date: '',
    expires_at: '',
    badge_url: '',
    verify_url: '',
    tags: [],
    status: 'published',
    sort_order: null,
};

export default function CertsManager() {
    const [certs, setCerts] = useState<Cert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCert, setSelectedCert] = useState<Cert | null>(null);
    const [formData, setFormData] = useState<Omit<CertInsert, 'id'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadCerts();
    }, []);

    const loadCerts = async () => {
        try {
            setLoading(true);
            const data = await certsService.getAll();
            setCerts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load certifications');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedCert(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (cert: Cert) => {
        setSelectedCert(cert);
        setFormData({
            name: cert.name,
            issuer: cert.issuer || '',
            issue_date: cert.issue_date || '',
            expires_at: cert.expires_at || '',
            badge_url: cert.badge_url || '',
            verify_url: cert.verify_url || '',
            tags: cert.tags || [],
            status: cert.status,
            sort_order: cert.sort_order || null,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (cert: Cert) => {
        setSelectedCert(cert);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedCert) return;
        try {
            setDeleting(true);
            await certsService.delete(selectedCert.id);
            setSuccess('Certification deleted successfully');
            setIsDeleteDialogOpen(false);
            loadCerts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete certification');
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
            if (selectedCert) {
                await certsService.update(selectedCert.id, formData);
                setSuccess('Certification updated successfully');
            } else {
                await certsService.create(formData as CertInsert);
                setSuccess('Certification created successfully');
            }
            setIsModalOpen(false);
            loadCerts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save certification');
        } finally {
            setSaving(false);
        }
    };

    const columns: Column<Cert>[] = [
        {
            key: 'name',
            header: 'Certification',
            render: (cert) => (
                <div className="flex items-center gap-3">
                    {cert.badge_url && (
                        <img
                            src={cert.badge_url}
                            alt={cert.name}
                            className="h-10 w-10 rounded object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                    <div>
                        <p className="font-medium text-white">{cert.name}</p>
                        {cert.issuer && (
                            <p className="text-xs text-slate-500">by {cert.issuer}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'issue_date',
            header: 'Issued',
            render: (cert) => (
                <span className="text-slate-300">
                    {cert.issue_date
                        ? new Date(cert.issue_date).toLocaleDateString()
                        : '-'}
                </span>
            ),
        },
        {
            key: 'expires_at',
            header: 'Expires',
            render: (cert) => {
                if (!cert.expires_at) return <span className="text-slate-500">Never</span>;
                const isExpired = new Date(cert.expires_at) < new Date();
                return (
                    <span className={isExpired ? 'text-red-400' : 'text-slate-300'}>
                        {new Date(cert.expires_at).toLocaleDateString()}
                        {isExpired && ' (Expired)'}
                    </span>
                );
            },
        },
        {
            key: 'sort_order',
            header: 'Sort Order',
            render: (cert) => (
                <span className="text-slate-400">
                    {cert.sort_order ?? '-'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (cert) => <StatusBadge status={cert.status} />,
        },
        {
            key: 'tags',
            header: 'Tags',
            render: (cert) => <TagList tags={cert.tags} />,
        },
    ];

    return (
        <div>
            <PageHeader
                title="Certifications"
                description="Manage your professional certifications"
                action={
                    <Button onClick={handleCreate}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Certification
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
                data={certs}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRowKey={(cert) => cert.id}
                emptyMessage="No certifications yet. Add your credentials!"
            />

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCert ? 'Edit Certification' : 'Add Certification'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="Name" htmlFor="name" required error={formErrors.name}>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="AWS Solutions Architect Associate"
                            error={!!formErrors.name}
                        />
                    </FormField>

                    <FormField label="Issuer" htmlFor="issuer">
                        <Input
                            id="issuer"
                            value={formData.issuer || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, issuer: e.target.value }))}
                            placeholder="Amazon Web Services"
                        />
                    </FormField>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Issue Date" htmlFor="issue_date">
                            <Input
                                id="issue_date"
                                type="date"
                                value={formData.issue_date || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, issue_date: e.target.value }))}
                            />
                        </FormField>

                        <FormField label="Expiration Date" htmlFor="expires_at">
                            <Input
                                id="expires_at"
                                type="date"
                                value={formData.expires_at || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
                            />
                        </FormField>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Badge URL" htmlFor="badge_url">
                            <Input
                                id="badge_url"
                                type="url"
                                value={formData.badge_url || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, badge_url: e.target.value }))}
                                placeholder="https://example.com/badge.png"
                            />
                        </FormField>

                        <FormField label="Verification URL" htmlFor="verify_url">
                            <Input
                                id="verify_url"
                                type="url"
                                value={formData.verify_url || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, verify_url: e.target.value }))}
                                placeholder="https://credly.com/badges/..."
                            />
                        </FormField>
                    </div>

                    <FormField label="Sort Order" htmlFor="sort_order">
                        <Input
                            id="sort_order"
                            type="number"
                            value={formData.sort_order ?? ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: e.target.value ? parseInt(e.target.value, 10) : null }))}
                            placeholder="Leave empty for default ordering"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            Lower numbers appear first. Leave empty to use default ordering.
                        </p>
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
                            {selectedCert ? 'Update Certification' : 'Add Certification'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Certification"
                message={`Are you sure you want to delete "${selectedCert?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
