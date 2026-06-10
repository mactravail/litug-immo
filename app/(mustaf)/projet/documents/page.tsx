import { FileText, Map, ScrollText, FileCheck2, Download } from 'lucide-react';
import { getMustafProvider } from '@/lib/mustaf/provider';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDateShort } from '@/lib/utils';
import type { DocumentCategory } from '@/lib/mustaf/types';

const CATEGORY_META: Record<DocumentCategory, { label: string; icon: typeof FileText }> = {
  plan:    { label: 'Plan',    icon: Map },
  permis:  { label: 'Permis',  icon: FileCheck2 },
  devis:   { label: 'Devis',   icon: ScrollText },
  contrat: { label: 'Contrat', icon: FileText },
};

export default async function DocumentsPage() {
  const mp = getMustafProvider();
  const documents = await mp.getDocuments();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        breadcrumbs={[{ label: 'Mon projet', href: '/projet' }, { label: 'Documents' }]}
      />

      <p className="text-sm text-muted -mt-2">
        Plan d’architecte, permis de construire, devis par phase et contrats — accessibles à tout moment.
      </p>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
        {documents.map(doc => {
          const meta = CATEGORY_META[doc.category];
          const Icon = meta.icon;
          return (
            <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-ink" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text truncate">
                  {doc.label}{doc.phaseLabel ? ` — ${doc.phaseLabel}` : ''}
                </p>
                <p className="text-xs text-muted">{meta.label} · {formatDateShort(doc.createdAt)}</p>
              </div>
              <a
                href={doc.url ?? '#'}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline shrink-0"
              >
                <Download size={14} /> Ouvrir
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
