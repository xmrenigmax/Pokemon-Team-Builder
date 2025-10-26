/**
 * Frontend Pokémon data utilities
 */

// Import sprite functions
export { 
  getPokemonSprite, 
  getPokemonShinySprite, 
  getPokemonDisplayName,
  getFormSprite 
} from './pokemonSprites';

/**
 * Get Pokémon name with fallback and form handling
 */
export const getPokemonName = (pokemon) => {
  if (!pokemon) return 'Unknown';
  
  // Use display name if available (includes form info)
  if (pokemon.formName && pokemon.formName !== pokemon.name) {
    const formSuffix = pokemon.formName.replace(`${pokemon.name}-`, '');
    return `${pokemon.name} (${formSuffix.replace(/-/g, ' ')})`;
  }
  
  return pokemon?.name || 'Unknown';
};

/**
 * Get Pokémon types array with form handling
 */
export const getPokemonTypes = (pokemon) => {
  if (!pokemon) return [];
  
  // Use form types if available, otherwise base types
  if (pokemon.form && pokemon.form.types && pokemon.form.types.length > 0) {
    return pokemon.form.types;
  }
  return pokemon.types || [];
};

/**
 * Get Pokémon stats array with form handling
 */
export const getPokemonStats = (pokemon) => {
  // Use form stats if available, otherwise base stats
  if (pokemon?.form?.stats && pokemon.form.stats.length > 0) {
    return pokemon.form.stats;
  }
  return pokemon?.stats || [];
};

/**
 * Get Pokémon abilities array
 */
export const getPokemonAbilities = (pokemon) => pokemon?.abilities || [];

/**
 * Get Pokémon moves array
 */
export const getPokemonMoves = (pokemon) => pokemon?.moves || [];

/**
 * Get HP stat specifically with form handling
 */
export const getPokemonHP = (pokemon) => {
  const stats = getPokemonStats(pokemon);
  const hpStat = stats.find(s => 
    s.name === 'hp' || s.stat?.name === 'hp'
  );
  return hpStat?.base_stat || 0;
};

/**
 * Convert Pokémon height from decimeters to meters with form handling
 */
export const getPokemonHeightInMeters = (pokemon) => {
  // Use form height if available
  const height = pokemon?.form?.height || pokemon?.height || 0;
  return height / 10;
};

/**
 * Convert Pokémon weight from hectograms to kilograms with form handling
 */
export const getPokemonWeightInKg = (pokemon) => {
  // Use form weight if available
  const weight = pokemon?.form?.weight || pokemon?.weight || 0;
  return weight / 10;
};

/**
 * Get base experience value
 */
export const getPokemonBaseExp = (pokemon) => pokemon?.base_experience || 'N/A';

/**
 * Check if Pokémon is shiny
 */
export const getIsShiny = (pokemon) => pokemon?._isShiny || false;

/**
 * Create empty move slots
 */
export const createEmptyMoves = () => [
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' },
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' },
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' },
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' }
];

/**
 * Get default ability from available abilities
 */
export const getDefaultAbility = (abilities = []) => {
  return abilities.find(a => !a.is_hidden)?.name || abilities[0]?.name || 'unknown';
};

/**
 * Normalize Pokémon data (for backward compatibility)
 */
export const normalizePokemonData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    sprites: {
      front_default: data.sprites?.front_default || data.sprites || '/placeholder-pokemon.png',
      front_shiny: data.sprites?.front_shiny || data.sprites?.front_default || data.sprites || '/placeholder-pokemon.png',
      other: data.sprites?.other || {}
    },
    types: Array.isArray(data.types) ? data.types : [],
    stats: Array.isArray(data.stats) ? data.stats : [],
    abilities: Array.isArray(data.abilities) ? data.abilities : [],
    height: data.height || 0,
    weight: data.weight || 0,
    base_experience: data.base_experience || 0,
    moves: Array.isArray(data.moves) ? data.moves : [],
    _isShiny: data._isShiny !== undefined ? data._isShiny : false,
    // Form data
    form: data.form || null,
    formName: data.formName || null
  };
};

/**
 * Normalize loaded Pokémon data with form support
 */
export const normalizeLoadedPokemon = (pokemonData) => {
  if (!pokemonData) return null;
  
  return {
    id: pokemonData.id,
    name: pokemonData.name,
    sprites: pokemonData.sprites || {
      front_default: '/placeholder-pokemon.png',
      front_shiny: '/placeholder-pokemon.png',
      other: {}
    },
    types: pokemonData.types || [],
    stats: pokemonData.stats || [],
    abilities: pokemonData.abilities || [],
    height: pokemonData.height || 0,
    weight: pokemonData.weight || 0,
    base_experience: pokemonData.base_experience || 0,
    moves: pokemonData.moves || createEmptyMoves(),
    // Battle data
    level: pokemonData.level || 50,
    nature: pokemonData.nature || 'hardy',
    ability: pokemonData.ability || getDefaultAbility(pokemonData.abilities),
    item: pokemonData.item || '',
    itemData: pokemonData.itemData || null,
    form: pokemonData.form || null,
    formName: pokemonData.formName || null,
    calculatedStats: pokemonData.calculatedStats || {},
    _isShiny: pokemonData._isShiny || false
  };
};

/**
 * Create battle-ready Pokémon (for backward compatibility)
 */
export const createBattlePokemon = (basicPokemon, options = {}) => {
  const {
    level = 50,
    nature = 'hardy',
    ability = getDefaultAbility(basicPokemon.abilities),
    moves = createEmptyMoves(),
    form = null,
    formName = null
  } = options;

  return {
    ...basicPokemon,
    level,
    nature,
    ability,
    moves,
    form,
    formName,
    calculatedStats: basicPokemon.base_stats || {}
  };
};