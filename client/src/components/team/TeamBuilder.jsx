
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

const TeamBuilder = () => {
  const { team, removeFromTeam, setTeam, updatePokemon } = usePokemon();
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [editingPokemon, setEditingPokemon] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeIndex = parseInt(activeId.split('-')[1]);
    const overIndex = parseInt(overId.split('-')[1]);

    if (!isNaN(activeIndex) && !isNaN(overIndex) && 
        activeIndex >= 0 && activeIndex < team.length &&
        overIndex >= 0 && overIndex < team.length) {
      setTeam(arrayMove(team, activeIndex, overIndex));
    }
  };

  const handleShinyToggle = (index) => {
    updatePokemon(index, {
      _isShiny: !team[index]._isShiny
    });
  };

  const handleInfoOpen = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  const handleEditOpen = (pokemon, index) => {
  setEditingPokemon(pokemon);
  setEditingIndex(index);
  setIsSettingsOpen(true);
};

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

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setEditingPokemon(null);
    setEditingIndex(null);
  };

  const handleModalShinyToggle = (isShiny) => {
    if (selectedPokemon) {
      const updatedTeam = team.map(p => 
        p && p.id === selectedPokemon.id ? { ...p, _isShiny: isShiny } : p
      );
      setTeam(updatedTeam);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  // Team analysis
  const teamPokemon = team.filter(p => p);
  const uniqueTypes = Array.from(
    new Set(teamPokemon.flatMap(p => p.types.map(t => t.type.name)))
  );
  
  const totalLevel = teamPokemon.reduce((sum, p) => sum + (p.level || 50), 0);
  const averageLevel = teamPokemon.length > 0 ? Math.round(totalLevel / teamPokemon.length) : 0;

  const sortableItems = team.map((_, index) => `slot-${index}`);

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
                  onEdit={handleEditOpen}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Team Stats Summary */}
        <div className="mt-6 p-4 bg-[#141414] rounded-xl border border-[#7f1d1d]/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <span className="text-gray-400">Team Size:</span>
              <p className="text-white font-bold">{teamPokemon.length}/6</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400">Avg. Level:</span>
              <p className="text-white font-bold">{averageLevel}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400">Unique Types:</span>
              <p className="text-white font-bold">{uniqueTypes.length}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400">Shiny:</span>
              <p className="text-white font-bold">
                {teamPokemon.filter(p => p._isShiny).length}
              </p>
            </div>
          </div>
        </div>

        {/* Team Type Coverage */}
        {teamPokemon.length > 0 && (
          <div className="mt-6 p-4 bg-[#141414] rounded-xl border border-[#7f1d1d]/20">
            <h3 className="text-white font-bold mb-3">Team Type Coverage</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTypes.map(type => (
                <span key={type} className={`type-badge bg-${type} text-xs`}>
                  {type}
                </span>
              ))}
            </div>
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
