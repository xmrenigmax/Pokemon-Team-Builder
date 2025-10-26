import axios from 'axios';

/**
 * API endpoint for Pokémon search and data retrieval
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q, id } = req.query;

  // If ID is provided, get single Pokémon
  if (id) {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = response.data;

      const pokemon = {
        id: data.id,
        name: data.name,
        sprites: {
          front_default: data.sprites.front_default,
          front_shiny: data.sprites.front_shiny,
        },
        types: data.types.map(t => ({
          slot: t.slot,
          type: { name: t.type.name }
        })),
        stats: data.stats.map(stat => ({
          name: stat.stat.name,
          base_stat: stat.base_stat
        })),
        abilities: data.abilities.map(ability => ({
          name: ability.ability.name,
          is_hidden: ability.is_hidden
        })),
        height: data.height,
        weight: data.weight,
        base_experience: data.base_experience
      };

      return res.status(200).json(pokemon);
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Pokémon not found' });
      } else {
        console.error('Error fetching Pokémon:', error);
        return res.status(500).json({ error: 'Failed to fetch Pokémon' });
      }
    }
  }

  // Original search functionality
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required for search' });
  }

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
    const allPokemon = response.data.results;

    const filtered = allPokemon
      .filter(pokemon => pokemon.name.includes(q.toLowerCase()))
      .slice(0, 10);

    const results = await Promise.all(
      filtered.map(async (pokemon) => {
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
      })
    );

    res.status(200).json({ 
      query: q,
      results 
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
}