/**
 * Ability data utilities - used by frontend ability selector and backend battle effects
 */

export const normalizeAbility = (apiData) => ({
  id: apiData.id,
  name: apiData.name,
  description: getAbilityDescription(apiData),
  is_hidden: apiData.is_hidden
});

const getAbilityDescription = (abilityData) => {
  const englishEntry = abilityData.effect_entries?.find(e => e.language.name === 'en');
  return englishEntry?.effect || 'No description available';
};