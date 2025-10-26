/**
 * Safe data access utilities for Pokémon objects
 */

// Import sprite functions from pokemonSprites
export { getPokemonSprite, getPokemonShinySprite } from './pokemonSprites';

/**
 * Get Pokémon name with fallback
 * @param {Object} pokemon - Pokémon data object
 * @returns {string} Pokémon name
 */
export const getPokemonName = (pokemon) => pokemon?.name || 'Unknown';

/**
 * Get Pokémon types array
 * @param {Object} pokemon - Pokémon data object
 * @returns {Array} Types array
 */
export const getPokemonTypes = (pokemon) => pokemon?.types || [];

/**
 * Get Pokémon stats array
 * @param {Object} pokemon - Pokémon data object
 * @returns {Array} Stats array
 */
export const getPokemonStats = (pokemon) => pokemon?.stats || [];

/**
 * Get Pokémon abilities array
 * @param {Object} pokemon - Pokémon data object
 * @returns {Array} Abilities array
 */
export const getPokemonAbilities = (pokemon) => pokemon?.abilities || [];

/**
 * Get Pokémon moves array
 * @param {Object} pokemon - Pokémon data object
 * @returns {Array} Moves array
 */
export const getPokemonMoves = (pokemon) => pokemon?.moves || [];

/**
 * Get specific stat value
 * @param {Object} pokemon - Pokémon data object
 * @param {string} statName - Name of the stat to retrieve
 * @returns {number} Stat value
 */
export const getPokemonStat = (pokemon, statName) => {
  const stats = getPokemonStats(pokemon);
  const stat = stats.find(s => 
    s.name === statName || s.stat?.name === statName
  );
  return stat?.base_stat || 0;
};

/**
 * Get HP stat specifically
 * @param {Object} pokemon - Pokémon data object
 * @returns {number} HP value
 */
export const getPokemonHP = (pokemon) => getPokemonStat(pokemon, 'hp');

/**
 * Convert Pokémon height from decimeters to meters
 * @param {Object} pokemon - Pokémon data object
 * @returns {number} Height in meters
 */
export const getPokemonHeightInMeters = (pokemon) => 
  (pokemon?.height || 0) / 10;

/**
 * Convert Pokémon weight from hectograms to kilograms
 * @param {Object} pokemon - Pokémon data object
 * @returns {number} Weight in kilograms
 */
export const getPokemonWeightInKg = (pokemon) => 
  (pokemon?.weight || 0) / 10;

/**
 * Get base experience value
 * @param {Object} pokemon - Pokémon data object
 * @returns {number|string} Base experience or 'N/A'
 */
export const getPokemonBaseExp = (pokemon) => pokemon?.base_experience || 'N/A';

/**
 * Check if Pokémon is shiny
 * @param {Object} pokemon - Pokémon data object
 * @returns {boolean} Shiny status
 */
export const getIsShiny = (pokemon) => pokemon?._isShiny || false;

/**
 * Normalize Pokémon data from different API responses
 * @param {Object} data - Raw Pokémon data from API
 * @returns {Object} Normalized Pokémon data
 */
export const normalizePokemonData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id || 0,
    name: data.name || 'Unknown',
    sprites: {
      front_default: data.sprites?.front_default || data.sprites || '/placeholder-pokemon.png',
      front_shiny: data.sprites?.front_shiny || data.sprites?.front_default || data.sprites || '/placeholder-pokemon.png'
    },
    types: Array.isArray(data.types) ? data.types : [],
    stats: Array.isArray(data.stats) ? data.stats : [],
    abilities: Array.isArray(data.abilities) ? data.abilities : [],
    height: data.height || 0,
    weight: data.weight || 0,
    base_experience: data.base_experience || 0,
    moves: Array.isArray(data.moves) ? data.moves : [],
    _isShiny: data._isShiny !== undefined ? data._isShiny : false
  };
};