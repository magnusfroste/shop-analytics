import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, isLoading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Fråga Ana om dina besöksdata
          </h2>
          <p className="text-muted-foreground text-sm">
            Ställ frågor om trender, demografisk fördelning, eller be om rekommendationer baserat på dina besöksdata och väderförhållanden.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 text-xs">
            <div className="bg-muted rounded-lg p-3 text-left hover:bg-muted/80 transition-colors cursor-pointer">
              "Vilka mönster ser du i besökstrender denna vecka?"
            </div>
            <div className="bg-muted rounded-lg p-3 text-left hover:bg-muted/80 transition-colors cursor-pointer">
              "Hur påverkar vädret besöksantalet?"
            </div>
            <div className="bg-muted rounded-lg p-3 text-left hover:bg-muted/80 transition-colors cursor-pointer">
              "Ge mig rekommendationer för att öka besöken"
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 px-4 py-3">
            <div className="shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
