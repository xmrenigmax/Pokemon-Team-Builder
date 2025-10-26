export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    message: '🚀 Pokémon Team Builder API is LIVE!',
    status: 'Deployed on Vercel',
    endpoints: [
      'GET /api/test',
      'GET /api/pokemon/search?q=pikachu',
      'GET /api/pokemon/25',
      'GET /api/pokemon/types',
      'POST /api/team/analyze'
    ],
    timestamp: new Date().toISOString()
  });
}