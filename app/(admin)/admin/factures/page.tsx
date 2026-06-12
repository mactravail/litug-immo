import { Receipt, ExternalLink, ShieldCheck } from 'lucide-react';
import { getAdminProvider } from '@/lib/admin/provider';
import { CreateInvoiceForm } from '@/components/admin/CreateInvoiceForm';
import { INVOICE_RECIPIENT_LABEL, INVOICE_STATUS_LABEL, INVOICE_STATUS_STYLE } from '@/lib/admin/labels';
import { formatFcfa, formatEur, formatDateShort } from '@/lib/utils';

export default async function AdminFacturesPage() {
  const ap = getAdminProvider();
  const [parties, invoices] = await Promise.all([ap.listBillableParties(), ap.listInvoices()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">Factures</h1>
        <p className="text-muted text-sm mt-1">
          Émettez une facture aux clients qui doivent un service à Litug — vendeurs Sara, clients Mustaf, employés.
          Le client reçoit un lien de paiement Stripe.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-stone-50 border border-stone-100 px-4 py-3 text-xs text-muted">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent" />
        <span>
          Mode test : aucune somme réelle n’est encaissée tant que le volet bancaire n’est pas validé.
          La facturation se fait en EUR (le XOF n’est pas débitable). Chaque émission est tracée dans le journal d’audit.
        </span>
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 max-w-2xl">
        <h2 className="font-display text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Receipt size={17} className="text-accent" /> Nouvelle facture
        </h2>
        <CreateInvoiceForm parties={parties} />
      </div>

      {/* Factures émises */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-text">Factures émises</h2>

        {invoices.length === 0 ? (
          <p className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-6 text-sm text-muted">
            Aucune facture émise pour le moment.
          </p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-stone-100 bg-stone-50/50">
                    <th className="px-5 py-3 font-medium">Destinataire</th>
                    <th className="px-5 py-3 font-medium">Service</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Émise le</th>
                    <th className="px-5 py-3 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-stone-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-text">{inv.recipientName}</p>
                        <p className="text-[11px] text-muted">{INVOICE_RECIPIENT_LABEL[inv.recipientType]} · {inv.recipientEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {inv.description}
                        {inv.stripeNumber && <span className="block text-[11px] text-muted/70 font-mono">{inv.stripeNumber}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-text">{formatFcfa(inv.amount)}</p>
                        <p className="text-[11px] text-muted">{formatEur(inv.amount)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${INVOICE_STATUS_STYLE[inv.status]}`}>
                          {INVOICE_STATUS_LABEL[inv.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted">{formatDateShort(inv.createdAt)}</td>
                      <td className="px-5 py-3 text-right">
                        {inv.hostedInvoiceUrl && (
                          <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="text-accent inline-flex"><ExternalLink size={16} /></a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {invoices.map(inv => (
                <div key={inv.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-text truncate">{inv.recipientName}</p>
                      <p className="text-[11px] text-muted">{INVOICE_RECIPIENT_LABEL[inv.recipientType]}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${INVOICE_STATUS_STYLE[inv.status]}`}>
                      {INVOICE_STATUS_LABEL[inv.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-2">{inv.description}</p>
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <div>
                      <p className="text-sm font-medium text-text">{formatFcfa(inv.amount)}</p>
                      <p className="text-[11px] text-muted">{formatEur(inv.amount)} · {formatDateShort(inv.createdAt)}</p>
                    </div>
                    {inv.hostedInvoiceUrl && (
                      <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline shrink-0">
                        <ExternalLink size={13} /> Voir
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
