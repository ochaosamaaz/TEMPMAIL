'use client';

import { useEffect, useState } from 'react';
import { AuditLog } from '@/types/database';
import Badge from '@/components/ui/Badge';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    const res = await fetch(`/api/admin/audit?page=${page}&limit=20`);
    const data = await res.json();
    setLogs(data.logs || []);
    setTotalPages(data.totalPages || 1);
  };

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('login')) return 'success';
    if (action.includes('deleted')) return 'danger';
    if (action.includes('deactivated')) return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track all admin actions and changes
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ScrollText className="w-4 h-4" />
            Activity Log
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Action</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Resource</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Details</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <Badge variant={getActionColor(log.action) as any}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {log.resource_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {log.details ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {JSON.stringify(log.details)}
                      </code>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No audit logs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
