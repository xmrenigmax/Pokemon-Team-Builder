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
    return res.status(400).json({ error: 'Ability ID or name is required. Use /api/abilities?id=static' });
  }

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/ability/${id}/`);
    const data = response.data;

    const ability = {
      id: data.id,
      name: data.name,
      description: getAbilityDescription(data),
      is_hidden: data.is_main_series,
      effect: getAbilityEffect(data)
    };

    res.status(200).json(ability);
  } catch (error) {
    console.error(`Error fetching ability ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch ability data' });
  }
}

function getAbilityDescription(abilityData) {
  const englishEntry = abilityData.flavor_text_entries?.find(entry => entry.language.name === 'en');
  return englishEntry?.flavor_text || 'No description available';
}

function getAbilityEffect(abilityData) {
  const englishEntry = abilityData.effect_entries?.find(entry => entry.language.name === 'en');
  return englishEntry?.effect || 'No effect description available';
}