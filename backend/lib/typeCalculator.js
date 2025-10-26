class TypeCalculator {
  constructor(typeRelations) {
    this.typeRelations = typeRelations;
    this.allTypes = Object.keys(typeRelations);
  }

  calculateEffectiveness(attackType, defendTypes) {
    if (!Array.isArray(defendTypes)) {
      defendTypes = [defendTypes];
    }

    return defendTypes.reduce((total, defendType) => {
      const relations = this.typeRelations[defendType];
      if (!relations) return total;

      if (relations.double_damage_from.includes(attackType)) return total * 2;
      if (relations.half_damage_from.includes(attackType)) return total * 0.5;
      if (relations.no_damage_from.includes(attackType)) return total * 0;
      
      return total;
    }, 1);
  }

  analyzeTeamWeaknesses(teamPokemon) {
    const weaknesses = {};
    const resistances = {};
    const immunities = {};

    this.allTypes.forEach(attackType => {
      let teamEffectiveness = 0;
      let worstCase = 0;

      teamPokemon.forEach(pokemon => {
        const pokemonTypes = pokemon.types.map(t => t.type.name);
        const effectiveness = this.calculateEffectiveness(attackType, pokemonTypes);
        teamEffectiveness += effectiveness;
        worstCase = Math.max(worstCase, effectiveness);
      });

      const avgEffectiveness = teamEffectiveness / teamPokemon.length;

      if (worstCase >= 2) {
        weaknesses[attackType] = {
          worstCase,
          average: avgEffectiveness
        };
      } else if (worstCase === 0) {
        immunities[attackType] = true;
      } else if (worstCase <= 0.5) {
        resistances[attackType] = {
          worstCase,
          average: avgEffectiveness
        };
      }
    });

    return { weaknesses, resistances, immunities };
  }

  getTeamTypeCoverage(teamPokemon) {
    const coverage = {};
    
    this.allTypes.forEach(attackType => {
      let maxEffectiveness = 0;

      teamPokemon.forEach(pokemon => {
        const pokemonTypes = pokemon.types.map(t => t.type.name);
        const effectiveness = this.calculateEffectiveness(attackType, pokemonTypes);
        
        if (effectiveness > maxEffectiveness) {
          maxEffectiveness = effectiveness;
        }
      });

      if (maxEffectiveness > 0) {
        coverage[attackType] = maxEffectiveness;
      }
    });

    return coverage;
  }

  getTeamSynergy(teamPokemon) {
    const weaknesses = this.analyzeTeamWeaknesses(teamPokemon);
    const coverage = this.getTeamTypeCoverage(teamPokemon);
    
    // Calculate synergy score
    let synergyScore = 100;
    
    // Penalize for major weaknesses
    Object.values(weaknesses.weaknesses).forEach(({ worstCase }) => {
      if (worstCase >= 4) synergyScore -= 20;
      else if (worstCase >= 2) synergyScore -= 10;
    });

    // Reward for good coverage
    const coveredTypes = Object.keys(coverage).length;
    synergyScore += Math.min((coveredTypes / this.allTypes.length) * 20, 20);

    return {
      score: Math.max(0, Math.min(100, synergyScore)),
      weaknesses: weaknesses.weaknesses,
      resistances: weaknesses.resistances,
      immunities: weaknesses.immunities,
      coverage
    };
  }
}

export default TypeCalculator;