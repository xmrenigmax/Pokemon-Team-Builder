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
    return res.status(400).json({ error: 'Pokémon ID parameter is required. Use /api/pokemon?id=25' });
  }

  console.log(`Fetching Pokémon: ${id}`);

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
      weight: data.weight
    };

    res.status(200).json(pokemon);
  } catch (error) {
    console.error(`Error fetching Pokémon ${id}:`, error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: `Pokémon with ID ${id} not found` });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch Pokémon data',
        details: error.message 
      });
    }
  }
}