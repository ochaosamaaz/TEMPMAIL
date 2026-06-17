'use client';

import { useMailStore } from '@/store/useMailStore';
import { cn, formatDate, truncateText } from '@/lib/utils';
import { Inbox, Lock } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function MessageList() {
  const { messages, selectedMessage, setSelectedMessage, filterAliasId } = useMailStore();

  const filteredMessages = filterAliasId
    ? messages.filter((m) => m.alias_id === filterAliasId)
    : messages;

  if (filteredMessages.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Inbox className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Inbox Empty
        </h3>
        <p className="text-muted-foreground text-sm">
          Waiting for incoming emails... Auto-refresh every 10 seconds
        </p>
        <div className="mt-4 flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Inbox className="w-4 h-4" />
          Messages ({filteredMessages.length})
        </h3>
        {filterAliasId && (
          <Badge variant="default">Filtered</Badge>
        )}
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'px-4 py-3 cursor-pointer transition-colors',
              selectedMessage?.id === message.id
                ? 'bg-primary/5 border-l-2 border-l-primary'
                : 'hover:bg-muted',
              !message.is_read && 'bg-primary/3'
            )}
            onClick={() => setSelectedMessage(message)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!message.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  <p className={cn(
                    'text-sm truncate',
                    !message.is_read ? 'font-semibold text-foreground' : 'text-foreground'
                  )}>
                    {message.from_name || message.from_email}
                  </p>
                </div>
                <p className="text-sm text-foreground mt-0.5 truncate">
                  {message.subject || '(No Subject)'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {truncateText(message.body_text || '', 80)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatDate(message.received_at)}
                </span>
                {message.has_otp && (
                  <Badge variant="otp">
                    <Lock className="w-3 h-3 mr-1" />
                    OTP
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
