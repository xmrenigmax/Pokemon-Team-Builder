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
    return res.status(400).json({ error: 'Pokémon ID is required. Use ?id=25' });
  }

  try {
    console.log(`[EVOLUTION] Fetching evolution for: ${id}`);
    
    // Get species data first
    const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
    const speciesData = speciesResponse.data;

    if (!speciesData.evolution_chain) {
      console.log(`[EVOLUTION] No evolution chain for ${id}`);
      return res.status(200).json({ 
        evolves: false,
        chain: [{ id: parseInt(id), name: speciesData.name }],
        message: 'This Pokémon does not evolve.'
      });
    }

    // Get evolution chain
    const evolutionResponse = await axios.get(speciesData.evolution_chain.url);
    const evolutionData = evolutionResponse.data;

    // Parse evolution chain
    const chain = [];
    const parseChain = (chainLink) => {
      if (!chainLink) return;
      
      const pokemonId = chainLink.species.url.split('/').filter(Boolean).pop();
      chain.push({
        id: parseInt(pokemonId),
        name: chainLink.species.name
      });
      
      if (chainLink.evolves_to && chainLink.evolves_to.length > 0) {
        chainLink.evolves_to.forEach(nextEvolution => {
          parseChain(nextEvolution);
        });
      }
    };
    
    parseChain(evolutionData.chain);
    
    console.log(`[EVOLUTION] Found chain for ${id}:`, chain.map(p => p.name));
    
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json({
      evolves: chain.length > 1,
      chain: chain,
      current_pokemon_id: parseInt(id)
    });
    
  } catch (error) {
    console.error(`[EVOLUTION ERROR] Failed for ${id}:`, error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Evolution data not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch evolution data' });
    }
  }
}