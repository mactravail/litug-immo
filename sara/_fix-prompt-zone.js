// Met à jour le comportement de Sara pour les zones indisponibles.
// Usage : N8N_API_KEY=xxx node sara/_fix-prompt-zone.js
const API = 'https://n8n.litug.com/api/v1';
const KEY = process.env.N8N_API_KEY;
const WF_ID = 'Qam6lzZwupon0v8b';

(async () => {
  // 1. Récupérer le workflow
  const res = await fetch(`${API}/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': KEY },
  });
  const wf = await res.json();

  const aiNode = wf.nodes.find(n => n.name === 'Sara (AI Agent)');
  let msg = aiNode.parameters.options.systemMessage;

  // 2. Remplacer la section "zone indisponible" dans RÈGLE N1
  const OLD_ZONE = /Quand on te demande un terrain dans une zone \(ou d'un type\) que tu n'as pas dans la liste[\s\S]*?Tu ne laisses jamais la personne sans suite, et tu n'inventes jamais de panne pour esquiver\./;
  const NEW_ZONE = `Quand on te demande un terrain dans une zone (ou d'un type) que tu n'as pas dans la liste, applique ce comportement en 2 etapes OBLIGATOIRES :
ETAPE 1 — Dis honnetement que tu n'as pas de terrain dans cette zone pour le moment. Puis IMMEDIATEMENT, sans attendre, liste TOUS les terrains disponibles un par un avec : titre, zone, prix en FCFA, type de document. Termine par : "Est-ce que l'un de ces terrains pourrait vous interesser ?"
ETAPE 2 — Si la personne confirme qu'elle ne veut QUE sa zone initiale : recapitule ses criteres exacts (zone souhaitee, budget si connu, type de document si connu, usage si connu), dis-lui : "Je note vos criteres et le vendeur vous contactera directement des qu'un terrain correspondant sera disponible." Ensuite APPELLE l'outil mark_lead_qualified avec ces criteres.
Tu ne proposes jamais un terrain absent de la liste. Tu ne laisses jamais la personne sans reponse concrete.`;

  if (!OLD_ZONE.test(msg)) {
    console.error('ERREUR : section zone introuvable dans le prompt. Affichage du contexte :');
    const idx = msg.indexOf('Quand on te demande un terrain');
    console.log(msg.substring(idx, idx + 400));
    process.exit(1);
  }
  msg = msg.replace(OLD_ZONE, NEW_ZONE);

  // 3. Remplacer la section "CE QUE TU FAIS"
  const OLD_FAIS = /CE QUE TU FAIS : tu accueilles simplement[\s\S]*?propose de noter ses criteres\./;
  const NEW_FAIS = `CE QUE TU FAIS : tu reponds a la question posee. Tu presentes les terrains pertinents (titre, zone, prix FCFA, type de document). Si la personne demande une zone ou un type absent de ta liste : suis les 2 ETAPES OBLIGATOIRES ci-dessus (liste tous les terrains dispo, puis si insistance recapitule + mark_lead_qualified). Si la personne est serieuse sur un terrain disponible : APPELLE mark_lead_qualified UNE SEULE FOIS avec ce que tu as appris, puis dis que le vendeur la recontactera directement.`;

  if (!OLD_FAIS.test(msg)) {
    console.error('ERREUR : section CE QUE TU FAIS introuvable.');
    process.exit(1);
  }
  msg = msg.replace(OLD_FAIS, NEW_FAIS);

  aiNode.parameters.options.systemMessage = msg;
  console.log('✓ Prompt mis à jour — vérification : ETAPE 1 présent :', msg.includes('ETAPE 1'));

  // 4. PUT
  const put = await fetch(`${API}/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: { executionOrder: wf.settings?.executionOrder || 'v1' },
    }),
  });
  console.log('PUT status:', put.status, put.ok ? 'OK' : await put.text());

  // 5. Réactiver
  const act = await fetch(`${API}/workflows/${WF_ID}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': KEY },
  });
  const actJson = await act.json();
  console.log('ACTIVE:', actJson.active);
})();
