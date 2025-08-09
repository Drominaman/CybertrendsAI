
import { TrendData } from '../types';
import { supabase } from './supabaseClient';

// --- IMPORTANT ---
// Please check your Supabase project and update the table name below.
// This should be the exact name of the table where you imported your data.
// You can find the table name in the Supabase Dashboard under 'Table Editor'.
const SUPABASE_TABLE_NAME = 'Cybersecstats'; 

export const fetchAndParseData = async (): Promise<TrendData[]> => {
    const { data, error } = await supabase
        .from(SUPABASE_TABLE_NAME)
        .select('*');

    if (error) {
        console.error('Error fetching from Supabase:', error);
        // Provide a more helpful error message for the user.
        throw new Error(`Failed to fetch data from table '${SUPABASE_TABLE_NAME}'. Reason: ${error.message}. Please verify the table name in 'services/dataService.ts' and ensure Row Level Security is configured correctly for read access in your Supabase project.`);
    }

    if (!data) {
        return [];
    }

    // Map the Supabase data to our application's TrendData interface.
    // This mapping has been updated to use the exact column names from the database,
    // resolving the issue where data fields were not being populated correctly.
    const mappedData = data.map((row: any) => ({
        Date: (row['Date'] || '').toString().trim(),
        Company: (row['Publisher'] || '').trim(),
        Topic: (row['Tag 1'] || '').trim(),
        Technology: (row['Tag 2'] || '').trim(),
        Source: (row['Link'] || '').trim(),
        stat: (row['Stat'] || '').trim(),
        ResourceName: (row['Resource Name'] || 'Untitled Resource').trim(),
    } as TrendData));

    return mappedData;
};
