/**
 * Sprite utility functions for Pokémon data
 */

/**
 * Get the regular sprite URL for a Pokémon, handling forms
 * @param {Object} pokemon - Pokémon data object
 * @returns {string} Sprite URL
 */
export const getPokemonSprite = (pokemon) => {
  if (!pokemon) return '/placeholder-pokemon.png';
  
  // Handle form-specific sprites first
  if (pokemon.form && pokemon.form.sprites) {
    const formSprite = pokemon.form.sprites.front_default || 
                      pokemon.form.sprites.other?.['official-artwork']?.front_default;
    if (formSprite) return formSprite;
  }
  
  // Handle different data structures
  if (typeof pokemon.sprites === 'string') {
    return pokemon.sprites;
  }
  
  // Try official artwork first, then default sprite
  const officialArtwork = pokemon.sprites?.other?.['official-artwork']?.front_default;
  if (officialArtwork) return officialArtwork;
  
  return pokemon.sprites?.front_default || '/placeholder-pokemon.png';
};

/**
 * Get the shiny sprite URL for a Pokémon with fallback logic, handling forms
 * @param {Object} pokemon - Pokémon data object
 * @returns {string} Shiny sprite URL
 */
export const getPokemonShinySprite = (pokemon) => {
  if (!pokemon) return '/placeholder-pokemon.png';
  
  // Handle form-specific shiny sprites first
  if (pokemon.form && pokemon.form.sprites) {
    const formShinySprite = pokemon.form.sprites.front_shiny || 
                           pokemon.form.sprites.other?.['official-artwork']?.front_shiny;
    if (formShinySprite) return formShinySprite;
  }
  
  // Use proper shiny sprite if available and different from regular
  const shinySprite = pokemon.sprites?.front_shiny;
  const regularSprite = getPokemonSprite(pokemon);
  
  if (shinySprite && shinySprite !== regularSprite) {
    return shinySprite;
  }
  
  // Try official artwork shiny sprite
  const officialShiny = pokemon.sprites?.other?.['official-artwork']?.front_shiny;
  if (officialShiny) return officialShiny;
  
  // Fallback: Construct shiny URL from Pokémon ID
  if (pokemon.id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`;
  }
  
  // Ultimate fallback
  return regularSprite;
};

/**
 * Get sprite URL for a specific form
 * @param {Object} form - Form data object
 * @param {boolean} isShiny - Whether to get shiny sprite
 * @returns {string} Sprite URL
 */
export const getFormSprite = (form, isShiny = false) => {
  if (!form) return '/placeholder-pokemon.png';
  
  if (isShiny) {
    return form.sprites?.front_shiny || 
           form.sprites?.other?.['official-artwork']?.front_shiny ||
           form.sprites?.front_default || 
           '/placeholder-pokemon.png';
  }
  
  return form.sprites?.front_default || 
         form.sprites?.other?.['official-artwork']?.front_default ||
         '/placeholder-pokemon.png';
};

/**
 * Get display name for Pokémon with form
 * @param {Object} pokemon - Pokémon data object
 * @returns {string} Display name
 */
export const getPokemonDisplayName = (pokemon) => {
  if (!pokemon) return 'Unknown';
  
  const baseName = pokemon.name || 'Unknown';
  
  // If we have a form with a different name, format it nicely
  if (pokemon.formName && pokemon.formName !== baseName) {
    const formSuffix = pokemon.formName.replace(`${baseName}-`, '');
    return `${baseName} (${formSuffix.replace(/-/g, ' ')})`;
  }
  
  return baseName;
};