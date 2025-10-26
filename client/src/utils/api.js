import axios from 'axios';
import { normalizePokemonData } from './pokemonData';

const API_BASE = 'https://pokemon-team-builder-backend.vercel.app/api';

/**
 * Fetch evolution chain data from PokeAPI
 * @param {string|number} pokemonId - Pokémon ID
 * @returns {Object} Evolution chain data
 */
const fetchEvolutionChainFromAPI = async (pokemonId) => {
  try {
    // Step 1: Get species data to find evolution chain URL
    const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
    const speciesData = speciesResponse.data;
    
    // If no evolution chain exists, return single Pokémon
    if (!speciesData.evolution_chain?.url) {
      const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
      return {
        evolves: false,
        chain: [normalizePokemonData(pokemonResponse.data)],
        message: 'This Pokémon does not evolve.'
      };
    }
    
    // Step 2: Get the evolution chain data
    const evolutionResponse = await axios.get(speciesData.evolution_chain.url);
    const evolutionData = evolutionResponse.data;
    
    // Step 3: Parse the evolution chain to extract all Pokémon IDs
    const extractPokemonIdsFromChain = (chain) => {
      const ids = [];
      
      const traverseChain = (chainLink) => {
        if (!chainLink) return;
        
        // Extract Pokémon ID from species URL
        const speciesUrl = chainLink.species.url;
        const pokemonId = speciesUrl.split('/').filter(part => part).pop();
        
        if (pokemonId && !ids.includes(parseInt(pokemonId))) {
          ids.push(parseInt(pokemonId));
        }
        
        // Recursively traverse evolves_to
        if (chainLink.evolves_to?.length > 0) {
          chainLink.evolves_to.forEach(nextEvolution => {
            traverseChain(nextEvolution);
          });
        }
      };
      
      traverseChain(chain);
      return ids;
    };
    
    const evolutionIds = extractPokemonIdsFromChain(evolutionData.chain);
    
    // If only one Pokémon in chain, it doesn't evolve
    if (evolutionIds.length <= 1) {
      const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
      return {
        evolves: false,
        chain: [normalizePokemonData(pokemonResponse.data)],
        message: 'This Pokémon does not evolve.'
      };
    }
    
    // Step 4: Fetch details for all Pokémon in the evolution chain
    const evolutionPromises = evolutionIds.map(evoId => 
      axios.get(`https://pokeapi.co/api/v2/pokemon/${evoId}/`)
        .then(res => normalizePokemonData(res.data))
        .catch(error => {
          console.error(`Failed to fetch Pokémon ${evoId}:`, error.message);
          return normalizePokemonData({ 
            id: evoId, 
            name: 'Unknown', 
            sprites: { front_default: '/placeholder-pokemon.png', front_shiny: '/placeholder-pokemon.png' }
          });
        })
    );
    
    const evolutionChain = await Promise.all(evolutionPromises);
    
    return {
      evolves: true,
      chain: evolutionChain,
      current_pokemon_id: parseInt(pokemonId)
    };
    
  } catch (error) {
    console.error(`Error fetching evolution chain for ${pokemonId}:`, error.message);
    throw error;
  }
};

/**
 * Fallback evolution mapping for when PokeAPI fails
 * @param {number} id - Pokémon ID
 * @returns {Array} Evolution chain IDs
 */
const getFallbackEvolutionChain = (id) => {
  const evolutionMap = {
    // Pikachu line
    172: [172, 25, 26], // Pichu -> Pikachu -> Raichu
    25: [172, 25, 26],
    26: [172, 25, 26],
    
    // Starter lines
    1: [1, 2, 3],     // Bulbasaur -> Ivysaur -> Venusaur
    2: [1, 2, 3],
    3: [1, 2, 3],
    4: [4, 5, 6],     // Charmander -> Charmeleon -> Charizard
    5: [4, 5, 6],
    6: [4, 5, 6],
    7: [7, 8, 9],     // Squirtle -> Wartortle -> Blastoise
    8: [7, 8, 9],
    9: [7, 8, 9],
    
    // Eevee line
    133: [133, 134, 135, 136], // Eevee -> Vaporeon/Jolteon/Flareon
    134: [133, 134],
    135: [133, 135],
    136: [133, 136],
  };

  return evolutionMap[id] || [id];
};

export const pokemonAPI = {
  /**
   * Search for Pokémon by name
   * @param {string} query - Search query
   * @returns {Array} Search results
   */
  search: async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/search?q=${query}`);
      const results = response.data.results || [];
      return results.map(normalizePokemonData);
    } catch (error) {
      console.error('API search error:', error);
      return [];
    }
  },
  
  /**
   * Get Pokémon by ID
   * @param {string|number} id - Pokémon ID
   * @returns {Object|null} Pokémon data
   */
  getPokemon: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/search?id=${id}`);
      return normalizePokemonData(response.data);
    } catch (error) {
      console.error('API getPokemon error:', error);
      return null;
    }
  },
  
  /**
   * Get evolution chain for a Pokémon
   * @param {string|number} id - Pokémon ID
   * @returns {Object} Evolution chain data
   */
  getEvolutionChain: async (id) => {
    try {
      // Try to get real evolution data from PokeAPI first
      try {
        const evolutionData = await fetchEvolutionChainFromAPI(id);
        return evolutionData;
      } catch (apiError) {
        console.log(`PokeAPI failed, using fallback for ${id}:`, apiError.message);
        // Fallback to hardcoded evolution data
        const fallbackIds = getFallbackEvolutionChain(parseInt(id));
        
        // If only one Pokémon, it doesn't evolve
        if (fallbackIds.length <= 1) {
          const response = await axios.get(`${API_BASE}/pokemon/search?id=${id}`);
          const pokemon = normalizePokemonData(response.data);
          return {
            evolves: false,
            chain: [pokemon],
            message: 'This Pokémon does not evolve.'
          };
        }
        
        // Fetch all Pokémon in the fallback evolution chain
        const evolutionPromises = fallbackIds.map(evoId => 
          axios.get(`${API_BASE}/pokemon/search?id=${evoId}`)
            .then(res => normalizePokemonData(res.data))
            .catch(() => normalizePokemonData({ id: evoId, name: 'Unknown' }))
        );
        
        const evolutionChain = await Promise.all(evolutionPromises);
        
        return {
          evolves: evolutionChain.length > 1,
          chain: evolutionChain,
          current_pokemon_id: parseInt(id),
          note: 'Using fallback evolution data'
        };
      }
    } catch (error) {
      console.error('API getEvolutionChain error:', error);
      // Ultimate fallback - just return the current Pokémon
      const response = await axios.get(`${API_BASE}/pokemon/search?id=${id}`);
      const pokemon = normalizePokemonData(response.data);
      return { 
        evolves: false, 
        chain: [pokemon],
        error: 'Failed to load evolution data' 
      };
    }
  },
  
  /**
   * Get type relationships data
   * @returns {Object} Type relationships
   */
  getTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/types`);
      return response.data;
    } catch (error) {
      console.error('API getTypes error:', error);
      return {};
    }
  },
  
  /**
   * Analyze team composition
   * @param {Array} team - Team of Pokémon IDs
   * @returns {Object} Team analysis
   */
  analyzeTeam: async (team) => {
    try {
      const response = await axios.post(`${API_BASE}/team/analyze`, { team });
      return response.data;
    } catch (error) {
      console.error('API analyzeTeam error:', error);
      return {};
    }
  }
};