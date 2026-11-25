import { useState, useEffect } from 'react';
import {
    PageHeader,
    Button,
    FormField,
    Input,
    Textarea,
    Alert,
} from '../../components/admin/FormComponents';
import { settingsService } from '../../services/admin';
import type { Json } from '../../types/database.types';

interface SocialsData {
    email?: string;
    github?: string;
    linkedin?: string;
}

interface SeoDefaultsData {
    title?: string;
    description?: string;
    image?: string;
}

export default function SettingsManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        availability_status: '',
        hero_copy: '',
        cv_url: '',
        socials: {
            email: '',
            github: '',
            linkedin: '',
        } as SocialsData,
        seo_defaults: {
            title: '',
            description: '',
            image: '',
        } as SeoDefaultsData,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.get();
            if (data) {
                setFormData({
                    availability_status: data.availability_status || '',
                    hero_copy: data.hero_copy || '',
                    cv_url: data.cv_url || '',
                    socials: (data.socials as SocialsData) || { email: '', github: '', linkedin: '' },
                    seo_defaults: (data.seo_defaults as SeoDefaultsData) || { title: '', description: '', image: '' },
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            await settingsService.upsert({
                availability_status: formData.availability_status || null,
                hero_copy: formData.hero_copy || null,
                cv_url: formData.cv_url || null,
                socials: formData.socials as Json,
                seo_defaults: formData.seo_defaults as Json,
            });
            setSuccess('Settings saved successfully');
            loadSettings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Settings"
                description="Configure global site settings"
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Section */}
                <div className="glass rounded-xl p-6">
                    <h2 className="mb-6 text-lg font-semibold text-white">General</h2>
                    <div className="space-y-6">
                        <FormField label="Availability Status" htmlFor="availability_status">
                            <Input
                                id="availability_status"
                                value={formData.availability_status}
                                onChange={(e) => setFormData((prev) => ({ ...prev, availability_status: e.target.value }))}
                                placeholder="Available for freelance work"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Displayed on the contact page and hero section
                            </p>
                        </FormField>

                        <FormField label="Hero Copy" htmlFor="hero_copy">
                            <Textarea
                                id="hero_copy"
                                value={formData.hero_copy}
                                onChange={(e) => setFormData((prev) => ({ ...prev, hero_copy: e.target.value }))}
                                placeholder="Cloud/DevOps Engineer passionate about building scalable solutions..."
                                rows={4}
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Main headline text for the home page
                            </p>
                        </FormField>

                        <FormField label="CV/Resume URL" htmlFor="cv_url">
                            <Input
                                id="cv_url"
                                type="url"
                                value={formData.cv_url}
                                onChange={(e) => setFormData((prev) => ({ ...prev, cv_url: e.target.value }))}
                                placeholder="https://s3.amazonaws.com/.../resume.pdf"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Link to your downloadable CV/Resume file
                            </p>
                        </FormField>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="glass rounded-xl p-6">
                    <h2 className="mb-6 text-lg font-semibold text-white">Social Links</h2>
                    <div className="grid gap-6 sm:grid-cols-3">
                        <FormField label="Email" htmlFor="socials_email">
                            <Input
                                id="socials_email"
                                type="email"
                                value={formData.socials.email || ''}
                                onChange={(e) => setFormData((prev) => ({
                                    ...prev,
                                    socials: { ...prev.socials, email: e.target.value }
                                }))}
                                placeholder="contact@example.com"
                            />
                        </FormField>

                        <FormField label="GitHub" htmlFor="socials_github">
                            <Input
                                id="socials_github"
                                type="url"
                                value={formData.socials.github || ''}
                                onChange={(e) => setFormData((prev) => ({
                                    ...prev,
                                    socials: { ...prev.socials, github: e.target.value }
                                }))}
                                placeholder="https://github.com/username"
                            />
                        </FormField>

                        <FormField label="LinkedIn" htmlFor="socials_linkedin">
                            <Input
                                id="socials_linkedin"
                                type="url"
                                value={formData.socials.linkedin || ''}
                                onChange={(e) => setFormData((prev) => ({
                                    ...prev,
                                    socials: { ...prev.socials, linkedin: e.target.value }
                                }))}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </FormField>
                    </div>
                </div>

                {/* SEO Defaults Section */}
                <div className="glass rounded-xl p-6">
                    <h2 className="mb-6 text-lg font-semibold text-white">SEO Defaults</h2>
                    <div className="space-y-6">
                        <FormField label="Default Title" htmlFor="seo_title">
                            <Input
                                id="seo_title"
                                value={formData.seo_defaults.title || ''}
                                onChange={(e) => setFormData((prev) => ({
                                    ...prev,
                                    seo_defaults: { ...prev.seo_defaults, title: e.target.value }
                                }))}
                                placeholder="Your Name - Cloud/DevOps Engineer"
                            />
                        </FormField>

                        <FormField label="Default Description" htmlFor="seo_description">
                            <Textarea
                                id="seo_description"
                                value={formData.seo_defaults.description || ''}
                                onChange={(e) => setFormData((prev) => ({
                                    ...prev,
                                    seo_defaults: { ...prev.seo_defaults, description: e.target.value }
                                }))}
                                placeholder="Portfolio and blog of a Cloud/DevOps engineer..."
                                rows={3}
                            />
                        </FormField>

                        <FormField label="Default OG Image" htmlFor="seo_image">
                            <Input
                                id="seo_image"
                                type="url"
                                value={formData.seo_defaults.image || ''}
                                onChange={(e) => setFormData((prev) => ({
                                    ...prev,
                                    seo_defaults: { ...prev.seo_defaults, image: e.target.value }
                                }))}
                                placeholder="https://mohamedsalem11041-gif.github.io/og-image.jpg"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Used when sharing links on social media (1200x630px recommended)
                            </p>
                        </FormField>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" loading={saving} size="lg">
                        Save Settings
                    </Button>
                </div>
            </form>
        </div>
    );
}
