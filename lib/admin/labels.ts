/* ============================================================
   Admin back-office — code → French display labels.
   DB codes stay English; every UI string here is French.
   ============================================================ */

import type {
  SubscriptionStatus, SubjectType, AuditAction, TeamRole,
  TaskPriority, TaskStatus, FieldReportStatus, IncidentStatus,
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

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  admin:      'Administrateur',
  procurement:'Achats',
  site_agent: 'Chef de chantier',
  inspector:  'Inspecteur indépendant',
  controller: 'Contrôleur (déblocage)',
};

/** Human sentence for each audit action — used by the journal d'audit screen. */
export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  validate_sub:        'a validé un abonnement',
  suspend_sub:         'a suspendu un abonnement',
  revoke_sub:          'a révoqué un abonnement',
  change_tier:         'a changé le palier d’un abonnement',
  add_invoice:         'a ajouté une facture',
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
