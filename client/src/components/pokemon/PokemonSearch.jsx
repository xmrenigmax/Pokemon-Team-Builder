import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { usePokemon } from '../../contexts/PokemonContext';
import PokemonCard from './PokemonCard';

const PokemonSearch = () => {
  const { searchPokemon, searchResults, loading, getEmptySlots } = usePokemon();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Search when debounced query changes
  useEffect(() => {
    searchPokemon(debouncedQuery);
  }, [debouncedQuery, searchPokemon]);

  const canAddToTeam = getEmptySlots() > 0;

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#7f1d1d]/30">
      <h2 className="text-2xl font-bold text-white mb-4">Add Pokémon</h2>
      
      {/* Team Status */}
      <div className="mb-4">
        {!canAddToTeam ? (
          <div className="bg-[#991b1b]/20 border border-[#ef4444]/30 rounded-xl p-3">
            <p className="text-[#ef4444] text-sm text-center">
              Team is full! Remove a Pokémon to add more.
            </p>
          </div>
        ) : (
          <div className="bg-[#059669]/20 border border-[#10b981]/30 rounded-xl p-3">
            <p className="text-[#10b981] text-sm text-center">
              {getEmptySlots()} slot{getEmptySlots() !== 1 ? 's' : ''} available
            </p>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search Pokémon by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#141414] border border-[#7f1d1d]/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ef4444]/50 transition-colors"
        />
        {loading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-[#ef4444]" size={20} />
        )}
      </div>

      {/* Search Results */}
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin text-[#ef4444] mr-2" size={20} />
            <span className="text-gray-400">Searching...</span>
          </div>
        )}

        {!loading && searchResults.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            disabled={!canAddToTeam}
          />
        ))}
        
        {!loading && debouncedQuery && searchResults.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No Pokémon found for "{debouncedQuery}"
          </p>
        )}

        {!loading && !debouncedQuery && (
          <p className="text-gray-400 text-center py-4">
            Start typing to search Pokémon...
          </p>
        )}
      </div>
    </div>
  );
};

export default PokemonSearch;