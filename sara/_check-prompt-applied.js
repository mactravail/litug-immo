const API = 'https://n8n.litug.com/api/v1';
const KEY = process.env.N8N_API_KEY;
(async () => {
  const r = await fetch(`${API}/workflows/Qam6lzZwupon0v8b`, { headers: { 'X-N8N-API-KEY': KEY } });
  const wf = await r.json();
  const ai = wf.nodes.find(n => n.name === 'Sara (AI Agent)');
  const msg = ai.parameters.options.systemMessage;
  console.log('ETAPE 1 présent:', msg.includes('ETAPE 1'));
  console.log('LISTE IMMEDIATEMENT présent:', msg.includes('LISTE IMMEDIATEMENT') || msg.includes('liste TOUS'));
  console.log('ZONE INDISPONIBLE présent:', msg.includes('ZONE INDISPONIBLE'));
  // Montrer le bloc zone
  const idx = msg.indexOf('Quand on te demande un terrain');
  if (idx >= 0) console.log('\nBloc zone:\n', msg.substring(idx, idx + 500));
})();
