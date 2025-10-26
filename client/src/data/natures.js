/**
 * Pokémon natures data - affects stat growth
 * Static data used by both frontend and backend calculations
 */

export const NATURES = {
  hardy: { name: 'Hardy', increased: null, decreased: null },
  lonely: { name: 'Lonely', increased: 'attack', decreased: 'defense' },
  brave: { name: 'Brave', increased: 'attack', decreased: 'speed' },
  adamant: { name: 'Adamant', increased: 'attack', decreased: 'special-attack' },
  bold: { name: 'Bold', increased: 'defense', decreased: 'attack' },
  timid: { name: 'Timid', increased: 'speed', decreased: 'attack' },
  modest: { name: 'Modest', increased: 'special-attack', decreased: 'attack' },
  calm: { name: 'Calm', increased: 'special-defense', decreased: 'attack' },
  // ... all 25 natures
};

export const getNature = (name) => NATURES[name] || NATURES.hardy;
export const getAllNatures = () => Object.values(NATURES);