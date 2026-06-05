import Link from 'next/link';
import { Plus, Map } from 'lucide-react';
import { getDataProvider } from '@/lib/data/provider';
import { getAuthenticatedSellerId } from '@/lib/supabase-server';
import { LandCard } from '@/components/ui/LandCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/ui/PageHeader';
import type { SaleStatus, VerificationStatus, DocumentType } from '@/lib/data/types';

const FILTER_GROUPS = [
  {
    key: 'saleStatus',
    label: 'Statut de vente',
    options: [
      { value: 'disponible', label: 'Disponibles' },
      { value: 'en_cours_de_vente', label: 'En cours de vente' },
      { value: 'vendu', label: 'Vendus' },
    ],
  },
  {
    key: 'verificationStatus',
    label: 'Vérification',
    options: [
      { value: 'verifie', label: 'Vérifiés' },
      { value: 'a_verifier', label: 'À vérifier' },
      { value: 'non_verifie', label: 'Non vérifiés' },
    ],
  },
  {
    key: 'documentType',
    label: 'Type de document',
    options: [
      { value: 'tf', label: 'Titre Foncier' },
      { value: 'bail', label: 'Bail' },
      { value: 'deliberation', label: 'Délibération' },
    ],
  },
];

interface Props {
  searchParams: Promise<{ saleStatus?: string; verificationStatus?: string; documentType?: string }>;
}

export default async function TerrainsPage({ searchParams }: Props) {
  const params = await searchParams;
  const sellerId = await getAuthenticatedSellerId();
  const dp = getDataProvider();
  const lands = await dp.listLands(sellerId, {
    saleStatus: params.saleStatus as SaleStatus | undefined,
    verificationStatus: params.verificationStatus as VerificationStatus | undefined,
    documentType: params.documentType as DocumentType | undefined,
  });

  return (
    <div>
      <PageHeader
        title="Mes terrains"
        action={
          <Link
            href="/terrains/nouveau"
            className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} />
            Ajouter un terrain
          </Link>
        }
      />

      <div className="mb-6">
        <FilterBar groups={FILTER_GROUPS} />
      </div>

      {lands.length === 0 ? (
        <EmptyState
          icon={Map}
          title="Aucun terrain trouvé"
          description="Ajoutez votre premier terrain ou modifiez les filtres."
          action={{ label: '+ Ajouter un terrain', href: '/terrains/nouveau' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lands.map(land => <LandCard key={land.id} land={land} />)}
        </div>
      )}
    </div>
  );
}
