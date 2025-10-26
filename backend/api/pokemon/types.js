import pokeAPI from '../../../lib/pokeapi';

/**
 * API endpoint for type relationships data
 */
export default async function handler(req, res) {
  // CORS headers
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

  try {
    const typeRelations = await pokeAPI.getTypeRelationships();
    
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(typeRelations);
  } catch (error) {
    console.error('Error in types API:', error.message);
    res.status(500).json({ error: 'Failed to fetch type data' });
  }
}