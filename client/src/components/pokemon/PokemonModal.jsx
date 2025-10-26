import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Loader } from 'lucide-react';
import { pokemonAPI } from '../../utils/api';

const PokemonModal = ({ pokemon, isOpen, onClose, onShinyToggle }) => {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [isShiny, setIsShiny] = useState(pokemon?._isShiny || false);
  const [evolutionLoading, setEvolutionLoading] = useState(false);

  useEffect(() => {
    if (pokemon && isOpen) {
      fetchPokemonDetails();
    }
  }, [pokemon, isOpen]);

  useEffect(() => {
    if (activeTab === 'evolution' && pokemonDetails && evolutionChain.length === 0) {
      fetchEvolutionChain();
    }
  }, [activeTab, pokemonDetails]);

  const fetchPokemonDetails = async () => {
    try {
      const details = await pokemonAPI.getPokemon(pokemon.id);
      setPokemonDetails(details);
    } catch (error) {
      console.error('Error fetching Pokémon details:', error);
    }
  };

  const fetchEvolutionChain = async () => {
    if (!pokemonDetails) return;
    
    setEvolutionLoading(true);
    try {
      const evolutionData = await pokemonAPI.getEvolutionChain(pokemon.id);
      
      if (evolutionData && !evolutionData.evolves) {
        // Pokémon doesn't evolve
        setEvolutionChain([pokemonDetails]);
      } else if (evolutionData && Array.isArray(evolutionData)) {
        // We have evolution data - fetch details for each Pokémon in the chain
        const evolutionLine = [];
        
        for (const evolution of evolutionData) {
          const pokemonId = evolution.species_url.split('/').filter(Boolean).pop();
          try {
            const pokemonData = await pokemonAPI.getPokemon(pokemonId);
            if (pokemonData) {
              evolutionLine.push(pokemonData);
            }
          } catch (error) {
            console.error(`Error fetching evolution Pokémon ${pokemonId}:`, error);
          }
        }
        
        setEvolutionChain(evolutionLine);
      } else {
        // Fallback - just show current Pokémon
        setEvolutionChain([pokemonDetails]);
      }
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
      setEvolutionChain([pokemonDetails]); // Fallback to just current Pokémon
    } finally {
      setEvolutionLoading(false);
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
              
              {evolutionLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="animate-spin text-[#ef4444] mr-3" size={24} />
                  <span className="text-gray-400">Loading evolution chain...</span>
                </div>
              ) : evolutionChain.length > 1 ? (
                <div className="flex flex-col items-center space-y-6">
                  {evolutionChain.map((evo, index) => (
                    <React.Fragment key={evo.id}>
                      <div className={`text-center group hover:scale-105 transition-transform duration-200 ${
                        evo.id === displayPokemon.id ? 'ring-2 ring-[#ef4444] rounded-xl p-2' : ''
                      }`}>
                        <img
                          src={evo.sprites.front_default}
                          alt={evo.name}
                          className="w-20 h-20 object-contain mx-auto mb-2"
                        />
                        <p className="text-white capitalize font-semibold">{evo.name}</p>
                        <p className="text-gray-400 text-sm">#{evo.id.toString().padStart(3, '0')}</p>
                        <div className="flex justify-center gap-1 mt-1">
                          {evo.types.map(type => (
                            <span
                              key={type.type.name}
                              className={`type-badge bg-${type.type.name} text-xs px-2 py-0.5`}
                            >
                              {type.type.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      {index < evolutionChain.length - 1 && (
                        <div className="flex items-center justify-center">
                          <ArrowRight className="text-[#ef4444] mx-4" size={24} />
                          <div className="text-xs text-gray-400 bg-[#141414] px-2 py-1 rounded">
                            →
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : evolutionChain.length === 1 ? (
                <div className="text-center py-8">
                  <div className="bg-[#141414] rounded-xl p-6 border border-[#7f1d1d]/20">
                    <img
                      src={evolutionChain[0].sprites.front_default}
                      alt={evolutionChain[0].name}
                      className="w-24 h-24 object-contain mx-auto mb-4"
                    />
                    <h4 className="text-white font-bold text-lg capitalize mb-2">
                      {evolutionChain[0].name}
                    </h4>
                    <p className="text-gray-400">
                      This Pokémon does not evolve.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      #{evolutionChain[0].id.toString().padStart(3, '0')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Evolution data not available
                </p>
              )}
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