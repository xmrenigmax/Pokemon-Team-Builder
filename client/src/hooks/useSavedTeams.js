
import { useState, useEffect } from 'react';
import { normalizeLoadedPokemon } from '../utils/pokemonData';

export const useSavedTeams = () => {
  const [savedTeams, setSavedTeams] = useState([]);

  // Load saved teams from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('savedPokemonTeams');
    if (stored) {
      try {
        const parsedTeams = JSON.parse(stored);
        // Ensure all Pokémon data is properly normalized
        const normalizedTeams = parsedTeams.map(team => ({
          ...team,
          pokemon: team.pokemon.map(pokemon => normalizeLoadedPokemon(pokemon))
        }));
        setSavedTeams(normalizedTeams);
      } catch (error) {
        console.error('Error loading saved teams:', error);
        setSavedTeams([]);
      }
    }
  }, []);

  // Save to localStorage whenever savedTeams changes
  useEffect(() => {
    if (savedTeams.length > 0) {
      localStorage.setItem('savedPokemonTeams', JSON.stringify(savedTeams));
    }
  }, [savedTeams]);

  const saveCurrentTeam = (team, teamName) => {
    if (!teamName?.trim() || team.filter(p => p).length === 0) {
      return null;
    }

    const newTeam = {
      id: Date.now(),
      name: teamName,
      pokemon: team.filter(p => p).map(pokemon => ({
        // Preserve ALL Pokémon data including forms, shiny status, etc.
        id: pokemon.id,
        name: pokemon.name,
        sprites: pokemon.sprites,
        types: pokemon.types,
        stats: pokemon.stats,
        abilities: pokemon.abilities,
        height: pokemon.height,
        weight: pokemon.weight,
        base_experience: pokemon.base_experience,
        moves: pokemon.moves,
        // Battle data
        level: pokemon.level || 50,
        nature: pokemon.nature || 'hardy',
        ability: pokemon.ability,
        item: pokemon.item || '',
        itemData: pokemon.itemData || null,
        // Form data - CRITICAL: preserve form information
        form: pokemon.form || null,
        formName: pokemon.formName || null,
        calculatedStats: pokemon.calculatedStats || {},
        // Visual data
        _isShiny: pokemon._isShiny || false,
        // Battle HP
        hp: pokemon.hp || calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50),
        maxHp: pokemon.maxHp || calculateHP(getPokemonStat(pokemon, 'hp'), pokemon.level || 50)
      })),
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    setSavedTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const deleteSavedTeam = (teamId) => {
    setSavedTeams(prev => prev.filter(t => t.id !== teamId));
  };

  // Clear all saved teams (optional utility)
  const clearAllTeams = () => {
    setSavedTeams([]);
    localStorage.removeItem('savedPokemonTeams');
  };

  return {
    savedTeams,
    saveCurrentTeam,
    deleteSavedTeam,
    clearAllTeams
  };
};

// Helper functions
const calculateHP = (base, level = 50, iv = 31, ev = 0) => {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
};

const getPokemonStat = (pokemon, statName) => {
  const stats = pokemon.stats || [];
  const stat = stats.find(s => 
    s.stat?.name === statName || s.name === statName
  );
  return stat?.base_stat || 0;
};