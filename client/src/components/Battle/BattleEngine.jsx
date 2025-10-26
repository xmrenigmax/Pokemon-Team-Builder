// BattleEngine.js - FIXED POKÉMON COMPARISON
export class BattleEngine {
  constructor(battleState) {
    this.battleState = JSON.parse(JSON.stringify(battleState));
    this.log = [];
  }

  // Main battle turn execution
  executeTurn(playerAction, opponentAction) {
    const newState = JSON.parse(JSON.stringify(this.battleState));
    
    // Reset remaining Pokémon counts based on actual HP
    newState.player.remainingPokemon = newState.player.team.filter(p => p.hp > 0).length;
    newState.opponent.remainingPokemon = newState.opponent.team.filter(p => p.hp > 0).length;

    const playerActive = newState.player.team[newState.player.activePokemon];
    const opponentActive = newState.opponent.team[newState.opponent.activePokemon];

    // Skip turn if both Pokémon are fainted (shouldn't happen, but safety)
    if (this.isPokemonFainted(playerActive) && this.isPokemonFainted(opponentActive)) {
      this.addLog("Both Pokémon are fainted! The battle ends in a draw.");
      newState.winner = 'draw';
      return newState;
    }

    // Determine turn order based on speed and priority
    const actions = this.determineTurnOrder(playerActive, opponentActive, playerAction, opponentAction);

    // Execute actions in order
   for (const action of actions) {
    // Skip if Pokémon is fainted, UNLESS it's a player switch (which should always process)
    if (this.isPokemonFainted(action.pokemon) && action.type !== 'switch') continue;
    
    switch (action.type) {
      case 'move':
        this.executeMove(action.pokemon, action.target, action.move, newState);
        break;
      case 'switch':
        this.executeSwitch(action.side, action.newIndex, newState);
        break;
    }

    // Check for fainted Pokémon after each action, but only if battle hasn't ended
    if (!newState.winner) {
      const faintedResult = this.checkFaintedPokemon(newState);
      
      // If player fainted and battle continues, break out to let UI handle switch
      if (faintedResult.playerFainted && !newState.winner) {
        break;
      }
    }
    
    // If battle ended, break out
    if (newState.winner) break;
  }

    // Apply end-of-turn effects only if battle hasn't ended
    if (!newState.winner) {
      this.applyEndOfTurnEffects(newState);
    }

    newState.turn++;
    this.battleState = newState;
    return newState;
  }

