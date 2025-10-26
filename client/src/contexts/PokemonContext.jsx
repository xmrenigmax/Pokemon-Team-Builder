import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pokemonAPI } from '../utils/api';
import { createBattlePokemon } from '../utils/pokemonData';

const PokemonContext = createContext();

export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (!context) {
    throw new Error('usePokemon must be used within a PokemonProvider');
  }
  return context;
};

export const PokemonProvider = ({ children }) => {
  const [team, setTeam] = useState(Array(6).fill(null));
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load team from localStorage on mount
  useEffect(() => {
    const savedTeam = localStorage.getItem('pokemonTeam');
    if (savedTeam) {
      try {
        const parsedTeam = JSON.parse(savedTeam);
        // Ensure we always have exactly 6 slots
        const filledTeam = [...parsedTeam];
        while (filledTeam.length < 6) filledTeam.push(null);
        while (filledTeam.length > 6) filledTeam.pop();
        setTeam(filledTeam);
      } catch (error) {
        console.error('Error loading team from storage:', error);
        setTeam(Array(6).fill(null));
      }
    }
  }, []);

  // Save team to localStorage when team changes
  useEffect(() => {
    // Only save non-null team members with their full data
    const teamToSave = team.map(pokemon => {
      if (!pokemon) return null;
      
      return {
        id: pokemon.id,
        name: pokemon.name,
        sprites: pokemon.sprites,
        types: pokemon.types,
        stats: pokemon.stats,
        abilities: pokemon.abilities,
        height: pokemon.height,
        weight: pokemon.weight,
        base_experience: pokemon.base_experience,
        // Battle data
        level: pokemon.level || 50,
        nature: pokemon.nature || 'hardy',
        ability: pokemon.ability,
        moves: pokemon.moves || createEmptyMoves(),
        item: pokemon.item || '',
        itemData: pokemon.itemData || null,
        form: pokemon.form || null,
        formName: pokemon.formName || null,
        calculatedStats: pokemon.calculatedStats || {},
        _isShiny: pokemon._isShiny || false
      };
    });
    
    localStorage.setItem('pokemonTeam', JSON.stringify(teamToSave));
  }, [team]);

  const searchPokemon = useCallback(async (query) => {
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
   * Add battle-ready Pokémon to team
   */
  const addToTeam = useCallback(async (pokemon, options = {}) => {
    // Find first empty slot
    const emptySlotIndex = team.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) return false; // Team is full

    try {
      // Get battle-ready Pokémon data with options
      const battlePokemon = await pokemonAPI.getBattlePokemon(pokemon.id, options);
      
      if (battlePokemon) {
        const enhancedPokemon = {
          ...battlePokemon,
          _isShiny: pokemon._isShiny || false,
          // Ensure all options are applied
          level: options.level || 50,
          nature: options.nature || 'hardy',
          ability: options.ability || battlePokemon.ability,
          moves: options.moves || battlePokemon.moves,
          item: options.item || '',
          itemData: options.itemData || null,
          form: options.form || null,
          formName: options.formName || null
        };
        
        setTeam(prev => {
          const newTeam = [...prev];
          newTeam[emptySlotIndex] = enhancedPokemon;
          return newTeam;
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding battle Pokémon:', error);
      // Fallback to basic Pokémon with options
      const basicPokemon = createBattlePokemon(pokemon, options);
      setTeam(prev => {
        const newTeam = [...prev];
        newTeam[emptySlotIndex] = basicPokemon;
        return newTeam;
      });
      return true;
    }
  }, [team]);

  /**
   * Update Pokémon in team with full settings
   */
  const updatePokemon = useCallback((index, updates) => {
    setTeam(prev => prev.map((pokemon, i) => 
      i === index && pokemon ? { ...pokemon, ...updates } : pokemon
    ));
  }, []);

  /**
   * Remove Pokémon from team
   */
  const removeFromTeam = useCallback((index) => {
    setTeam(prev => {
      const newTeam = [...prev];
      newTeam[index] = null;
      return newTeam;
    });
  }, []);

  /**
   * Get number of empty slots
   */
  const getEmptySlots = useCallback(() => {
    return team.filter(slot => slot === null).length;
  }, [team]);

  const value = {
    team,
    searchResults,
    loading,
    searchPokemon,
    addToTeam,
    updatePokemon,
    removeFromTeam,
    getEmptySlots,
    setTeam,
  };

  return (
    <PokemonContext.Provider value={value}>
      {children}
    </PokemonContext.Provider>
  );
};

// Helper function for empty moves
const createEmptyMoves = () => [
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' },
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' },
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' },
  { name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' }
];
