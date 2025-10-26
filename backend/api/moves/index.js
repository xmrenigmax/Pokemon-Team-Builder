import axios from 'axios';


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://pokemon-team-builder-plum.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Move ID or name is required. Use /api/moves?id=thunderbolt' });
  }

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/move/${id.toLowerCase()}/`);
    const data = response.data;

    // More robust data handling with fallbacks
    const move = {
      id: data.id,
      name: data.name,
      type: data.type?.name || 'unknown',
      power: data.power || 0,
      accuracy: data.accuracy || 100,
      pp: data.pp || 0,
      priority: data.priority || 0,
      damage_class: data.damage_class?.name || 'physical',
      description: getMoveDescription(data),
      category: data.damage_class?.name === 'status' ? 'status' : 
                data.damage_class?.name === 'physical' ? 'physical' : 'special',
      target: data.target?.name || 'selected-pokemon',
      effect_chance: data.effect_chance || null
    };

    res.status(200).json(move);
  } catch (error) {
    console.error(`Error fetching move ${id}:`, error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: `Move '${id}' not found` });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch move data',
      details: error.message 
    });
  }
}

function getMoveDescription(moveData) {
  try {
    const englishEntry = moveData.effect_entries?.find(entry => entry.language.name === 'en');
    if (englishEntry) {
      return englishEntry.effect.replace(/\$effect_chance/g, moveData.effect_chance || 0);
    }
    
    const flavorEntry = moveData.flavor_text_entries?.find(entry => entry.language.name === 'en');
    return flavorEntry?.flavor_text || 'No description available';
  } catch (error) {
    return 'Description unavailable';
  }
}