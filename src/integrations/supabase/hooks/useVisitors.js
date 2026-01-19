import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### visitors

| name       | type                    | format | required |
|------------|-------------------------|--------|----------|
| id         | bigint                  | number | true     |
| id_camera  | bigint                  | number | false    |
| id_person  | bigint                  | number | false    |
| visit_date | timestamp with time zone| string | false    |
| leave_date | timestamp with time zone| string | false    |
| age        | text                    | string | false    |
| gender     | text                    | string | false    |
| created_at | timestamp with time zone| string | true     |

Note: id is the Primary Key.
*/

export const useVisitors = () => useQuery({
  queryKey: ['visitors'],
  queryFn: () => fromSupabase(supabase.from('visitors').select('*')),
});

export const useVisitorById = (id) => useQuery({
  queryKey: ['visitors', id],
  queryFn: () => fromSupabase(supabase.from('visitors').select('*').eq('id', id).single()),
  enabled: !!id,
});

export const useAddVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVisitor) => fromSupabase(supabase.from('visitors').insert([newVisitor])),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useUpdateVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('visitors').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useDeleteVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('visitors').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

// Keep legacy hook for backwards compatibility
export const useTestdata = useVisitors;
export const useTestdataById = useVisitorById;
export const useAddTestdata = useAddVisitor;
export const useUpdateTestdata = useUpdateVisitor;
export const useDeleteTestdata = useDeleteVisitor;
