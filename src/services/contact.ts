
import { getSupabase } from "../lib/supabase";

export interface ContactSubmission {
    name: string;
    email: string;
    message: string;
    source_page?: string;
}

const RATE_LIMIT_KEY = 'contact_form_timestamps';
const LIMIT = 3;
const TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

const checkAndRecordRateLimit = () => {
    const now = Date.now();
    const storedTimestamps = localStorage.getItem(RATE_LIMIT_KEY);
    let timestamps: number[] = storedTimestamps ? JSON.parse(storedTimestamps) : [];

    // Filter out timestamps older than the time window
    timestamps = timestamps.filter(t => now - t < TIME_WINDOW);

    if (timestamps.length >= LIMIT) {
        throw new Error(`Rate limit exceeded. You can only send ${LIMIT} messages per 24 hours.`);
    }

    timestamps.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
};

export const submitContactForm = async (submission: ContactSubmission) => {
    // Check rate limit before sending
    checkAndRecordRateLimit();

    const payload = {
        name: submission.name,
        email: submission.email,
        message: submission.message,
        source_page: submission.source_page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    };

    const { error } = await getSupabase().from("contact_submissions").insert(payload as never);

    if (error) {
        throw error;
    }

    return true;
};
