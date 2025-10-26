// BattleSimulatorPage.jsx - FIXED BATTLE END LOGIC
import React, { useState, useEffect, useCallback } from 'react';
import { usePokemon } from '../contexts/PokemonContext';
import { useSavedTeams } from '../hooks/useSavedTeams';
import { BattleEngine } from '../components/Battle/BattleEngine';
import { 
  getPokemonSprite, 
  getPokemonDisplayName, 
  getPokemonTypes, 
  getPokemonStats,
  getPokemonMoves
} from '../utils/pokemonData';
import { pokemonAPI } from '../utils/api';
import BattleArena from '../components/Battle/BattleArena';
import TeamSelector from '../components/Battle/TeamSelector';
import AISelector from '../components/Battle/AISelector';
import BattleLog from '../components/Battle/BattleLog';
import BattleControls from '../components/Battle/BattleControls';

const BattleSimulatorPage = () => {
  const { team } = usePokemon();
  const { savedTeams } = useSavedTeams();
  const [playerTeam, setPlayerTeam] = useState([]);
  const [opponentTeam, setOpponentTeam] = useState([]);
  const [battleState, setBattleState] = useState(null);
  const [isBattling, setIsBattling] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('current');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState('random');
  const [battleEngine, setBattleEngine] = useState(null);
  const [forceSwitch, setForceSwitch] = useState(false);
  const [voluntarySwitch, setVoluntarySwitch] = useState(false);

  // Initialize with current team
  useEffect(() => {
    const validTeam = team.filter(pokemon => pokemon !== null);
    setPlayerTeam(validTeam);
  }, [team]);

  // Load saved teams
  const loadSavedTeam = (teamId) => {
    const teamToLoad = savedTeams.find(t => t.id === teamId);
    if (teamToLoad) {
      setPlayerTeam(teamToLoad.pokemon);
      setSelectedTeam(teamId);
    }
  };

  // Use current team
  const useCurrentTeam = () => {
    const validTeam = team.filter(pokemon => pokemon !== null);
    setPlayerTeam(validTeam);
    setSelectedTeam('current');
  };

  // Generate random opponent team
  const generateRandomTeam = useCallback(async (difficulty = 'medium') => {
    const teamSize = difficulty === 'easy' ? 3 : 6;
    const randomPokemonIds = [];
    
    for (let i = 0; i < teamSize; i++) {
      let id;
      if (difficulty === 'easy') {
        id = Math.floor(Math.random() * 151) + 1;
      } else if (difficulty === 'medium') {
        id = Math.floor(Math.random() * 386) + 1;
      } else {
        id = Math.floor(Math.random() * 386) + 1;
      }
      randomPokemonIds.push(id);
    }

    try {
      const teamPromises = randomPokemonIds.map(id => 
        pokemonAPI.getBattlePokemon(id, { level: 50 })
      );
      const teamData = await Promise.all(teamPromises);
      const validTeam = teamData.filter(pokemon => pokemon !== null);
      
      const teamWithHP = validTeam.map(pokemon => ({
        ...pokemon,
        hp: calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50),
        maxHp: calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50),
        status: null,
        statChanges: {}
      }));
      
      setOpponentTeam(teamWithHP);
      return teamWithHP;
    } catch (error) {
      console.error('Error generating random team:', error);
      return [];
    }
  }, []);

  // Load predefined opponent team
  const loadOpponentTeam = useCallback(async (teamType) => {
    const themeTeams = {
      gym_leader: [6, 59, 130, 142, 94, 150],
      elite_four: [149, 248, 373, 376, 445, 467],
      starter: [3, 6, 9, 154, 157, 160],
      legendary: [144, 145, 146, 150, 249, 250],
    };

    const teamIds = themeTeams[teamType] || themeTeams.gym_leader;
    
    try {
      const teamPromises = teamIds.map(id => 
        pokemonAPI.getBattlePokemon(id, { level: 50 })
      );
      const teamData = await Promise.all(teamPromises);
      const validTeam = teamData.filter(pokemon => pokemon !== null);
      
      const teamWithHP = validTeam.map(pokemon => ({
        ...pokemon,
        hp: calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50),
        maxHp: calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50),
        status: null,
        statChanges: {}
      }));
      
      setOpponentTeam(teamWithHP);
      return teamWithHP;
    } catch (error) {
      console.error('Error loading opponent team:', error);
      return [];
    }
  }, []);

  // Initialize battle
  const startBattle = async () => {
    if (playerTeam.length === 0) {
      alert('Please select a team first!');
      return;
    }

    setIsBattling(true);
    setBattleLog([]);
    setForceSwitch(false);
    setVoluntarySwitch(false);

    let opponentTeamData = [];
    
    if (selectedOpponentTeam === 'random') {
      opponentTeamData = await generateRandomTeam(aiDifficulty);
    } else {
      opponentTeamData = await loadOpponentTeam(selectedOpponentTeam);
    }

    if (opponentTeamData.length === 0) {
      alert('Failed to load opponent team. Please try again.');
      setIsBattling(false);
      return;
    }

    // Ensure player team has HP initialized and battle properties
    const playerTeamWithHP = playerTeam.map(pokemon => ({
      ...pokemon,
      hp: pokemon.hp || calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50),
      maxHp: pokemon.maxHp || calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50),
      status: pokemon.status || null,
      statChanges: pokemon.statChanges || {}
    }));

    // Initialize battle state
    const initialBattleState = {
      player: {
        team: playerTeamWithHP,
        activePokemon: 0,
        remainingPokemon: playerTeamWithHP.length
      },
      opponent: {
        team: opponentTeamData,
        activePokemon: 0,
        remainingPokemon: opponentTeamData.length
      },
      turn: 1,
      weather: 'clear',
      terrain: 'normal',
      winner: null
    };

    const engine = new BattleEngine(initialBattleState);
    setBattleEngine(engine);
    setBattleState(initialBattleState);
    
    addToBattleLog(`Battle started! Your ${getPokemonDisplayName(playerTeamWithHP[0])} vs ${getPokemonDisplayName(opponentTeamData[0])}`);
  };

  // Check if player has any Pokémon left
  const checkPlayerHasRemainingPokemon = (state) => {
    return state.player.team.some(pokemon => pokemon.hp > 0);
  };

  // Check if opponent has any Pokémon left
  const checkOpponentHasRemainingPokemon = (state) => {
    return state.opponent.team.some(pokemon => pokemon.hp > 0);
  };

  // Execute player move
