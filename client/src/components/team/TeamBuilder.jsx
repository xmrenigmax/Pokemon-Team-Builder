import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import TeamSlot from './TeamSlot';
import PokemonModal from '../pokemon/PokemonModal';
import { usePokemon } from '../../contexts/PokemonContext';

/**
 * Main team builder component with drag and drop functionality
 */
const TeamBuilder = () => {
  const { team, removeFromTeam, setTeam } = usePokemon();
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag end event for team reordering
   * @param {Object} event - Drag event
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Extract indices from IDs
    const activeIndex = parseInt(activeId.split('-')[1]);
    const overIndex = parseInt(overId.split('-')[1]);

    // Only proceed if both indices are valid and within team bounds
    if (!isNaN(activeIndex) && !isNaN(overIndex) && 
        activeIndex >= 0 && activeIndex < team.length &&
        overIndex >= 0 && overIndex < team.length) {
      setTeam(arrayMove(team, activeIndex, overIndex));
    }
  };

  /**
   * Toggle shiny state for Pokémon at specific index
   * @param {number} index - Team slot index
   */
  const handleShinyToggle = (index) => {
    const updatedTeam = team.map((pokemon, i) => {
      if (i === index && pokemon) {
        const newShinyState = !pokemon._isShiny;
        return {
          ...pokemon,
          _isShiny: newShinyState
        };
      }
      return pokemon;
    });
    setTeam(updatedTeam);
  };

  /**
   * Open info modal for Pokémon
   * @param {Object} pokemon - Pokémon to show in modal
   */
  const handleInfoOpen = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  /**
   * Handle shiny toggle from modal
   * @param {boolean} isShiny - New shiny state
   */
  const handleModalShinyToggle = (isShiny) => {
    if (selectedPokemon) {
      const updatedTeam = team.map(p => 
        p && p.id === selectedPokemon.id ? { ...p, _isShiny: isShiny } : p
      );
      setTeam(updatedTeam);
    }
  };

  /**
   * Close modal and reset selected Pokémon
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  // Create proper IDs for DnD
  const sortableItems = team.map((_, index) => `slot-${index}`);

  // Calculate unique types in team
  const uniqueTypes = Array.from(
    new Set(team.filter(p => p).flatMap(p => p.types.map(t => t.type.name)))
  );

  return (
    <>
      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#7f1d1d]/30">
        <h2 className="text-2xl font-bold text-white mb-6">Your Team</h2>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sortableItems}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <TeamSlot
                  key={`slot-${index}-${team[index]?._isShiny ? 'shiny' : 'normal'}`}
                  id={`slot-${index}`}
                  index={index}
                  pokemon={team[index]}
                  onRemove={() => removeFromTeam(index)}
                  onShinyToggle={() => handleShinyToggle(index)}
                  onInfoOpen={handleInfoOpen}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Team Stats Summary */}
        <div className="mt-6 p-4 bg-[#141414] rounded-xl border border-[#7f1d1d]/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Team Size:</span>
            <span className="text-white font-bold">{team.filter(p => p).length}/6</span>
          </div>
        </div>

        {/* Team Type Coverage Preview */}
        {team.filter(p => p).length > 0 && (
          <div className="mt-6 p-4 bg-[#141414] rounded-xl border border-[#7f1d1d]/20">
            <h3 className="text-white font-bold mb-3">Team Type Coverage</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTypes.map(type => (
                <span key={type} className={`type-badge bg-${type} text-xs`}>
                  {type}
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {team.filter(p => p).length} Pokémon, {uniqueTypes.length} unique types
            </p>
          </div>
        )}
      </div>

      {/* Pokémon Modal */}
      <PokemonModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onShinyToggle={handleModalShinyToggle}
      />
    </>
  );
};

export default TeamBuilder;