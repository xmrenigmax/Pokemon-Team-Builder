import React, { useState } from 'react'
import { Save, FolderOpen, Trash2, Plus } from 'lucide-react'
import { usePokemon } from '../../contexts/PokemonContext'

const TeamStorage = () => {
  const { team, setTeam } = usePokemon()
  const [savedTeams, setSavedTeams] = useState(() => {
    const stored = localStorage.getItem('savedPokemonTeams')
    return stored ? JSON.parse(stored) : []
  })
  const [teamName, setTeamName] = useState('')

  const saveCurrentTeam = () => {
    if (!teamName.trim() || team.length === 0) return

    const newTeam = {
      id: Date.now(),
      name: teamName,
      pokemon: team,
      date: new Date().toLocaleDateString()
    }

    const updatedTeams = [...savedTeams, newTeam]
    setSavedTeams(updatedTeams)
    localStorage.setItem('savedPokemonTeams', JSON.stringify(updatedTeams))
    setTeamName('')
  }

  const loadTeam = (teamToLoad) => {
    setTeam(teamToLoad.pokemon)
  }

  const deleteTeam = (teamId) => {
    const updatedTeams = savedTeams.filter(t => t.id !== teamId)
    setSavedTeams(updatedTeams)
    localStorage.setItem('savedPokemonTeams', JSON.stringify(updatedTeams))
  }

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#7f1d1d]/30">
      <h2 className="text-2xl font-bold text-white mb-4">Team Storage</h2>

      {/* Save Current Team */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Team name..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="flex-1 bg-[#141414] border border-[#7f1d1d]/30 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ef4444]/50"
          />
          <button
            onClick={saveCurrentTeam}
            disabled={!teamName.trim() || team.length === 0}
            className="bg-[#10b981] hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
            title="Save Team"
          >
            <Save size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Current team: {team.length}/6 Pokémon
        </p>
      </div>

      {/* Saved Teams List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {savedTeams.map((savedTeam) => (
          <div
            key={savedTeam.id}
            className="bg-[#141414] border border-[#7f1d1d]/20 rounded-xl p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold">{savedTeam.name}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => loadTeam(savedTeam)}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white p-1 rounded transition-colors"
                  title="Load Team"
                >
                  <FolderOpen size={14} />
                </button>
                <button
                  onClick={() => deleteTeam(savedTeam.id)}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white p-1 rounded transition-colors"
                  title="Delete Team"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{savedTeam.pokemon.length} Pokémon</span>
              <span>{savedTeam.date}</span>
            </div>
            <div className="flex gap-1 mt-2">
              {savedTeam.pokemon.slice(0, 3).map((pokemon, index) => (
                <img
                  key={index}
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  className="w-6 h-6 object-contain"
                />
              ))}
              {savedTeam.pokemon.length > 3 && (
                <span className="text-xs text-gray-400">+{savedTeam.pokemon.length - 3}</span>
              )}
            </div>
          </div>
        ))}

        {savedTeams.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No saved teams yet
          </p>
        )}
      </div>
    </div>
  )
}

export default TeamStorage