/* ============================================================
   Admin back-office — code → French display labels.
   DB codes stay English; every UI string here is French.
   ============================================================ */

import type {
  SubscriptionStatus, SubjectType, AuditAction, TeamRole,
  TaskPriority, TaskStatus, FieldReportStatus, IncidentStatus,
  InvoiceRecipientType, InvoiceStatus,
  ProspectNetwork, ProspectContactMethod, ProspectOutcome, ProspectStatus,
} from './types';

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  pending:   'En attente de validation',
  active:    'Actif',
  suspended: 'Suspendu',
  revoked:   'Révoqué',
};

/** Tailwind classes (Sahel palette) per subscription status — semantic, not brand. */
export const SUBSCRIPTION_STATUS_STYLE: Record<SubscriptionStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-stone-100 text-stone-600 border-stone-200',
  revoked:   'bg-red-50 text-red-600 border-red-200',
};

export const SUBJECT_TYPE_LABEL: Record<SubjectType, string> = {
  seller: 'Vendeur (Sara)',
  mustaf: 'Client construction (Mustaf)',
};

/* --- Factures --- */

export const INVOICE_RECIPIENT_LABEL: Record<InvoiceRecipientType, string> = {
  seller:   'Vendeur (Sara)',
  mustaf:   'Client construction (Mustaf)',
  employee: 'Employé',
  other:    'Autre destinataire',
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  open: 'À régler',
  paid: 'Réglée',
  void: 'Annulée',
};

/** Tailwind classes per invoice status — semantic, not brand. */
export const INVOICE_STATUS_STYLE: Record<InvoiceStatus, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  void: 'bg-stone-100 text-stone-600 border-stone-200',
};

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  admin:      'Administrateur',
  procurement:'Achats',
  site_agent: 'Chef de chantier',
  inspector:  'Inspecteur indépendant',
  controller: 'Contrôleur (déblocage)',
  prospector: 'Prospecteur commercial',
};

/** Human sentence for each audit action — used by the journal d'audit screen. */
export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  validate_sub:        'a validé un abonnement',
  suspend_sub:         'a suspendu un abonnement',
  revoke_sub:          'a révoqué un abonnement',
  change_tier:         'a changé le palier d’un abonnement',
  add_invoice:         'a ajouté une facture',
  issue_invoice:       'a émis une facture',
  add_media:           'a ajouté un média de chantier',
  update_phase_status: 'a fait avancer une phase',
  release_funds:       'a débloqué des fonds',
  assign_role:         'a assigné un rôle',
  rotate_inspector:    'a fait tourner un inspecteur',
  update_anomaly:      'a traité une anomalie',
  assign_task:         'a assigné une tâche',
  create_advance:      'a accordé une avance',
  validate_report:     'a validé un rendu-compte',
  request_fix:         'a demandé une correction',
  cancel_task:         'a annulé une tâche',
  resolve_incident:    'a résolu un problème',
  escalate_incident:   'a escaladé un problème',
  log_prospect:        'a enregistré une prospection',
  submit_prospects:    'a envoyé ses prospections au superviseur',
  validate_recharge:   'a validé une recharge',
  reject_recharge:     'a refusé une recharge',
};

/* --- Prospection commerciale --- */

export const PROSPECT_NETWORK_LABEL: Record<ProspectNetwork, string> = {
  facebook:    'Facebook',
  instagram:   'Instagram',
  tiktok:      'TikTok',
  linkedin:    'LinkedIn',
  whatsapp:    'WhatsApp',
  youtube:     'YouTube',
  marketplace: 'Marketplace',
  other:       'Autre',
};

export const PROSPECT_CONTACT_LABEL: Record<ProspectContactMethod, string> = {
  message:   'Message privé',
  comment:   'Commentaire',
  call:      'Appel téléphonique',
  whatsapp:  'WhatsApp',
  in_person: 'En personne',
  other:     'Autre',
};

export const PROSPECT_OUTCOME_LABEL: Record<ProspectOutcome, string> = {
  to_contact:  'À prospecter',
  no_response: 'Sans réponse',
  interested:  'A accepté',
  refused:     'A refusé',
};

/** Libellés courts pour les onglets / listes de l'entonnoir de prospection. */
export const PROSPECT_OUTCOME_TAB_LABEL: Record<ProspectOutcome, string> = {
  to_contact:  'À prospecter',
  no_response: 'Prospectés',
  interested:  'Ont accepté',
  refused:     'Ont refusé',
};

/** Tailwind classes per outcome — semantic, not brand. */
export const PROSPECT_OUTCOME_STYLE: Record<ProspectOutcome, string> = {
  to_contact:  'bg-sky-50 text-sky-700 border-sky-200',
  no_response: 'bg-stone-100 text-stone-600 border-stone-200',
  interested:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  refused:     'bg-amber-50 text-amber-700 border-amber-200',
};

export const PROSPECT_STATUS_LABEL: Record<ProspectStatus, string> = {
  draft: 'Brouillon',
  sent:  'Envoyé',
};

export const PROSPECT_STATUS_STYLE: Record<ProspectStatus, string> = {
  draft: 'bg-stone-100 text-stone-500 border-stone-200',
  sent:  'bg-sky-50 text-sky-700 border-sky-200',
};

/* --- Volet B : tâches, redditions, incidents --- */

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  high:   'Haute',
  medium: 'Moyenne',
  low:    'Basse',
};

export const TASK_PRIORITY_STYLE: Record<TaskPriority, string> = {
  high:   'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-stone-100 text-stone-600 border-stone-200',
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  assigned:    'Assignée',
  in_progress: 'En cours',
  reported:    'Rendu-compte soumis',
  validated:   'Validée',
  cancelled:   'Annulée',
};

export const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
  assigned:    'bg-stone-100 text-stone-600 border-stone-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  reported:    'bg-amber-50 text-amber-700 border-amber-200',
  validated:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:   'bg-stone-50 text-muted border-stone-200',
};

export const FIELD_REPORT_STATUS_LABEL: Record<FieldReportStatus, string> = {
  submitted: 'À examiner',
  validated: 'Validé',
  needs_fix: 'Correction demandée',
};

export const FIELD_REPORT_STATUS_STYLE: Record<FieldReportStatus, string> = {
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  validated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  needs_fix: 'bg-red-50 text-red-600 border-red-200',
};

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
  to_resolve: 'À résoudre',
  resolved:   'Résolu',
};

export const INCIDENT_STATUS_STYLE: Record<IncidentStatus, string> = {
  to_resolve: 'bg-red-50 text-red-600 border-red-200',
  resolved:   'bg-emerald-50 text-emerald-700 border-emerald-200',
};
