/**
 * Sprite utility functions for Pokémon data
 */

/**
 * Get the regular sprite URL for a Pokémon
 * @param {Object} pokemon - Pokémon data object
 * @returns {string} Sprite URL
 */
export const getPokemonSprite = (pokemon) => {
  if (!pokemon) return '/placeholder-pokemon.png';
  
  // Handle different data structures
  if (typeof pokemon.sprites === 'string') {
    return pokemon.sprites;
  }
  
  return pokemon.sprites?.front_default || '/placeholder-pokemon.png';
};

/**
 * Get the shiny sprite URL for a Pokémon with fallback logic
 * @param {Object} pokemon - Pokémon data object
 * @returns {string} Shiny sprite URL
 */
export const getPokemonShinySprite = (pokemon) => {
  if (!pokemon) return '/placeholder-pokemon.png';
  
  // Use proper shiny sprite if available and different from regular
  const shinySprite = pokemon.sprites?.front_shiny;
  const regularSprite = getPokemonSprite(pokemon);
  
  if (shinySprite && shinySprite !== regularSprite) {
    return shinySprite;
  }
  
  // Fallback: Construct shiny URL from Pokémon ID
  if (pokemon.id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`;
  }
  
  // Ultimate fallback
  return regularSprite;
};