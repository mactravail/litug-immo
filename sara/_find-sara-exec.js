// Trouve les exécutions qui ont passé par Sara (AI Agent)
const API = 'https://n8n.litug.com/api/v1';
const KEY = process.env.N8N_API_KEY;
(async () => {
  const r = await fetch(`${API}/executions?limit=30&workflowId=Qam6lzZwupon0v8b`, { headers: { 'X-N8N-API-KEY': KEY } });
  const { data } = await r.json();
  for (const ex of data) {
    const r2 = await fetch(`${API}/executions/${ex.id}?includeData=true`, { headers: { 'X-N8N-API-KEY': KEY } });
    const full = await r2.json();
    const run = full.data?.resultData?.runData || {};
    const hasSara = 'Sara (AI Agent)' in run || 'Extraire le message' in run;
    const terNode = run['Charger terrains'];
    const lands = terNode?.[0]?.data?.main?.[0]?.[0]?.json?.lands;
    if (hasSara) {
      const fromNode = run['Extraire le message']?.[0]?.data?.main?.[0]?.[0]?.json;
      console.log(`exec ${ex.id} [${ex.startedAt}] from=${fromNode?.from} lands_count=${lands?.length ?? 'N/A'}`);
      if (lands !== undefined) console.log('  lands:', JSON.stringify(lands).substring(0, 200));
    }
  }
})();
