/**
 * Frontend data utilities - only for shaping data for display
 * No API calls, no complex calculations
 */

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