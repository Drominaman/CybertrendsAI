
// This declaration is necessary because we're loading the Supabase client from a CDN
declare const supabase: { createClient: (url: string, key: string) => any };

const supabaseUrl = 'https://luyqgwcqxkldskdcjsho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eXFnd2NxeGtsZHNrZGNqc2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjE4NzEsImV4cCI6MjA2OTI5Nzg3MX0.Kj6t1A3__F3c2nDJyU3F3l-PFZqYK9sVqR2UY4sXheA';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required.');
}

// Add a check to ensure the CDN script has loaded the Supabase global object
if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
    throw new Error('Supabase client library not loaded from CDN. Please check the script tag in index.html and your internet connection.');
}

// Initialize the Supabase client from the global object
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Re-export as 'supabase' to match the data service's usage
export { supabaseClient as supabase };
