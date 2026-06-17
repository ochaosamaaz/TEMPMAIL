'use client';

import { useState } from 'react';
import { useMailStore } from '@/store/useMailStore';
import { generateLocalPart } from '@/lib/utils';
import { Copy, RefreshCw, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AliasGenerator() {
  const { domains, selectedDomain, setSelectedDomain, addAlias, setActiveAlias } = useMailStore();
  const [localPart, setLocalPart] = useState(generateLocalPart());
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullEmail = selectedDomain ? `${localPart}@${selectedDomain.domain}` : '';

  const handleGenerate = () => {
    setLocalPart(generateLocalPart());
  };

  const handleCopy = async () => {
    if (fullEmail) {
      await navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreate = async () => {
    if (!selectedDomain || !localPart) return;
    setIsCreating(true);

    try {
      const res = await fetch('/api/aliases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local_part: localPart,
          domain_id: selectedDomain.id,
        }),
      });

      if (res.ok) {
        const alias = await res.json();
        addAlias(alias);
        setActiveAlias(alias);
        setLocalPart(generateLocalPart());
      }
    } catch (error) {
      console.error('Error creating alias:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Generate Temp Email
      </h2>

      <div className="space-y-4">
        {/* Domain selector */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            Select Domain
          </label>
          <select
            value={selectedDomain?.id || ''}
            onChange={(e) => {
              const domain = domains.find((d) => d.id === e.target.value);
              setSelectedDomain(domain || null);
            }}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">-- Choose domain --</option>
            {domains.filter(d => d.is_active).map((domain) => (
              <option key={domain.id} value={domain.id}>
                @{domain.domain}
              </option>
            ))}
          </select>
        </div>

        {/* Email display */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-muted rounded-lg px-4 py-3 border border-border">
            <input
              type="text"
              value={localPart}
              onChange={(e) => setLocalPart(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
              className="flex-1 bg-transparent text-foreground font-mono text-sm focus:outline-none"
              placeholder="username"
            />
            <span className="text-muted-foreground text-sm">
              @{selectedDomain?.domain || 'domain.com'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={handleGenerate} variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Random
          </Button>
          <Button onClick={handleCopy} variant="secondary" size="sm" disabled={!fullEmail}>
            <Copy className="w-4 h-4 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            onClick={handleCreate}
            variant="primary"
            size="sm"
            disabled={!selectedDomain || !localPart || isCreating}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isCreating ? 'Creating...' : 'Create Alias'}
          </Button>
        </div>
      </div>
    </div>
  );
}
