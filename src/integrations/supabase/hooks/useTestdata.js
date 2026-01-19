import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### testdata

| name       | type                    | format | required |
|------------|-------------------------|--------|----------|
| Id         | bigint                  | number | true     |
| id_camera  | bigint                  | number | false    |
| id_person  | bigint                  | number | false    |
| visit_date | timestamp with time zone| string | false    |
| leave_date | timestamp with time zone| string | false    |
| age        | text                    | string | false    |
| gender     | text                    | string | false    |

Note: Id is the Primary Key.
*/

export const useTestdata = () => useQuery({
  queryKey: ['testdata'],
  queryFn: () => fromSupabase(supabase.from('testdata').select('*')),
});

export const useTestdataById = (id) => useQuery({
  queryKey: ['testdata', id],
  queryFn: () => fromSupabase(supabase.from('testdata').select('*').eq('Id', id).single()),
  enabled: !!id,
});

export const useAddTestdata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTestdata) => fromSupabase(supabase.from('testdata').insert([newTestdata])),
    onSuccess: () => {
      queryClient.invalidateQueries('testdata');
    },
  });
};

export const useUpdateTestdata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('testdata').update(updateData).eq('Id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries('testdata');
    },
  });
};

export const useDeleteTestdata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('testdata').delete().eq('Id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries('testdata');
    },
  });
};