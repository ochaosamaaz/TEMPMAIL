'use client';

import { useEffect, useState } from 'react';
import { Alias } from '@/types/database';
import Badge from '@/components/ui/Badge';
import { Mail, Trash2, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AliasesPage() {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAliases();
  }, []);

  const fetchAliases = async () => {
    const res = await fetch('/api/aliases');
    const data = await res.json();
    if (Array.isArray(data)) setAliases(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this alias? All associated messages will be lost.')) return;
    await fetch(`/api/aliases?id=${id}`, { method: 'DELETE' });
    fetchAliases();
  };

  const filteredAliases = aliases.filter((a) =>
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alias Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all email aliases
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search aliases..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Alias List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            All Aliases ({filteredAliases.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Domain</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Created</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Expires</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAliases.map((alias) => (
                <tr key={alias.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground font-mono">
                      {alias.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {alias.domain?.domain || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {alias.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Expired</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(alias.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {alias.expires_at ? formatDate(alias.expires_at) : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(alias.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAliases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {search ? 'No aliases match your search' : 'No aliases created yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
