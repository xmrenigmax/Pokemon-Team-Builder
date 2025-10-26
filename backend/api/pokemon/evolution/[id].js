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
    return res.status(400).json({ error: 'Pokémon ID is required' });
  }

  try {
    console.log(`Fetching evolution chain for: ${id}`);
    
    // First get the species to find the evolution chain URL
    const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
    const speciesData = speciesResponse.data;

    if (!speciesData.evolution_chain) {
      return res.status(200).json({ 
        evolves: false,
        message: 'This Pokémon does not evolve.'
      });
    }

    // Get the evolution chain
    const evolutionResponse = await axios.get(speciesData.evolution_chain.url);
    const evolutionData = evolutionResponse.data;

    // Parse the evolution chain
    const evolutionChain = parseEvolutionChain(evolutionData.chain);
    
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(evolutionChain);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Evolution data not found' });
    } else {
      console.error('Error fetching evolution chain:', error.message);
      res.status(500).json({ error: 'Failed to fetch evolution chain' });
    }
  }
}

function parseEvolutionChain(chain) {
  const evolutionLine = [];
  
  const traverseChain = (currentChain) => {
    if (!currentChain) return;
    
    evolutionLine.push({
      species_name: currentChain.species.name,
      species_url: currentChain.species.url,
      evolution_details: currentChain.evolution_details?.[0] || null
    });
    
    if (currentChain.evolves_to && currentChain.evolves_to.length > 0) {
      currentChain.evolves_to.forEach(nextEvolution => {
        traverseChain(nextEvolution);
      });
    }
  };
  
  traverseChain(chain);
  return evolutionLine;
}