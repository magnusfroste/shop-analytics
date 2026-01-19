import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { aggregateDataForChatGPT } from '../utils/dataProcessing';

export const useChat = ({ visitorData, weatherData, systemPrompt, userPrompt, model }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const aggregatedData = aggregateDataForChatGPT(visitorData, weatherData);

      const formattedUserPrompt = userPrompt
        .replace('{question}', content)
        .replace('{visitorData}', JSON.stringify(aggregatedData));

      // Build conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error: functionError } = await supabase.functions.invoke('ask-chatgpt', {
        body: {
          question: content,
          visitorData: aggregatedData,
          systemPrompt,
          userPrompt: formattedUserPrompt,
          model,
          conversationHistory,
        },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to get response');
      }

      if (data && data.content) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [visitorData, weatherData, systemPrompt, userPrompt, model, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};
