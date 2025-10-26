
import React from 'react';
import { X, Sparkles, Menu, GripVertical, Settings } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  getPokemonSprite, 
  getPokemonShinySprite, 
  getPokemonDisplayName, 
  getPokemonTypes,
  getIsShiny 
} from '../../utils/pokemonData';

const TeamSlot = ({ id, index, pokemon, onRemove, onShinyToggle, onInfoOpen, onEdit }) => {
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

  const handleShinyClick = () => {
    onShinyToggle();
  };

  // Empty slot state
  if (!pokemon) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="team-slot group relative bg-[#141414] border-2 border-dashed border-[#7f1d1d]/30 rounded-xl p-4 text-center hover:border-[#ef4444]/50 transition-colors"
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
  const currentSprite = isShiny ? getPokemonShinySprite(pokemon) : getPokemonSprite(pokemon);
  const displayName = getPokemonDisplayName(pokemon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pokemon-card group relative bg-[#141414] border border-[#7f1d1d]/20 rounded-xl p-4 ${
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
        onClick={() => onEdit(pokemon, index)} // Ensure we pass both parameters
        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded p-1 transition-colors"
        title="Edit Pokémon"
      >
        <Settings size={12} />
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
          alt={displayName}
          className="w-16 h-16 object-contain"
          key={`sprite-${pokemon.id}-${isShiny}-${pokemon.formName || 'base'}`}
        />
      </div>

      {/* Pokémon Name & Level - USE displayName */}
      <h3 className="text-white font-bold text-center capitalize mb-1">
        {displayName}
        {isShiny && <span className="text-[#fbbf24] ml-1">✨</span>}
      </h3>
      
      {/* Level Badge */}
      <div className="text-center mb-2">
        <span className="bg-[#ef4444] text-white text-xs px-2 py-1 rounded-full">
          Lv. {pokemon.level || 50}
        </span>
      </div>

      {/* Types - This will now show form types */}
      <div className="flex justify-center gap-1 mb-2">
        {getPokemonTypes(pokemon).map((typeInfo) => {
          const typeName = typeInfo.type?.name || typeInfo.name || 'unknown';
          return (
            <span
              key={typeName}
              className={`type-badge bg-${typeName} text-xs px-2 py-0.5`}
            >
              {typeName}
            </span>
          );
        })}
      </div>

      {/* Ability */}
      {pokemon.ability && (
        <div className="text-center mb-2">
          <span className="bg-[#3b82f6] text-white text-xs px-2 py-1 rounded-full capitalize">
            {pokemon.ability}
          </span>
        </div>
      )}

      {/* Item */}
      {pokemon.item && (
        <div className="text-center mb-2">
          <span className="bg-[#10b981] text-white text-xs px-2 py-1 rounded-full capitalize">
            {pokemon.item.replace(/-/g, ' ')}
          </span>
        </div>
      )}

      {/* Form Badge - ADD THIS SECTION */}
      {pokemon.formName && pokemon.formName !== pokemon.name && (
        <div className="text-center mb-2">
          <span className="bg-[#8b5cf6] text-white text-xs px-2 py-1 rounded-full capitalize">
            {pokemon.formName.replace(`${pokemon.name}-`, '').replace(/-/g, ' ')}
          </span>
        </div>
      )}

      {/* Moves Preview */}
      {pokemon.moves && pokemon.moves.filter(m => m.name !== '---').length > 0 && (
        <div className="text-xs text-gray-400 text-center space-y-1">
          {pokemon.moves.slice(0, 2).map((move, index) => 
            move.name !== '---' && (
              <div key={index} className="truncate" title={move.name}>
                {move.name}
              </div>
            )
          )}
          {pokemon.moves.filter(m => m.name !== '---').length > 2 && (
            <div className="text-gray-500">+{pokemon.moves.filter(m => m.name !== '---').length - 2} more</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamSlot;
