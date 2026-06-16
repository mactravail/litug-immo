const API = 'https://n8n.litug.com/api/v1';
const KEY = process.env.N8N_API_KEY;
const ID = process.argv[2] || '352';
(async () => {
  const r = await fetch(`${API}/executions/${ID}?includeData=true`, { headers: { 'X-N8N-API-KEY': KEY } });
  const ex = await r.json();
  const run = ex.data?.resultData?.runData;
  if (!run) { console.log('Pas de runData'); return; }
  for (const [name, arr] of Object.entries(run)) {
    const node = arr[0];
    const out = node?.data?.main?.[0];
    const status = node?.executionStatus;
    if (name.match(/Extraire|Résoudre|soudre|Upsert|terrains|base/i)) {
      console.log(`\n=== ${name} [${status}] ===`);
      if (out && out.length > 0) {
        console.log(JSON.stringify(out[0]?.json).substring(0, 300));
      } else {
        console.log('(vide — 0 lignes)');
      }
    }
  }
})();
