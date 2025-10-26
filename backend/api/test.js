export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    status: '✅ SUCCESS!',
    message: 'Your Pokémon API backend is working perfectly!',
    data: {
      version: '1.0.0',
      environment: 'production'
    }
  });
}