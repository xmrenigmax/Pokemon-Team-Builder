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
    return res.status(400).json({ error: 'Move ID or name is required. Use /api/moves?id=thunderbolt' });
  }

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/move/${id}/`);
    const data = response.data;

    const move = {
      id: data.id,
      name: data.name,
      type: data.type.name,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      priority: data.priority,
      damage_class: data.damage_class.name,
      description: getMoveDescription(data),
      category: data.damage_class.name === 'status' ? 'status' : 
                data.damage_class.name === 'physical' ? 'physical' : 'special',
      target: data.target.name,
      effect_chance: data.effect_chance
    };

    res.status(200).json(move);
  } catch (error) {
    console.error(`Error fetching move ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch move data' });
  }
}

function getMoveDescription(moveData) {
  const englishEntry = moveData.effect_entries?.find(entry => entry.language.name === 'en');
  if (englishEntry) {
    return englishEntry.effect.replace(/\$effect_chance/g, moveData.effect_chance || 0);
  }
  
  const flavorEntry = moveData.flavor_text_entries?.find(entry => entry.language.name === 'en');
  return flavorEntry?.flavor_text || 'No description available';
}