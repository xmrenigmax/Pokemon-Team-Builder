import axios from 'axios';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const RATE_LIMIT_DELAY = 100; // ms between requests

class PokeAPIService {
  constructor() {
    this.cache = new Map();
    this.lastRequestTime = 0;
  }

  async makeRequest(url) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      });
      this.lastRequestTime = Date.now();
      return response;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async getPokemon(idOrName) {
    const cacheKey = `pokemon-${idOrName}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest(`${POKEAPI_BASE}/pokemon/${idOrName}`);
      const pokemon = this.transformPokemonData(response.data);
      this.setCached(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error(`Error fetching Pokémon ${idOrName}:`, error.message);
      throw new Error(`Pokémon "${idOrName}" not found`);
    }
  }

  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  transformPokemonData(apiData) {
    return {
      id: apiData.id,
      name: apiData.name,
      sprites: {
        front_default: apiData.sprites.front_default,
        front_shiny: apiData.sprites.front_shiny,
        official_artwork: apiData.sprites.other?.['official-artwork']?.front_default,
      },
      types: apiData.types.map(t => ({
        slot: t.slot,
        type: { name: t.type.name }
      })),
      stats: apiData.stats.map(stat => ({
        name: this.normalizeStatName(stat.stat.name),
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

  normalizeStatName(statName) {
    const statMap = {
      'hp': 'hp',
      'attack': 'attack',
      'defense': 'defense',
      'special-attack': 'special_attack',
      'special-defense': 'special_defense',
      'speed': 'speed'
    };
    return statMap[statName] || statName;
  }
}

export default new PokeAPIService();