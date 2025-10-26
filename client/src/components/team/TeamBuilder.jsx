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
import PokemonSettings from '../pokemon/PokemonSettings';
import { usePokemon } from '../../contexts/PokemonContext';

/**
 * TeamBuilder Component
 * Main component for building and managing Pokémon teams
 * Features drag-and-drop reordering, team analysis, and Pokémon editing
 */
const TeamBuilder = () => {
  // Context and state management
  const { team, removeFromTeam, setTeam, updatePokemon } = usePokemon();
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [editingPokemon, setEditingPokemon] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // DnD Sensors configuration for drag and drop functionality
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Minimum distance to start drag (px)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handles drag end event for team reordering
   * @param {Object} event - Drag end event from DnD context
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Extract indices from slot IDs
    const activeIndex = parseInt(activeId.split('-')[1]);
    const overIndex = parseInt(overId.split('-')[1]);

    // Validate indices and reorder team
    if (!isNaN(activeIndex) && !isNaN(overIndex) && 
        activeIndex >= 0 && activeIndex < team.length &&
        overIndex >= 0 && overIndex < team.length) {
      setTeam(arrayMove(team, activeIndex, overIndex));
    }
  };

  /**
   * Toggles shiny state for a Pokémon
   * @param {number} index - Index of Pokémon in team
   */
  const handleShinyToggle = (index) => {
    updatePokemon(index, {
      _isShiny: !team[index]._isShiny
    });
  };

  /**
   * Opens Pokémon info modal
   * @param {Object} pokemon - Pokémon data to display
   */
  const handleInfoOpen = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  /**
   * Opens Pokémon settings for editing
   * @param {Object} pokemon - Pokémon to edit
   * @param {number} index - Index of Pokémon in team
   */
  const handleEditOpen = (pokemon, index) => {
    console.log('Opening edit for:', pokemon?.name, 'at index:', index);
    setEditingPokemon(pokemon);
    setEditingIndex(index);
    setIsSettingsOpen(true);
  };

  /**
   * Updates Pokémon settings with new options
   * @param {Object} updatedOptions - New Pokémon configuration
   */
  const handleSettingsUpdate = (updatedOptions) => {
    if (editingIndex !== null && team[editingIndex]) {
      updatePokemon(editingIndex, {
        ...updatedOptions,
        // Preserve existing properties including form data
        id: team[editingIndex].id,
        name: team[editingIndex].name,
        sprites: team[editingIndex].sprites,
        types: team[editingIndex].types,
        _isShiny: team[editingIndex]._isShiny,
        // Make sure form data is preserved from updatedOptions
        form: updatedOptions.form || team[editingIndex].form,
        formName: updatedOptions.formName || team[editingIndex].formName
      });
    }
  };

  /**
   * Closes Pokémon settings modal
   */
  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setEditingPokemon(null);
    setEditingIndex(null);
  };

  /**
   * Toggles shiny state from modal
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
   * Closes Pokémon info modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  // Team analysis calculations
  const teamPokemon = team.filter(p => p);
  const uniqueTypes = Array.from(
    new Set(teamPokemon.flatMap(p => p.types.map(t => t.type.name)))
  );
  
  const totalLevel = teamPokemon.reduce((sum, p) => sum + (p.level || 50), 0);
  const averageLevel = teamPokemon.length > 0 ? Math.round(totalLevel / teamPokemon.length) : 0;

  // Sortable items for DnD context
  const sortableItems = team.map((_, index) => `slot-${index}`);

  return (
    <>
      <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#7f1d1d]/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Your Team
          </h2>
          <div className="text-sm text-gray-400">
            {teamPokemon.length}/6 Pokémon • Lv. {averageLevel} Avg.
          </div>
        </div>
        
        {/* Drag and Drop Team Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sortableItems}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <TeamSlot
                  key={`slot-${index}-${team[index]?._isShiny ? 'shiny' : 'normal'}-${team[index]?.id || 'empty'}`}
                  id={`slot-${index}`}
                  index={index}
                  pokemon={team[index]}
                  onRemove={() => removeFromTeam(index)}
                  onShinyToggle={() => handleShinyToggle(index)}
                  onInfoOpen={handleInfoOpen}
                  onEdit={handleEditOpen}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Team Stats Summary */}
        <div className="mt-8 p-6 bg-gradient-to-br from-[#141414] to-[#1a1a1a] rounded-2xl border border-[#7f1d1d]/20 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Team Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="text-center p-4 bg-black/30 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">Team Size</span>
              <p className="text-white font-bold text-2xl">{teamPokemon.length}/6</p>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">Avg. Level</span>
              <p className="text-white font-bold text-2xl">{averageLevel}</p>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">Unique Types</span>
              <p className="text-white font-bold text-2xl">{uniqueTypes.length}</p>
            </div>
            <div className="text-center p-4 bg-black/30 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">Shiny Count</span>
              <p className="text-white font-bold text-2xl">
                {teamPokemon.filter(p => p._isShiny).length}
              </p>
            </div>
          </div>
        </div>

        {/* Team Type Coverage */}
        {teamPokemon.length > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-br from-[#141414] to-[#1a1a1a] rounded-2xl border border-[#7f1d1d]/20 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Team Type Coverage
            </h3>
            <div className="flex flex-wrap gap-3">
              {uniqueTypes.map(type => (
                <span 
                  key={type} 
                  className={`type-badge bg-${type} px-4 py-2 text-sm font-semibold shadow-lg transform hover:scale-105 transition-transform duration-200`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pokémon Info Modal */}
      <PokemonModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onShinyToggle={handleModalShinyToggle}
      />

      {/* Pokémon Settings Modal for Editing */}
      {isSettingsOpen && editingPokemon && (
        <PokemonSettings
          pokemon={editingPokemon}
          options={{
            level: editingPokemon.level || 50,
            nature: editingPokemon.nature || 'hardy',
            moves: editingPokemon.moves || [],
            item: editingPokemon.item || '',
            itemData: editingPokemon.itemData || null,
            form: editingPokemon.form || null,
            formName: editingPokemon.formName || null
          }}
          onOptionsChange={handleSettingsUpdate}
          onAdd={handleSettingsClose}
          onClose={handleSettingsClose}
          isEditing={true}
        />
      )}
    </>
  );
};

export default TeamBuilder;