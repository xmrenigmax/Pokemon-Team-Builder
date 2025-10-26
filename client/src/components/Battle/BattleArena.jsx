// BattleArena.jsx - UPDATED WITH FAINTED VISUALS
import React from 'react';
import { getPokemonSprite, getPokemonDisplayName, getPokemonTypes } from '../../utils/pokemonData';

const BattleArena = ({ battleState, onSwitchPokemon, forceSwitch }) => {
  if (!battleState) return null;

  const playerActive = battleState.player.team[battleState.player.activePokemon];
  const opponentActive = battleState.opponent.team[battleState.opponent.activePokemon];

  // Type color mapping
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

  return (
    <div className="pokemon-card p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#ef4444] text-center">Battle Arena</h2>
      
      {/* Opponent Pokémon */}
      <div className="flex justify-between items-start mb-12">
        <div className="text-center">
          <div className={`relative ${opponentActive.hp <= 0 ? 'opacity-50 grayscale' : ''}`}>
            <img
              src={getPokemonSprite(opponentActive)}
              alt={getPokemonDisplayName(opponentActive)}
              className="w-32 h-32 mx-auto mb-2"
            />
            {opponentActive.hp <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-red-500 font-bold text-lg bg-black bg-opacity-70 px-2 py-1 rounded">
                  FAINTED
                </span>
              </div>
            )}
          </div>
          <h3 className={`font-bold capitalize ${opponentActive.hp <= 0 ? 'text-red-400' : 'text-white'}`}>
            {getPokemonDisplayName(opponentActive)}
            {opponentActive.hp <= 0 && ' (Fainted)'}
          </h3>
          <div className="flex justify-center gap-1 mt-1">
            {getPokemonTypes(opponentActive).map((type, index) => {
              const typeName = type.type?.name || type;
              return (
                <span
                  key={index}
                  className={`type-badge ${typeColors[typeName] || 'bg-gray-500'} text-white capitalize text-xs px-2 py-1 rounded`}
                >
                  {typeName}
                </span>
              );
            })}
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                opponentActive.hp <= 0 ? 'bg-red-700' :
                (opponentActive.hp / opponentActive.maxHp) < 0.2 ? 'bg-red-500' :
                (opponentActive.hp / opponentActive.maxHp) < 0.5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${(opponentActive.hp / opponentActive.maxHp) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            HP: {opponentActive.hp}/{opponentActive.maxHp}
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-[#1a1a1a] rounded-lg p-3">
            <p className="text-white font-bold">Turn {battleState.turn}</p>
            <p className="text-gray-400 text-sm">
              {battleState.weather === 'clear' ? 'Clear' : battleState.weather}
            </p>
          </div>
        </div>
      </div>

      {/* Player Pokémon */}
      <div className="flex justify-between items-end">
        <div className="text-center">
          <div className="bg-[#1a1a1a] rounded-lg p-3">
            <p className="text-white font-bold">Your Team</p>
            <p className="text-gray-400 text-sm">
              {battleState.player.remainingPokemon} remaining
            </p>
            {forceSwitch && (
              <p className="text-yellow-400 text-sm mt-1">Choose a Pokémon!</p>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`relative ${playerActive.hp <= 0 ? 'opacity-50 grayscale' : ''}`}>
            <img
              src={getPokemonSprite(playerActive)}
              alt={getPokemonDisplayName(playerActive)}
              className="w-32 h-32 mx-auto mb-2"
            />
            {playerActive.hp <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-red-500 font-bold text-lg bg-black bg-opacity-70 px-2 py-1 rounded">
                  FAINTED
                </span>
              </div>
            )}
          </div>
          <h3 className={`font-bold capitalize ${playerActive.hp <= 0 ? 'text-red-400' : 'text-white'}`}>
            {getPokemonDisplayName(playerActive)}
            {playerActive.hp <= 0 && ' (Fainted)'}
          </h3>
          <div className="flex justify-center gap-1 mt-1">
            {getPokemonTypes(playerActive).map((type, index) => {
              const typeName = type.type?.name || type;
              return (
                <span
                  key={index}
                  className={`type-badge ${typeColors[typeName] || 'bg-gray-500'} text-white capitalize text-xs px-2 py-1 rounded`}
                >
                  {typeName}
                </span>
              );
            })}
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                playerActive.hp <= 0 ? 'bg-red-700' :
                (playerActive.hp / playerActive.maxHp) < 0.2 ? 'bg-red-500' :
                (playerActive.hp / playerActive.maxHp) < 0.5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${(playerActive.hp / playerActive.maxHp) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            HP: {playerActive.hp}/{playerActive.maxHp}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BattleArena;