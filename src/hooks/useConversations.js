import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(async (title = 'Ny konversation') => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: createError } = await supabase
        .from('conversations')
        .insert([{ title, user_id: user.id }])
        .select()
        .single();

      if (createError) throw createError;
      setConversations((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const updateConversation = useCallback(async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? data : conv))
      );
      return data;
    } catch (err) {
      console.error('Error updating conversation:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const deleteConversation = useCallback(async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err.message);
      return false;
    }
  }, []);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
  };
};
