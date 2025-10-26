import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Loader, Sword, Shield, Zap, Heart, Gauge, Crown } from 'lucide-react';
import { pokemonAPI } from '../../utils/api';
import { 
  getPokemonSprite, 
  getPokemonShinySprite, 
  getPokemonName, 
  getPokemonDisplayName, // ADD THIS IMPORT
  getPokemonTypes, 
  getPokemonStats, 
  getPokemonAbilities, 
  getPokemonMoves,
  getPokemonHeightInMeters,
  getPokemonWeightInKg,
  getPokemonBaseExp,
  getIsShiny 
} from '../../utils/pokemonData';

/**
 * Modal component for displaying detailed Pokémon information
 * @param {Object} props - Component props
 * @param {Object} props.pokemon - Pokémon data to display
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {Function} props.onShinyToggle - Function to toggle shiny state
 */
const PokemonModal = ({ pokemon, isOpen, onClose, onShinyToggle }) => {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [isShiny, setIsShiny] = useState(getIsShiny(pokemon));
  const [evolutionLoading, setEvolutionLoading] = useState(false);

  // Reset state when pokemon changes
  useEffect(() => {
    if (pokemon) {
      setPokemonDetails(null);
      setEvolutionChain([]);
      setActiveTab('stats');
      setIsShiny(getIsShiny(pokemon));
      setEvolutionLoading(false);
      fetchPokemonDetails();
    }
  }, [pokemon]);

  // Fetch evolution chain when evolution tab is active
  useEffect(() => {
    if (activeTab === 'evolution' && pokemonDetails && evolutionChain.length === 0) {
      fetchEvolutionChain();
    }
  }, [activeTab, pokemonDetails, evolutionChain.length]);

  /**
   * Fetch detailed Pokémon information
   */
  const fetchPokemonDetails = async () => {
    if (!pokemon) return;
    
    try {
      const details = await pokemonAPI.getPokemon(pokemon.id);
      setPokemonDetails(details);
    } catch (error) {
      console.error('Error fetching Pokémon details:', error);
    }
  };

  /**
   * Fetch evolution chain data
   */
  const fetchEvolutionChain = async () => {
    if (!pokemonDetails) return;
    
    setEvolutionLoading(true);
    try {
      const evolutionData = await pokemonAPI.getEvolutionChain(pokemon.id);
      setEvolutionChain(evolutionData.chain || [pokemonDetails]);
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
      setEvolutionChain([pokemonDetails]); // Fallback
    } finally {
      setEvolutionLoading(false);
    }
  };

  /**
   * Handle shiny toggle
   */
  const handleShinyToggle = () => {
    const newShinyState = !isShiny;
    setIsShiny(newShinyState);
    onShinyToggle(newShinyState);
  };

  // Don't render if modal is closed or no Pokémon
  if (!isOpen || !pokemon) return null;

  // Use detailed data if available, otherwise use basic Pokémon data
  const displayPokemon = pokemonDetails || pokemon;

  // Helper function to get stat icon
  const getStatIcon = (statName) => {
    const icons = {
      hp: <Heart size={14} className="text-red-400" />,
      attack: <Sword size={14} className="text-orange-400" />,
      defense: <Shield size={14} className="text-blue-400" />,
      'special-attack': <Zap size={14} className="text-yellow-400" />,
      'special-defense': <Shield size={14} className="text-green-400" />,
      speed: <Gauge size={14} className="text-purple-400" />
    };
    return icons[statName] || <Gauge size={14} />;
  };

  // Calculate base stat total
  const getBaseStatTotal = () => {
    return getPokemonStats(displayPokemon).reduce((total, stat) => total + (stat.base_stat || 0), 0);
  };

  // Get nature effect with icons
  const getNatureEffect = (nature) => {
    const natureEffects = {
      lonely: { plus: 'attack', minus: 'defense' },
      brave: { plus: 'attack', minus: 'speed' },
      adamant: { plus: 'attack', minus: 'special-attack' },
      naughty: { plus: 'attack', minus: 'special-defense' },
      bold: { plus: 'defense', minus: 'attack' },
      relaxed: { plus: 'defense', minus: 'speed' },
      impish: { plus: 'defense', minus: 'special-attack' },
      lax: { plus: 'defense', minus: 'special-defense' },
      timid: { plus: 'speed', minus: 'attack' },
      hasty: { plus: 'speed', minus: 'defense' },
      jolly: { plus: 'speed', minus: 'special-attack' },
      naive: { plus: 'speed', minus: 'special-defense' },
      modest: { plus: 'special-attack', minus: 'attack' },
      mild: { plus: 'special-attack', minus: 'defense' },
      quiet: { plus: 'special-attack', minus: 'speed' },
      rash: { plus: 'special-attack', minus: 'special-defense' },
      calm: { plus: 'special-defense', minus: 'attack' },
      gentle: { plus: 'special-defense', minus: 'defense' },
      sassy: { plus: 'special-defense', minus: 'speed' },
      careful: { plus: 'special-defense', minus: 'special-attack' },
      hardy: { plus: null, minus: null },
      docile: { plus: null, minus: null },
      serious: { plus: null, minus: null },
      bashful: { plus: null, minus: null },
      quirky: { plus: null, minus: null }
    };
    return natureEffects[nature] || { plus: null, minus: null };
  };

  const natureEffect = getNatureEffect(pokemon.nature);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#7f1d1d]/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#7f1d1d]/30">
          <div className="flex items-center gap-4">
            <img
              src={isShiny ? getPokemonShinySprite(displayPokemon) : getPokemonSprite(displayPokemon)}
              alt={getPokemonDisplayName(displayPokemon)}
              className="w-20 h-20 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {getPokemonDisplayName(displayPokemon)}
                {isShiny && <span className="text-[#fbbf24] ml-2">✨</span>}
              </h2>
              {/* Show form badge if applicable */}
              {displayPokemon.formName && displayPokemon.formName !== displayPokemon.name && (
                <div className="mb-1">
                  <span className="bg-[#8b5cf6] text-white text-xs px-2 py-1 rounded-full capitalize">
                    {displayPokemon.formName.replace(`${displayPokemon.name}-`, '').replace(/-/g, ' ')} Form
                  </span>
                </div>
              )}
              <div className="flex gap-2 mt-1">
                {getPokemonTypes(displayPokemon).map((type, index) => {
                  const typeName = type.type?.name || type.name || 'unknown';
                  return (
                    <span
                      key={`${typeName}-${index}`} // FIXED: Add index to make keys unique
                      className={`type-badge bg-${typeName} px-3 py-1`}
                    >
                      {typeName}
                    </span>
                  );
                })}
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

        {/* Tabs - ADDED MORE TABS */}
        <div className="border-b border-[#7f1d1d]/30">
          <div className="flex">
            {['team', 'stats', 'moves', 'info', 'evolution'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-medium transition-colors text-sm ${
                  activeTab === tab
                    ? 'text-[#ef4444] border-b-2 border-[#ef4444]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'team' && 'Team Data'}
                {tab === 'stats' && 'Stats'}
                {tab === 'moves' && 'Moves'}
                {tab === 'info' && 'Info'}
                {tab === 'evolution' && 'Evolution'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* NEW TEAM DATA TAB */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Crown size={20} />
                Team Configuration
              </h3>
              
              {/* Battle Configuration */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#141414] rounded-xl p-4 border border-[#7f1d1d]/20">
                    <h4 className="text-white font-semibold mb-3">Battle Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Level:</span>
                        <span className="text-white font-bold">{pokemon.level || 50}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nature:</span>
                        <span className="text-white font-bold capitalize">{pokemon.nature || 'hardy'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ability:</span>
                        <span className="text-white font-bold capitalize">{pokemon.ability || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nature Effect */}
                  {pokemon.nature && pokemon.nature !== 'hardy' && (
                    <div className="bg-[#141414] rounded-xl p-4 border border-[#7f1d1d]/20">
                      <h4 className="text-white font-semibold mb-3">Nature Effect</h4>
                      <div className="flex items-center justify-between">
                        {natureEffect.plus && (
                          <div className="flex items-center gap-2 text-green-400">
                            {getStatIcon(natureEffect.plus)}
                            <span className="text-sm capitalize">+{natureEffect.plus.replace('-', ' ')}</span>
                          </div>
                        )}
                        {natureEffect.minus && (
                          <div className="flex items-center gap-2 text-red-400">
                            {getStatIcon(natureEffect.minus)}
                            <span className="text-sm capitalize">-{natureEffect.minus.replace('-', ' ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Held Item */}
                  {pokemon.item && (
                    <div className="bg-[#141414] rounded-xl p-4 border border-[#7f1d1d]/20">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Sparkles size={16} />
                        Held Item
                      </h4>
                      <div className="text-center">
                        <span className="text-[#10b981] font-bold text-lg capitalize">
                          {pokemon.item.replace(/-/g, ' ')}
                        </span>
                        {pokemon.itemData?.effect && (
                          <p className="text-gray-400 text-sm mt-2">
                            {pokemon.itemData.effect}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Info */}
                  {pokemon.form && (
                    <div className="bg-[#141414] rounded-xl p-4 border border-[#7f1d1d]/20">
                      <h4 className="text-white font-semibold mb-3">Form Details</h4>
                      <div className="text-gray-400 text-sm">
                        <div className="flex gap-2 mb-2">
                          {pokemon.form.types.map((type, index) => (
                            <span key={`form-type-${index}`} className={`type-badge bg-${type} px-2 py-1 text-xs`}>
                              {type}
                            </span>
                          ))}
                        </div>
                        <p>Base Stats Total: {pokemon.form.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Calculated Stats Preview */}
              {pokemon.calculatedStats && Object.keys(pokemon.calculatedStats).length > 0 && (
                <div className="bg-[#141414] rounded-xl p-4 border border-[#7f1d1d]/20">
                  <h4 className="text-white font-semibold mb-4">Final Stats (Lv. {pokemon.level || 50})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(pokemon.calculatedStats).map(([stat, value]) => (
                      <div key={stat} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatIcon(stat)}
                          <span className="text-gray-400 text-sm capitalize">
                            {stat.replace('_', ' ')}:
                          </span>
                        </div>
                        <span className="text-white font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Base Stats</h3>
                <div className="text-gray-400 text-sm">
                  Total: <span className="text-white font-bold">{getBaseStatTotal()}</span>
                </div>
              </div>
              
              {getPokemonStats(displayPokemon).map((stat, index) => {
                const statName = stat.name || stat.stat?.name || 'unknown';
                const baseStat = stat.base_stat || 0;
                return (
                  <div key={`${statName}-${index}`} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 w-40">
                      {getStatIcon(statName)}
                      <span className="text-gray-400 capitalize text-sm">
                        {statName.replace('_', ' ')}:
                      </span>
                    </div>
                    <div className="flex-1 bg-[#141414] rounded-full h-3">
                      <div
                        className="bg-[#ef4444] h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (baseStat / 255) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-white font-bold w-8 text-sm">
                      {baseStat}
                    </span>
                  </div>
                );
              })}
              
              {/* Physical Attributes */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#7f1d1d]/30">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Height</p>
                  <p className="text-white font-bold">
                    {getPokemonHeightInMeters(displayPokemon).toFixed(1)} m
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="text-white font-bold">
                    {getPokemonWeightInKg(displayPokemon).toFixed(1)} kg
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Base EXP</p>
                  <p className="text-white font-bold">
                    {getPokemonBaseExp(displayPokemon)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NEW MOVES TAB */}
          {activeTab === 'moves' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Moveset</h3>
              
              {pokemon.moves && pokemon.moves.filter(m => m.name !== '---').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pokemon.moves.map((move, index) => (
                    move.name !== '---' && (
                      <div key={`${move.name}-${index}`} className="bg-[#141414] rounded-xl p-4 border border-[#7f1d1d]/20">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-bold capitalize text-lg">{move.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`type-badge bg-${move.type} px-2 py-1 text-xs`}>
                                {move.type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                move.category === 'physical' ? 'bg-red-500' :
                                move.category === 'special' ? 'bg-blue-500' :
                                'bg-gray-500'
                              } text-white`}>
                                {move.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {move.power > 0 && (
                              <div className="text-white text-sm">Power: {move.power}</div>
                            )}
                            <div className="text-gray-400 text-sm">Acc: {move.accuracy}%</div>
                            <div className="text-gray-400 text-sm">PP: {move.pp}</div>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{move.description}</p>
                        {move.learnMethod && (
                          <div className={`text-xs mt-2 ${
                            move.learnMethod === 'machine' ? 'text-blue-400' : 'text-yellow-400'
                          }`}>
                            {move.learnMethod === 'machine' 
                              ? `TM${move.tmNumber || ''}`
                              : `Learned at Lv. ${move.levelLearned}`
                            }
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No moves configured for this Pokémon.
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Pokémon Information</h3>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Abilities</h4>
                <div className="space-y-2">
                  {getPokemonAbilities(displayPokemon).map((ability, index) => {
                    const abilityName = ability.name || ability.ability?.name || 'unknown';
                    const isHidden = ability.is_hidden || false;
                    return (
                      <div
                        key={`${abilityName}-${index}`}
                        className="bg-[#141414] rounded-lg p-3 border border-[#7f1d1d]/20"
                      >
                        <span className="text-white capitalize">
                          {abilityName.replace('-', ' ')}
                        </span>
                        {isHidden && (
                          <span className="text-[#fbbf24] text-sm ml-2">(Hidden)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {getPokemonMoves(displayPokemon).length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Available Moves</h4>
                  <div className="flex flex-wrap gap-2">
                    {getPokemonMoves(displayPokemon).slice(0, 12).map((move, index) => {
                      const moveName = move.name || move.move?.name || 'unknown';
                      return (
                        <span
                          key={`${moveName}-${index}`}
                          className="bg-[#141414] text-white text-sm px-3 py-1 rounded-full border border-[#7f1d1d]/20"
                        >
                          {moveName.replace('-', ' ')}
                        </span>
                      );
                    })}
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
                    <React.Fragment key={`${evo.id}-${index}`}>
                      <div className={`text-center group hover:scale-105 transition-transform duration-200 ${
                        evo.id === displayPokemon.id ? 'ring-2 ring-[#ef4444] rounded-xl p-2 bg-[#1a1a1a]' : ''
                      }`}>
                        <img
                          src={getPokemonSprite(evo)}
                          alt={getPokemonName(evo)}
                          className="w-20 h-20 object-contain mx-auto mb-2"
                        />
                        <p className="text-white capitalize font-semibold">{getPokemonName(evo)}</p>
                        <p className="text-gray-400 text-sm">#{evo.id?.toString().padStart(3, '0') || '???'}</p>
                        <div className="flex justify-center gap-1 mt-1">
                          {getPokemonTypes(evo).map((type, typeIndex) => {
                            const typeName = type.type?.name || type.name || 'unknown';
                            return (
                              <span
                                key={`${typeName}-${typeIndex}`}
                                className={`type-badge bg-${typeName} text-xs px-2 py-0.5`}
                              >
                                {typeName}
                              </span>
                            );
                          })}
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
              ) : (
                <div className="text-center py-8">
                  <div className="bg-[#141414] rounded-xl p-6 border border-[#7f1d1d]/20">
                    <img
                      src={getPokemonSprite(displayPokemon)}
                      alt={getPokemonName(displayPokemon)}
                      className="w-24 h-24 object-contain mx-auto mb-4"
                    />
                    <h4 className="text-white font-bold text-lg capitalize mb-2">
                      {getPokemonName(displayPokemon)}
                    </h4>
                    <p className="text-gray-400">
                      This Pokémon does not evolve.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      #{displayPokemon.id?.toString().padStart(3, '0') || '???'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#7f1d1d]/30 bg-[#141414]">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">
              Pokédex ID: #{displayPokemon.id?.toString().padStart(3, '0') || '???'}
            </span>
            <span className="text-gray-400">
              Base EXP: {getPokemonBaseExp(displayPokemon)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonModal;