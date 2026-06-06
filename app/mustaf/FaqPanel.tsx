'use client';

import { useState } from 'react';
import { HelpCircle, X, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: "Mustaf est-il un simple chatbot AI ?",
    a: "Non. Mustaf est un assistant construction complet. L'IA génère les concepts et maquettes, mais de vrais architectes sénégalais et italiens prennent le relais pour créer les plans et suivre le chantier.",
  },
  {
    q: "Puis-je construire depuis la diaspora sans être au Sénégal ?",
    a: "Oui, c'est exactement pour ça que Mustaf existe. Tu suis l'avancement à distance : rapports photo, vidéos chantier, appels réguliers avec notre géomètre sur place.",
  },
  {
    q: "Comment fonctionne le paiement par étapes ?",
    a: "Tu ne paies que ce qui est réalisé. Chaque étape (fondations, murs, toiture, finitions) est validée par notre géomètre avec photo avant le déblocage du montant suivant.",
  },
  {
    q: "Quel style de maison peut concevoir Mustaf ?",
    a: "Mustaf propose trois styles : africain traditionnel, moderne minimaliste, et européen. Tu peux aussi mixer les inspirations — l'architecte adapte selon ton terrain et ton budget.",
  },
  {
    q: "Quelle est la différence entre les plans Starter, Build et Complete ?",
    a: "Starter = exploration d'idées et maquettes AI. Build = mise en relation avec un architecte et pré-plans réels. Complete = accompagnement terrain complet jusqu'à la livraison des clés.",
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
