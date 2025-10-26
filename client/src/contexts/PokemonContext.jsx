import React, { createContext, useContext, useState, useEffect } from 'react'
import { pokemonAPI } from '../utils/api'

const PokemonContext = createContext()

export const usePokemon = () => {
  const context = useContext(PokemonContext)
  if (!context) {
    throw new Error('usePokemon must be used within a PokemonProvider')
  }
  return context
}

export const PokemonProvider = ({ children }) => {
  const [team, setTeam] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Load team from localStorage
  useEffect(() => {
    const savedTeam = localStorage.getItem('pokemonTeam')
    if (savedTeam) {
      setTeam(JSON.parse(savedTeam))
    }
  }, [])

  // Save team to localStorage
  useEffect(() => {
    localStorage.setItem('pokemonTeam', JSON.stringify(team))
  }, [team])

  const searchPokemon = async (query) => {
    // Immediately clear results if query is empty
    if (!query || !query.trim()) {
      setSearchResults([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const results = await pokemonAPI.search(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const addToTeam = (pokemon) => {
    if (team.length < 6) {
      setTeam(prev => [...prev, pokemon])
    }
  }

  const removeFromTeam = (index) => {
    setTeam(prev => prev.filter((_, i) => i !== index))
  }

  const value = {
    team,
    searchResults,
    loading,
    searchPokemon,
    addToTeam,
    removeFromTeam,
    setTeam,
  }

  return (
    <PokemonContext.Provider value={value}>
      {children}
    </PokemonContext.Provider>
  )
}