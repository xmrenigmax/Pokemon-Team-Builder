import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pokemonAPI } from '../utils/api';

const PokemonContext = createContext();

/**
 * Custom hook to access Pokémon context
 * @returns {Object} Pokémon context value
 */
export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (!context) {
    throw new Error('usePokemon must be used within a PokemonProvider');
  }
  return context;
};

export const PokemonProvider = ({ children }) => {
  const [team, setTeam] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load team from localStorage on mount
  useEffect(() => {
    const savedTeam = localStorage.getItem('pokemonTeam');
    if (savedTeam) {
      const parsedTeam = JSON.parse(savedTeam);
      setTeam(parsedTeam);
    }
  }, []);

  // Save team to localStorage when team changes
  useEffect(() => {
    localStorage.setItem('pokemonTeam', JSON.stringify(team));
  }, [team]);

  /**
   * Search for Pokémon by query
   * @param {string} query - Search term
   */
  const searchPokemon = useCallback(async (query) => {
    // Immediately clear results if query is empty
    if (!query?.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const results = await pokemonAPI.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add Pokémon to team
   * @param {Object} pokemon - Pokémon to add
   */
  const addToTeam = useCallback((pokemon) => {
    if (team.length < 6) {
      const pokemonWithShiny = {
        ...pokemon,
        _isShiny: pokemon._isShiny || false // Ensure _isShiny property exists
      };
      setTeam(prev => [...prev, pokemonWithShiny]);
    }
  }, [team.length]);

  /**
   * Remove Pokémon from team by index
   * @param {number} index - Index of Pokémon to remove
   */
  const removeFromTeam = useCallback((index) => {
    setTeam(prev => prev.filter((_, i) => i !== index));
  }, []);

  const value = {
    team,
    searchResults,
    loading,
    searchPokemon,
    addToTeam,
    removeFromTeam,
    setTeam,
  };

  return (
    <PokemonContext.Provider value={value}>
      {children}
    </PokemonContext.Provider>
  );
};