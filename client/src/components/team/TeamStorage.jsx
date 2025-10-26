// TeamStorage.jsx - UPDATED
import React, { useState } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload } from 'lucide-react';
import { usePokemon } from '../../contexts/PokemonContext';
import { useSavedTeams } from '../../hooks/useSavedTeams';
import { getPokemonSprite, getPokemonDisplayName, normalizeLoadedPokemon } from '../../utils/pokemonData';

const TeamStorage = () => {
  const { team, setTeam } = usePokemon();
  const { savedTeams, saveCurrentTeam, deleteSavedTeam, clearAllTeams } = useSavedTeams();
  const [teamName, setTeamName] = useState('');

  const handleSaveTeam = () => {
    if (!teamName.trim() || team.filter(p => p).length === 0) return;
    
    const result = saveCurrentTeam(team, teamName);
    if (result) {
      setTeamName('');
      // Optional: Show success message
      console.log('Team saved successfully:', result.name);
    }
  };

  const loadTeam = (teamToLoad) => {
    if (!teamToLoad || !teamToLoad.pokemon) return;
    
    // Normalize each Pokémon data to ensure consistency
    const normalizedPokemon = teamToLoad.pokemon.map(pokemon => 
      normalizeLoadedPokemon(pokemon)
    );
    
    // Fill the team array with the loaded Pokémon + empty slots
    const loadedTeam = [...normalizedPokemon];
    while (loadedTeam.length < 6) {
      loadedTeam.push(null);
    }
    setTeam(loadedTeam);
  };

  // Export teams to JSON file
  const exportTeams = () => {
    const dataStr = JSON.stringify(savedTeams, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pokemon-teams-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import teams from JSON file
  const importTeams = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTeams = JSON.parse(e.target.result);
        if (Array.isArray(importedTeams)) {
          // Validate and normalize imported teams
          const validTeams = importedTeams.filter(team => 
            team.id && team.name && Array.isArray(team.pokemon)
          ).map(team => ({
            ...team,
            pokemon: team.pokemon.map(pokemon => normalizeLoadedPokemon(pokemon))
          }));
          
          setSavedTeams(prev => [...prev, ...validTeams]);
          console.log('Teams imported successfully:', validTeams.length);
        }
      } catch (error) {
        console.error('Error importing teams:', error);
        alert('Invalid team file format');
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const currentTeamSize = team.filter(p => p).length;
  const hasSavedTeams = savedTeams.length > 0;

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#7f1d1d]/30">
      <h2 className="text-2xl font-bold text-white mb-4">Team Storage</h2>

      {/* Save Current Team */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Team name..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="flex-1 bg-[#141414] border border-[#7f1d1d]/30 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ef4444]/50"
            onKeyPress={(e) => e.key === 'Enter' && handleSaveTeam()}
          />
          <button
            onClick={handleSaveTeam}
            disabled={!teamName.trim() || currentTeamSize === 0}
            className="bg-[#10b981] hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
            title="Save Team"
          >
            <Save size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Current team: {currentTeamSize}/6 Pokémon
        </p>
      </div>

      {/* Import/Export Controls */}
      {hasSavedTeams && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={exportTeams}
            className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-3 py-2 rounded-xl transition-colors text-sm"
            title="Export all teams"
          >
            <Download size={16} />
            Export
          </button>
          <label className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-3 py-2 rounded-xl transition-colors text-sm cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importTeams}
              className="hidden"
            />
          </label>
          <button
            onClick={clearAllTeams}
            className="flex items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-2 rounded-xl transition-colors text-sm"
            title="Delete all teams"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      )}

      {/* Saved Teams List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {savedTeams.map((savedTeam) => (
          <div
            key={savedTeam.id}
            className="bg-[#141414] border border-[#7f1d1d]/20 rounded-xl p-3 hover:border-[#ef4444]/30 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold">{savedTeam.name}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => loadTeam(savedTeam)}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white p-1 rounded transition-colors"
                  title="Load Team"
                >
                  <FolderOpen size={14} />
                </button>
                <button
                  onClick={() => deleteSavedTeam(savedTeam.id)}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white p-1 rounded transition-colors"
                  title="Delete Team"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{savedTeam.pokemon.length} Pokémon</span>
              <span>{savedTeam.date}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {savedTeam.pokemon.slice(0, 4).map((pokemon, index) => (
                <div key={index} className="relative group">
                  <img
                    src={getPokemonSprite(pokemon)}
                    alt={getPokemonDisplayName(pokemon)}
                    className="w-6 h-6 object-contain"
                  />
                  {pokemon._isShiny && (
                    <div className="absolute -top-1 -right-1 text-[#fbbf24] text-xs">✨</div>
                  )}
                  {pokemon.formName && pokemon.formName !== pokemon.name && (
                    <div className="absolute -bottom-1 -left-1 bg-[#8b5cf6] text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                      F
                    </div>
                  )}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black bg-opacity-80 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {getPokemonDisplayName(pokemon)}
                    {pokemon.level && ` Lv.${pokemon.level}`}
                  </div>
                </div>
              ))}
              {savedTeam.pokemon.length > 4 && (
                <div className="w-6 h-6 bg-[#7f1d1d] rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
                  <span className="text-xs text-white">+{savedTeam.pokemon.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {!hasSavedTeams && (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-2">No saved teams yet</p>
            <p className="text-gray-500 text-sm">Save your current team to use it in battles!</p>
          </div>
        )}
      </div>

      {/* Storage Info */}
      {hasSavedTeams && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          {savedTeams.length} team{savedTeams.length !== 1 ? 's' : ''} saved • 
          Auto-saved to browser storage
        </div>
      )}
    </div>
  );
};

export default TeamStorage;