const executePlayerMove = (move) => {
  if (!battleState || battleState.winner || !battleEngine || forceSwitch) {
    console.log('executePlayerMove blocked - battleState:', !!battleState, 'winner:', battleState?.winner, 'battleEngine:', !!battleEngine, 'forceSwitch:', forceSwitch);
    return;
  }

  const aiMove = selectAIMove();
  const playerAction = { type: 'move', move };
  const opponentAction = { type: 'move', move: aiMove };

  console.log('Executing turn - before battleEngine.executeTurn');
  const newBattleState = battleEngine.executeTurn(playerAction, opponentAction);
  
  // Add battle log messages
  battleEngine.getLog().forEach(message => addToBattleLog(message));
  
  setBattleState(newBattleState);
  console.log('After executeTurn - newBattleState winner:', newBattleState.winner, 'playerActive HP:', newBattleState.player.team[newBattleState.player.activePokemon].hp);

  // Check if player's active Pokémon fainted
  const playerActive = newBattleState.player.team[newBattleState.player.activePokemon];
  if (playerActive.hp <= 0) {
    console.log('Player Pokémon fainted! Checking for remaining Pokémon...');
    const hasRemaining = checkPlayerHasRemainingPokemon(newBattleState);
    console.log('Has remaining Pokémon:', hasRemaining);
    
    if (hasRemaining) {
      console.log('Setting forceSwitch to true');
      setForceSwitch(true);
      addToBattleLog(`Please choose a Pokémon to send out!`);
    } else {
      // No Pokémon left - battle ends
      console.log('No Pokémon left - ending battle');
      newBattleState.winner = 'opponent';
      addToBattleLog('You have no Pokémon left! You lost the battle!');
      endBattle();
    }
  }
  // Check if opponent's active Pokémon fainted
  const opponentActive = newBattleState.opponent.team[newBattleState.opponent.activePokemon];
  if (opponentActive.hp <= 0) {
    const hasRemaining = checkOpponentHasRemainingPokemon(newBattleState);
    if (hasRemaining) {
      // Give player option to switch
      setVoluntarySwitch(true);
      addToBattleLog(`The opponent is about to send out a new Pokémon. Would you like to switch?`);
    } else {
      // No opponent Pokémon left - battle ends
      newBattleState.winner = 'player';
      addToBattleLog('The opponent has no Pokémon left! You won the battle!');
      endBattle();
    }
  }

  battleEngine.clearLog();
};

 // Switch Pokémon (when forced or voluntary)
