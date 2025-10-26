import axios from 'axios';
import { setCorsHeaders, handleOptions } from '../../lib/cors';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) {
    return;
  }
  
  try {
    const response = await axios.get('https://pokeapi.co/api/v2/type?limit=20');
    const types = response.data.results;

    const typeRelations = {};
    
    await Promise.all(
      types.map(async (type) => {
        try {
          const typeData = await axios.get(type.url);
          typeRelations[type.name] = {
            double_damage_from: typeData.data.damage_relations.double_damage_from.map(t => t.name),
            double_damage_to: typeData.data.damage_relations.double_damage_to.map(t => t.name),
            half_damage_from: typeData.data.damage_relations.half_damage_from.map(t => t.name),
            half_damage_to: typeData.data.damage_relations.half_damage_to.map(t => t.name),
            no_damage_from: typeData.data.damage_relations.no_damage_from.map(t => t.name),
            no_damage_to: typeData.data.damage_relations.no_damage_to.map(t => t.name),
          };
        } catch (error) {
          console.error(`Error fetching type ${type.name}:`, error.message);
        }
      })
    );

    res.status(200).json(typeRelations);
  } catch (error) {
    console.error('Error fetching type data:', error.message);
    res.status(500).json({ error: 'Failed to fetch type data' });
  }
}