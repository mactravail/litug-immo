const API = 'https://n8n.litug.com/api/v1';
const KEY = process.env.N8N_API_KEY;
(async () => {
  const r = await fetch(`${API}/workflows/Qam6lzZwupon0v8b`, { headers: { 'X-N8N-API-KEY': KEY } });
  const wf = await r.json();
  // Tous les noeuds Postgres
  wf.nodes.filter(n => n.type && n.type.includes('postgres')).forEach(n => {
    console.log(`\n=== ${n.name} ===`);
    console.log('query:', n.parameters.query);
    console.log('replacement:', n.parameters?.options?.queryReplacement);
  });
})();
