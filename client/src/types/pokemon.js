/**
 * Type definitions for enhanced Pokémon data structures
 * Used by both frontend components and backend utilities
 */

/**
 * Enhanced Pokémon data structure for battle-ready teams
 */
export const EnhancedPokemon = {
  id: 25,
  name: "pikachu",
  level: 50,
  ability: "static",
  nature: "timid", 
  moves: [
    { 
      name: "thunderbolt", 
      type: "electric", 
      power: 90, 
      accuracy: 100,
      pp: 15,
      description: "A strong electric attack",
      category: "special"
    }
  ],
  calculatedStats: {
    hp: 120,
    attack: 85,
    defense: 70,
    special_attack: 105,
    special_defense: 80,
    speed: 110
  },
  sprites: { 
    front_default: "...",
    front_shiny: "..." 
  },
  types: [
    { slot: 1, type: { name: "electric" } }
  ],
  baseStats: {
    hp: 35,
    attack: 55,
    defense: 40,
    special_attack: 50,
    special_defense: 50,
    speed: 90
  },
  abilities: [
    { name: "static", is_hidden: false }
  ],
  _isShiny: false
};