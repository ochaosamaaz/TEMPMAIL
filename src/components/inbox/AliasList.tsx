'use client';

import { useMailStore } from '@/store/useMailStore';
import { cn, formatDate } from '@/lib/utils';
import { Mail, Filter, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function AliasList() {
  const { aliases, activeAlias, setActiveAlias, filterAliasId, setFilterAliasId } = useMailStore();

  const handleFilter = (aliasId: string) => {
    if (filterAliasId === aliasId) {
      setFilterAliasId(null);
    } else {
      setFilterAliasId(aliasId);
    }
  };

  if (aliases.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">
          No aliases yet. Generate one above!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Your Aliases ({aliases.length})
        </h3>
      </div>
      <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
        {aliases.map((alias) => (
          <div
            key={alias.id}
            className={cn(
              'flex items-center justify-between px-4 py-3 cursor-pointer transition-colors',
              activeAlias?.id === alias.id
                ? 'bg-primary/5 border-l-2 border-l-primary'
                : 'hover:bg-muted'
            )}
            onClick={() => setActiveAlias(alias)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {alias.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Created {formatDate(alias.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {alias.is_active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="danger">Expired</Badge>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilter(alias.id);
                }}
                className={cn(
                  'p-1 rounded transition-colors',
                  filterAliasId === alias.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Filter messages"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
