import axios from 'axios'

const API_BASE = 'https://pokemon-team-builder-backend.vercel.app/api'

export const pokemonAPI = {
  search: async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/search?q=${query}`)
      return response.data.results
    } catch (error) {
      console.error('API search error:', error)
      return []
    }
  },
  
  getPokemon: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/${id}`)
      return response.data
    } catch (error) {
      console.error('API getPokemon error:', error)
      return null
    }
  },
  
  getPokemonSpecies: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/species/${id}`)
      return response.data
    } catch (error) {
      console.error('API getPokemonSpecies error:', error)
      return null
    }
  },
  
  getEvolutionChain: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/evolution/${id}`)
      return response.data
    } catch (error) {
      console.error('API getEvolutionChain error:', error)
      return null
    }
  },
  
  getTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/types`)
      return response.data
    } catch (error) {
      console.error('API getTypes error:', error)
      return {}
    }
  },
  
  analyzeTeam: async (team) => {
    try {
      const response = await axios.post(`${API_BASE}/team/analyze`, { team })
      return response.data
    } catch (error) {
      console.error('API analyzeTeam error:', error)
      return {}
    }
  }
}