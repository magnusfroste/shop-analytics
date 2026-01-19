import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { User, Bot, CheckCircle, TrendingUp, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const MarkdownComponents = {
  h1: ({ children }) => (
    <h1 className="font-bold text-lg mt-4 mb-2 text-foreground">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-semibold text-base mt-3 mb-2 text-foreground">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-medium text-sm mt-2 mb-1 text-foreground">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 text-sm leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1 my-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>
  ),
  li: ({ children }) => {
    const text = children?.toString() || '';
    let ItemIcon = CheckCircle;
    if (text.toLowerCase().includes('trend') || text.toLowerCase().includes('increase')) {
      ItemIcon = TrendingUp;
    } else if (text.toLowerCase().includes('demographic') || text.toLowerCase().includes('age')) {
      ItemIcon = Users;
    } else if (text.toLowerCase().includes('time') || text.toLowerCase().includes('hour')) {
      ItemIcon = Clock;
    }
    
    return (
      <li className="flex items-start gap-2 text-sm">
        <ItemIcon className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
        <span>{children}</span>
      </li>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) => {
    if (inline) {
      return <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>;
    }
    return (
      <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
        <code className="font-mono text-xs">{children}</code>
      </pre>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-sm border border-border rounded-lg">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="py-1.5 px-2 border-b border-border bg-muted text-left text-xs font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-1.5 px-2 border-b border-border text-xs">{children}</td>
  ),
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={MarkdownComponents}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <span className={cn(
          'text-[10px] mt-1 block',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
