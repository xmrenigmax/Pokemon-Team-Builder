import React from 'react'
import { X, Sparkles, Menu, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const TeamSlot = ({ index, pokemon, onRemove, onShinyToggle, onInfoOpen }) => {
  // Use index-based ID to avoid conflicts
  const uniqueId = pokemon ? `slot-${index}` : `empty-${index}`
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: uniqueId,
    disabled: !pokemon // Disable drag for empty slots
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!pokemon) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="team-slot group relative"
      >
        <div className="text-center">
          <div className="text-4xl text-gray-500 mb-2">+</div>
          <p className="text-gray-400 font-medium">Slot {index + 1}</p>
          <p className="text-gray-500 text-sm">Empty</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pokemon-card group relative ${isDragging ? 'opacity-50 z-10' : ''}`}
    >
      {/* Drag Handle - Only show on Pokémon slots */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        {/* Shiny Toggle */}
        <button
          onClick={onShinyToggle}
          className="bg-[#fbbf24] hover:bg-[#f59e0b] text-white rounded p-1 transition-colors"
          title="Toggle Shiny"
        >
          <Sparkles size={12} />
        </button>

        {/* Info Button */}
        <button
          onClick={() => onInfoOpen(pokemon)}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded p-1 transition-colors"
          title="View Details"
        >
          <Menu size={12} />
        </button>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="bg-[#ef4444] hover:bg-[#dc2626] text-white rounded p-1 transition-colors"
          title="Remove"
        >
          <X size={12} />
        </button>
      </div>

      {/* Pokémon Sprite */}
      <div className="flex justify-center mb-3 pt-2">
        <img
          src={pokemon._isShiny && pokemon.sprites.front_shiny 
            ? pokemon.sprites.front_shiny 
            : pokemon.sprites.front_default}
          alt={pokemon.name}
          className="w-20 h-20 object-contain"
        />
      </div>

      {/* Pokémon Name */}
      <h3 className="text-white font-bold text-center capitalize mb-2">
        {pokemon.name}
        {pokemon._isShiny && <span className="text-[#fbbf24] ml-1">✨</span>}
      </h3>

      {/* Types */}
      <div className="flex justify-center gap-1 mb-2">
        {pokemon.types.map((typeInfo) => (
          <span
            key={typeInfo.type.name}
            className={`type-badge bg-${typeInfo.type.name} text-xs px-2 py-1`}
          >
            {typeInfo.type.name}
          </span>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="text-xs text-gray-400 text-center">
        <p>HP: {pokemon.stats.find(s => s.name === 'hp')?.base_stat || 0}</p>
      </div>
    </div>
  )
}

export default TeamSlot