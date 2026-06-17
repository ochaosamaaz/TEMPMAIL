'use client';

import { useEffect, useState } from 'react';
import { Domain } from '@/types/database';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Globe, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const res = await fetch('/api/domains');
    const data = await res.json();
    if (Array.isArray(data)) setDomains(data);
  };

  const handleAdd = async () => {
    if (!newDomain) return;
    setIsAdding(true);
    setError('');

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (res.ok) {
        setNewDomain('');
        fetchDomains();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add domain');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (domain: Domain) => {
    await fetch('/api/domains', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: domain.id, is_active: !domain.is_active }),
    });
    fetchDomains();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove all associated aliases.')) return;
    await fetch(`/api/domains?id=${id}`, { method: 'DELETE' });
    fetchDomains();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Domain Management</h1>
        <p className="text-muted-foreground mt-1">
          Add and manage custom domains for your TempMail service
        </p>
      </div>

      {/* Add Domain */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Domain
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button onClick={handleAdd} disabled={isAdding || !newDomain}>
            {isAdding ? 'Adding...' : 'Add Domain'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Domain List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Registered Domains ({domains.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Domain</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Created</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">
                      {domain.domain}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {domain.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(domain.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(domain)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title={domain.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {domain.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(domain.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {domains.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No domains added yet
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