  determineTurnOrder(playerActive, opponentActive, playerAction, opponentAction) {
  const actions = [];

  // Add player action
  if (playerAction.type === 'move') {
    actions.push({
      type: 'move',
      pokemon: playerActive,
      target: opponentActive,
      move: playerAction.move,
      priority: playerAction.move.priority || 0,
      speed: this.getEffectiveSpeed(playerActive),
      side: 'player'
    });
  } else if (playerAction.type === 'switch') {
    actions.push({
      type: 'switch',
      pokemon: playerActive,
      newIndex: playerAction.newIndex,
      priority: 7, // Switching has highest priority when forced
      speed: 999, // Always goes first
      side: 'player'
    });
  }

  // Add opponent action
  if (opponentAction.type === 'move') {
    actions.push({
      type: 'move',
      pokemon: opponentActive,
      target: playerActive,
      move: opponentAction.move,
      priority: opponentAction.move.priority || 0,
      speed: this.getEffectiveSpeed(opponentActive),
      side: 'opponent'
    });
  } else if (opponentAction.type === 'switch') {
    actions.push({
      type: 'switch',
      pokemon: opponentActive,
      newIndex: opponentAction.newIndex,
      priority: 7,
      speed: 999,
      side: 'opponent'
    });
  }

  // Sort by priority (higher first), then speed (higher first)
  return actions.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return b.speed - a.speed;
  });
  }

  executeMove(attacker, defender, move, battleState) {
    // Check for accuracy
    if (!this.checkAccuracy(attacker, defender, move)) {
      this.addLog(`${this.getPokemonName(attacker)} used ${move.name}!`);
      this.addLog(`But it missed!`);
      return;
    }

    this.addLog(`${this.getPokemonName(attacker)} used ${move.name}!`);

    // Handle different move categories
    switch (move.category) {
      case 'physical':
      case 'special':
        this.executeDamagingMove(attacker, defender, move, battleState);
        break;
      case 'status':
        this.executeStatusMove(attacker, defender, move, battleState);
        break;
      default:
        this.executeDamagingMove(attacker, defender, move, battleState);
    }

    // Apply recoil, stat changes, etc.
    this.applyMoveSideEffects(attacker, defender, move, battleState);
  }

  executeDamagingMove(attacker, defender, move, battleState) {
    const damage = this.calculateDamage(attacker, defender, move);
    
    if (damage > 0) {
        defender.hp = Math.max(0, defender.hp - damage);
        this.addLog(`It hit ${this.getPokemonName(defender)} for ${damage} damage!`);

        // Show effectiveness message
        const effectiveness = this.calculateTypeEffectiveness(move.type, defender);
        if (effectiveness > 1) {
        this.addLog(`It's super effective!`);
        } else if (effectiveness < 1 && effectiveness > 0) {
        this.addLog(`It's not very effective...`);
        } else if (effectiveness === 0) {
        this.addLog(`It doesn't affect ${this.getPokemonName(defender)}...`);
        }
    } else {
        this.addLog(`It had no effect on ${this.getPokemonName(defender)}!`);
    }

    // Check for critical hit
    if (this.isCriticalHit(attacker, defender, move)) {
        this.addLog(`A critical hit!`);
    }
  }

  executeStatusMove(attacker, defender, move, battleState) {
    // Implement status moves like Stat changes, status conditions, etc.
    switch (move.name.toLowerCase()) {
      case 'swords dance':
        this.boostStat(attacker, 'attack', 2);
        this.addLog(`${this.getPokemonName(attacker)}'s Attack sharply rose!`);
        break;
      case 'growl':
        this.boostStat(defender, 'attack', -1);
        this.addLog(`${this.getPokemonName(defender)}'s Attack fell!`);
        break;
      case 'thunder wave':
        if (this.canBeParalyzed(defender)) {
          defender.status = 'paralyzed';
          this.addLog(`${this.getPokemonName(defender)} is paralyzed! It may be unable to move!`);
        } else {
          this.addLog(`But it failed!`);
        }
        break;
      case 'toxic':
        if (this.canBePoisoned(defender)) {
          defender.status = 'badly-poisoned';
          this.addLog(`${this.getPokemonName(defender)} was badly poisoned!`);
        } else {
          this.addLog(`But it failed!`);
        }
        break;
      case 'will-o-wisp':
        if (this.canBeBurned(defender)) {
          defender.status = 'burned';
          this.addLog(`${this.getPokemonName(defender)} was burned!`);
        } else {
          this.addLog(`But it failed!`);
        }
        break;
      default:
        this.addLog(`But nothing happened!`);
    }
  }

  executeSwitch(side, newIndex, battleState) {
    console.log('executeSwitch called - side:', side, 'newIndex:', newIndex, 'current active:', battleState[side].activePokemon);
    
    // Validate the new index
    if (newIndex < 0 || newIndex >= battleState[side].team.length) {
      console.error('Invalid switch index:', newIndex);
      return;
    }

    const newActive = battleState[side].team[newIndex];
    
    // Check if the new Pokémon is fainted
    if (this.isPokemonFainted(newActive)) {
      console.error('Cannot switch to fainted Pokémon:', this.getPokemonName(newActive));
      return;
    }

    // Store the old active Pokémon for logging
    const oldActive = battleState[side].team[battleState[side].activePokemon];
    
    // Actually switch the active Pokémon
    battleState[side].activePokemon = newIndex;
    
    console.log('Switch completed - old:', this.getPokemonName(oldActive), 'new:', this.getPokemonName(newActive), 'new HP:', newActive.hp);
    
    this.addLog(`${side === 'player' ? 'You' : 'The opponent'} sent out ${this.getPokemonName(newActive)}!`);
  }

  checkFaintedPokemon(battleState) {
    const playerActive = battleState.player.team[battleState.player.activePokemon];
    const opponentActive = battleState.opponent.team[battleState.opponent.activePokemon];

    // Update remaining Pokémon counts
    battleState.player.remainingPokemon = battleState.player.team.filter(p => p.hp > 0).length;
    battleState.opponent.remainingPokemon = battleState.opponent.team.filter(p => p.hp > 0).length;

    let playerFainted = false;
    let opponentFainted = false;

    // Check player active Pokémon
    if (this.isPokemonFainted(playerActive)) {
      playerFainted = true;
      this.addLog(`${this.getPokemonName(playerActive)} fainted!`);
      
      // CRITICAL FIX: Don't auto-switch for player, just log that they need to choose
      if (battleState.player.remainingPokemon > 0) {
        this.addLog(`Please choose another Pokémon!`);
        // DO NOT auto-switch here - let the UI handle it
      }
    }

    // Check opponent active Pokémon
    if (this.isPokemonFainted(opponentActive)) {
      opponentFainted = true;
      this.addLog(`${this.getPokemonName(opponentActive)} fainted!`);
      
      // AI automatically switches if possible
      if (battleState.opponent.remainingPokemon > 0) {
        const nextPokemonIndex = battleState.opponent.team.findIndex((p, index) => 
          p.hp > 0 && index !== battleState.opponent.activePokemon
        );
        if (nextPokemonIndex !== -1) {
          battleState.opponent.activePokemon = nextPokemonIndex;
          this.addLog(`Opponent sent out ${this.getPokemonName(battleState.opponent.team[nextPokemonIndex])}!`);
        }
      }
    }

    // Check for battle end - only end if ALL Pokémon on one side are fainted
    if (battleState.player.remainingPokemon <= 0) {
      battleState.winner = 'opponent';
      this.addLog('You have no Pokémon left! You lost the battle!');
    } else if (battleState.opponent.remainingPokemon <= 0) {
      battleState.winner = 'player';
      this.addLog('The opponent has no Pokémon left! You won the battle!');
    }
    
    return { playerFainted, opponentFainted };
  }

  calculateDamage(attacker, defender, move) {
    if (move.power === 0 || move.power === undefined) return 0;

    const level = attacker.level || 50;
    const attackStat = move.category === 'physical' ? 
      this.getAttackStat(attacker) : 
      this.getSpecialAttackStat(attacker);
    
    const defenseStat = move.category === 'physical' ? 
      this.getDefenseStat(defender) : 
      this.getSpecialDefenseStat(defender);
    
    // STAB (Same Type Attack Bonus)
    const stab = this.hasSTAB(attacker, move.type) ? 1.5 : 1;
    
    // Type effectiveness
    const typeEffectiveness = this.calculateTypeEffectiveness(move.type, defender);
    if (typeEffectiveness === 0) return 0;
    
    // Critical hit
    const critical = this.isCriticalHit(attacker, defender, move) ? 1.5 : 1;
    
    // Random factor (0.85 to 1.0)
    const random = 0.85 + Math.random() * 0.15;
    
    // Modifiers (items, abilities, etc.)
    const modifiers = stab * typeEffectiveness * critical * random;

    const damage = Math.floor(
      ((((2 * level / 5 + 2) * move.power * attackStat / defenseStat) / 50) + 2) * 
      modifiers
    );
    
    return Math.max(1, damage);
  }

  calculateTypeEffectiveness(moveType, defender) {
    const defenderTypes = this.getPokemonTypes(defender);
    let effectiveness = 1;
    
    const typeChart = {
      normal: { rock: 0.5, ghost: 0, steel: 0.5 },
      fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
      grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
      ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
      fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
      poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
      ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
      flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
      bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
      rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
      ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
      dragon: { dragon: 2, steel: 0.5, fairy: 0 },
      dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
      steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
      fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
    };
    
    defenderTypes.forEach(defenderType => {
      if (typeChart[moveType] && typeChart[moveType][defenderType]) {
        effectiveness *= typeChart[moveType][defenderType];
      }
    });
    
    return effectiveness;
  }

  // Helper methods
  getEffectiveSpeed(pokemon) {
    let speed = this.getSpeedStat(pokemon);
    
    // Apply status effects
    if (pokemon.status === 'paralyzed') {
      speed = Math.floor(speed / 2);
    }
    
    return speed;
  }

  checkAccuracy(attacker, defender, move) {
    if (move.accuracy === true || move.accuracy === undefined) return true;
    const accuracy = move.accuracy || 100;
    return Math.random() * 100 < accuracy;
  }

  isCriticalHit(attacker, defender, move) {
    const criticalChance = move.critical_hit || 0;
    return Math.random() < (criticalChance / 24);
  }

  hasSTAB(pokemon, moveType) {
    return this.getPokemonTypes(pokemon).includes(moveType);
  }

  boostStat(pokemon, stat, stages) {
    if (!pokemon.statChanges) pokemon.statChanges = {};
    pokemon.statChanges[stat] = (pokemon.statChanges[stat] || 0) + stages;
    // Clamp between -6 and +6
    pokemon.statChanges[stat] = Math.max(-6, Math.min(6, pokemon.statChanges[stat]));
  }

  getAttackStat(pokemon) {
    const base = this.getPokemonStat(pokemon, 'attack');
    return this.applyStatModifiers(base, pokemon.statChanges?.attack || 0);
  }

  getDefenseStat(pokemon) {
    const base = this.getPokemonStat(pokemon, 'defense');
    return this.applyStatModifiers(base, pokemon.statChanges?.defense || 0);
  }

  getSpecialAttackStat(pokemon) {
    const base = this.getPokemonStat(pokemon, 'special-attack');
    return this.applyStatModifiers(base, pokemon.statChanges?.['special-attack'] || 0);
  }

  getSpecialDefenseStat(pokemon) {
    const base = this.getPokemonStat(pokemon, 'special-defense');
    return this.applyStatModifiers(base, pokemon.statChanges?.['special-defense'] || 0);
  }

  getSpeedStat(pokemon) {
    const base = this.getPokemonStat(pokemon, 'speed');
    return this.applyStatModifiers(base, pokemon.statChanges?.speed || 0);
  }

  applyStatModifiers(base, stages) {
    if (stages === 0) return base;
    const multiplier = stages > 0 ? (2 + stages) / 2 : 2 / (2 - stages);
    return Math.floor(base * multiplier);
  }

  getPokemonStat(pokemon, statName) {
    const stats = pokemon.stats || [];
    const stat = stats.find(s => 
      s.stat?.name === statName || s.name === statName
    );
    return stat?.base_stat || 50; // Default to 50 if not found
  }

  getPokemonTypes(pokemon) {
    const types = pokemon.types || [];
    return types.map(t => t.type?.name || t).filter(Boolean);
  }

  getPokemonName(pokemon) {
    return pokemon.name || 'Unknown Pokémon';
  }

  isPokemonFainted(pokemon) {
    return pokemon.hp <= 0;
  }

  applyEndOfTurnEffects(battleState) {
    const playerActive = battleState.player.team[battleState.player.activePokemon];
    const opponentActive = battleState.opponent.team[battleState.opponent.activePokemon];

    // Apply status damage
    [playerActive, opponentActive].forEach(pokemon => {
      if (this.isPokemonFainted(pokemon)) return;

      switch (pokemon.status) {
        case 'poisoned':
          const poisonDamage = Math.floor(pokemon.maxHp / 8);
          pokemon.hp = Math.max(0, pokemon.hp - poisonDamage);
          this.addLog(`${this.getPokemonName(pokemon)} is hurt by poison!`);
          break;
        case 'badly-poisoned':
          if (!pokemon.toxicCounter) pokemon.toxicCounter = 1;
          const toxicDamage = Math.floor(pokemon.maxHp * pokemon.toxicCounter / 16);
          pokemon.hp = Math.max(0, pokemon.hp - toxicDamage);
          pokemon.toxicCounter++;
          this.addLog(`${this.getPokemonName(pokemon)} is hurt by poison!`);
          break;
        case 'burned':
          const burnDamage = Math.floor(pokemon.maxHp / 16);
          pokemon.hp = Math.max(0, pokemon.hp - burnDamage);
          this.addLog(`${this.getPokemonName(pokemon)} is hurt by its burn!`);
          break;
      }
    });

    // Check for fainted Pokémon after status effects, but only if battle hasn't ended
    if (!battleState.winner) {
      this.checkFaintedPokemon(battleState);
    }
  }

  applyMoveSideEffects(attacker, defender, move, battleState) {
    // Handle move-specific side effects
    switch (move.name.toLowerCase()) {
      case 'double-edge':
      case 'take-down':
        // Recoil damage (1/4 of damage dealt)
        const recoilDamage = Math.floor(this.calculateDamage(attacker, defender, move) / 4);
        attacker.hp = Math.max(0, attacker.hp - recoilDamage);
        this.addLog(`${this.getPokemonName(attacker)} is hit with recoil!`);
        break;
      case 'flare-blitz':
        // Recoil damage (1/3 of damage dealt)
        const flareRecoil = Math.floor(this.calculateDamage(attacker, defender, move) / 3);
        attacker.hp = Math.max(0, attacker.hp - flareRecoil);
        this.addLog(`${this.getPokemonName(attacker)} is hit with recoil!`);
        break;
    }
  }

  canBeParalyzed(pokemon) {
    const immuneTypes = ['electric'];
    return !immuneTypes.some(type => this.getPokemonTypes(pokemon).includes(type)) &&
           !pokemon.status;
  }

  canBePoisoned(pokemon) {
    const immuneTypes = ['poison', 'steel'];
    return !immuneTypes.some(type => this.getPokemonTypes(pokemon).includes(type)) &&
           !pokemon.status;
  }

  canBeBurned(pokemon) {
    const immuneTypes = ['fire'];
    return !immuneTypes.some(type => this.getPokemonTypes(pokemon).includes(type)) &&
           !pokemon.status;
  }

  addLog(message) {
    this.log.push(message);
  }

  getLog() {
    return this.log;
  }

  clearLog() {
    this.log = [];
  }
}