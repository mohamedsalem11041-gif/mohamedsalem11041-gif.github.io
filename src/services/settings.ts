
import { getSupabase } from "../lib/supabase";

export interface SocialLinks {
    email?: string;
    github?: string;
    linkedin?: string;
    whatsapp?: string;
    [key: string]: string | undefined;
}

export interface Settings {
    id: boolean;
    availability_status: string | null;
    hero_copy: string | null;
    socials: SocialLinks;
    cv_url: string | null;
}

export const fetchSettings = async (): Promise<Settings | null> => {
    const { data, error } = await getSupabase()
        .from("settings")
        .select("*")
        // The settings table is a singleton with id=true
        .eq("id", true)
        .single();

    if (error) {
        console.error("Error fetching settings:", error);
        return null;
    }

    return data;
};
