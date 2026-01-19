import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((msg) => msg.id === payload.new.id)) {
              return prev;
            }
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const addMessage = useCallback(
    async (role, content) => {
      if (!conversationId) return null;

      try {
        const { data, error: insertError } = await supabase
          .from('messages')
          .insert([{ conversation_id: conversationId, role, content }])
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Update is handled by realtime subscription, but we add optimistically
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === data.id)) {
            return prev;
          }
          return [...prev, data];
        });
        
        return data;
      } catch (err) {
        console.error('Error adding message:', err);
        setError(err.message);
        return null;
      }
    },
    [conversationId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    addMessage,
    clearMessages,
    setMessages,
  };
};
