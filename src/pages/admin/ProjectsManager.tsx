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
    ImageListInput,
    ConfirmDialog,
    Alert,
} from '../../components/admin/FormComponents';
import { projectsService, generateSlug, type Project, type ProjectInsert } from '../../services/admin';
import type { Json } from '../../types/database.types';

interface ImageItem {
    url: string;
    alt: string;
}

interface ProjectFormState {
    title: string;
    slug: string;
    summary: string;
    description_md: string;
    demo_url: string;
    code_url: string;
    tags: string[];
    images: ImageItem[];
    status: 'draft' | 'published';
    published_at?: string | null;
}

const initialFormData: ProjectFormState = {
    title: '',
    slug: '',
    summary: '',
    description_md: '',
    demo_url: '',
    code_url: '',
    tags: [],
    images: [],
    status: 'draft',
};

export default function ProjectsManager() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<ProjectFormState>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectsService.getAll();
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProject(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setFormData({
            title: project.title,
            slug: project.slug,
            summary: project.summary || '',
            description_md: project.description_md || '',
            demo_url: project.demo_url || '',
            code_url: project.code_url || '',
            tags: project.tags || [],
            images: (project.images as unknown as ImageItem[]) || [],
            status: project.status,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = (project: Project) => {
        setSelectedProject(project);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedProject) return;
        try {
            setDeleting(true);
            await projectsService.delete(selectedProject.id);
            setSuccess('Project deleted successfully');
            setIsDeleteDialogOpen(false);
            loadProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
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
            const slugExists = await projectsService.checkSlugExists(
                formData.slug,
                selectedProject?.id
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
            const dataToSave: ProjectInsert = {
                ...formData,
                images: formData.images as unknown as Json,
                published_at: formData.status === 'published' && !selectedProject?.published_at
                    ? new Date().toISOString()
                    : selectedProject?.published_at,
            };

            if (selectedProject) {
                await projectsService.update(selectedProject.id, dataToSave);
                setSuccess('Project updated successfully');
            } else {
                await projectsService.create(dataToSave as ProjectInsert);
                setSuccess('Project created successfully');
            }

            setIsModalOpen(false);
            loadProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (title: string) => {
        setFormData((prev) => ({
            ...prev,
            title,
            slug: !selectedProject ? generateSlug(title) : prev.slug,
        }));
    };

    const columns: Column<Project>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (project) => (
                <div>
                    <p className="font-medium text-white">{project.title}</p>
                    <p className="text-xs text-slate-500">/{project.slug}</p>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (project) => <StatusBadge status={project.status} />,
        },
        {
            key: 'tags',
            header: 'Tags',
            render: (project) => <TagList tags={project.tags} />,
        },
        {
            key: 'updated_at',
            header: 'Last Updated',
            render: (project) => (
                <span className="text-slate-400">
                    {new Date(project.updated_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Projects"
                description="Manage your portfolio projects"
                action={
                    <Button onClick={handleCreate}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Project
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
                data={projects}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRowKey={(project) => project.id}
                emptyMessage="No projects yet. Create your first one!"
            />

            {/* Create/Edit Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedProject ? 'Edit Project' : 'Create Project'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Title" htmlFor="title" required error={formErrors.title}>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="My Awesome Project"
                                error={!!formErrors.title}
                            />
                        </FormField>

                        <FormField label="Slug" htmlFor="slug" required error={formErrors.slug}>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="my-awesome-project"
                                error={!!formErrors.slug}
                            />
                        </FormField>
                    </div>

                    <FormField label="Summary" htmlFor="summary">
                        <Textarea
                            id="summary"
                            value={formData.summary || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                            placeholder="A brief description of the project..."
                            rows={2}
                        />
                    </FormField>

                    <FormField label="Description (Markdown)" htmlFor="description">
                        <Textarea
                            id="description"
                            value={formData.description_md || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description_md: e.target.value }))}
                            placeholder="Full project description in Markdown..."
                            rows={6}
                        />
                    </FormField>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Demo URL" htmlFor="demo_url">
                            <Input
                                id="demo_url"
                                type="url"
                                value={formData.demo_url || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, demo_url: e.target.value }))}
                                placeholder="https://demo.example.com"
                            />
                        </FormField>

                        <FormField label="Code URL" htmlFor="code_url">
                            <Input
                                id="code_url"
                                type="url"
                                value={formData.code_url || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, code_url: e.target.value }))}
                                placeholder="https://github.com/..."
                            />
                        </FormField>
                    </div>

                    <FormField label="Tags">
                        <TagInput
                            value={formData.tags || []}
                            onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                            placeholder="Add tags (press Enter)"
                        />
                    </FormField>

                    <FormField label="Images">
                        <ImageListInput
                            value={(formData.images as ImageItem[]) || []}
                            onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
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
                            {selectedProject ? 'Update Project' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${selectedProject?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
