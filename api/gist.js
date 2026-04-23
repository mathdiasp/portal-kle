const GIST_ID   = 'f75610c784ccff5fe5b8b484c230cd70';
const GIST_FILE = 'antecipados-data.json';

export default async function handler(req, res) {
  const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!TOKEN) return res.status(500).json({ error: 'Token não configurado' });

  const headers = {
    'Authorization': `token ${TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
    if (!r.ok) return res.status(r.status).json({ error: 'Gist read failed' });
    const gist = await r.json();
    const content = gist.files?.[GIST_FILE]?.content;
    if (!content || content === '{}') return res.status(404).json({ error: 'Sem dados' });
    return res.status(200).json(JSON.parse(content));
  }

  if (req.method === 'POST') {
    const data = req.body;
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(data) } } })
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: err.message || 'Gist write failed' });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
