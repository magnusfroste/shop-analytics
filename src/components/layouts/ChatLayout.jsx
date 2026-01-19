import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import ChatSidebar from '../chat/ChatSidebar';
import ChatHeader from '../chat/ChatHeader';
import MessageList from '../chat/MessageList';
import ChatInput from '../chat/ChatInput';
import DashboardPanel from '../dashboard/DashboardPanel';
import { useChat } from '../../hooks/useChat';
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
  const [conversations, setConversations] = useState([]);

  const { messages, isLoading, error, sendMessage, clearMessages } = useChat({
    visitorData,
    weatherData,
    systemPrompt,
    userPrompt,
    model
  });

  const handleNewChat = () => {
    clearMessages();
    setCurrentConversationId(null);
  };

  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
    // In a real app, load messages for this conversation
  };

  const handleDeleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      handleNewChat();
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen w-full flex bg-background overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
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
            title={currentConversationId ? "Konversation" : "Ny konversation"}
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
