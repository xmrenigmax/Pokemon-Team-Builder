// TeamSelector.jsx - Final safe version
import React from 'react';
import { getPokemonSprite, getPokemonDisplayName } from '../../utils/pokemonData';

const TeamSelector = ({ currentTeam, savedTeams, selectedTeam, onTeamSelect, onUseCurrentTeam }) => {
  // Ensure savedTeams is always an array
  const safeSavedTeams = savedTeams || [];
  const validCurrentTeam = currentTeam.filter(pokemon => pokemon !== null);

  return (
    <div className="space-y-4">
      {/* Current Team Option */}
      <div
        onClick={onUseCurrentTeam}
        className={`p-4 rounded-xl cursor-pointer transition-all ${
          selectedTeam === 'current' 
            ? 'bg-[#ef4444]/20 border-2 border-[#ef4444]' 
            : 'bg-[#1a1a1a] border border-[#7f1d1d]/30 hover:border-[#ef4444]/50'
        }`}
      >
        <h4 className="font-bold text-white mb-2">Current Team</h4>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">
            {validCurrentTeam.length} Pokémon
          </span>
          <div className="flex -space-x-2">
            {validCurrentTeam.slice(0, 3).map((pokemon, index) => (
              <img
                key={index}
                src={getPokemonSprite(pokemon)}
                alt={getPokemonDisplayName(pokemon)}
                className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]"
              />
            ))}
            {validCurrentTeam.length > 3 && (
              <div className="w-8 h-8 bg-[#7f1d1d] rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
                <span className="text-xs text-white">+{validCurrentTeam.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Teams */}
      {safeSavedTeams.map(team => (
        <div
          key={team.id}
          onClick={() => onTeamSelect(team.id)}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            selectedTeam === team.id
              ? 'bg-[#ef4444]/20 border-2 border-[#ef4444]' 
              : 'bg-[#1a1a1a] border border-[#7f1d1d]/30 hover:border-[#ef4444]/50'
          }`}
        >
          <h4 className="font-bold text-white mb-2">{team.name}</h4>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">
              {team.pokemon?.length || 0} Pokémon • {team.date || 'No date'}
            </span>
            <div className="flex -space-x-2">
              {team.pokemon?.slice(0, 3).map((pokemon, index) => (
                <img
                  key={index}
                  src={getPokemonSprite(pokemon)}
                  alt={getPokemonDisplayName(pokemon)}
                  className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]"
                />
              ))}
              {team.pokemon?.length > 3 && (
                <div className="w-8 h-8 bg-[#7f1d1d] rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
                  <span className="text-xs text-white">+{team.pokemon.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {safeSavedTeams.length === 0 && (
        <p className="text-gray-400 text-center py-4">
          No saved teams yet. Save your current team to use it in battles!
        </p>
      )}
    </div>
  );
};

export default TeamSelector;