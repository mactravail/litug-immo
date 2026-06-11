import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { TEAM_ROLE_LABEL } from '@/lib/admin/labels';
import { formatFcfa } from '@/lib/utils';

export default async function AdminEmployesPage() {
  const employees = await getAdminProvider().listEmployees();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Employés</h1>
        <p className="text-muted text-sm mt-1">Travailleurs de terrain : tâches en cours, chantiers et avances à réconcilier.</p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-stone-100 bg-stone-50/50">
              <th className="px-5 py-3 font-medium">Employé</th>
              <th className="px-5 py-3 font-medium">Rôle</th>
              <th className="px-5 py-3 font-medium">Chantiers</th>
              <th className="px-5 py-3 font-medium">Tâches actives</th>
              <th className="px-5 py-3 font-medium">Avances</th>
              <th className="px-5 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {employees.map(({ member, activeTasks, unreconciledAdvances, outstandingAmount }) => (
              <tr key={member.id} className="hover:bg-stone-50/50">
                <td className="px-5 py-3">
                  <Link href={`/admin/employes/${member.id}`} className="font-medium text-text hover:text-accent transition-colors">{member.displayName}</Link>
                  <p className="text-[11px] text-muted">{member.contact}</p>
                </td>
                <td className="px-5 py-3 text-muted">{TEAM_ROLE_LABEL[member.role]}</td>
                <td className="px-5 py-3 text-muted">{member.assignedProjectIds.length}</td>
                <td className="px-5 py-3 text-muted">{activeTasks}</td>
                <td className="px-5 py-3">
                  {unreconciledAdvances > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
                      <AlertTriangle size={13} /> {unreconciledAdvances} non réconciliée{unreconciledAdvances > 1 ? 's' : ''}
                      {outstandingAmount !== 0 && <span className="text-muted font-normal">· écart {formatFcfa(outstandingAmount)}</span>}
                    </span>
                  ) : <span className="text-[11px] text-emerald-700 font-medium">À jour</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/employes/${member.id}`} className="text-accent inline-flex"><ArrowRight size={16} /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {employees.map(({ member, activeTasks, unreconciledAdvances, outstandingAmount }) => (
          <Link key={member.id} href={`/admin/employes/${member.id}`} className="block bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-text">{member.displayName}</p>
                <p className="text-[11px] text-muted">{TEAM_ROLE_LABEL[member.role]} · {activeTasks} tâche(s)</p>
              </div>
              {unreconciledAdvances > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"><AlertTriangle size={12} /> {formatFcfa(outstandingAmount)}</span>
              ) : <span className="text-[11px] text-emerald-700 font-medium">À jour</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
