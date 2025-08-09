// Load Supabase URL and anon key from Vite public env vars
// These are safe to expose client-side only if your tables are protected by RLS policies.
// Netlify: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Site settings → Environment variables.

// This declaration is necessary because we're loading the Supabase client from a CDN
declare const supabase: { createClient: (url: string, key: string) => any };

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in your env.");
}

if (typeof supabase === "undefined" || typeof supabase.createClient !== "function") {
  throw new Error(
    "Supabase client library not loaded from CDN. Check the script tag in index.html and your internet connection."
  );
}

// Initialize the Supabase client from the global object
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Re-export as 'supabase' to match the data service's usage
export { supabaseClient as supabase };
