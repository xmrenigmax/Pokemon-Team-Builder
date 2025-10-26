import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://pokemon-team-builder-plum.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  console.log(`Searching for: ${q}`); // Debug log

  try {
    // Get all Pokémon list
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const allPokemon = response.data.results;

    // Filter by search query
    const filtered = allPokemon
      .filter(pokemon => pokemon.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 10);

    console.log(`Found ${filtered.length} results`); // Debug log

    // Get basic data for search results
    const results = await Promise.all(
      filtered.map(async (pokemon) => {
        try {
          const pokemonRes = await axios.get(pokemon.url);
          const data = pokemonRes.data;
          
          return {
            id: data.id,
            name: data.name,
            sprites: {
              front_default: data.sprites.front_default
            },
            types: data.types.map(t => ({
              slot: t.slot,
              type: { name: t.type.name }
            }))
          };
        } catch (error) {
          console.error(`Error fetching ${pokemon.name}:`, error.message);
          return null;
        }
      })
    );

    // Filter out failed requests
    const validResults = results.filter(result => result !== null);

    res.status(200).json({ 
      query: q,
      results: validResults
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Search failed', 
      details: error.message 
    });
  }
}