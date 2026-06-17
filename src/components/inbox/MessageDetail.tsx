'use client';

import { useMailStore } from '@/store/useMailStore';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Copy, Lock, Mail, User, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';

export default function MessageDetail() {
  const { selectedMessage, setSelectedMessage, markAsRead, messages, setMessages } = useMailStore();
  const [otpCopied, setOtpCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (selectedMessage && !selectedMessage.is_read) {
      // Mark as read
      fetch(`/api/messages/${selectedMessage.id}/read`, { method: 'PATCH' });
      markAsRead(selectedMessage.id);
    }
  }, [selectedMessage]);

  if (!selectedMessage) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center h-full flex items-center justify-center">
        <div>
          <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Select a message to view details
          </p>
        </div>
      </div>
    );
  }

  const handleCopyOtp = async () => {
    if (selectedMessage.otp_code) {
      await navigator.clipboard.writeText(selectedMessage.otp_code);
      setOtpCopied(true);
      setTimeout(() => setOtpCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/messages/${selectedMessage.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== selectedMessage.id));
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setSelectedMessage(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to inbox
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          {selectedMessage.subject || '(No Subject)'}
        </h2>

        <div className="mt-3 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {selectedMessage.from_name || 'Unknown'}
              </span>
              <span className="text-muted-foreground">
                &lt;{selectedMessage.from_email}&gt;
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {formatDate(selectedMessage.received_at)}
            </p>
          </div>
        </div>

        {/* OTP Badge */}
        {selectedMessage.has_otp && selectedMessage.otp_code && (
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                  OTP Detected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-300 tracking-wider">
                  {selectedMessage.otp_code}
                </span>
                <Button
                  onClick={handleCopyOtp}
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {otpCopied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedMessage.body_html ? (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }}
          />
        ) : (
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
            {selectedMessage.body_text || 'No content'}
          </pre>
        )}
      </div>
    </div>
  );
}
