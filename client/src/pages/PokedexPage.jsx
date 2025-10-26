import React, { useState, useEffect, useMemo } from 'react';
import { usePokemon } from '../contexts/PokemonContext';
import { getPokemonSprite, getPokemonDisplayName, getPokemonTypes } from '../utils/pokemonData';
import { pokemonAPI } from '../utils/api';

// Region definitions with Pokémon ranges
const REGIONS = {
  kanto: { name: 'Kanto', range: [1, 151] },
  johto: { name: 'Johto', range: [152, 251] },
  hoenn: { name: 'Hoenn', range: [252, 386] },
  sinnoh: { name: 'Sinnoh', range: [387, 493] },
  unova: { name: 'Unova', range: [494, 649] },
  kalos: { name: 'Kalos', range: [650, 721] },
  alola: { name: 'Alola', range: [722, 809] },
  galar: { name: 'Galar', range: [810, 898] },
  paldea: { name: 'Paldea', range: [899, 1025] }
};

// Pokémon types for filtering
const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Generate Pokémon IDs for each region
const generatePokemonIdsForRegion = (region) => {
  const ids = [];
  for (let i = region.range[0]; i <= region.range[1]; i++) {
    ids.push(i);
  }
  return ids;
};

const PokedexPage = () => {
  const { addToTeam } = usePokemon();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('kanto');
  const [selectedType, setSelectedType] = useState('all');
  const [pokemonData, setPokemonData] = useState({});
  const [loadingPokemon, setLoadingPokemon] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);

  // Get the current region's Pokémon IDs
  const currentRegionPokemonIds = useMemo(() => {
    return generatePokemonIdsForRegion(REGIONS[selectedRegion]);
  }, [selectedRegion]);

  // Load Pokémon data for the current region
  useEffect(() => {
    const loadRegionPokemon = async () => {
      setIsInitializing(true);
      
      // Create loading states for all Pokémon in the region
      const loadingStates = {};
      currentRegionPokemonIds.forEach(id => {
        loadingStates[id] = true;
      });
      setLoadingPokemon(loadingStates);

      // Load Pokémon data in batches to avoid overwhelming the API
      const batchSize = 20;
      const batches = [];
      
      for (let i = 0; i < currentRegionPokemonIds.length; i += batchSize) {
        batches.push(currentRegionPokemonIds.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const promises = batch.map(async (id) => {
          try {
            // Only fetch if we don't already have the data
            if (!pokemonData[id]) {
              const data = await pokemonAPI.getPokemon(id);
              if (data) {
                setPokemonData(prev => ({ ...prev, [id]: data }));
              }
            }
          } catch (error) {
            console.error(`Error loading Pokémon ${id}:`, error);
          } finally {
            setLoadingPokemon(prev => ({ ...prev, [id]: false }));
          }
        });

        await Promise.all(promises);
        // Small delay between batches to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setIsInitializing(false);
    };

    loadRegionPokemon();
  }, [selectedRegion]);

  // Filter Pokémon based on search and type
  const filteredPokemon = useMemo(() => {
    const regionPokemon = currentRegionPokemonIds
      .map(id => pokemonData[id])
      .filter(Boolean); // Remove undefined/null

    let filtered = regionPokemon;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pokemon.id.toString().includes(searchQuery)
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(pokemon => {
        const types = getPokemonTypes(pokemon);
        return types.some(type => 
          type.type?.name === selectedType || type === selectedType
        );
      });
    }

    return filtered;
  }, [pokemonData, currentRegionPokemonIds, searchQuery, selectedType]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddToTeam = async (pokemon) => {
    const success = await addToTeam(pokemon);
    if (success) {
      alert(`${getPokemonDisplayName(pokemon)} added to your team!`);
    } else {
      alert('Your team is full! Remove a Pokémon first.');
    }
  };

  // Check if any Pokémon in current region are still loading
  const isRegionLoading = currentRegionPokemonIds.some(id => loadingPokemon[id]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#f87171] to-[#ef4444] bg-clip-text text-transparent">Pokédex</h1>
        <p className="text-gray-400 mb-8">Explore all Pokémon across different regions</p>

        {/* Search and Filters */}
        <div className="pokemon-card p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${REGIONS[selectedRegion].name} Pokémon...`}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-4 bg-[#1a1a1a] border border-[#7f1d1d]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] transition-all duration-300"
            />
          </div>

          {/* Quick Select Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Region Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#ef4444]">Regions</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(REGIONS).map(([key, region]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedRegion(key);
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedRegion === key 
                        ? 'bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/25' 
                        : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#141414] border border-[#7f1d1d]/30 hover:border-[#ef4444]/50'
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#ef4444]">Types</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedType === 'all' 
                      ? 'bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/25' 
                      : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#141414] border border-[#7f1d1d]/30 hover:border-[#ef4444]/50'
                  }`}
                >
                  All Types
                </button>
                {POKEMON_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedType === type 
                        ? 'bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/25' 
                        : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#141414] border border-[#7f1d1d]/30 hover:border-[#ef4444]/50'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isInitializing || isRegionLoading) && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4444] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading {REGIONS[selectedRegion].name} Pokémon...</p>
            </div>
          </div>
        )}

        {/* Pokémon Grid */}
        {!isInitializing && (
          <div className="pokemon-card p-6">
            <h2 className="text-2xl font-bold mb-6 text-[#ef4444] border-b border-[#7f1d1d]/30 pb-2">
              {REGIONS[selectedRegion].name} Pokémon 
              <span className="text-gray-400 text-lg ml-2">
                ({filteredPokemon.length} of {currentRegionPokemonIds.length})
              </span>
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredPokemon.map(pokemon => (
                <div
                  key={pokemon.id}
                  className="pokemon-card p-4 hover:border-[#ef4444]/50 transition-all duration-300 group"
                >
                  {/* Pokémon Sprite */}
                  <div className="relative">
                    <img
                      src={getPokemonSprite(pokemon)}
                      alt={getPokemonDisplayName(pokemon)}
                      className="w-24 h-24 mx-auto group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder-pokemon.png';
                      }}
                    />
                    <div className="absolute top-0 right-0 bg-[#1a1a1a] text-white text-xs px-2 py-1 rounded-full border border-[#7f1d1d]/30">
                      #{pokemon.id}
                    </div>
                  </div>

                  {/* Pokémon Info */}
                  <div className="text-center mt-3">
                    <h3 className="font-semibold text-white capitalize">
                      {getPokemonDisplayName(pokemon)}
                    </h3>
                    
                    {/* Types */}
                    <div className="flex justify-center gap-1 mt-2">
                      {getPokemonTypes(pokemon).map((type, index) => {
                        const typeName = type.type?.name || type;
                        return (
                          <span
                            key={index}
                            className="type-badge bg-[#1a1a1a] border-[#7f1d1d]/30 text-gray-300 capitalize"
                          >
                            {typeName}
                          </span>
                        );
                      })}
                    </div>

                    {/* Add to Team Button */}
                    <button
                      onClick={() => handleAddToTeam(pokemon)}
                      className="btn-primary mt-3 w-full py-2 text-sm"
                    >
                      Add to Team
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredPokemon.length === 0 && !isInitializing && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-400">No Pokémon found.</p>
                <p className="text-gray-500">
                  {searchQuery ? 'Try a different search term.' : 'Loading Pokémon...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PokedexPage;