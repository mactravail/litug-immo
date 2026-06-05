import { PageHeader } from '@/components/ui/PageHeader';
import { NewLandForm } from './NewLandForm';

export default function NouveauTerrain() {
  return (
    <div>
      <PageHeader
        title="Ajouter un terrain"
        breadcrumbs={[{ label: 'Terrains', href: '/terrains' }, { label: 'Nouveau' }]}
      />
      <div className="max-w-2xl">
        <NewLandForm />
      </div>
    </div>
  );
}
