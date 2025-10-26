import axios from 'axios'

const API_BASE = 'https://pokemon-team-builder-backend.vercel.app/api'
const createCancelToken = () => axios.CancelToken.source()

export const pokemonAPI = {
  search: async (query, cancelToken) => {
    try {
      const response = await axios.get(`${API_BASE}/pokemon/search?q=${query}`, {
        cancelToken: cancelToken?.token
      })
      return response.data.results
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Search request cancelled:', query)
      } else {
        console.error('API search error:', error)
      }
      return []
    }
  },

  getPokemon: async (id) => {
    const response = await axios.get(`${API_BASE}/pokemon/${id}`)
    return response.data
  },
  
  getTypes: async () => {
    const response = await axios.get(`${API_BASE}/pokemon/types`)
    return response.data
  },
  
  analyzeTeam: async (team) => {
    const response = await axios.post(`${API_BASE}/team/analyze`, { team })
    return response.data
  }
}