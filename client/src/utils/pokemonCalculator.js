/**
 * Pokémon stat calculator - used by frontend components and backend analysis
 * Implements official Pokémon stat formulas
 */

/**
 * Calculate HP stat using official formula
 */
export const calculateHP = (base, level = 50, iv = 31, ev = 0) => {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
};

/**
 * Calculate other stats using official formula
 */
export const calculateStat = (base, level = 50, iv = 31, ev = 0, nature = 1.0) => {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature);
};

/**
 * Get nature multiplier for a stat
 */
export const getNatureMultiplier = (nature, statName) => {
  const natureData = getNature(nature);
  if (natureData.increased === statName) return 1.1;
  if (natureData.decreased === statName) return 0.9;
  return 1.0;
};

/**
 * Calculate all stats for battle display
 */
export const calculateBattleStats = (pokemon, level = 50, nature = 'hardy') => {
  const baseStats = getBaseStats(pokemon);
  
  return {
    hp: calculateHP(baseStats.hp, level),
    attack: calculateStat(baseStats.attack, level, 31, 0, getNatureMultiplier(nature, 'attack')),
    defense: calculateStat(baseStats.defense, level, 31, 0, getNatureMultiplier(nature, 'defense')),
    special_attack: calculateStat(baseStats.special_attack, level, 31, 0, getNatureMultiplier(nature, 'special-attack')),
    special_defense: calculateStat(baseStats.special_defense, level, 31, 0, getNatureMultiplier(nature, 'special-defense')),
    speed: calculateStat(baseStats.speed, level, 31, 0, getNatureMultiplier(nature, 'speed'))
  };
};