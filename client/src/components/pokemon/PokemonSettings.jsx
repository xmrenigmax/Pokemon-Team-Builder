import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, ChevronDown, ChevronUp, Search, Lock, Package, Zap, Sparkles, Moon, Sun, Heart, Sword, Shield, Gauge } from 'lucide-react';
import { pokemonAPI } from '../../utils/api';
import debounce from 'lodash/debounce';

/**
 * Available Pokémon natures with stat effects
 */
const NATURES = [
  'hardy', 'lonely', 'brave', 'adamant', 'naughty',
  'bold', 'docile', 'relaxed', 'impish', 'lax',
  'timid', 'hasty', 'serious', 'jolly', 'naive',
  'modest', 'mild', 'quiet', 'bashful', 'rash',
  'calm', 'gentle', 'sassy', 'careful', 'quirky'
];

/**
 * Fallback items in case API fails to load
 */
const FALLBACK_ITEMS = [
  {
    name: 'leftovers',
    category: 'held-items',
    effect: 'Restores 1/16 of max HP at the end of each turn.',
    displayName: 'Leftovers'
  },
  {
    name: 'choice-band',
    category: 'held-items', 
    effect: 'Boosts Attack by 50%, but restricts the holder to one move.',
    displayName: 'Choice Band'
  },
  {
    name: 'choice-specs',
    category: 'held-items',
    effect: 'Boosts Special Attack by 50%, but restricts the holder to one move.',
    displayName: 'Choice Specs'
  },
  {
    name: 'choice-scarf',
    category: 'held-items',
    effect: 'Boosts Speed by 50%, but restricts the holder to one move.',
    displayName: 'Choice Scarf'
  },
  {
    name: 'life-orb',
    category: 'held-items',
    effect: 'Boosts damage by 30%, but holder loses 10% HP per attack.',
    displayName: 'Life Orb'
  }
];

/**
 * PokémonSettings Component
 * Modal for configuring Pokémon battle settings including:
 * - Forms selection
 * - Level and nature
 * - Held items
 * - Moveset management
 * - Stats preview
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pokemon - The Pokémon being configured
 * @param {Object} props.options - Current configuration options
 * @param {Function} props.onOptionsChange - Callback when options change
 * @param {Function} props.onAdd - Callback when saving/adding to team
 * @param {Function} props.onClose - Callback when closing modal
 * @param {boolean} props.isEditing - Whether editing existing Pokémon
 */
