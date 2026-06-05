'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Map, Users, X } from 'lucide-react';

export type SearchItem = {
  id: string;
  type: 'terrain' | 'client';
  title: string;
  subtitle: string;
  href: string;
};

interface Props {
  items: SearchItem[];
}

export function GlobalSearch({ items }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length < 2 ? [] : items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const terrains = results.filter(r => r.type === 'terrain');
  const clients  = results.filter(r => r.type === 'client');

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(href: string) {
    setQuery('');
    setOpen(false);
    router.push(href);
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all">
        <Search size={15} className="text-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un terrain, un client…"
          className="flex-1 text-sm text-text placeholder:text-muted bg-transparent outline-none"
        />
        {query && (
          <button onClick={handleClear} className="text-muted hover:text-text transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-150 rounded-2xl shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">Aucun résultat pour « {query} »</p>
          ) : (
            <div className="py-2">
              {terrains.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Terrains</p>
                  {terrains.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-left"
                    >
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Map size={13} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{item.title}</p>
                        <p className="text-xs text-muted truncate">{item.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {clients.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Clients</p>
                  {clients.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-left"
                    >
                      <span className="p-1.5 rounded-lg bg-violet-50 text-violet-600 shrink-0">
                        <Users size={13} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{item.title}</p>
                        <p className="text-xs text-muted truncate">{item.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
