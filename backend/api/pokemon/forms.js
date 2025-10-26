import axios from 'axios';
import { setCorsHeaders, handleOptions } from '../../lib/cors';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) {
    return;
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID parameter is required' });
  }

  try {
    // Get species data to find all forms
    const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
    const speciesData = speciesResponse.data;

    // Get all variant forms
    const formsPromises = speciesData.varieties.map(async (variety) => {
      try {
        const formResponse = await axios.get(variety.pokemon.url);
        const formData = formResponse.data;

        return {
          id: formData.id,
          name: formData.name,
          form_name: variety.pokemon.name,
          is_default: variety.is_default,
          types: formData.types.map(t => t.type.name),
          stats: formData.stats.map(stat => ({
            name: stat.stat.name,
            base_stat: stat.base_stat
          })),
          abilities: formData.abilities.map(ability => ({
            name: ability.ability.name,
            is_hidden: ability.is_hidden
          })),
          sprites: {
            front_default: formData.sprites.front_default,
            front_shiny: formData.sprites.front_shiny,
            other: {
              'official-artwork': formData.sprites.other['official-artwork']?.front_default
            }
          },
          form_details: getFormDetails(formData)
        };
      } catch (error) {
        console.error(`Error fetching form ${variety.pokemon.name}:`, error.message);
        return null;
      }
    });

    const forms = (await Promise.all(formsPromises)).filter(Boolean);
    
    // Categorize forms
    const categorizedForms = categorizeForms(forms, speciesData);

    res.status(200).json({
      base_pokemon: speciesData.name,
      forms: categorizedForms
    });

  } catch (error) {
    console.error(`Error fetching forms for ${id}:`, error.message);
    
    // Return a fallback response with at least the base form
    res.status(200).json({
      base_pokemon: id,
      forms: {
        standard: [{
          id: id,
          name: id,
          form_name: id,
          is_default: true,
          types: ['normal'],
          stats: [],
          abilities: [],
          sprites: {
            front_default: null,
            front_shiny: null,
            other: { 'official-artwork': null }
          },
          form_details: { form_type: 'standard' }
        }],
        mega: [],
        gigantamax: [],
        regional: [],
        special: []
      }
    });
  }
}

function getFormDetails(formData) {
  const formName = formData.name.toLowerCase();
  
  const details = {
    is_mega: formName.includes('-mega'),
    is_gigantamax: formName.includes('-gmax'),
    is_alolan: formName.includes('-alola'),
    is_galarian: formName.includes('-galar'),
    is_hisuian: formName.includes('-hisui'),
    is_primal: formName.includes('-primal'),
    is_totem: formName.includes('-totem'),
    is_eternamax: formName.includes('-eternamax')
  };

  details.form_type = Object.keys(details).find(key => details[key]) || 'standard';

  return details;
}

function categorizeForms(forms, speciesData) {
  const categories = {
    standard: [],
    mega: [],
    gigantamax: [],
    regional: [],
    special: []
  };

  forms.forEach(form => {
    if (form.form_details.is_mega) {
      categories.mega.push(form);
    } else if (form.form_details.is_gigantamax) {
      categories.gigantamax.push(form);
    } else if (form.form_details.is_alolan || form.form_details.is_galarian || form.form_details.is_hisuian) {
      categories.regional.push(form);
    } else if (form.form_details.is_primal || form.form_details.is_totem || form.form_details.is_eternamax) {
      categories.special.push(form);
    } else {
      categories.standard.push(form);
    }
  });

  return categories;
}