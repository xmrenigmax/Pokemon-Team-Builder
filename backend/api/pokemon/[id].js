import pokeAPI from '../../lib/pokeapi.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID is required' });
  }

  try {
    const pokemon = await pokeAPI.getPokemon(id);
    
    // Cache for 1 hour on CDN
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(pokemon);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Pokémon not found' });
    } else {
      console.error('Error in Pokémon API:', error.message);
      res.status(500).json({ error: 'Failed to fetch Pokémon data' });
    }
  }
}