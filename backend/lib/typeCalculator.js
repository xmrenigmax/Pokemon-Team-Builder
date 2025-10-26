/**
 * Calculator for Pokémon type effectiveness and team analysis
 */
class TypeCalculator {
  constructor(typeRelations) {
    this.typeRelations = typeRelations;
  }

  /**
   * Calculate effectiveness of one type against another
   * @param {string} attackType - Attacking type
   * @param {string} defendType - Defending type
   * @returns {number} Effectiveness multiplier
   */
  calculateSingleTypeEffectiveness(attackType, defendType) {
    const relations = this.typeRelations[defendType];
    if (!relations) return 1;
    
    if (relations.double_damage_from.includes(attackType)) return 2;
    if (relations.half_damage_from.includes(attackType)) return 0.5;
    if (relations.no_damage_from.includes(attackType)) return 0;
    
    return 1;
  }

  /**
   * Calculate effectiveness against dual types
   * @param {string} attackType - Attacking type
   * @param {string} defendType1 - First defending type
   * @param {string} defendType2 - Second defending type
   * @returns {number} Combined effectiveness multiplier
   */
  calculateDualTypeEffectiveness(attackType, defendType1, defendType2 = null) {
    const effectiveness1 = this.calculateSingleTypeEffectiveness(attackType, defendType1);
    
    if (!defendType2) {
      return effectiveness1;
    }

    const effectiveness2 = this.calculateSingleTypeEffectiveness(attackType, defendType2);
    
    // Multiply effectiveness for dual types
    return effectiveness1 * effectiveness2;
  }

  /**
   * Get all attacking types covered by team
   * @param {Array} teamPokemon - Team Pokémon array
   * @returns {Array} Array of attacking types
   */
  getTeamTypeCoverage(teamPokemon) {
    const attackingTypes = new Set();
    
    teamPokemon.forEach(pokemon => {
      pokemon.types.forEach(type => {
        attackingTypes.add(type.type.name);
      });
    });

    return Array.from(attackingTypes);
  }

  /**
   * Analyze team weaknesses to different attack types
   * @param {Array} teamPokemon - Team Pokémon array
   * @returns {Object} Weakness analysis
   */
  analyzeTeamWeaknesses(teamPokemon) {
    const allTypes = Object.keys(this.typeRelations);
    const weaknesses = {};
    
    allTypes.forEach(attackType => {
      let maxEffectiveness = 0;
      
      teamPokemon.forEach(pokemon => {
        const types = pokemon.types.map(t => t.type.name);
        const effectiveness = types.length === 2 
          ? this.calculateDualTypeEffectiveness(attackType, types[0], types[1])
          : this.calculateSingleTypeEffectiveness(attackType, types[0]);
        
        maxEffectiveness = Math.max(maxEffectiveness, effectiveness);
      });

      if (maxEffectiveness >= 2) {
        weaknesses[attackType] = maxEffectiveness;
      }
    });

    return weaknesses;
  }
}

export default TypeCalculator;