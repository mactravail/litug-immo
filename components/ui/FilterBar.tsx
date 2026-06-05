'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Option { value: string; label: string }

interface FilterGroup {
  key: string;
  label: string;
  options: Option[];
}

interface Props {
  groups: FilterGroup[];
  className?: string;
}

export function FilterBar({ groups, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {groups.map(group => (
        <select
          key={group.key}
          value={searchParams.get(group.key) ?? ''}
          onChange={e => updateFilter(group.key, e.target.value)}
          className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-white text-text appearance-none cursor-pointer hover:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          <option value="">{group.label}</option>
          {group.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
