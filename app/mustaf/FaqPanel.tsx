'use client';

import { useState } from 'react';
import { HelpCircle, X, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: "Qui détient mon argent ?",
    a: "Jamais Litug. Votre argent est bloqué chez un tiers de confiance (notaire ou banque partenaire), sur un compte séquestre dédié à votre seul projet. Nous orchestrons le chantier ; nous ne touchons jamais aux fonds.",
  },
  {
    q: "Et si je n'ai plus les moyens de continuer ?",
    a: "Votre argent reste bloqué pour votre projet, à votre disposition. Et comme une phase ne démarre que lorsqu'elle est entièrement financée, vous ne vous retrouvez jamais avec un chantier lancé puis abandonné à moitié.",
  },
  {
    q: "Et si le travail est mal fait ?",
    a: "Avant chaque paiement, un inspecteur indépendant vérifie le travail — et même avant chaque coulage de béton, pour prouver aujourd'hui ce qui sera caché demain. Une retenue de garantie de 10 % est conservée sur chaque entreprise jusqu'à la vérification finale.",
  },
  {
    q: "Ma famille peut-elle cotiser avec moi ?",
    a: "Oui. Plusieurs proches peuvent verser sur le même projet, et la participation de chacun est visible. Important : il s'agit d'un relevé de participation, pas d'un titre de propriété. La propriété est établie par acte notarié.",
  },
  {
    q: "Faut-il avoir déjà acheté le terrain ?",
    a: "Oui — ou en acheter un via Litug. Dans tous les cas, on vérifie le titre du terrain avant de commencer à construire.",
  },
  {
    q: "Combien ça coûte vraiment ?",
    a: "Nos honoraires sont un pourcentage de votre budget (de ~8 % à ~16 % selon l'offre), étalé sur les phases. Utilisez le simulateur sur la page pour voir le montant exact pour votre budget, en FCFA et en euros. La Phase 0 (plan, permis, étude de sol) est un forfait fixe payé au départ.",
  },
];

export default function FaqPanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="faq-trigger"
        aria-expanded={open}
      >
        <HelpCircle size={16} />
        Questions fréquentes
      </button>

      {/* Overlay + panel */}
      {open && (
        <>
          {/* backdrop */}
          <div className="faq-backdrop" onClick={() => setOpen(false)} />

          {/* panel */}
          <div className="faq-panel" role="dialog" aria-modal="true" aria-label="Questions fréquentes">
            <div className="faq-panel-head">
              <div className="faq-panel-title">
                <HelpCircle size={18} />
                Questions fréquentes
              </div>
              <button
                className="faq-close"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <ul className="faq-list">
              {FAQS.map((item, i) => (
                <li key={i} className={`faq-item${expanded === i ? ' open' : ''}`}>
                  <button
                    className="faq-q"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    aria-expanded={expanded === i}
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={16} className="faq-chevron" />
                  </button>
                  {expanded === i && (
                    <div className="faq-a">{item.a}</div>
                  )}
                </li>
              ))}
            </ul>

            <div className="faq-panel-foot">
              <a href="/#contact" className="faq-contact-link">
                Autre question ? Parler à l&apos;équipe →
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
