import { supabase } from './supabase.js';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth.jsx';
import {
  useTestdata,
  useTestdataById,
  useAddTestdata,
  useUpdateTestdata,
  useDeleteTestdata,
} from './hooks/useTestdata';

export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
  useTestdata,
  useTestdataById,
  useAddTestdata,
  useUpdateTestdata,
  useDeleteTestdata,
};
