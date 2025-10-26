import React, { useState, useEffect } from 'react';
import { pokemonAPI } from '../utils/api';

const TypeShowcasePage = () => {
  const [typeData, setTypeData] = useState({});
  const [selectedType, setSelectedType] = useState('fire');
  const [isLoading, setIsLoading] = useState(true);

  const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const TYPE_COLORS = {
    normal: 'bg-gray-400',
    fire: 'bg-[#ef4444]',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-300',
    fighting: 'bg-[#dc2626]',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-300',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300'
  };

  useEffect(() => {
    const loadTypeData = async () => {
      setIsLoading(true);
      try {
        const data = await pokemonAPI.getTypes();
        setTypeData(data);
      } catch (error) {
        console.error('Error loading type data:', error);
        setTypeData(getFallbackTypeData());
      } finally {
        setIsLoading(false);
      }
    };

    loadTypeData();
  }, []);

  const getFallbackTypeData = () => {
    const fallbackData = {};
    POKEMON_TYPES.forEach(type => {
      fallbackData[type] = {
        double_damage_from: [],
        double_damage_to: [],
        half_damage_from: [],
        half_damage_to: [],
        no_damage_from: [],
        no_damage_to: []
      };
    });

    // Add basic relationships for demonstration
    fallbackData.fire.double_damage_to = ['grass', 'ice', 'bug', 'steel'];
    fallbackData.fire.double_damage_from = ['water', 'ground', 'rock'];
    fallbackData.fire.half_damage_from = ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'];
    
    fallbackData.water.double_damage_to = ['fire', 'ground', 'rock'];
    fallbackData.water.double_damage_from = ['electric', 'grass'];
    fallbackData.water.half_damage_from = ['fire', 'water', 'ice', 'steel'];
    
    return fallbackData;
  };

  const getCurrentTypeData = () => {
    return typeData[selectedType] || {};
  };

  const TypeCard = ({ type }) => {
    const isSelected = selectedType === type;
    return (
      <button
        onClick={() => setSelectedType(type)}
        className={`${TYPE_COLORS[type]} ${
          isSelected ? 'ring-4 ring-[#ef4444] transform scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'
        } text-white font-bold py-6 px-4 rounded-2xl transition-all duration-300 capitalize text-lg shadow-lg flex items-center justify-center min-h-[80px] border border-white/20`}
      >
        <span className="text-shadow">{type}</span>
      </button>
    );
  };

  const EffectivenessSection = ({ title, types, color, description }) => (
    <div className={`pokemon-card p-6 transform hover:scale-[1.02] transition-all duration-300 hover:border-[#ef4444]/50 ${color}`}>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-3">
        {types.length > 0 ? (
          types.map(type => (
            <span
              key={type}
              className={`${TYPE_COLORS[type]} px-4 py-2 rounded-full text-white font-medium text-sm shadow-md capitalize border border-white/20`}
            >
              {type}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">None</span>
        )}
      </div>
    </div>
  );

  const TypeMatchupCard = ({ type, multiplier, description }) => {
    const getCardColor = () => {
      if (multiplier >= 2) return 'bg-gradient-to-br from-[#ef4444] to-[#dc2626]';
      if (multiplier === 1) return 'bg-gradient-to-br from-[#1a1a1a] to-[#141414]';
      if (multiplier > 0) return 'bg-gradient-to-br from-[#991b1b] to-[#7f1d1d]';
      return 'bg-gradient-to-br from-[#141414] to-black';
    };

    return (
      <div className={`${getCardColor()} rounded-xl p-4 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-[#7f1d1d]/30`}>
        <div className={`${TYPE_COLORS[type]} w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center shadow-md border border-white/20`}>
          <span className="text-white font-bold text-xs">{type.charAt(0).toUpperCase()}</span>
        </div>
        <div className="text-white font-bold text-lg mb-1">{multiplier}×</div>
        <div className="text-white text-xs opacity-90 capitalize">{type}</div>
        <div className="text-white text-xs mt-2 opacity-75">{description}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ef4444] mb-4"></div>
            <p className="text-gray-300">Loading type data...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentData = getCurrentTypeData();

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#f87171] to-[#ef4444] bg-clip-text text-transparent">
            Type Matchups
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover how Pokémon types interact. Select a type to see its strengths and weaknesses.
          </p>
        </div>

        {/* Type Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#ef4444]">
            Choose a Type
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-3">
            {POKEMON_TYPES.map(type => (
              <TypeCard key={type} type={type} />
            ))}
          </div>
        </div>

        {/* Selected Type Showcase */}
        <div className="mb-12 text-center">
          <div className={`inline-block ${TYPE_COLORS[selectedType]} text-white px-8 py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20`}>
            <h2 className="text-3xl font-bold capitalize">{selectedType} Type</h2>
          </div>
        </div>

        {/* Defensive Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#ef4444] mb-2">Defensive</h3>
            <p className="text-gray-300">How well {selectedType} type defends against attacks</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <EffectivenessSection
              title="Weak Against"
              types={currentData.double_damage_from || []}
              color="border-l-4 border-l-[#ef4444]"
              description="Takes double damage from these types"
            />
            <EffectivenessSection
              title="Resistant To"
              types={currentData.half_damage_from || []}
              color="border-l-4 border-l-[#991b1b]"
              description="Takes half damage from these types"
            />
            <EffectivenessSection
              title="Immune To"
              types={currentData.no_damage_from || []}
              color="border-l-4 border-l-[#1a1a1a]"
              description="Takes no damage from these types"
            />
          </div>

          {/* Defensive Matchups Grid */}
          <div className="pokemon-card p-8">
            <h4 className="text-2xl font-bold text-center mb-6 text-[#ef4444]">Defensive Matchups</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
              {POKEMON_TYPES.map(attackingType => {
                const data = typeData[selectedType];
                let multiplier = 1;
                let description = "Normal";

                if (data) {
                  if (data.double_damage_from.includes(attackingType)) {
                    multiplier = 2;
                    description = "Weak";
                  } else if (data.half_damage_from.includes(attackingType)) {
                    multiplier = 0.5;
                    description = "Resistant";
                  } else if (data.no_damage_from.includes(attackingType)) {
                    multiplier = 0;
                    description = "Immune";
                  }
                }

                return (
                  <TypeMatchupCard
                    key={attackingType}
                    type={attackingType}
                    multiplier={multiplier}
                    description={description}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Offensive Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#ef4444] mb-2">Offensive</h3>
            <p className="text-gray-300">How effective {selectedType} type attacks are</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <EffectivenessSection
              title="Super Effective Against"
              types={currentData.double_damage_to || []}
              color="border-l-4 border-l-[#dc2626]"
              description="Deals double damage to these types"
            />
            <EffectivenessSection
              title="Not Very Effective Against"
              types={currentData.half_damage_to || []}
              color="border-l-4 border-l-[#7f1d1d]"
              description="Deals half damage to these types"
            />
            <EffectivenessSection
              title="No Effect Against"
              types={currentData.no_damage_to || []}
              color="border-l-4 border-l-[#1a1a1a]"
              description="Deals no damage to these types"
            />
          </div>

          {/* Offensive Matchups Grid */}
          <div className="pokemon-card p-8">
            <h4 className="text-2xl font-bold text-center mb-6 text-[#ef4444]">Offensive Matchups</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
              {POKEMON_TYPES.map(defendingType => {
                const data = typeData[selectedType];
                let multiplier = 1;
                let description = "Normal";

                if (data) {
                  if (data.double_damage_to.includes(defendingType)) {
                    multiplier = 2;
                    description = "Super Effective";
                  } else if (data.half_damage_to.includes(defendingType)) {
                    multiplier = 0.5;
                    description = "Not Very Effective";
                  } else if (data.no_damage_to.includes(defendingType)) {
                    multiplier = 0;
                    description = "No Effect";
                  }
                }

                return (
                  <TypeMatchupCard
                    key={defendingType}
                    type={defendingType}
                    multiplier={multiplier}
                    description={description}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="pokemon-card p-8">
          <h3 className="text-2xl font-bold text-center mb-6 text-[#ef4444]">Effectiveness Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { multiplier: '2×', label: 'Super Effective', color: 'from-[#ef4444] to-[#dc2626]', desc: 'Deals double damage' },
              { multiplier: '1×', label: 'Normal', color: 'from-[#1a1a1a] to-[#141414]', desc: 'Standard damage' },
              { multiplier: '½×', label: 'Not Very Effective', color: 'from-[#991b1b] to-[#7f1d1d]', desc: 'Halves damage' },
              { multiplier: '0×', label: 'No Effect', color: 'from-[#141414] to-black', desc: 'No damage dealt' },
              { multiplier: '4×', label: 'Double Weakness', color: 'from-[#dc2626] to-[#991b1b]', desc: 'Quadruple damage' }
            ].map((item, index) => (
              <div key={index} className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-center text-white shadow-lg border border-[#7f1d1d]/30`}>
                <div className="text-2xl font-bold mb-2">{item.multiplier}</div>
                <div className="font-semibold mb-1">{item.label}</div>
                <div className="text-xs opacity-80">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeShowcasePage;