import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { usePokemon } from '../../contexts/PokemonContext';
import { 
  getPokemonSprite, 
  getPokemonName, 
  getPokemonTypes 
} from '../../utils/pokemonData';
import PokemonSettings from './PokemonSettings';

const PokemonCard = ({ pokemon, disabled }) => {
  const { addToTeam, getEmptySlots } = usePokemon();
  const [showSettings, setShowSettings] = useState(false);
  const [addOptions, setAddOptions] = useState({
    level: 50,
    nature: 'hardy',
    moves: null
  });

  const canAdd = getEmptySlots() > 0;

  const handleAdd = () => {
    if (canAdd) {
      addToTeam(pokemon, addOptions);
      setShowSettings(false);
    }
  };

  const handleQuickAdd = () => {
    if (canAdd) {
      addToTeam(pokemon, { level: 50, nature: 'hardy' });
    }
  };

  return (
    <>
      <div className="bg-[#141414] border border-[#7f1d1d]/20 rounded-xl p-4 hover:border-[#ef4444]/30 transition-all duration-200 group">
        <div className="flex items-center justify-between">
          {/* Pokémon Info */}
          <div className="flex items-center space-x-3 flex-1">
            <img
              src={getPokemonSprite(pokemon)}
              alt={getPokemonName(pokemon)}
              className="w-12 h-12 object-contain"
            />
            <div className="flex-1">
              <h3 className="text-white font-bold capitalize">{getPokemonName(pokemon)}</h3>
              <div className="flex gap-1 mt-1">
                {getPokemonTypes(pokemon).map((typeInfo) => (
                  <span
                    key={typeInfo.type.name}
                    className={`type-badge bg-${typeInfo.type.name} text-xs px-2 py-0.5`}
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              disabled={!canAdd}
              className={`p-2 rounded-xl transition-all duration-200 ${
                !canAdd
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-[#3b82f6] hover:bg-[#2563eb] hover:scale-110'
              }`}
              title={!canAdd ? 'Team is full' : 'Customize before adding'}
            >
              <Settings size={16} className="text-white" />
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={!canAdd}
              className={`p-3 rounded-xl transition-all duration-200 ${
                !canAdd
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-[#ef4444] hover:bg-[#dc2626] hover:scale-110 active:scale-95'
              }`}
              title={!canAdd ? 'Team is full' : `Add ${getPokemonName(pokemon)} to team`}
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Team Status */}
        {!canAdd && (
          <div className="mt-2 text-xs text-[#ef4444] text-center">
            Team is full! Remove a Pokémon to add more.
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <PokemonSettings
          pokemon={pokemon}
          options={addOptions}
          onOptionsChange={setAddOptions}
          onAdd={handleAdd}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default PokemonCard;