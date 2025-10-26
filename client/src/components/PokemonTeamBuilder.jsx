import React, { useState, useEffect } from 'react';
import './PokemonTeamBuilder.css';

const PokemonTeamBuilder = () => {
  const [team, setTeam] = useState(Array(6).fill(null));
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Pokémon from PokeAPI
  const searchPokemon = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
      const data = await response.json();
      
      const filtered = data.results.filter(pokemon => 
        pokemon.name.includes(query.toLowerCase())
      ).slice(0, 10);
      
      const detailedPokemon = await Promise.all(
        filtered.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return res.json();
        })
      );
      
      setSearchResults(detailedPokemon);
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
    }
    setLoading(false);
  };

  // Add Pokémon to team
  const addToTeam = (pokemon, slotIndex) => {
    const newTeam = [...team];
    newTeam[slotIndex] = pokemon;
    setTeam(newTeam);
    // Save to localStorage
    localStorage.setItem('pokemonTeam', JSON.stringify(newTeam));
  };

  // Remove Pokémon from team
  const removeFromTeam = (slotIndex) => {
    const newTeam = [...team];
    newTeam[slotIndex] = null;
    setTeam(newTeam);
    localStorage.setItem('pokemonTeam', JSON.stringify(newTeam));
  };

  // Calculate type effectiveness
  const calculateTypeCoverage = () => {
    const allTypes = team
      .filter(pokemon => pokemon)
      .flatMap(pokemon => pokemon.types.map(t => t.type.name));
    
    return [...new Set(allTypes)];
  };

  // Load team from localStorage on mount
  useEffect(() => {
    const savedTeam = localStorage.getItem('pokemonTeam');
    if (savedTeam) {
      setTeam(JSON.parse(savedTeam));
    }
  }, []);

  // Search when term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) searchPokemon(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="team-builder">
      <header className="builder-header">
        <h1>🚀 Pokémon Team Builder</h1>
        <p>Build your perfect team of 6 Pokémon</p>
      </header>

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        {loading && <div className="loading">Searching...</div>}
        
        <div className="search-results">
          {searchResults.map(pokemon => (
            <div 
              key={pokemon.id} 
              className="pokemon-card"
              onClick={() => {
                const emptySlot = team.findIndex(slot => slot === null);
                if (emptySlot !== -1) addToTeam(pokemon, emptySlot);
              }}
            >
              <img 
                src={pokemon.sprites.front_default} 
                alt={pokemon.name}
                className="pokemon-sprite"
              />
              <h3>{pokemon.name}</h3>
              <div className="types">
                {pokemon.types.map(type => (
                  <span key={type.type.name} className={`type ${type.type.name}`}>
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Display */}
      <div className="team-section">
        <h2>Your Team</h2>
        <div className="team-slots">
          {team.map((pokemon, index) => (
            <div key={index} className="team-slot">
              {pokemon ? (
                <div className="team-pokemon">
                  <img 
                    src={pokemon.sprites.front_default} 
                    alt={pokemon.name}
                  />
                  <h4>{pokemon.name}</h4>
                  <div className="types">
                    {pokemon.types.map(type => (
                      <span key={type.type.name} className={`type ${type.type.name}`}>
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => removeFromTeam(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="empty-slot">
                  <span>Slot {index + 1}</span>
                  <small>Click a Pokémon to add</small>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Analysis */}
      <div className="analysis-section">
        <h2>Team Analysis</h2>
        <div className="coverage">
          <h3>Type Coverage</h3>
          <div className="type-list">
            {calculateTypeCoverage().map(type => (
              <span key={type} className={`type ${type}`}>
                {type}
              </span>
            ))}
          </div>
        </div>
        
        <div className="team-stats">
          <h3>Team Stats</h3>
          <p>Pokémon in team: {team.filter(p => p).length}/6</p>
          <p>Unique types: {calculateTypeCoverage().length}</p>
        </div>
      </div>
    </div>
  );
};

export default PokemonTeamBuilder;