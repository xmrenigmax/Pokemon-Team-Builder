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
    console.log(`Fetching species data for: ${id}`);
    
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
    const data = response.data;

    const species = {
      id: data.id,
      name: data.name,
      evolution_chain: data.evolution_chain,
      habitat: data.habitat?.name,
      growth_rate: data.growth_rate?.name,
      capture_rate: data.capture_rate,
      base_happiness: data.base_happiness,
      is_legendary: data.is_legendary,
      is_mythical: data.is_mythical,
      egg_groups: data.egg_groups.map(group => group.name),
      flavor_text: data.flavor_text_entries
        .find(entry => entry.language.name === 'en')?.flavor_text
        .replace(/\n/g, ' ') || 'No description available'
    };

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(species);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Pokémon species not found' });
    } else {
      console.error('Error fetching Pokémon species:', error.message);
      res.status(500).json({ error: 'Failed to fetch Pokémon species' });
    }
  }
}