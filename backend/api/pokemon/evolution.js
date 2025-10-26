import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID parameter is required. Use /api/pokemon/evolution?id=25' });
  }

  try {
    // Get species data first to find evolution chain
    const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
    const speciesData = speciesResponse.data;

    // If no evolution chain, return single Pokémon
    if (!speciesData.evolution_chain?.url) {
      const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`);
      return res.status(200).json({
        evolves: false,
        chain: [formatPokemonData(pokemonResponse.data)],
        message: 'This Pokémon does not evolve.'
      });
    }

    // Get evolution chain data
    const evolutionResponse = await axios.get(speciesData.evolution_chain.url);
    const evolutionData = evolutionResponse.data;

    // Extract all Pokémon IDs from evolution chain
    const pokemonIds = extractEvolutionChain(evolutionData.chain);
    
    // Fetch data for all Pokémon in evolution chain
    const evolutionChain = await Promise.all(
      pokemonIds.map(async (pokemonId) => {
        try {
          const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
          return formatPokemonData(pokemonResponse.data);
        } catch (error) {
          console.error(`Failed to fetch evolution Pokémon ${pokemonId}:`, error.message);
          return createPlaceholderPokemon(pokemonId);
        }
      })
    );

    res.status(200).json({
      evolves: evolutionChain.length > 1,
      chain: evolutionChain,
      current_pokemon_id: parseInt(id)
    });

  } catch (error) {
    console.error(`Error fetching evolution chain for ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch evolution data' });
  }
}

// Helper functions
function extractEvolutionChain(chainLink) {
  const pokemonIds = [];
  
  const traverseChain = (link) => {
    if (!link) return;
    
    const speciesUrl = link.species.url;
    const pokemonId = speciesUrl.split('/').filter(part => part).pop();
    
    if (pokemonId && !pokemonIds.includes(parseInt(pokemonId))) {
      pokemonIds.push(parseInt(pokemonId));
    }
    
    if (link.evolves_to?.length > 0) {
      link.evolves_to.forEach(nextEvolution => {
        traverseChain(nextEvolution);
      });
    }
  };
  
  traverseChain(chainLink);
  return pokemonIds;
}

function formatPokemonData(pokemonData) {
  return {
    id: pokemonData.id,
    name: pokemonData.name,
    sprites: {
      front_default: pokemonData.sprites.front_default
    },
    types: pokemonData.types.map(t => ({
      slot: t.slot,
      type: { name: t.type.name }
    }))
  };
}

function createPlaceholderPokemon(id) {
  return {
    id: id,
    name: 'Unknown',
    sprites: {
      front_default: '/placeholder-pokemon.png'
    },
    types: [{ slot: 1, type: { name: 'normal' } }]
  };
}