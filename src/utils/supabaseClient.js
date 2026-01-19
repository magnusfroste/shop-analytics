import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or API key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchVisitorData = async () => {
  const { data, error } = await supabase
    .from('anavid_testdata')
    .select('*');

  if (error) {
    console.error('Error fetching visitor data:', error);
    throw new Error('Error fetching visitor data');
  }

  return data;
};
