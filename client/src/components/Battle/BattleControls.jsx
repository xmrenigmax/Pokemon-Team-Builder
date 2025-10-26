// BattleControls.jsx - FIXED POKÉMON COMPARISON
import React, { useState } from 'react';
import { getPokemonMoves, getPokemonDisplayName, getPokemonSprite } from '../../utils/pokemonData';

const BattleControls = ({ battleState, onMoveSelect, onSwitchPokemon }) => {
  const [showMoves, setShowMoves] = useState(true);
  const [showSwitch, setShowSwitch] = useState(false);

  if (!battleState) return null;

  const playerActive = battleState.player.team[battleState.player.activePokemon];
  const availableMoves = getPokemonMoves(playerActive).filter(move => move.name !== '---');

  // Type color mapping for moves
  const typeColors = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-300',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-300',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300'
  };

  const handleMoveSelect = (move) => {
    onMoveSelect(move);
    setShowMoves(true);
    setShowSwitch(false);
  };

  const handleSwitchSelect = (index) => {
    // FIX: Compare by index, not Pokémon object
    if (battleState.player.team[index].hp > 0 && index !== battleState.player.activePokemon) {
      onSwitchPokemon(index);
      setShowMoves(true);
      setShowSwitch(false);
    }
  };

  return (
    <div className="pokemon-card p-6">
      <h3 className="text-xl font-bold mb-4 text-[#ef4444]">Battle Controls</h3>
      
      {/* Action Type Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setShowMoves(true); setShowSwitch(false); }}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            showMoves ? 'bg-[#ef4444] text-white' : 'bg-[#1a1a1a] text-gray-300'
          }`}
        >
          Moves
        </button>
        <button
          onClick={() => { setShowMoves(false); setShowSwitch(true); }}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            showSwitch ? 'bg-[#ef4444] text-white' : 'bg-[#1a1a1a] text-gray-300'
          }`}
        >
          Switch
        </button>
      </div>

      {/* Moves List */}
      {showMoves && (
        <div className="grid grid-cols-2 gap-2">
          {availableMoves.map((move, index) => (
            <button
              key={index}
              onClick={() => handleMoveSelect(move)}
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] p-3 rounded-lg text-left transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium capitalize">{move.name}</span>
                <span className={`${typeColors[move.type] || 'bg-gray-500'} text-white text-xs px-2 py-0.5 rounded capitalize`}>
                  {move.type}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Power: {move.power || 0}</span>
                <span>Acc: {move.accuracy || 100}%</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Switch Pokémon List */}
      {showSwitch && (
        <div className="space-y-2">
          {battleState.player.team.map((pokemon, index) => (
            <button
              key={index}
              onClick={() => handleSwitchSelect(index)}
              disabled={pokemon.hp <= 0 || index === battleState.player.activePokemon}
              className={`w-full p-3 rounded-lg text-left transition-colors flex items-center ${
                pokemon.hp <= 0 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : index === battleState.player.activePokemon
                  ? 'bg-[#ef4444] text-white'
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BattleControls;