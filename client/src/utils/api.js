import axios from 'axios';

const API_BASE = 'https://pokemon-team-builder-backend.vercel.app/api';

export const pokemonAPI = {
  // Basic Pokémon data
  getPokemon: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('API getPokemon error:', error);
      return null;
    }
  },

  // Battle-ready Pokémon data
  getBattlePokemon: async (id, options = {}) => {
    try {
      const params = new URLSearchParams({ id, ...options });
      const response = await axios.get(`${API_BASE}/pokemon/battle?${params}`);
      return response.data;
    } catch (error) {
      console.error('API getBattlePokemon error:', error);
      return null;
    }
  },

  // Search
  search: async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/search?q=${query}`);
      return response.data.results || [];
    } catch (error) {
      console.error('API search error:', error);
      return [];
    }
  },

  // Evolution chain
  getEvolutionChain: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/evolution?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('API getEvolutionChain error:', error);
      return { evolves: false, chain: [] };
    }
  },

  // Move data
  getMove: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/moves?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('API getMove error:', error);
      return null;
    }
  },

  // Ability data
  getAbility: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/abilities?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('API getAbility error:', error);
      return null;
    }
  },

  // Type data
  getTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/types`);
      return response.data;
    } catch (error) {
      console.error('API getTypes error:', error);
      return {};
    }
  },

  // Get Pokémon learnset with actual levels
  getPokemonLearnset: async (pokemonId) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/learnset?id=${pokemonId}`);
      return response.data;
    } catch (error) {
      console.error('API getPokemonLearnset error:', error);
      throw error;
    }
  },

  getPokemonForms: async (pokemonId) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/forms?id=${pokemonId}`);
      return response.data;
    } catch (error) {
      console.error('API getPokemonForms error:', error);
      // Return fallback data
      return {
        base_pokemon: pokemonId,
        forms: {
          standard: [{
            id: pokemonId,
            name: pokemonId,
            form_name: pokemonId,
            is_default: true,
            types: ['normal'],
            stats: [],
            abilities: [],
            sprites: { front_default: null, front_shiny: null, other: { 'official-artwork': null } },
            form_details: { form_type: 'standard' }
          }],
          mega: [],
          gigantamax: [],
          regional: [],
          special: []
        }
      };
    }
  },

  getItems: async (category = null) => {
    try {
      const url = category 
        ? `${API_BASE}/pokemon/items?category=${category}`
        : `${API_BASE}/pokemon/items`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('API getItems error:', error);
      // Return fallback items
      return {
        items: [
          { name: 'leftovers', category: 'held_items', effect: 'Restores HP each turn' },
          { name: 'choice-band', category: 'held_items', effect: 'Boosts Attack but locks moves' },
          { name: 'life-orb', category: 'held_items', effect: 'Boosts damage but costs HP' },
          { name: 'focus-sash', category: 'held_items', effect: 'Survives one fatal hit' }
        ],
        total: 4
      };
    }
  },
};