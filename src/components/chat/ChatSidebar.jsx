import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatSidebar = ({ 
  conversations = [], 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation,
  isOpen 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="w-64 h-full border-r border-border bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <Button 
          onClick={onNewConversation} 
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Ny konversation
        </Button>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                currentConversationId === conv.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground'
              )}
              onClick={() => onSelectConversation?.(conv.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground">{conv.date}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation?.(conv.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
          <img 
            src="/anavid.png" 
            alt="Ana" 
            className="h-6 w-6 rounded-full"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span>Ana - Visitor Analytics AI</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
