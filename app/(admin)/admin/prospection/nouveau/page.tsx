import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';
import { CreateEmployeeForm } from '@/components/admin/CreateEmployeeForm';

export default function NouveauProspecteurPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/prospection" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors mb-3">
          <ArrowLeft size={14} /> Retour à la prospection
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Créer un compte prospection</h1>
        <p className="text-muted text-sm mt-1">
          Vous créez le compte ; le prospecteur se connecte et accède à son propre espace pour saisir
          chaque jour les vendeurs qu’il démarche pour Sara.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-stone-50 border border-stone-100 px-4 py-3 text-xs text-muted">
        <Target size={15} className="mt-0.5 shrink-0 text-accent" />
        <span>
          Un compte prospection a un dashboard différent des employés terrain : il ne voit que
          <strong> son carnet de prospection</strong>, jamais les chantiers ni l’argent. Cette création est tracée dans le journal d’audit.
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <CreateEmployeeForm lockedRole="prospector" />
      </div>
    </div>
  );
}
