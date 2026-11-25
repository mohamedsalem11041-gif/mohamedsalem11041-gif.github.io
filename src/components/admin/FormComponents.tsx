import { useState } from 'react';
import { cn } from '../../lib/utils';

// Form Field Wrapper
interface FormFieldProps {
    label: string;
    htmlFor?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-slate-300"
            >
                {label}
                {required && <span className="ml-1 text-red-400">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

// Text Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
    return (
        <input
            className={cn(
                'w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-colors',
                'focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
            )}
            {...props}
        />
    );
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
    return (
        <textarea
            className={cn(
                'w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-colors',
                'focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'resize-y min-h-[100px]',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
            )}
            {...props}
        />
    );
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean;
    options: { value: string; label: string }[];
}

export function Select({ className, error, options, ...props }: SelectProps) {
    return (
        <select
            className={cn(
                'w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-200 transition-colors',
                'focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
            )}
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value} className="bg-ink-900">
                    {option.label}
                </option>
            ))}
        </select>
    );
}

// Tag Input
interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    error?: boolean;
}

export function TagInput({ value, onChange, placeholder = 'Add tag and press Enter', error }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed && !value.includes(trimmed)) {
                onChange([...value, trimmed]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div
            className={cn(
                'flex flex-wrap gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2',
                'focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500',
                error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
            )}
        >
            {value.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-sky-500/20 px-2 py-1 text-xs text-sky-300"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded hover:bg-sky-500/30 focus:outline-none"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={value.length === 0 ? placeholder : ''}
                className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
            />
        </div>
    );
}

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-500 hover:to-sky-400',
        secondary: 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
        danger: 'bg-red-600 text-white hover:bg-red-500',
        ghost: 'text-slate-400 hover:bg-white/5 hover:text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-ink-900',
                'disabled:cursor-not-allowed disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}

// Modal
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
    if (!open) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full rounded-2xl border border-white/10 bg-ink-900 shadow-2xl',
                    sizes[size]
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Confirmation Dialog
interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    loading = false,
    variant = 'danger',
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div
                        className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                            variant === 'danger' ? 'bg-red-500/10' : 'bg-amber-500/10'
                        )}
                    >
                        <svg
                            className={cn('h-5 w-5', variant === 'danger' ? 'text-red-400' : 'text-amber-400')}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="mt-2 text-sm text-slate-400">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Page Header
interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
                {description && (
                    <p className="mt-1 text-sm text-slate-400">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

// Alert/Toast
interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
    const styles = {
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        info: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    };

    const icons = {
        success: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
        error: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
        warning: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        ),
        info: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
    };

    return (
        <div className={cn('flex items-center gap-3 rounded-lg border p-4', styles[type])}>
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icons[type]}
            </svg>
            <p className="flex-1 text-sm">{message}</p>
            {onClose && (
                <button onClick={onClose} className="shrink-0 rounded p-1 hover:bg-white/10">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// URL List Input (for images/assets arrays)
interface UrlListInputProps {
    value: string[];
    onChange: (urls: string[]) => void;
    placeholder?: string;
    label?: string;
}

export function UrlListInput({ value, onChange, placeholder = 'Enter URL and press Enter' }: UrlListInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleAdd}>
                    Add
                </Button>
            </div>
            {value.length > 0 && (
                <ul className="space-y-2">
                    {value.map((url, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2"
                        >
                            <span className="flex-1 truncate text-sm text-slate-300">{url}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="shrink-0 rounded p-1 text-slate-400 hover:bg-white/5 hover:text-red-400"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Image JSON List (for projects images with url and alt)
interface ImageItem {
    url: string;
    alt: string;
}

interface ImageListInputProps {
    value: ImageItem[];
    onChange: (images: ImageItem[]) => void;
}

export function ImageListInput({ value, onChange }: ImageListInputProps) {
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');

    const handleAdd = () => {
        if (url.trim()) {
            onChange([...value, { url: url.trim(), alt: alt.trim() }]);
            setUrl('');
            setAlt('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Image URL"
                />
                <Input
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Alt text (optional)"
                />
            </div>
            <Button type="button" variant="secondary" onClick={handleAdd} className="w-full">
                Add Image
            </Button>
            {value.length > 0 && (
                <ul className="space-y-2">
                    {value.map((img, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/10 p-3"
                        >
                            {img.url && (
                                <img
                                    src={img.url}
                                    alt={img.alt || 'Preview'}
                                    className="h-12 w-12 rounded object-cover"
                                    onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="%23374151" width="48" height="48"/><text x="50%" y="50%" fill="%239CA3AF" font-size="10" text-anchor="middle" dy=".3em">?</text></svg>'; }}
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm text-slate-300">{img.url}</p>
                                {img.alt && <p className="truncate text-xs text-slate-500">{img.alt}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="shrink-0 rounded p-1 text-slate-400 hover:bg-white/5 hover:text-red-400"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
