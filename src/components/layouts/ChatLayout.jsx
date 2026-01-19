import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import ChatSidebar from '../chat/ChatSidebar';
import ChatHeader from '../chat/ChatHeader';
import MessageList from '../chat/MessageList';
import ChatInput from '../chat/ChatInput';
import DashboardPanel from '../dashboard/DashboardPanel';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { supabase } from '../../integrations/supabase/client';
import { aggregateDataForChatGPT } from '../../utils/dataProcessing';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const ChatLayout = ({ 
  visitorData, 
  weatherData, 
  processedData, 
  summary,
  city,
  systemPrompt,
  userPrompt,
  model,
  onOpenSettings
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { 
    conversations, 
    createConversation, 
    updateConversation,
    deleteConversation 
  } = useConversations();

  const { 
    messages, 
    addMessage, 
    clearMessages,
    setMessages 
  } = useMessages(currentConversationId);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create conversation if none exists
      let convId = currentConversationId;
      if (!convId) {
        // Generate title from first message (first 50 chars)
        const title = content.length > 50 ? content.substring(0, 47) + '...' : content;
        const newConv = await createConversation(title);
        if (!newConv) throw new Error('Failed to create conversation');
        convId = newConv.id;
        setCurrentConversationId(convId);
      }

      // Add user message to database
      await addMessage('user', content);

      // Prepare data for ChatGPT
      const aggregatedData = aggregateDataForChatGPT(visitorData, weatherData);
      const formattedUserPrompt = userPrompt
        .replace('{question}', content)
        .replace('{visitorData}', JSON.stringify(aggregatedData));

      // Build conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call ChatGPT
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
        // Add assistant message to database
        await addMessage('assistant', data.content);
        
        // Update conversation timestamp
        await updateConversation(convId, { updated_at: new Date().toISOString() });
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, visitorData, weatherData, systemPrompt, userPrompt, model, messages, createConversation, addMessage, updateConversation]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    setCurrentConversationId(null);
    setError(null);
  }, [clearMessages]);

  const handleSelectConversation = useCallback((id) => {
    setCurrentConversationId(id);
    setError(null);
  }, []);

  const handleDeleteConversation = useCallback(async (id) => {
    const success = await deleteConversation(id);
    if (success && currentConversationId === id) {
      handleNewChat();
    }
  }, [deleteConversation, currentConversationId, handleNewChat]);

  // Format conversations for sidebar
  const formattedConversations = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    date: new Date(conv.updated_at || conv.created_at).toLocaleDateString('sv-SE'),
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen w-full flex bg-background overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          conversations={formattedConversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          isOpen={isSidebarOpen}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleDashboard={() => setIsDashboardOpen(!isDashboardOpen)}
            onNewChat={handleNewChat}
            onOpenSettings={onOpenSettings}
            isSidebarOpen={isSidebarOpen}
            isDashboardOpen={isDashboardOpen}
            title={currentConversationId 
              ? (formattedConversations.find(c => c.id === currentConversationId)?.title || "Konversation")
              : "Ny konversation"
            }
          />

          {/* Error display */}
          {error && (
            <div className="px-4 pt-2">
              <Alert variant="destructive" className="max-w-4xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <MessageList messages={messages} isLoading={isLoading} />
          
          <ChatInput 
            onSend={sendMessage} 
            isLoading={isLoading}
          />
        </div>

        {/* Dashboard panel */}
        <DashboardPanel
          processedData={processedData}
          summary={summary}
          city={city}
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
        />
      </div>
    </ThemeProvider>
  );
};

export default ChatLayout;
