import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import {
    PageHeader,
    Modal,
    Button,
    ConfirmDialog,
    Alert,
} from '../../components/admin/FormComponents';
import { contactSubmissionsService, type ContactSubmission } from '../../services/admin';

export default function MessagesManager() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const data = await contactSubmissionsService.getAll();
            setSubmissions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsViewModalOpen(true);
    };

    const handleDelete = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedSubmission) return;
        try {
            setDeleting(true);
            await contactSubmissionsService.delete(selectedSubmission.id);
            setSuccess('Message deleted successfully');
            setIsDeleteDialogOpen(false);
            loadSubmissions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete message');
        } finally {
            setDeleting(false);
        }
    };

    const columns: Column<ContactSubmission>[] = [
        {
            key: 'name',
            header: 'From',
            render: (submission) => (
                <div>
                    <p className="font-medium text-white">{submission.name}</p>
                    <p className="text-xs text-slate-500">{submission.email}</p>
                </div>
            ),
        },
        {
            key: 'message',
            header: 'Message',
            render: (submission) => (
                <p className="max-w-md truncate text-slate-300">
                    {submission.message}
                </p>
            ),
        },
        {
            key: 'source_page',
            header: 'Source',
            render: (submission) => (
                <span className="text-slate-400">
                    {submission.source_page || 'Contact Page'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Received',
            render: (submission) => (
                <span className="text-slate-400">
                    {new Date(submission.created_at).toLocaleString()}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Messages"
                description="View contact form submissions"
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

            {/* Stats */}
            <div className="mb-6 glass rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-300">
                        {submissions.length} message{submissions.length !== 1 ? 's' : ''} received
                    </span>
                </div>
            </div>

            <DataTable
                data={submissions}
                columns={columns}
                loading={loading}
                onView={handleView}
                onDelete={handleDelete}
                getRowKey={(submission) => submission.id}
                emptyMessage="No messages yet. Your inbox is empty!"
            />

            {/* View Modal */}
            <Modal
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Message Details"
                size="lg"
            >
                {selectedSubmission && (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Name
                                </label>
                                <p className="mt-1 text-white">{selectedSubmission.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Email
                                </label>
                                <a
                                    href={`mailto:${selectedSubmission.email}`}
                                    className="mt-1 block text-sky-400 hover:underline"
                                >
                                    {selectedSubmission.email}
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Source Page
                                </label>
                                <p className="mt-1 text-slate-300">
                                    {selectedSubmission.source_page || 'Contact Page'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Received
                                </label>
                                <p className="mt-1 text-slate-300">
                                    {new Date(selectedSubmission.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                                Message
                            </label>
                            <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-4">
                                <p className="whitespace-pre-wrap text-slate-200">
                                    {selectedSubmission.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
                            <Button
                                variant="secondary"
                                onClick={() => setIsViewModalOpen(false)}
                            >
                                Close
                            </Button>
                            <a
                                href={`mailto:${selectedSubmission.email}?subject=Re: Contact Form Submission`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-sky-500 hover:to-sky-400"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Reply via Email
                            </a>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Message"
                message={`Are you sure you want to delete the message from "${selectedSubmission?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
