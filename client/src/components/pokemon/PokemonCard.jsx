import React from 'react'
import { Plus } from 'lucide-react'

const PokemonCard = ({ pokemon, onAdd, disabled }) => {
  const handleAdd = () => {
    if (!disabled) {
      onAdd(pokemon)
    }
  }

  return (
    <div className="bg-[#141414] border border-[#7f1d1d]/20 rounded-xl p-4 hover:border-[#ef4444]/30 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        {/* Pokémon Info */}
        <div className="flex items-center space-x-3 flex-1">
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-12 h-12 object-contain"
          />
          <div className="flex-1">
            <h3 className="text-white font-bold capitalize">{pokemon.name}</h3>
            <div className="flex gap-1 mt-1">
              {pokemon.types.map((typeInfo) => (
                <span
                  key={typeInfo.type.name}
                  className={`type-badge bg-${typeInfo.type.name} text-xs px-2 py-0.5`}
                >
                  {typeInfo.type.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={disabled}
          className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            disabled
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-[#ef4444] hover:bg-[#dc2626] hover:scale-110 active:scale-95'
          }`}
          title={disabled ? 'Team is full' : `Add ${pokemon.name} to team`}
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>
    </div>
  )
}

export default PokemonCard