const PokemonSettings = ({ 
  pokemon, 
  options, 
  onOptionsChange, 
  onAdd, 
  onClose, 
  isEditing = false,
  teamIndex
}) => {
  // State for moves management
  const [allMoves, setAllMoves] = useState([]);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [filteredMoves, setFilteredMoves] = useState([]);
  const [showMoves, setShowMoves] = useState(false);
  const [statsPreview, setStatsPreview] = useState(null);
  const [moveSearch, setMoveSearch] = useState('');
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [tmMoves, setTmMoves] = useState([]);
  
  // State for forms and items management
  const [pokemonForms, setPokemonForms] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [availableItems, setAvailableItems] = useState(FALLBACK_ITEMS);
  const [showForms, setShowForms] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  /**
   * Load all required data when component mounts or Pokémon changes
   */

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  useEffect(() => {
    if (!pokemon?.id) return;

    console.log(`Loading settings for Pokémon: ${pokemon.name} (ID: ${pokemon.id})`);
    
    // Reset state for new Pokémon
    setAllMoves([]);
    setAvailableMoves([]);
    setFilteredMoves([]);
    setStatsPreview(null);
    setPokemonForms(null);
    setSelectedForm(null);
    setHasChanges(false);

    // Load all data in parallel for better performance
    const loadData = async () => {
      try {
        await Promise.all([
          loadAllMoves(),
          loadPokemonForms(),
          loadAvailableItems()
        ]);
        
        // Calculate initial stats preview
        await calculateStatsPreview();
        
      } catch (error) {
        console.error('Error loading Pokémon settings data:', error);
      }
    };

    loadData();
  }, [pokemon?.id]);

  /**
   * Update available moves and recalculate stats when dependencies change
   */
  useEffect(() => {
    if (allMoves.length > 0) {
      updateAvailableMoves();
      calculateStatsPreview();
    }
  }, [options.level, allMoves, options.nature, selectedForm]);

  /**
   * Filter moves based on search query
   */
  useEffect(() => {
    if (moveSearch.trim()) {
      const filtered = availableMoves.filter(move =>
        move.name.toLowerCase().includes(moveSearch.toLowerCase()) ||
        move.type.toLowerCase().includes(moveSearch.toLowerCase()) ||
        (move.description && move.description.toLowerCase().includes(moveSearch.toLowerCase()))
      );
      setFilteredMoves(filtered);
    } else {
      setFilteredMoves(availableMoves);
    }
  }, [moveSearch, availableMoves]);

  /**
   * Track changes in options and update stats
   */
  useEffect(() => {
  // Set hasChanges to true when any option changes (except initial load)
  if (allMoves.length > 0) {
    setHasChanges(true);
    // For team Pokémon, update the context immediately for dynamic updates
    if (isEditing && pokemon.teamIndex !== undefined) {
      // This ensures team Pokémon get updated in real-time
      debouncedTeamUpdate();
    }
  }
}, [options, selectedForm]);

  // Debounced version of calculateStatsPreview
  const debouncedTeamUpdate = useCallback(
  debounce(() => {
    if (isEditing && pokemon.teamIndex !== undefined && onOptionsChange) {
      onOptionsChange(options, true); // Pass true to indicate immediate update
    }
  }, 300),
  [options, isEditing, pokemon?.teamIndex, onOptionsChange]
);

  /**
   * Load all moves the Pokémon can learn
   */
  const loadAllMoves = async () => {
    if (!pokemon?.id) return;
    
    setLoadingMoves(true);
    console.log(`Loading moves for ${pokemon.name}...`);

    try {
      const learnset = await pokemonAPI.getPokemonLearnset(pokemon.id);
      
      // Load level-up moves with error handling
      const levelUpMovePromises = learnset.level_up_moves.map(async (moveData) => {
        try {
          const move = await pokemonAPI.getMove(moveData.name);
          return {
            ...move,
            learnMethod: moveData.learn_method,
            levelLearned: moveData.level,
            description: move.description || 'No description available',
            category: move.damage_class?.name || 'status'
          };
        } catch (error) {
          console.warn(`Failed to fetch move ${moveData.name}:`, error);
          return null;
        }
      });

      // Load TM moves
      const tmMovePromises = learnset.tm_moves.map(async (moveData) => {
        try {
          const move = await pokemonAPI.getMove(moveData.name);
          return {
            ...move,
            learnMethod: 'machine',
            levelLearned: 0,
            tmNumber: moveData.tm_number,
            description: move.description || 'No description available',
            category: move.damage_class?.name || 'status'
          };
        } catch (error) {
          console.warn(`Failed to fetch TM move ${moveData.name}:`, error);
          return null;
        }
      });

      const [levelUpMoves, tmMovesList] = await Promise.all([
        Promise.all(levelUpMovePromises),
        Promise.all(tmMovePromises)
      ]);

      // Filter out failed moves and sort
      const validLevelUpMoves = levelUpMoves
        .filter(Boolean)
        .sort((a, b) => a.levelLearned - b.levelLearned);

      const validTmMoves = tmMovesList
        .filter(Boolean)
        .sort((a, b) => (a.tmNumber || 0) - (b.tmNumber || 0));

      setAllMoves(validLevelUpMoves);
      setTmMoves(validTmMoves);
      
      console.log(`Loaded ${validLevelUpMoves.length} level-up moves and ${validTmMoves.length} TM moves`);
      
    } catch (error) {
      console.error('Error loading Pokémon learnset:', error);
      loadFallbackMoves();
    } finally {
      setLoadingMoves(false);
    }
  };

  /**
   * Load available forms for the Pokémon
   */
  const loadPokemonForms = async () => {
    if (!pokemon?.id) return;
    
    setLoadingForms(true);
    console.log(`Loading forms for ${pokemon.name}...`);

    try {
      const forms = await pokemonAPI.getPokemonForms(pokemon.id);
      setPokemonForms(forms);
      
      // Determine which form to select
      let formToSet = null;
      
      if (isEditing && options.form) {
        // Use existing form when editing
        formToSet = options.form;
        console.log('Using existing form:', formToSet.form_name);
      } else {
        // Select default form (standard -> regional -> mega)
        formToSet = forms.forms.standard?.[0] || forms.forms.regional?.[0] || forms.forms.mega?.[0];
        console.log('Selected default form:', formToSet?.form_name);
      }
      
      if (formToSet) {
        setSelectedForm(formToSet);
        // Update options with form data if not already set
        if (!isEditing || !options.form) {
          onOptionsChange({
            ...options,
            form: formToSet,
            formName: formToSet.form_name
          });
        }
      }
      
      console.log(`Loaded ${Object.values(forms.forms).flat().length} total forms`);
      
    } catch (error) {
      console.error('Error loading Pokémon forms:', error);
      // Set base form as fallback
      setSelectedForm({
        ...pokemon,
        form_name: pokemon.name,
        types: pokemon.types,
        stats: pokemon.stats
      });
    } finally {
      setLoadingForms(false);
    }
  };

  /**
   * Load available battle items
   */
  const loadAvailableItems = async () => {
    setLoadingItems(true);
    console.log('Loading battle items...');

    try {
      const itemsData = await pokemonAPI.getItems();
      console.log('Battle items loaded:', itemsData);
      
      if (itemsData?.items?.length > 0) {
        // Filter and validate items
        const validItems = itemsData.items.filter(item => 
          item && item.name && item.category && item.effect
        );
        setAvailableItems(validItems);
        console.log(`Loaded ${validItems.length} valid items`);
      } else {
        console.warn('No valid items data received, using fallback');
        setAvailableItems(FALLBACK_ITEMS);
      }
    } catch (error) {
      console.error('Error loading items, using fallback:', error);
      setAvailableItems(FALLBACK_ITEMS);
    } finally {
      setLoadingItems(false);
    }
  };

  /**
   * Update available moves based on current level and form
   */
  const updateAvailableMoves = useCallback(() => {
    if (allMoves.length === 0) return;

    // Filter moves learnable at current level
    const learnableLevelMoves = allMoves.filter(move => 
      move.levelLearned <= options.level
    );
    
    // Combine level-up and TM moves
    const allAvailableMoves = [...learnableLevelMoves, ...tmMoves];
    
    // Remove duplicates by move name
    const uniqueMoves = allAvailableMoves.reduce((acc, move) => {
      if (!acc.some(m => m.name === move.name)) {
        acc.push(move);
      }
      return acc;
    }, []);
    
    setAvailableMoves(uniqueMoves);
    setFilteredMoves(uniqueMoves);
    
    console.log(`Available moves at level ${options.level}: ${uniqueMoves.length}`);
    
    // Update current moves with available moves
    updateCurrentMoves(uniqueMoves);
  }, [allMoves, tmMoves, options.level]);

  /**
   * Update current moves based on available moves
   */
  const updateCurrentMoves = useCallback((learnableMoves) => {
    const currentMoves = options.moves || Array(4).fill(createEmptyMove());
    const newMoves = [...currentMoves];
    let hasChanges = false;

    // Sort moves by power and level for smart selection
    const eligibleMoves = [...learnableMoves].sort((a, b) => {
      const powerDiff = (b.power || 0) - (a.power || 0);
      if (Math.abs(powerDiff) > 20) return powerDiff;
      return b.levelLearned - a.levelLearned;
    });

    // Fill empty slots with best available moves
    for (let i = 0; i < newMoves.length; i++) {
      if (newMoves[i].name === '---') {
        const bestMove = findBestMoveForSlot(eligibleMoves, newMoves);
        if (bestMove) {
          newMoves[i] = bestMove;
          hasChanges = true;
        }
      }
    }

    // Upgrade weak moves if better options available
    if (learnableMoves.length > 4) {
      for (let i = 0; i < newMoves.length; i++) {
        const currentMove = newMoves[i];
        if (currentMove.name !== '---' && currentMove.power < 60 && currentMove.learnMethod !== 'machine') {
          const betterMove = findBetterReplacement(currentMove, eligibleMoves, newMoves);
          if (betterMove) {
            newMoves[i] = betterMove;
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      onOptionsChange({ 
        ...options, 
        moves: newMoves 
      });
    }
  }, [options, onOptionsChange]);

  /**
   * Handle form change and update options
   */
  const handleFormChange = async (form) => {
    console.log('Changing form to:', form.form_name);
    setSelectedForm(form);
    
    const newOptions = {
      ...options,
      form: form,
      formName: form.form_name
    };
    
    onOptionsChange(newOptions);
    
    // Reload moves for the new form if it has a different ID
    if (form.id !== pokemon.id) {
      console.log('Form changed, reloading moves...');
      await loadAllMoves();
    }
    
    // Recalculate stats for the new form
    await calculateStatsPreview();
  };

  const handleOptionsChange = useCallback((newOptions) => {
    setLocalOptions(newOptions);
    setHasChanges(true);
    
    // If this is a team Pokémon, update immediately
    if (isEditing && teamIndex !== undefined) {
      onOptionsChange(newOptions, true);
    } else {
      onOptionsChange(newOptions);
    }
  }, [isEditing, teamIndex, onOptionsChange]);

  /**
   * Handle item change
   */
  const handleItemChange = (itemName) => {
    const selectedItem = availableItems.find(item => item.name === itemName);
    const newOptions = { 
      ...localOptions, 
      item: itemName,
      itemData: selectedItem 
    };
    handleOptionsChange(newOptions);
    debouncedCalculateStats();
  };

  /**
   * Find the best move for an empty slot
   */
  const findBestMoveForSlot = (eligibleMoves, currentMoves) => {
    return eligibleMoves.find(move => 
      !currentMoves.some(m => m.name === move.name)
    );
  };

  /**
   * Find a better replacement for a weak move
   */
  const findBetterReplacement = (currentMove, eligibleMoves, currentMoves) => {
    return eligibleMoves.find(move => 
      (move.power >= (currentMove.power + 20) || 
       (move.power > 0 && currentMove.power === 0)) &&
      !currentMoves.some(m => m.name === move.name)
    );
  };

  /**
   * Create an empty move slot
   */
  const createEmptyMove = () => ({
    name: '---', 
    type: 'normal', 
    power: 0, 
    accuracy: 0, 
    pp: 0, 
    description: 'Empty move slot', 
    category: 'status'
  });

  /**
   * Fallback moves if API fails
   */
  const loadFallbackMoves = () => {
    const fallbackMoves = [
      { 
        name: 'Tackle', 
        type: 'normal', 
        power: 40, 
        accuracy: 100, 
        pp: 35, 
        description: 'A physical attack that charges the target with a full-body tackle.', 
        category: 'physical', 
        learnMethod: 'level-up', 
        levelLearned: 1 
      },
      { 
        name: 'Growl', 
        type: 'normal', 
        power: 0, 
        accuracy: 100, 
        pp: 40, 
        description: 'The user growls in an endearing way, lowering the target\'s Attack stat.', 
        category: 'status', 
        learnMethod: 'level-up', 
        levelLearned: 1 
      }
    ];
    setAllMoves(fallbackMoves);
    setAvailableMoves(fallbackMoves);
  };

  /**
   * Calculate stats preview based on current configuration
   */
  const calculateStatsPreview = async () => {
    if (!pokemon) return;

    try {
      // Use selected form if available, otherwise use base pokemon
      const pokemonId = selectedForm?.id || pokemon.id;
      const battleData = await pokemonAPI.getBattlePokemon(pokemonId, {
        level: options.level,
        nature: options.nature,
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, // Default EVs
        item: options.item, // Include held item
        moves: options.moves?.map(m => m.name) || [] // Include moves
      });
      
      setStatsPreview(battleData?.calculatedStats);
      // Update options with calculated stats for parent component
      onOptionsChange({
        ...options,
        calculatedStats: battleData?.calculatedStats
      });

      console.log('Stats preview calculated:', battleData?.calculatedStats);
      onOptionsChange(updatedOptions);
    } catch (error) {
      console.error('Error calculating stats preview:', error);
      // Set fallback stats based on base stats
      const fallbackStats = calculateFallbackStats();
      setStatsPreview(fallbackStats);
      // Update options with fallback stats
      onOptionsChange({
        ...options,
        calculatedStats: fallbackStats
      });
    }
  };

  /**
   * Calculate fallback stats when API fails
   */
  const calculateFallbackStats = () => {
    const baseStats = selectedForm?.stats || pokemon.stats;
    const level = options.level || 50;
    
    const stats = {};
    baseStats.forEach(stat => {
      const statName = stat.stat?.name || stat.name;
      const baseStat = stat.base_stat || 0;
      
      // Simple stat calculation formula (HP is different)
      if (statName === 'hp') {
        stats[statName] = Math.floor((2 * baseStat * level) / 100) + level + 10;
      } else {
        stats[statName] = Math.floor((2 * baseStat * level) / 100) + 5;
      }
    });
    
    return stats;
  };

  /**
   * Handle level change with validation
   */
  const handleLevelChange = (level) => {
    const newLevel = Math.max(1, Math.min(100, parseInt(level) || 50));
    const newOptions = { 
      ...localOptions, 
      level: newLevel
    };
    handleOptionsChange(newOptions);
  };

  /**
   * Handle nature change
   */
   const handleNatureChange = (nature) => {
    const newOptions = { ...localOptions, nature };
    handleOptionsChange(newOptions);
    debouncedCalculateStats();
  };

  /**
   * Handle move selection with validation
   */
  const handleMoveSelect = async (moveIndex, selectedMove) => {
    const newMoves = [...(options.moves || Array(4).fill(createEmptyMove()))];
    
    // Check if move is already selected
    const isAlreadySelected = newMoves.some((move, idx) => 
      idx !== moveIndex && move.name === selectedMove.name
    );
    
    if (isAlreadySelected) {
      console.warn(`Move ${selectedMove.name} is already selected`);
      return;
    }
    
    newMoves[moveIndex] = selectedMove;
    onOptionsChange({ ...options, moves: newMoves });
    setHasChanges(true);
    
    console.log(`Selected move: ${selectedMove.name} for slot ${moveIndex}`);
    // Trigger UI update
    await calculateStatsPreview();
  };

  /**
   * Clear a move slot
   */
  const handleMoveClear = (moveIndex) => {
    const newMoves = [...(options.moves || [])];
    newMoves[moveIndex] = createEmptyMove();
    onOptionsChange({ ...options, moves: newMoves });
  };

  /**
   * Get nature effect description
   */
  const getNatureEffect = (nature) => {
    const natureEffects = {
      lonely: '+Atk, -Def', brave: '+Atk, -Spe', adamant: '+Atk, -SpA', naughty: '+Atk, -SpD',
      bold: '+Def, -Atk', relaxed: '+Def, -Spe', impish: '+Def, -SpA', lax: '+Def, -SpD',
      timid: '+Spe, -Atk', hasty: '+Spe, -Def', jolly: '+Spe, -SpA', naive: '+Spe, -SpD',
      modest: '+SpA, -Atk', mild: '+SpA, -Def', quiet: '+SpA, -Spe', rash: '+SpA, -SpD',
      calm: '+SpD, -Atk', gentle: '+SpD, -Def', sassy: '+SpD, -Spe', careful: '+SpD, -SpA',
      hardy: 'Neutral', docile: 'Neutral', serious: 'Neutral', bashful: 'Neutral', quirky: 'Neutral'
    };
    return natureEffects[nature] || 'Neutral';
  };

  /**
   * Get move learning information
   */
  const getMoveLearnInfo = (move) => {
    if (move.learnMethod === 'level-up' && move.levelLearned > 0) {
      return `Lv. ${move.levelLearned}`;
    } else if (move.learnMethod === 'level-up') {
      return 'Start';
    } else if (move.learnMethod === 'machine') {
      return `TM${move.tmNumber || ''}`;
    } else {
      return move.learnMethod || 'Unknown';
    }
  };

  /**
   * Count locked moves (above current level)
   */
  const getLockedMovesCount = () => {
    return allMoves.filter(move => move.levelLearned > options.level).length;
  };

  /**
   * Get form type icon
   */
  const getFormIcon = (formType) => {
    switch (formType) {
      case 'mega': return <Zap size={14} />;
      case 'gigantamax': return <Sparkles size={14} />;
      case 'primal': return <Sun size={14} />;
      case 'eternamax': return <Moon size={14} />;
      default: return null;
    }
  };

  /**
   * Get selected item effect description
   */
  const getSelectedItemEffect = () => {
    if (!options.item) return '';
    const selectedItem = availableItems.find(item => item.name === options.item);
    return selectedItem?.effect || 'Item effect description not available.';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#7f1d1d]/30 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#7f1d1d]/30">
          <div>
            <h2 className="text-xl font-bold text-white capitalize">
              {isEditing ? 'Edit' : 'Add'} {pokemon.name}
              {selectedForm && selectedForm.form_name !== pokemon.name && (
                <span className="text-[#ef4444] ml-2">
                  ({selectedForm.form_name.replace(`${pokemon.name}-`, '').replace('-', ' ')})
                </span>
              )}
            </h2>
            <p className="text-gray-400 text-sm">
              Level {options.level} • {availableMoves.length} moves available
              {getLockedMovesCount() > 0 && ` • ${getLockedMovesCount()} moves locked`}
              {tmMoves.length > 0 && ` • ${tmMoves.length} TM moves`}
              {hasChanges && ` • Unsaved changes`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main content layout */}
        <div className="flex h-[750px]">
          {/* Settings Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Forms Section */}
            {pokemonForms && (
              <div className="p-4 border-b border-[#7f1d1d]/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Pokémon Form</h3>
                  <button
                    onClick={() => setShowForms(!showForms)}
                    className="text-[#ef4444] text-sm hover:text-[#dc2626] transition-colors flex items-center gap-1"
                  >
                    {showForms ? 'Hide Forms' : 'Show Forms'}
                    {showForms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                
                {showForms && (
                  <FormsSection 
                    pokemonForms={pokemonForms}
                    selectedForm={selectedForm}
                    onFormChange={handleFormChange}
                    pokemon={pokemon}
                  />
                )}
              </div>
            )}

            {/* Basic Settings */}
            <BasicSettings 
              options={localOptions}
              onLevelChange={handleLevelChange}
              onNatureChange={handleNatureChange}
              onItemChange={handleItemChange}
              availableItems={availableItems}
              loadingItems={loadingItems}
              NATURES={NATURES}
              getNatureEffect={getNatureEffect}
              getSelectedItemEffect={getSelectedItemEffect}
            />

            {/* Moves Section */}
            <MovesSection 
              options={localOptions}
              availableMoves={availableMoves}
              filteredMoves={filteredMoves}
              showMoves={showMoves}
              loadingMoves={loadingMoves}
              moveSearch={moveSearch}
              onMoveSearchChange={setMoveSearch}
              onMoveSelect={handleMoveSelect}
              onMoveClear={handleMoveClear}
              onShowMovesToggle={() => setShowMoves(!showMoves)}
              getMoveLearnInfo={getMoveLearnInfo}
              getLockedMovesCount={getLockedMovesCount}
              tmMoves={tmMoves}
            />
          </div>

          {/* Preview Panel */}
          <PreviewPanel 
            statsPreview={statsPreview}
            selectedForm={selectedForm}
            options={localOptions}
            availableItems={availableItems}
            pokemon={pokemon}
            onAdd={onAdd}
            isEditing={isEditing}
            hasChanges={hasChanges}
          />
        </div>
      </div>
    </div>
  );
};
// Additional sub-components for better organization

/**
 * Form Card Component for displaying individual form options
 */
const FormCard = ({ form, isSelected, onSelect, requiresItem, getFormIcon }) => (
  <div
    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
      isSelected
        ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500 shadow-lg shadow-blue-500/25'
        : 'bg-[#141414] border-[#7f1d1d]/20 hover:border-[#ef4444]/50 hover:bg-[#1a1414] hover:scale-105'
    }`}
    onClick={() => onSelect(form)}
  >
    <div className="flex items-center gap-3 mb-3">
      <img 
        src={form.sprites.front_default || form.sprites.other?.['official-artwork']?.front_default || '/placeholder-pokemon.png'} 
        alt={form.name}
        className="w-16 h-16 object-contain flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold capitalize text-lg truncate">
          {form.name.replace(`${form.pokemon?.name || ''}-`, '').replace(/-/g, ' ')}
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          {form.types.map((type, index) => (
            <span key={index} className={`type-badge bg-${type} px-2 py-1 text-xs`}>
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
    
    {requiresItem && (
      <div className="text-yellow-400 text-xs flex items-center gap-2 bg-yellow-900/20 rounded-lg p-2">
        <Package size={12} />
        <span>Requires: {requiresItem}</span>
      </div>
    )}
    
    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
      <span>BST: {form.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 'N/A'}</span>
      <span>#{form.id}</span>
    </div>
  </div>
);

/**
 * Forms Section Component for managing Pokémon forms
 */
const FormsSection = ({ pokemonForms, selectedForm, onFormChange, pokemon, getFormIcon }) => (
  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
    {/* Standard Forms */}
    {pokemonForms.forms.standard.length > 0 && (
      <div>
        <h4 className="text-gray-300 font-semibold text-sm mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Standard Forms
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {pokemonForms.forms.standard.map((form) => (
            <FormCard 
              key={form.id} 
              form={form} 
              isSelected={selectedForm?.id === form.id}
              onSelect={onFormChange}
              getFormIcon={getFormIcon}
            />
          ))}
        </div>
      </div>
    )}
    
    {/* Mega Evolutions */}
    {pokemonForms.forms.mega.length > 0 && (
      <div>
        <h4 className="text-yellow-400 font-semibold text-sm mb-3 flex items-center gap-2">
          <Zap size={16} />
          Mega Evolutions
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {pokemonForms.forms.mega.map((form) => (
            <FormCard 
              key={form.id} 
              form={form} 
              isSelected={selectedForm?.id === form.id}
              onSelect={onFormChange}
              requiresItem="Mega Stone"
              getFormIcon={getFormIcon}
            />
          ))}
        </div>
      </div>
    )}
    
    {/* Regional Variants */}
    {pokemonForms.forms.regional.length > 0 && (
      <div>
        <h4 className="text-blue-400 font-semibold text-sm mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Regional Variants
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {pokemonForms.forms.regional.map((form) => (
            <FormCard 
              key={form.id} 
              form={form} 
              isSelected={selectedForm?.id === form.id}
              onSelect={onFormChange}
              getFormIcon={getFormIcon}
            />
          ))}
        </div>
      </div>
    )}
    
    {/* Gigantamax Forms */}
    {pokemonForms.forms.gigantamax.length > 0 && (
      <div>
        <h4 className="text-purple-400 font-semibold text-sm mb-3 flex items-center gap-2">
          <Sparkles size={16} />
          Gigantamax Forms
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {pokemonForms.forms.gigantamax.map((form) => (
            <FormCard 
              key={form.id} 
              form={form} 
              isSelected={selectedForm?.id === form.id}
              onSelect={onFormChange}
              requiresItem="Dynamax Band"
              getFormIcon={getFormIcon}
            />
          ))}
        </div>
      </div>
    )}
    
    {/* Special Forms */}
    {pokemonForms.forms.special.length > 0 && (
      <div>
        <h4 className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Special Forms
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {pokemonForms.forms.special.map((form) => (
            <FormCard 
              key={form.id} 
              form={form} 
              isSelected={selectedForm?.id === form.id}
              onSelect={onFormChange}
              getFormIcon={getFormIcon}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

/**
 * Basic Settings Component for level, nature, and item configuration
 */
const BasicSettings = ({ 
  options, 
  onLevelChange, 
  onNatureChange, 
  onItemChange, 
  availableItems, 
  loadingItems, 
  NATURES, 
  getNatureEffect,
  getSelectedItemEffect 
}) => {
  // Debounced level change handler
  const debouncedLevelChange = useCallback(
    debounce((value) => {
      onLevelChange(value);
    }, 100),
    [onLevelChange]
  );

  const getFilteredItems = () => {
    if (!availableItems.length) return {};
    
    const categories = {};
    
    // Always show held items
    categories['Held Items'] = availableItems.filter(item => 
      item.category === 'held-items'
    );
    
    // Show other categories as needed
    categories['Battle Items'] = availableItems.filter(item => 
      item.category !== 'held-items'
    );
    
    return categories;
  };

  return (
    <div className="p-6 border-b border-[#7f1d1d]/30">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        Battle Configuration
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level Setting */}
        <div className="space-y-4">
          <label className="block text-white font-semibold">
            Level: <span className="text-[#ef4444]">{options.level || 50}</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={options.level || 50}
            onChange={(e) => {
              const value = e.target.value;
              // Update immediately for smooth UI
              onLevelChange(value);
              // Debounce the actual stat calculation
              debouncedLevelChange(value);
            }}
            className="w-full h-2 bg-[#141414] rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-400 px-2">
            <span>1</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Nature Setting */}
        <div className="space-y-3">
          <label className="block text-white font-semibold">Nature</label>
          <select
            value={options.nature || 'hardy'}
            onChange={(e) => onNatureChange(e.target.value)}
            className="w-full bg-[#141414] border border-[#7f1d1d]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ef4444]/50 transition-colors"
          >
            {NATURES.map(nature => (
              <option key={nature} value={nature} className="capitalize bg-[#1a1a1a]">
                {nature} ({getNatureEffect(nature)})
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-400 text-center">
            {getNatureEffect(options.nature || 'hardy')}
          </div>
        </div>

        {/* Item Setting */}
        <div className="space-y-3">
          <label className="block text-white font-semibold">Held Item</label>
          <select
            value={options.item || ''}
            onChange={(e) => onItemChange(e.target.value)}
            className="w-full bg-[#141414] border border-[#7f1d1d]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ef4444]/50 transition-colors"
            disabled={loadingItems}
          >
            <option value="">No Item</option>
            {Object.entries(getFilteredItems()).map(([category, items]) => (
              items.length > 0 && (
                <optgroup key={category} label={category} className="bg-[#1a1a1a]">
                  {items.map(item => (
                    <option key={item.name} value={item.name} className="capitalize">
                      {item.displayName || item.name.replace(/-/g, ' ')}
                    </option>
                  ))}
                </optgroup>
              )
            ))}
          </select>
          
          {/* Item Effect Display */}
          {options.item && (
            <div className="mt-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#7f1d1d]/20">
              <p className="text-gray-300 text-sm leading-relaxed">
                {getSelectedItemEffect()}
              </p>
            </div>
          )}
          
          {loadingItems && (
            <div className="text-gray-400 text-xs text-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mx-auto"></div>
              Loading items...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Move Slot Component for individual move selection
 */
const MoveSlot = ({ move, index, onMoveSelect, onMoveClear, availableMoves, getMoveLearnInfo }) => (
  <div className="bg-gradient-to-br from-[#141414] to-[#1a1414] border border-[#7f1d1d]/20 rounded-xl p-4 min-h-[140px] flex flex-col">
    <div className="flex items-center justify-between mb-3">
      <select
        value={move.name}
        onChange={(e) => {
          if (e.target.value === '---') {
            onMoveClear(index);
          } else {
            const selectedMove = availableMoves.find(m => m.name === e.target.value);
            if (selectedMove) {
              onMoveSelect(index, selectedMove);
            }
          }
        }}
        className="flex-1 bg-[#1a1a1a] border border-[#7f1d1d]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors"
      >
        <option value="---">--- Select Move ---</option>
        <optgroup label="Level-Up Moves" className="bg-[#1a1a1a]">
          {availableMoves
            .filter(m => m.learnMethod !== 'machine')
            .map(availableMove => (
              <option 
                key={availableMove.name} 
                value={availableMove.name}
                disabled={availableMoves.some((m, idx) => m.name === availableMove.name && m !== availableMove)}
                className="capitalize"
              >
                {availableMove.name} (Lv. {availableMove.levelLearned})
              </option>
            ))
          }
        </optgroup>
        {availableMoves.some(m => m.learnMethod === 'machine') && (
          <optgroup label="TM Moves" className="bg-[#1a1a1a]">
            {availableMoves
              .filter(m => m.learnMethod === 'machine')
              .map(availableMove => (
                <option 
                  key={availableMove.name} 
                  value={availableMove.name}
                  disabled={availableMoves.some((m, idx) => m.name === availableMove.name && m !== availableMove)}
                  className="capitalize"
                >
                  {availableMove.name} {availableMove.tmNumber ? `(TM${availableMove.tmNumber})` : '(TM)'}
                </option>
              ))
            }
          </optgroup>
        )}
      </select>
    </div>
    
    {move.name !== '---' && (
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div className="flex justify-between items-center">
          <span className={`type-badge bg-${move.type} px-2 py-1 text-xs font-semibold`}>
            {move.type}
          </span>
          <div className="flex gap-3 text-xs">
            {move.power > 0 && (
              <span className="text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                Pwr: {move.power}
              </span>
            )}
            <span className="text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
              Acc: {move.accuracy}%
            </span>
            <span className="text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
              PP: {move.pp}
            </span>
          </div>
        </div>
        
        <div className="text-gray-400 text-xs leading-relaxed flex-1 overflow-hidden">
          <div className="line-clamp-3">
            {move.description || 'No description available'}
          </div>
        </div>
        
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          move.learnMethod === 'machine' 
            ? 'bg-blue-900/30 text-blue-400' 
            : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          {getMoveLearnInfo(move)}
        </div>
      </div>
    )}
  </div>
);

/**
 * Moves Section Component for moveset management
 */
const MovesSection = ({
  options,
  availableMoves,
  filteredMoves,
  showMoves,
  loadingMoves,
  moveSearch,
  onMoveSearchChange,
  onMoveSelect,
  onMoveClear,
  onShowMovesToggle,
  getMoveLearnInfo,
  getLockedMovesCount,
  tmMoves
}) => (
  <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        Moveset Configuration
      </h3>
      <div className="flex items-center gap-4">
        {getLockedMovesCount() > 0 && (
          <span className="text-yellow-500 text-sm flex items-center gap-1">
            <Lock size={14} />
            {getLockedMovesCount()} locked
          </span>
        )}
        {tmMoves.length > 0 && (
          <span className="text-blue-400 text-sm">
            {tmMoves.length} TMs
          </span>
        )}
        <button
          onClick={onShowMovesToggle}
          className="text-[#ef4444] text-sm hover:text-[#dc2626] transition-colors font-semibold"
        >
          {showMoves ? 'Hide Moves' : 'Show Available Moves'}
        </button>
      </div>
    </div>

    {/* Selected Moves Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {(options.moves || Array(4).fill({ name: '---', type: 'normal', power: 0, accuracy: 0, pp: 0, description: 'Empty move slot', category: 'status' }))
        .map((move, index) => (
          <MoveSlot
            key={index}
            move={move}
            index={index}
            onMoveSelect={onMoveSelect}
            onMoveClear={onMoveClear}
            availableMoves={availableMoves}
            getMoveLearnInfo={getMoveLearnInfo}
          />
        ))}
    </div>

    {/* Available Moves Pool */}
    {showMoves && (
      <div className="flex-1 overflow-hidden flex flex-col border-t border-[#7f1d1d]/20 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search moves by name, type, or description..."
              value={moveSearch}
              onChange={(e) => onMoveSearchChange(e.target.value)}
              className="w-full bg-[#141414] border border-[#7f1d1d]/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ef4444]/50 transition-colors"
            />
          </div>
          <span className="text-gray-400 text-sm whitespace-nowrap px-3 py-2 bg-[#1a1a1a] rounded-lg">
            {filteredMoves.length} moves
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loadingMoves ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
              <span className="text-gray-400">Loading moves...</span>
            </div>
          ) : filteredMoves.length === 0 ? (
            <div className="text-center py-12 bg-[#141414] rounded-xl border border-[#7f1d1d]/20">
              <Search size={32} className="text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No moves found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredMoves.map((move, index) => {
                const isSelected = options.moves?.some(m => m.name === move.name);
                const isTMMove = move.learnMethod === 'machine';
                
                return (
                  <div
                    key={`${move.name}-${index}`}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                      isSelected
                        ? isTMMove 
                          ? 'bg-blue-900/20 border-blue-500' 
                          : 'bg-green-900/20 border-green-500'
                        : 'bg-[#141414] border-[#7f1d1d]/20 hover:border-[#ef4444]/50 hover:bg-[#1a1414] hover:scale-105'
                    } ${isTMMove ? 'border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => {
                      if (!isSelected) {
                        const emptySlotIndex = options.moves?.findIndex(m => m.name === '---');
                        if (emptySlotIndex !== -1) {
                          onMoveSelect(emptySlotIndex, move);
                        }
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white text-lg group-hover:text-[#ef4444] transition-colors">
                          {move.name}
                        </span>
                        {isTMMove && (
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                            TM{move.tmNumber || ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`type-badge bg-${move.type} px-2 py-1 text-xs font-semibold`}>
                          {move.type}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          isTMMove 
                            ? 'text-blue-400 bg-blue-900/30' 
                            : 'text-yellow-400 bg-yellow-900/30'
                        }`}>
                          {getMoveLearnInfo(move)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-4 text-xs text-gray-300">
                        {move.power > 0 ? (
                          <span>Power: {move.power}</span>
                        ) : (
                          <span className="text-gray-400">Status Move</span>
                        )}
                        <span>Accuracy: {move.accuracy}%</span>
                        <span>PP: {move.pp}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        move.category === 'physical' ? 'bg-red-500/20 text-red-400' :
                        move.category === 'special' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {move.category}
                      </span>
                    </div>
                    
                    <div className="text-gray-400 text-sm leading-relaxed">
                      {move.description || 'No description available'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

/**
 * Preview Panel Component for stats and summary
 */
const PreviewPanel = ({ 
  statsPreview, 
  selectedForm, 
  options, 
  availableItems, 
  pokemon, 
  onAdd, 
  isEditing, 
  hasChanges 
}) => {
  /**
   * Get stat icon for display
   */
  const getStatIcon = (statName) => {
    const icons = {
      hp: <Heart size={16} className="text-red-400" />,
      attack: <Sword size={16} className="text-orange-400" />,
      defense: <Shield size={16} className="text-blue-400" />,
      'special-attack': <Zap size={16} className="text-yellow-400" />,
      'special-defense': <Shield size={16} className="text-green-400" />,
      speed: <Gauge size={16} className="text-purple-400" />
    };
    return icons[statName] || <Gauge size={16} />;
  };

  return (
    <div className="w-96 bg-gradient-to-b from-[#141414] to-[#1a1a1a] border-l border-[#7f1d1d]/30 p-6 flex flex-col">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
        Battle Preview
      </h3>
      
      {/* Stats Preview */}
      <div className="space-y-4 flex-1">
        <h4 className="text-white font-semibold mb-4">Final Stats</h4>
        {statsPreview ? (
          <div className="space-y-3">
            {Object.entries(statsPreview).map(([stat, value]) => (
              <div key={stat} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  {getStatIcon(stat)}
                  <span className="text-gray-400 text-sm capitalize group-hover:text-white transition-colors">
                    {stat.replace('_', ' ')}:
                  </span>
                </div>
                <span className="text-white font-bold text-lg bg-[#1a1a1a] px-3 py-1 rounded-lg">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-2"></div>
            Calculating stats...
          </div>
        )}
      </div>
      
      {/* Form & Item Info */}
      <div className="space-y-4 mt-6">
        {/* Form Info */}
        {selectedForm && (
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#7f1d1d]/30">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              Form Details
            </h4>
            <div className="text-gray-400 text-sm space-y-2">
              <div className="flex gap-2">
                {selectedForm.types.map((type, index) => (
                  <span key={index} className={`type-badge bg-${type} px-2 py-1 text-xs`}>
                    {type}
                  </span>
                ))}
              </div>
              <div className="flex justify-between">
                <span>Base Total:</span>
                <span className="text-white font-semibold">
                  {selectedForm.stats?.reduce((sum, stat) => sum + stat.base_stat, 0)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Item Info */}
        {options.item && (
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#7f1d1d]/30">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Package size={16} />
              Held Item
            </h4>
            <div className="space-y-2">
              <p className="text-[#10b981] font-bold text-lg capitalize">
                {availableItems.find(item => item.name === options.item)?.displayName || options.item.replace(/-/g, ' ')}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {getSelectedItemEffect()}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Button */}
      <button
        onClick={onAdd}
        disabled={!hasChanges && isEditing}
        className={`w-full mt-6 py-4 rounded-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 shadow-2xl ${
          hasChanges || !isEditing
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Plus size={24} />
        {isEditing ? 'Update Pokémon' : 'Add to Team'} (Lv. {options.level})
      </button>
      
      {!hasChanges && isEditing && (
        <p className="text-gray-500 text-sm text-center mt-2">
          Make changes to update Pokémon
        </p>
      )}
    </div>
  );
};

export default PokemonSettings;