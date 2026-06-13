/* ============================================================
   Mustaf — config des 3 offres (% paramétrables) + Phase 0.
   Source unique partagée par la page produit et le simulateur.
   Les % sont indicatifs et ajustables ici, sans toucher au JSX.
   ============================================================ */

export const PHASE_ZERO_FEE = 500_000; // forfait fixe Phase 0 (FCFA), payé une fois

// Accès direct au tableau de bord sans Phase 0 (50 €, FCFA au taux fixe XOF).
// Couvre la prise en charge du dossier + création du dashboard, hors abonnement de gestion.
export const DASHBOARD_FEE_EUR = 50;
export const DASHBOARD_FEE = 32_800;

// Bornes du simulateur d'honoraires (FCFA)
export const SIM_MIN = 15_000_000;
export const SIM_MAX = 80_000_000;
export const SIM_STEP = 1_000_000;
export const SIM_DEFAULT = 30_000_000;

export type TierId = 'suivi' | 'serenite' | 'tranquillite';

export interface Tier {
  id: TierId;
  name: string;
  pct: number;            // honoraires de gestion, en % du budget de construction
  forWhom: string;        // "pour qui"
  featured: boolean;
  badge?: string;
  inherits?: string;      // petite légende au-dessus de la liste
  features: string[];     // ce qui s'ajoute au socle commun
}

// Socle commun à toutes les offres (§3.2)
export const COMMON_FEATURES: string[] = [
  'Compte séquestre dédié chez un tiers de confiance',
  'Une phase ne démarre que financée',
  'Zéro marge sur les matériaux',
  'Dépenses détaillées, ligne par ligne, avec factures',
  'Contribution familiale visible',
  'Gestion des permis',
  'Dashboard mobile',
];

export const TIERS: Tier[] = [
  {
    id: 'suivi',
    name: 'Suivi essentiel',
    pct: 8,
    forWhom: 'Pour qui peut aussi passer voir le chantier de temps en temps.',
    featured: false,
    inherits: 'En plus du socle commun :',
    features: [
      'Visite de chantier mensuelle',
      'Suivi photo daté et géolocalisé',
      'Paiement débloqué par phase',
    ],
  },
  {
    id: 'serenite',
    name: 'Sérénité',
    pct: 12,
    forWhom: 'Pour la diaspora qui veut dormir tranquille, sans rien gérer.',
    featured: true,
    badge: 'Recommandé',
    inherits: 'Tout « Suivi essentiel », et en plus :',
    features: [
      'Visite hebdomadaire',
      'Inspecteur indépendant',
      'Vérification avant chaque coulage de béton',
      'Retenue de garantie de 10 % sur les entreprises',
      'Rapport vidéo régulier',
    ],
  },
  {
    id: 'tranquillite',
    name: 'Tranquillité totale',
    pct: 16,
    forWhom: 'Pour les gros budgets et les villas — zéro souci, clé en main.',
    featured: false,
    inherits: 'Tout « Sérénité », et en plus :',
    features: [
      'Visites bihebdomadaires ou à la demande',
      'Chef de chantier dédié',
      'Alertes en temps réel',
      'Gestion complète de bout en bout',
    ],
  },
];
