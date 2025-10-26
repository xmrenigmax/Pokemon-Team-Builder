import React from 'react';
import { X, Sparkles, Menu, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  getPokemonSprite, 
  getPokemonShinySprite, 
  getPokemonName, 
  getPokemonTypes, 
  getPokemonHP,
  getIsShiny 
} from '../../utils/pokemonData';

/**
 * Sortable team slot component for displaying Pokémon in team
 * @param {Object} props - Component props
 * @param {string} props.id - Unique ID for sortable
 * @param {number} props.index - Slot index
 * @param {Object} props.pokemon - Pokémon data
 * @param {Function} props.onRemove - Function to remove Pokémon
 * @param {Function} props.onShinyToggle - Function to toggle shiny state
 * @param {Function} props.onInfoOpen - Function to open info modal
 */
const TeamSlot = ({ id, index, pokemon, onRemove, onShinyToggle, onInfoOpen }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: id,
    disabled: !pokemon
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
  };

  /**
   * Handle shiny toggle click
   */
  const handleShinyClick = () => {
    onShinyToggle();
  };

  // Empty slot state
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
    );
  }

  const isShiny = getIsShiny(pokemon);
  const hpStat = getPokemonHP(pokemon);
  const currentSprite = isShiny ? getPokemonShinySprite(pokemon) : getPokemonSprite(pokemon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pokemon-card group relative ${
        isDragging 
          ? 'opacity-60 scale-105 z-50 shadow-2xl' 
          : 'hover:scale-105 transition-transform duration-200'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <button
          onClick={handleShinyClick}
          className={`p-1 rounded transition-colors ${
            isShiny 
              ? 'bg-[#fbbf24] text-black' 
              : 'bg-[#374151] hover:bg-[#4b5563] text-white'
          }`}
          title={isShiny ? "Switch to Normal" : "Switch to Shiny"}
        >
          <Sparkles size={12} />
        </button>
        <button
          onClick={() => onInfoOpen(pokemon)}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded p-1 transition-colors"
          title="View Details"
        >
          <Menu size={12} />
        </button>
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
          src={currentSprite}
          alt={getPokemonName(pokemon)}
          className="w-20 h-20 object-contain"
          key={`sprite-${pokemon.id}-${isShiny}`} // Force re-render when shiny changes
        />
      </div>

      {/* Pokémon Name */}
      <h3 className="text-white font-bold text-center capitalize mb-2">
        {getPokemonName(pokemon)}
        {isShiny && <span className="text-[#fbbf24] ml-1">✨</span>}
      </h3>

      {/* Types */}
      <div className="flex justify-center gap-1 mb-2">
        {getPokemonTypes(pokemon).map((typeInfo) => {
          const typeName = typeInfo.type?.name || typeInfo.name || 'unknown';
          return (
            <span
              key={typeName}
              className={`type-badge bg-${typeName} text-xs px-2 py-1`}
            >
              {typeName}
            </span>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="text-xs text-gray-400 text-center">
        <p>HP: {hpStat}</p>
      </div>
    </div>
  );
};

export default TeamSlot;