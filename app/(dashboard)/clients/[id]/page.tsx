import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Phone, MapPin, FileText, Banknote } from 'lucide-react';
import { getDataProvider } from '@/lib/data/provider';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DocumentTypeBadge } from '@/components/ui/DocumentTypeBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { LeadStatusActions } from './LeadStatusActions';
import { formatFcfa, formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  site: 'Site web',
  autre: 'Autre',
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const dp = getDataProvider();
  const [lead, conversation] = await Promise.all([
    dp.getLead(id),
    dp.getConversation(id),
  ]);
  if (!lead) notFound();

  const interestedLand = lead.interestedLandId ? await dp.getLand(lead.interestedLandId) : null;

  return (
    <div>
      <PageHeader
        title={lead.name ?? 'Client inconnu'}
        breadcrumbs={[{ label: 'Clients', href: '/clients' }, { label: lead.name ?? id }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale — conversation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-50 flex items-center gap-2">
              <MessageCircle size={16} className="text-muted" />
              <p className="font-semibold text-sm text-text">Historique de conversation</p>
            </div>

            {conversation && conversation.messages.length > 0 ? (
              <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                {conversation.messages.map((msg, i) => {
                  const isAi = msg.role === 'ai';
                  const isSeller = msg.role === 'seller';
                  const isUser = msg.role === 'user';

                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                        {!isUser && (
                          <p className="text-[10px] text-muted mb-1 px-1">
                            {isAi ? 'Agent IA' : 'Vous'}
                          </p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-stone-100 text-text rounded-tr-sm'
                            : isAi
                            ? 'bg-accent-light text-accent rounded-tl-sm'
                            : 'bg-gold-light text-stone-800 border border-gold/30 rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <p className="text-[10px] text-muted mt-1 px-1">
                          {new Date(msg.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          {formatDate(msg.at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted text-sm">
                Aucune conversation enregistrée.
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Statut + action */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted font-semibold uppercase tracking-wider">Statut</p>
              <StatusBadge type="lead" status={lead.status} />
            </div>
            <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
          </div>

          {/* Infos client */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <p className="text-xs text-muted font-semibold uppercase tracking-wider">Profil</p>
            <div className="space-y-3 text-sm">
              {lead.phone && (
                <div className="flex items-center gap-3 text-text">
                  <Phone size={14} className="text-muted shrink-0" />
                  <a href={`tel:${lead.phone}`} className="hover:text-accent transition-colors">{lead.phone}</a>
                </div>
              )}
              {lead.budgetFcfa && (
                <div className="flex items-center gap-3 text-text">
                  <Banknote size={14} className="text-muted shrink-0" />
                  <span>{formatFcfa(lead.budgetFcfa)}</span>
                </div>
              )}
              {lead.desiredZone && (
                <div className="flex items-center gap-3 text-text">
                  <MapPin size={14} className="text-muted shrink-0" />
                  <span>{lead.desiredZone}</span>
                </div>
              )}
              {lead.desiredDocumentType && (
                <div className="flex items-center gap-3">
                  <FileText size={14} className="text-muted shrink-0" />
                  <DocumentTypeBadge type={lead.desiredDocumentType} />
                </div>
              )}
              <div className="flex items-center gap-3 text-muted text-xs">
                <MessageCircle size={14} className="shrink-0" />
                <span>Via {SOURCE_LABELS[lead.source]} · {formatDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Terrain visé */}
          {interestedLand && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">Terrain visé</p>
              <Link href={`/terrains/${interestedLand.id}`} className="block hover:text-accent transition-colors">
                <p className="font-medium text-sm text-text leading-snug">{interestedLand.title}</p>
                <p className="text-xs text-muted mt-1">{formatFcfa(interestedLand.priceFcfa)} · {interestedLand.zone}</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
