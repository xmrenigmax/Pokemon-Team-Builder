/**
 * Move data utilities - used by frontend move selector and backend damage calculator
 */

/**
 * Normalize move data from PokeAPI for frontend display
 */
export const normalizeMove = (apiData) => ({
  id: apiData.id,
  name: apiData.name,
  type: apiData.type?.name,
  power: apiData.power || 0,
  accuracy: apiData.accuracy || 100,
  pp: apiData.pp,
  description: getMoveDescription(apiData),
  category: apiData.damage_class?.name || 'status'
});

/**
 * Get English description from API data
 */
const getMoveDescription = (moveData) => {
  const englishEntry = moveData.effect_entries?.find(e => e.language.name === 'en');
  return englishEntry?.effect || 'No description available';
};