const switchPokemon = (pokemonIndex) => {
  console.log('=== SWITCH POKEMON START ===');
  console.log('switchPokemon called with index:', pokemonIndex, 'forceSwitch:', forceSwitch, 'voluntarySwitch:', voluntarySwitch);
  
  if (!battleState || battleState.winner || !battleEngine) {
    console.log('switchPokemon blocked - no battleState or battleEngine');
    return;
  }

  // Check if the selected Pokémon is valid and not fainted
  const selectedPokemon = battleState.player.team[pokemonIndex];
  console.log('Selected Pokémon:', getPokemonDisplayName(selectedPokemon), 'HP:', selectedPokemon.hp, 'Active index:', battleState.player.activePokemon);
  
  if (!selectedPokemon || selectedPokemon.hp <= 0) {
    console.log('Selected Pokémon is fainted or invalid');
    addToBattleLog(`That Pokémon has fainted! Choose another.`);
    return;
  }

  // Check if trying to switch to the same Pokémon
  if (pokemonIndex === battleState.player.activePokemon) {
    console.log('Trying to switch to same Pokémon');
    addToBattleLog(`${getPokemonDisplayName(selectedPokemon)} is already in battle!`);
    return;
  }

    const playerAction = { type: 'switch', newIndex: pokemonIndex };
    let opponentAction;
    
    // If it's a voluntary switch (after opponent KO), opponent will send out new Pokémon
    if (voluntarySwitch && battleState.opponent.team[battleState.opponent.activePokemon].hp <= 0) {
      const opponentNewIndex = getNextOpponentPokemon(battleState);
      opponentAction = { type: 'switch', newIndex: opponentNewIndex };
      console.log('Voluntary switch - opponent also switching to index:', opponentNewIndex);
    } else {
      // Normal switch or forced switch, opponent uses a move
      const aiMove = selectAIMove();
      opponentAction = { type: 'move', move: aiMove };
      console.log('Forced switch - opponent using move:', aiMove?.name);
    }

    console.log('Before executeTurn - player active index:', battleState.player.activePokemon);
    console.log('Executing switch turn with battleEngine...');
    
    const newBattleState = battleEngine.executeTurn(playerAction, opponentAction);
    
    console.log('After executeTurn - new player active index:', newBattleState.player.activePokemon);
    console.log('After executeTurn - new player active HP:', newBattleState.player.team[newBattleState.player.activePokemon].hp);
    console.log('After executeTurn - new player active name:', getPokemonDisplayName(newBattleState.player.team[newBattleState.player.activePokemon]));
    
    // Add battle log messages
    battleEngine.getLog().forEach(message => {
      console.log('Battle log:', message);
      addToBattleLog(message);
    });
    
    console.log('Updating battle state and resetting switches...');
    setBattleState(newBattleState);
    setForceSwitch(false);
    setVoluntarySwitch(false);
    console.log('Switch completed - forceSwitch now:', false, 'voluntarySwitch now:', false);

    // Check if battle ended after switch
    if (newBattleState.winner) {
      console.log('Battle ended after switch - winner:', newBattleState.winner);
      endBattle();
    } else {
      battleEngine.clearLog();
    }
    console.log('=== SWITCH POKEMON END ===');
  };

  // Keep current Pokémon (when opponent fainted)
  const keepCurrentPokemon = () => {
    if (!battleState || !battleEngine) return;

    // Opponent sends out new Pokémon
    const opponentNewIndex = getNextOpponentPokemon(battleState);
    const playerAction = { type: 'move', move: { name: 'Wait', type: 'normal', power: 0, accuracy: 100, category: 'status' } };
    const opponentAction = { type: 'switch', newIndex: opponentNewIndex };

    const newBattleState = battleEngine.executeTurn(playerAction, opponentAction);
    
    // Add battle log messages
    battleEngine.getLog().forEach(message => addToBattleLog(message));
    
    setBattleState(newBattleState);
    setVoluntarySwitch(false);

    battleEngine.clearLog();
  };

  // Get next available opponent Pokémon
  const getNextOpponentPokemon = (currentState) => {
    const opponentTeam = currentState.opponent.team;
    for (let i = 0; i < opponentTeam.length; i++) {
      if (i !== currentState.opponent.activePokemon && opponentTeam[i].hp > 0) {
        return i;
      }
    }
    return 0; // Fallback
  };

  // AI move selection
  const selectAIMove = () => {
    if (!battleState) return null;

    const aiPokemon = battleState.opponent.team[battleState.opponent.activePokemon];
    const playerPokemon = battleState.player.team[battleState.player.activePokemon];
    
    // Skip if Pokémon is fainted
    if (aiPokemon.hp <= 0) return null;

    const availableMoves = getPokemonMoves(aiPokemon).filter(move => move.name !== '---');
    
    if (availableMoves.length === 0) {
      return { name: 'Struggle', type: 'normal', power: 50, accuracy: 100, category: 'physical' };
    }

    let selectedMove;
    
    if (aiDifficulty === 'easy') {
      selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (aiDifficulty === 'medium') {
      const superEffectiveMoves = availableMoves.filter(move => 
        calculateTypeEffectiveness(move.type, playerPokemon) > 1
      );
      selectedMove = superEffectiveMoves.length > 0 
        ? superEffectiveMoves[Math.floor(Math.random() * superEffectiveMoves.length)]
        : availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      const moveScores = availableMoves.map(move => {
        const effectiveness = calculateTypeEffectiveness(move.type, playerPokemon);
        const power = move.power || 0;
        return { move, score: effectiveness * power };
      });
      moveScores.sort((a, b) => b.score - a.score);
      selectedMove = moveScores[0].move;
    }
    
    return selectedMove;
  };

  const endBattle = () => {
    setIsBattling(false);
    setBattleEngine(null);
    setForceSwitch(false);
    setVoluntarySwitch(false);
  };

  const addToBattleLog = (message) => {
    setBattleLog(prev => [...prev, { message, turn: battleState?.turn || 0 }]);
  };

  // Helper functions
  const getPokemonStat = (pokemon, statName) => {
    const stats = getPokemonStats(pokemon);
    const stat = stats.find(s => 
      s.stat?.name === statName || s.name === statName
    );
    return stat?.base_stat || 0;
  };

  const calculateHP = (base, level = 50, iv = 31, ev = 0) => {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  };

  const calculateTypeEffectiveness = (moveType, defender) => {
    const defenderTypes = getPokemonTypes(defender).map(t => t.type?.name || t);
    let effectiveness = 1;
    
    const effectivenessChart = {
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
      if (effectivenessChart[moveType] && effectivenessChart[moveType][defenderType]) {
        effectiveness *= effectivenessChart[moveType][defenderType];
      }
    });
    
    return effectiveness;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[#ef4444] text-center">Battle Simulator</h1>
        
        {!isBattling ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Selection */}
            <div className="pokemon-card p-6">
              <h2 className="text-2xl font-bold mb-6 text-[#ef4444]">Your Team</h2>
              <TeamSelector
                currentTeam={team}
                savedTeams={savedTeams}
                selectedTeam={selectedTeam}
                onTeamSelect={loadSavedTeam}
                onUseCurrentTeam={useCurrentTeam}
              />
            </div>

            {/* AI Settings */}
            <div className="pokemon-card p-6">
              <h2 className="text-2xl font-bold mb-6 text-[#ef4444]">Battle Settings</h2>
              <AISelector
                difficulty={aiDifficulty}
                opponentType={selectedOpponentTeam}
                onDifficultyChange={setAiDifficulty}
                onOpponentTypeChange={setSelectedOpponentTeam}
              />
              
              <button
                onClick={startBattle}
                className="w-full mt-6 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Start Battle!
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Battle Arena */}
            <div className="xl:col-span-2">
              <BattleArena 
                battleState={battleState} 
                onSwitchPokemon={switchPokemon}
                forceSwitch={forceSwitch}
              />
            </div>

            {/* Battle Controls & Log */}
            <div className="space-y-6">
              {/* Force Switch Panel (when player's Pokémon faints) */}
              {forceSwitch && (
                <div className="pokemon-card p-6 bg-yellow-900 border-2 border-yellow-500">
                  <h3 className="text-xl font-bold mb-4 text-yellow-300">Choose a Pokémon!</h3>
                  <p className="text-yellow-200 mb-4">Your Pokémon fainted! Choose another to send out:</p>
                  <div className="space-y-2">
                    {battleState.player.team.map((pokemon, index) => (
                      <button
                        key={index}
                        onClick={() => switchPokemon(index)}
                        disabled={pokemon.hp <= 0}
                        className={`w-full p-3 rounded-lg text-left transition-colors flex items-center ${
                          pokemon.hp <= 0 
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
                        }`}
                      >
                        <img
                          src={getPokemonSprite(pokemon)}
                          alt={getPokemonDisplayName(pokemon)}
                          className="w-8 h-8 mr-3"
                        />
                        <div className="flex-1">
                          <span className="font-medium capitalize">{getPokemonDisplayName(pokemon)}</span>
                          <div className="flex justify-between text-xs">
                            <span>Lv. {pokemon.level || 50}</span>
                            <span>HP: {pokemon.hp}/{pokemon.maxHp}</span>
                          </div>
                        </div>
                        {pokemon.hp <= 0 && (
                          <span className="text-red-400 text-xs">FAINTED</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voluntary Switch Panel (when opponent's Pokémon faints) */}
              {voluntarySwitch && !forceSwitch && (
                <div className="pokemon-card p-6 bg-blue-900 border-2 border-blue-500">
                  <h3 className="text-xl font-bold mb-4 text-blue-300">Opponent's Pokémon fainted!</h3>
                  <p className="text-blue-200 mb-4">Would you like to switch Pokémon?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={keepCurrentPokemon}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Keep {getPokemonDisplayName(battleState.player.team[battleState.player.activePokemon])}
                    </button>
                    <button
                      onClick={() => setVoluntarySwitch(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Switch Pokémon
                    </button>
                  </div>
                </div>
              )}

              {/* Switch Panel (when player chooses to switch voluntarily) */}
              {voluntarySwitch && !forceSwitch && (
                <div className="pokemon-card p-6 bg-blue-900 border-2 border-blue-500">
                  <h3 className="text-xl font-bold mb-4 text-blue-300">Switch Pokémon</h3>
                  <p className="text-blue-200 mb-4">Choose a Pokémon to send out:</p>
                  <div className="space-y-2">
                    {battleState.player.team.map((pokemon, index) => (
                      <button
                        key={index}
                        onClick={() => switchPokemon(index)}
                        disabled={pokemon.hp <= 0 || index === battleState.player.activePokemon}
                        className={`w-full p-3 rounded-lg text-left transition-colors flex items-center ${
                          pokemon.hp <= 0 
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                            : index === battleState.player.activePokemon
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
                        }`}
                      >
                        <img
                          src={getPokemonSprite(pokemon)}
                          alt={getPokemonDisplayName(pokemon)}
                          className="w-8 h-8 mr-3"
                        />
                        <div className="flex-1">
                          <span className="font-medium capitalize">{getPokemonDisplayName(pokemon)}</span>
                          <div className="flex justify-between text-xs">
                            <span>Lv. {pokemon.level || 50}</span>
                            <span>HP: {pokemon.hp}/{pokemon.maxHp}</span>
                          </div>
                        </div>
                        {pokemon.hp <= 0 && (
                          <span className="text-red-400 text-xs">FAINTED</span>
                        )}
                        {index === battleState.player.activePokemon && (
                          <span className="text-blue-300 text-xs">CURRENT</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Normal Battle Controls */}
              {!forceSwitch && !voluntarySwitch && (
                <BattleControls
                  battleState={battleState}
                  onMoveSelect={executePlayerMove}
                  onSwitchPokemon={switchPokemon}
                />
              )}
              
              <BattleLog logEntries={battleLog} />
              
              {battleState?.winner && (
                <div className="pokemon-card p-6 text-center">
                  <h3 className="text-2xl font-bold text-[#ef4444] mb-4">
                    {battleState.winner === 'player' ? 'Victory!' : 'Defeat!'}
                  </h3>
                  <button
                    onClick={endBattle}
                    className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Return to Setup
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Debug Panel - remove this after fixing */}
{isBattling && (
  <div className="pokemon-card p-4 bg-gray-800 border border-red-500">
    <h3 className="text-lg font-bold text-red-400 mb-2">Debug Info</h3>
    <div className="text-sm space-y-1">
      <div>Force Switch: {forceSwitch ? 'TRUE' : 'false'}</div>
      <div>Voluntary Switch: {voluntarySwitch ? 'TRUE' : 'false'}</div>
      <div>Battle Winner: {battleState?.winner || 'none'}</div>
      <div>Player Active HP: {battleState?.player.team[battleState?.player.activePokemon]?.hp}</div>
      <div>Player Remaining: {battleState?.player.remainingPokemon}</div>
      <div>Active Pokémon Index: {battleState?.player.activePokemon}</div>
    </div>
  </div>
)}
    </div>
  );
};

export default BattleSimulatorPage;