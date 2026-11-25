import { cn } from '../../lib/utils';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
    getRowKey: (item: T) => string;
}

export default function DataTable<T>({
    data,
    columns,
    onEdit,
    onDelete,
    onView,
    loading = false,
    emptyMessage = 'No items found',
    getRowKey,
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="glass rounded-xl overflow-hidden">
                <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
                    <p className="mt-4 text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="glass rounded-xl overflow-hidden">
                <div className="p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="mt-4 text-slate-400">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400',
                                        column.className
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                            {(onEdit || onDelete || onView) && (
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((item) => (
                            <tr
                                key={getRowKey(item)}
                                className="transition-colors hover:bg-white/[0.02]"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(
                                            'whitespace-nowrap px-6 py-4 text-sm text-slate-300',
                                            column.className
                                        )}
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : (item as Record<string, unknown>)[column.key]?.toString() || '-'}
                                    </td>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                        <div className="flex items-center justify-end gap-2">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(item)}
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                                                    title="View"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-500/10 hover:text-sky-400"
                                                    title="Edit"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                    title="Delete"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'draft' | 'published' }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
            )}
        >
            {status === 'published' ? 'Published' : 'Draft'}
        </span>
    );
}

// Tag List Component
function TagList({ tags }: { tags: string[] }) {
    if (!tags || tags.length === 0) {
        return <span className="text-slate-500">-</span>;
    }

    const displayTags = tags.slice(0, 3);
    const remaining = tags.length - 3;

    return (
        <div className="flex flex-wrap gap-1">
            {displayTags.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-sky-500/10 px-2 py-0.5 text-xs text-sky-400"
                >
                    {tag}
                </span>
            ))}
            {remaining > 0 && (
                <span className="inline-flex items-center text-xs text-slate-500">
                    +{remaining} more
                </span>
            )}
        </div>
    );
}

// Export types and components
export { StatusBadge, TagList };
export type { Column };
