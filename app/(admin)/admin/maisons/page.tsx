import { Home } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { HouseExamplesManager, type HouseExample } from '@/components/admin/HouseExamplesManager';

export const dynamic = 'force-dynamic';

async function listHouseExamples(): Promise<HouseExample[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('house_examples')
      .select('id, title, surface, photo')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as HouseExample[];
  } catch {
    return [];
  }
}

export default async function AdminMaisonsPage() {
  const items = await listHouseExamples();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text flex items-center gap-2.5">
          <Home size={24} className="text-accent" /> Exemples de maisons
        </h1>
        <p className="text-muted text-sm mt-1">
          Ajoutez des photos de maisons pour la vitrine de la page d’accueil (onglet « Exemple de maison »).
          Ces images illustrent ce que Litug peut construire — elles ne sont pas liées à un projet client.
        </p>
      </div>

      <HouseExamplesManager items={items} />
    </div>
  );
}
