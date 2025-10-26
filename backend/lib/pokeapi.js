import axios from 'axios';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Simple in-memory cache for serverless functions
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

class PokeAPIService {
  async getPokemon(idOrName) {
    const cacheKey = `pokemon-${idOrName}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      console.log(`Fetching Pokémon: ${idOrName}`);
      const response = await axios.get(`${POKEAPI_BASE}/pokemon/${idOrName}`);
      const pokemon = this.transformPokemonData(response.data);
      
      cache.set(cacheKey, {
        data: pokemon,
        timestamp: Date.now()
      });
      
      return pokemon;
    } catch (error) {
      console.error(`Error fetching Pokémon ${idOrName}:`, error.message);
      throw error;
    }
  }

  async getTypeRelationships() {
    const cacheKey = 'type-relationships';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      console.log('Fetching type relationships...');
      const typesResponse = await axios.get(`${POKEAPI_BASE}/type?limit=20`);
      const types = typesResponse.data.results;

      const typeRelations = {};
      
      await Promise.all(
        types.map(async (type) => {
          const typeData = await axios.get(type.url);
          typeRelations[type.name] = {
            double_damage_from: typeData.data.damage_relations.double_damage_from.map(t => t.name),
            double_damage_to: typeData.data.damage_relations.double_damage_to.map(t => t.name),
            half_damage_from: typeData.data.damage_relations.half_damage_from.map(t => t.name),
            half_damage_to: typeData.data.damage_relations.half_damage_to.map(t => t.name),
            no_damage_from: typeData.data.damage_relations.no_damage_from.map(t => t.name),
            no_damage_to: typeData.data.damage_relations.no_damage_to.map(t => t.name),
          };
        })
      );

      cache.set(cacheKey, {
        data: typeRelations,
        timestamp: Date.now()
      });
      
      return typeRelations;
    } catch (error) {
      console.error('Error fetching type relationships:', error.message);
      throw error;
    }
  }

  async searchPokemon(query, limit = 20) {
    const cacheKey = `search-${query}-${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      console.log(`Searching Pokémon: ${query}`);
      const response = await axios.get(`${POKEAPI_BASE}/pokemon?limit=1000`);
      const allPokemon = response.data.results;

      const filtered = allPokemon
        .filter(pokemon => 
          pokemon.name.includes(query.toLowerCase())
        )
        .slice(0, limit);

      const detailedResults = await Promise.all(
        filtered.map(async (pokemon) => {
          const res = await axios.get(pokemon.url);
          return this.transformPokemonData(res.data);
        })
      );

      cache.set(cacheKey, {
        data: detailedResults,
        timestamp: Date.now()
      });

      return detailedResults;
    } catch (error) {
      console.error('Error searching Pokémon:', error.message);
      throw error;
    }
  }

  transformPokemonData(apiData) {
    return {
      id: apiData.id,
      name: apiData.name,
      sprites: {
        front_default: apiData.sprites.front_default,
        front_shiny: apiData.sprites.front_shiny,
        official_artwork: apiData.sprites.other['official-artwork']?.front_default,
      },
      types: apiData.types.map(t => ({
        slot: t.slot,
        type: { name: t.type.name }
      })),
      stats: apiData.stats.map(stat => ({
        name: stat.stat.name.replace('-', '_'),
        base_stat: stat.base_stat,
        effort: stat.effort
      })),
      abilities: apiData.abilities.map(ability => ({
        name: ability.ability.name,
        is_hidden: ability.is_hidden
      })),
      height: apiData.height,
      weight: apiData.weight,
      base_experience: apiData.base_experience
    };
  }
}

export default new PokeAPIService();