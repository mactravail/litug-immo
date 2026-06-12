import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { CreateEmployeeForm } from '@/components/admin/CreateEmployeeForm';

export default function NouvelEmployePage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/employes" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors mb-3">
          <ArrowLeft size={14} /> Retour aux employés
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Créer un accès employé</h1>
        <p className="text-muted text-sm mt-1">
          Vous créez le compte ; l’employé reçoit une invitation par email et choisit lui-même son mot de passe.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-stone-50 border border-stone-100 px-4 py-3 text-xs text-muted">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" />
        <span>
          Les accès du personnel ne se créent que d’ici, jamais par inscription publique. L’employé ne verra
          que <strong>ses</strong> tâches et <strong>son</strong> argent. Cette création est tracée dans le journal d’audit.
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <CreateEmployeeForm />
      </div>
    </div>
  );
}
