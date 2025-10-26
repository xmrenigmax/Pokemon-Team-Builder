import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { pokemonAPI } from '../../utils/api';

const PokemonModal = ({ pokemon, isOpen, onClose, onShinyToggle }) => {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [isShiny, setIsShiny] = useState(pokemon?._isShiny || false);

  useEffect(() => {
    if (pokemon && isOpen) {
      fetchPokemonDetails();
      fetchEvolutionChain();
    }
  }, [pokemon, isOpen]);

  const fetchPokemonDetails = async () => {
    try {
      const details = await pokemonAPI.getPokemon(pokemon.id);
      setPokemonDetails(details);
    } catch (error) {
      console.error('Error fetching Pokémon details:', error);
    }
  };

  const fetchEvolutionChain = async () => {
    try {
      // Simplified evolution chain for now
      setEvolutionChain([pokemon]);
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
    }
  };

  const handleShinyToggle = () => {
    const newShinyState = !isShiny;
    setIsShiny(newShinyState);
    onShinyToggle(newShinyState);
  };

  if (!isOpen || !pokemon) return null;

  const displayPokemon = pokemonDetails || pokemon;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#7f1d1d]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#7f1d1d]/30">
          <div className="flex items-center gap-4">
            <img
              src={isShiny && displayPokemon.sprites.front_shiny 
                ? displayPokemon.sprites.front_shiny 
                : displayPokemon.sprites.front_default}
              alt={displayPokemon.name}
              className="w-16 h-16 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {displayPokemon.name}
                {isShiny && <span className="text-[#fbbf24] ml-2">✨</span>}
              </h2>
              <div className="flex gap-2 mt-1">
                {displayPokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={`type-badge bg-${type.type.name} px-3 py-1`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleShinyToggle}
              className={`p-2 rounded-lg transition-colors ${
                isShiny 
                  ? 'bg-[#fbbf24] text-black' 
                  : 'bg-[#374151] hover:bg-[#4b5563] text-white'
              }`}
              title="Toggle Shiny"
            >
              <Sparkles size={20} />
            </button>
            <button
              onClick={onClose}
              className="bg-[#ef4444] hover:bg-[#dc2626] text-white p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#7f1d1d]/30">
          <div className="flex">
            {['stats', 'info', 'evolution'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#ef4444] border-b-2 border-[#ef4444]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'stats' && 'Base Stats'}
                {tab === 'info' && 'Information'}
                {tab === 'evolution' && 'Evolution'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Base Stats</h3>
              {displayPokemon.stats.map((stat) => (
                <div key={stat.name} className="flex items-center gap-4">
                  <span className="text-gray-400 capitalize w-32 text-sm">
                    {stat.name.replace('_', ' ')}:
                  </span>
                  <div className="flex-1 bg-[#141414] rounded-full h-3">
                    <div
                      className="bg-[#ef4444] h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-white font-bold w-8 text-sm">
                    {stat.base_stat}
                  </span>
                </div>
              ))}
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#7f1d1d]/30">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Height</p>
                  <p className="text-white font-bold">{(displayPokemon.height / 10).toFixed(1)} m</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="text-white font-bold">{(displayPokemon.weight / 10).toFixed(1)} kg</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Pokémon Information</h3>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Abilities</h4>
                <div className="space-y-2">
                  {displayPokemon.abilities.map((ability) => (
                    <div
                      key={ability.name}
                      className="bg-[#141414] rounded-lg p-3 border border-[#7f1d1d]/20"
                    >
                      <span className="text-white capitalize">
                        {ability.name.replace('-', ' ')}
                      </span>
                      {ability.is_hidden && (
                        <span className="text-[#fbbf24] text-sm ml-2">(Hidden)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {displayPokemon.moves && displayPokemon.moves.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Sample Moves</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayPokemon.moves.slice(0, 8).map((move) => (
                      <span
                        key={move.name}
                        className="bg-[#141414] text-white text-sm px-3 py-1 rounded-full border border-[#7f1d1d]/20"
                      >
                        {move.name.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evolution' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Evolution Chain</h3>
              
              {evolutionChain.length > 0 ? (
                <div className="flex items-center justify-center gap-4">
                  {evolutionChain.map((evo, index) => (
                    <React.Fragment key={evo.id}>
                      <div className="text-center">
                        <img
                          src={evo.sprites.front_default}
                          alt={evo.name}
                          className="w-16 h-16 object-contain mx-auto mb-2"
                        />
                        <p className="text-white capitalize text-sm">{evo.name}</p>
                      </div>
                      {index < evolutionChain.length - 1 && (
                        <ArrowRight className="text-gray-400" size={20} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Evolution data not available
                </p>
              )}
              
              <div className="mt-6 p-4 bg-[#141414] rounded-lg border border-[#7f1d1d]/20">
                <p className="text-gray-400 text-sm text-center">
                  Full evolution chain support coming soon!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#7f1d1d]/30 bg-[#141414]">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Pokédex ID: #{displayPokemon.id.toString().padStart(3, '0')}</span>
            <span className="text-gray-400">Base EXP: {displayPokemon.base_experience || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonModal;