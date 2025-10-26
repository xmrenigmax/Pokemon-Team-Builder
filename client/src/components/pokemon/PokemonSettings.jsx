import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronDown, ChevronUp, Search, Lock, Package, Zap, Sparkles, Moon, Sun } from 'lucide-react';
import { pokemonAPI } from '../../utils/api';

const NATURES = [
  'hardy', 'lonely', 'brave', 'adamant', 'naughty',
  'bold', 'docile', 'relaxed', 'impish', 'lax',
  'timid', 'hasty', 'serious', 'jolly', 'naive',
  'modest', 'mild', 'quiet', 'bashful', 'rash',
  'calm', 'gentle', 'sassy', 'careful', 'quirky'
];

// Fallback items in case API fails
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
  },
  {
    name: 'focus-sash',
    category: 'held-items',
    effect: 'Allows the holder to survive one fatal blow with 1 HP.',
    displayName: 'Focus Sash'
  },
  {
    name: 'assault-vest',
    category: 'held-items',
    effect: 'Boosts Special Defense by 50%, but prevents status moves.',
    displayName: 'Assault Vest'
  },
  {
    name: 'weakness-policy',
    category: 'held-items',
    effect: 'Boosts Attack and Special Attack by 2 stages when hit by a super-effective move.',
    displayName: 'Weakness Policy'
  },
  {
    name: 'rocky-helmet',
    category: 'held-items',
    effect: 'Damages attacking Pokémon for 1/6 of their max HP when they use a contact move.',
    displayName: 'Rocky Helmet'
  },
  {
    name: 'expert-belt',
    category: 'held-items',
    effect: 'Boosts super-effective moves by 20%.',
    displayName: 'Expert Belt'
  },
  {
    name: 'muscle-band',
    category: 'held-items',
    effect: 'Boosts physical moves by 10%.',
    displayName: 'Muscle Band'
  },
  {
    name: 'wise-glasses',
    category: 'held-items',
    effect: 'Boosts special moves by 10%.',
    displayName: 'Wise Glasses'
  },
  {
    name: 'charizardite-x',
    category: 'mega-stones',
    effect: 'Allows Charizard to Mega Evolve into Mega Charizard X.',
    displayName: 'Charizardite X'
  },
  {
    name: 'charizardite-y',
    category: 'mega-stones',
    effect: 'Allows Charizard to Mega Evolve into Mega Charizard Y.',
    displayName: 'Charizardite Y'
  },
  {
    name: 'venusaurite',
    category: 'mega-stones',
    effect: 'Allows Venusaur to Mega Evolve.',
    displayName: 'Venusaurite'
  },
  {
    name: 'blastoisinite',
    category: 'mega-stones',
    effect: 'Allows Blastoise to Mega Evolve.',
    displayName: 'Blastoisinite'
  },
  {
    name: 'normalium-z',
    category: 'z-crystals',
    effect: 'Allows Normal-type Z-Moves.',
    displayName: 'Normalium Z'
  },
  {
    name: 'firium-z',
    category: 'z-crystals',
    effect: 'Allows Fire-type Z-Moves.',
    displayName: 'Firium Z'
  },
  {
    name: 'waterium-z',
    category: 'z-crystals',
    effect: 'Allows Water-type Z-Moves.',
    displayName: 'Waterium Z'
  }
];

const PokemonSettings = ({ pokemon, options, onOptionsChange, onAdd, onClose, isEditing = false }) => {
  const [allMoves, setAllMoves] = useState([]);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [filteredMoves, setFilteredMoves] = useState([]);
  const [showMoves, setShowMoves] = useState(false);
  const [statsPreview, setStatsPreview] = useState(null);
  const [moveSearch, setMoveSearch] = useState('');
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [tmMoves, setTmMoves] = useState([]);
  
  // New states for forms and items
  const [pokemonForms, setPokemonForms] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [availableItems, setAvailableItems] = useState(FALLBACK_ITEMS);
  const [showForms, setShowForms] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Load all data when component mounts
  useEffect(() => {
    loadAllMoves();
    calculateStatsPreview();
    loadPokemonForms();
    loadAvailableItems();
   if (isEditing && options.form) {
      setSelectedForm(options.form);
    }
  }, [pokemon.id]);

  // Update available moves and recalculate stats when level changes
  useEffect(() => {
    updateAvailableMoves();
    calculateStatsPreview();
  }, [options.level, allMoves, options.nature, selectedForm]);

  // Filter moves when search changes
  useEffect(() => {
    if (moveSearch.trim()) {
      const filtered = availableMoves.filter(move =>
        move.name.toLowerCase().includes(moveSearch.toLowerCase()) ||
        move.type.toLowerCase().includes(moveSearch.toLowerCase())
      );
      setFilteredMoves(filtered);
    } else {
      setFilteredMoves(availableMoves);
    }
  }, [moveSearch, availableMoves]);

  const loadAllMoves = async () => {
    setLoadingMoves(true);
    try {
      const learnset = await pokemonAPI.getPokemonLearnset(pokemon.id);
      
      // Load level-up moves
      const levelUpMovePromises = learnset.level_up_moves.map(async (moveData) => {
        try {
          const move = await pokemonAPI.getMove(moveData.name);
          return {
            ...move,
            learnMethod: moveData.learn_method,
            levelLearned: moveData.level,
            description: move.description || 'No description available'
          };
        } catch (error) {
          console.error(`Failed to fetch move ${moveData.name}:`, error);
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
            description: move.description || 'No description available'
          };
        } catch (error) {
          console.error(`Failed to fetch TM move ${moveData.name}:`, error);
          return null;
        }
      });

      const levelUpMoves = (await Promise.all(levelUpMovePromises))
        .filter(Boolean)
        .sort((a, b) => a.levelLearned - b.levelLearned);

      const tmMovesList = (await Promise.all(tmMovePromises))
        .filter(Boolean)
        .sort((a, b) => (a.tmNumber || 0) - (b.tmNumber || 0));

      setAllMoves(levelUpMoves);
      setTmMoves(tmMovesList);
      
    } catch (error) {
      console.error('Error loading learnset:', error);
      loadFallbackMoves();
    } finally {
      setLoadingMoves(false);
    }
  };

   const loadPokemonForms = async () => {
    setLoadingForms(true);
    try {
      const forms = await pokemonAPI.getPokemonForms(pokemon.id);
      setPokemonForms(forms);
      
      // Set form based on existing data or default
      let formToSet = null;
      
      // If editing and we have existing form, use that
      if (isEditing && options.form) {
        formToSet = options.form;
      } else {
        // Otherwise use default form
        formToSet = forms.forms.standard?.[0] || forms.forms.regional?.[0] || forms.forms.mega?.[0];
      }
      
      if (formToSet) {
        setSelectedForm(formToSet);
        // Only update options if we're not already setting from existing data
        if (!isEditing || !options.form) {
          onOptionsChange({
            ...options,
            form: formToSet,
            formName: formToSet.form_name
          });
        }
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoadingForms(false);
    }
  };

  const loadAvailableItems = async () => {
    setLoadingItems(true);
    try {
      console.log('Loading battle items...');
      const itemsData = await pokemonAPI.getItems();
      console.log('Battle items loaded:', itemsData);
      
      if (itemsData && itemsData.items && itemsData.items.length > 0) {
        // Filter out any non-battle items and ensure we have proper data
        const battleItems = itemsData.items.filter(item => 
          item && item.name && item.category
        );
        setAvailableItems(battleItems);
      } else {
        console.warn('No items data received, using fallback');
        setAvailableItems(FALLBACK_ITEMS);
      }
    } catch (error) {
      console.error('Error loading items, using fallback:', error);
      setAvailableItems(FALLBACK_ITEMS);
    } finally {
      setLoadingItems(false);
    }
  };

  const updateAvailableMoves = () => {
    const learnableLevelMoves = allMoves.filter(move => 
      move.levelLearned <= options.level
    );
    
    const allAvailableMoves = [...learnableLevelMoves, ...tmMoves];
    
    setAvailableMoves(allAvailableMoves);
    setFilteredMoves(allAvailableMoves);
    
    updateCurrentMoves(allAvailableMoves);
  };

  const updateCurrentMoves = (learnableMoves) => {
    const currentMoves = options.moves || Array(4).fill(createEmptyMove());
    const newMoves = [...currentMoves];
    let hasChanges = false;

    const eligibleMoves = [...learnableMoves].sort((a, b) => {
      const powerDiff = (b.power || 0) - (a.power || 0);
      if (Math.abs(powerDiff) > 20) return powerDiff;
      return b.levelLearned - a.levelLearned;
    });

    for (let i = 0; i < newMoves.length; i++) {
      if (newMoves[i].name === '---') {
        const bestMove = findBestMoveForSlot(eligibleMoves, newMoves);
        if (bestMove) {
          newMoves[i] = bestMove;
          hasChanges = true;
        }
      }
    }

    if (learnableMoves.length > 4) {
      for (let i = 0; i < newMoves.length; i++) {
        const currentMove = newMoves[i];
        if (currentMove.name !== '---' && currentMove.power < 40 && currentMove.learnMethod !== 'machine') {
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
  };

  const handleFormChange = (form) => {
    setSelectedForm(form);
    onOptionsChange({
      ...options,
      form: form,
      formName: form.form_name
    });
    
    // Recalculate stats for the new form
    calculateStatsPreview();
  };

  const handleItemChange = (itemName) => {
    console.log('Changing item to:', itemName);
    const selectedItem = availableItems.find(item => item.name === itemName);
    onOptionsChange({ 
      ...options, 
      item: itemName,
      itemData: selectedItem 
    });
  };

  const findBestMoveForSlot = (eligibleMoves, currentMoves) => {
    return eligibleMoves.find(move => 
      !currentMoves.some(m => m.name === move.name)
    );
  };

  const findBetterReplacement = (currentMove, eligibleMoves, currentMoves) => {
    return eligibleMoves.find(move => 
      move.power >= (currentMove.power + 20) &&
      !currentMoves.some(m => m.name === move.name)
    );
  };

  const createEmptyMove = () => ({
    name: '---', 
    type: 'normal', 
    power: 0, 
    accuracy: 0, 
    pp: 0, 
    description: 'Empty move slot', 
    category: 'status'
  });

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
      }
    ];
    setAllMoves(fallbackMoves);
    setAvailableMoves(fallbackMoves);
  };

  const calculateStatsPreview = async () => {
    try {
      // Use selected form if available, otherwise use base pokemon
      const pokemonId = selectedForm?.id || pokemon.id;
      const battleData = await pokemonAPI.getBattlePokemon(pokemonId, {
        level: options.level,
        nature: options.nature
      });
      setStatsPreview(battleData?.calculatedStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleLevelChange = (level) => {
    const newLevel = parseInt(level);
    onOptionsChange({ ...options, level: newLevel });
  };

  const handleNatureChange = (nature) => {
    onOptionsChange({ ...options, nature });
  };

  const handleMoveSelect = (moveIndex, selectedMove) => {
    const newMoves = [...(options.moves || Array(4).fill(createEmptyMove()))];
    
    const isAlreadySelected = newMoves.some((move, idx) => 
      idx !== moveIndex && move.name === selectedMove.name
    );
    
    if (!isAlreadySelected) {
      newMoves[moveIndex] = selectedMove;
      onOptionsChange({ ...options, moves: newMoves });
    }
  };

  const handleMoveClear = (moveIndex) => {
    const newMoves = [...(options.moves || [])];
    newMoves[moveIndex] = createEmptyMove();
    onOptionsChange({ ...options, moves: newMoves });
  };

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

  const getLockedMovesCount = () => {
    return allMoves.filter(move => move.levelLearned > options.level).length;
  };

  const getFormIcon = (formType) => {
    switch (formType) {
      case 'mega': return <Zap size={14} />;
      case 'gigantamax': return <Sparkles size={14} />;
      case 'primal': return <Sun size={14} />;
      case 'eternamax': return <Moon size={14} />;
      default: return null;
    }
  };

  const FormCard = ({ form, isSelected, onSelect, requiresItem }) => (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#1e3a8a] border-[#3b82f6]'
          : 'bg-[#141414] border-[#7f1d1d]/20 hover:border-[#ef4444]/30'
      }`}
      onClick={() => onSelect(form)}
    >
      <div className="flex items-center gap-2 mb-2">
        <img 
          src={form.sprites.front_default || form.sprites.other?.['official-artwork']?.front_default || '/placeholder-pokemon.png'} 
          alt={form.name}
          className="w-12 h-12 object-contain"
        />
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold capitalize text-sm truncate">
            {form.name.replace(`${pokemon.name}-`, '').replace('-', ' ')}
          </div>
          <div className="flex gap-1 flex-wrap">
            {form.types.map(type => (
              <span key={type} className={`type-badge bg-${type} px-1 py-0.5 text-xs`}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
      {requiresItem && (
        <div className="text-yellow-400 text-xs flex items-center gap-1">
          <Package size={10} />
          Requires: {requiresItem}
        </div>
      )}
    </div>
  );

  const getFilteredItems = () => {
  if (!availableItems.length) return [];
  
  const categories = {};
  
  // Always show held items
  categories['Held Items'] = availableItems.filter(item => 
    item.category === 'held-items'
  );
  
  // Show mega stones if Pokémon has mega forms - filter by Pokémon name
  const megaForms = pokemonForms?.forms.mega || [];
  const hasMegaForms = megaForms.length > 0;
  
  if (hasMegaForms) {
    const pokemonName = pokemon.name.toLowerCase();
    categories['Mega Stones'] = availableItems.filter(item => {
      if (item.category !== 'mega-stones') return false;
      
      // Check if this mega stone matches the current Pokémon
      const stoneName = item.name.toLowerCase();
      
      // Direct name match (e.g., 'gengarite' for 'gengar')
      if (stoneName.includes(pokemonName) && stoneName.endsWith('ite')) {
        return true;
      }
      
      // Special cases for Pokémon with multiple forms or different naming
      const specialCases = {
        'charizard': ['charizardite-x', 'charizardite-y'],
        'mewtwo': ['mewtwonite-x', 'mewtwonite-y'],
        'kyogre': ['blue-orb'], // Primal
        'groudon': ['red-orb'], // Primal
        'rayquaza': [] // Doesn't use a stone
      };
      
      if (specialCases[pokemonName]?.includes(item.name)) {
        return true;
      }
      
      return false;
    });
  }
  
  // Show Z-Crystals - filter by Pokémon types for type-specific crystals
  const pokemonTypes = selectedForm?.types || pokemon.types.map(t => t.type.name);
  categories['Z-Crystals'] = availableItems.filter(item => {
    if (item.category !== 'z-crystals') return false;
    
    // Show all Z-Crystals for now, or filter by Pokémon types
    // For example, if Pokémon is Fire type, show Firium Z
    const crystalType = item.name.replace('-z', '').replace('ium', '');
    return pokemonTypes.some(type => 
      type.toLowerCase().includes(crystalType) || 
      crystalType.includes(type.toLowerCase())
    );
  });
  
  // Show Dynamax items if Pokémon has Gigantamax forms
  const gigantamaxForms = pokemonForms?.forms.gigantamax || [];
  const hasGigantamaxForms = gigantamaxForms.length > 0;
  
  if (hasGigantamaxForms) {
    categories['Dynamax'] = availableItems.filter(item => 
      item.category === 'dynamax'
    );
  }
  
  // Show type-boosting items based on Pokémon's types
  const typeBoostingItems = availableItems.filter(item => {
    if (item.category !== 'held-items') return false;
    
    const typeItems = {
      'black-glasses': 'dark',
      'charcoal': 'fire',
      'mystic-water': 'water',
      'magnet': 'electric',
      'miracle-seed': 'grass',
      'never-melt-ice': 'ice',
      'dragon-fang': 'dragon',
      'black-belt': 'fighting',
      'poison-barb': 'poison',
      'soft-sand': 'ground',
      'sharp-beak': 'flying',
      'twisted-spoon': 'psychic',
      'hard-stone': 'rock',
      'silver-powder': 'bug',
      'spell-tag': 'ghost',
      'metal-coat': 'steel',
      'silken-scarf': 'normal'
    };
    
    const itemType = typeItems[item.name];
    return itemType && pokemonTypes.includes(itemType);
  });
  
  if (typeBoostingItems.length > 0) {
    categories['Type Boosters'] = typeBoostingItems;
  }
  
  return categories;
};

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
            {isEditing ? 'Edit' : 'Add'} {pokemon.name} to Team
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
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[750px]">
          {/* Left Column - Settings & Moves */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Forms Section */}
            {pokemonForms && pokemonForms.forms && (
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
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {/* Standard Forms */}
                    {pokemonForms.forms.standard.length > 0 && (
                      <div>
                        <h4 className="text-gray-300 font-semibold text-sm mb-2">Standard Forms</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {pokemonForms.forms.standard.map((form) => (
                            <FormCard 
                              key={form.id} 
                              form={form} 
                              isSelected={selectedForm?.id === form.id}
                              onSelect={handleFormChange}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Mega Evolutions */}
                    {pokemonForms.forms.mega.length > 0 && (
                      <div>
                        <h4 className="text-yellow-400 font-semibold text-sm mb-2 flex items-center gap-1">
                          <Zap size={14} />
                          Mega Evolutions
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {pokemonForms.forms.mega.map((form) => (
                            <FormCard 
                              key={form.id} 
                              form={form} 
                              isSelected={selectedForm?.id === form.id}
                              onSelect={handleFormChange}
                              requiresItem="Mega Stone"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Regional Variants */}
                    {pokemonForms.forms.regional.length > 0 && (
                      <div>
                        <h4 className="text-blue-400 font-semibold text-sm mb-2">Regional Variants</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {pokemonForms.forms.regional.map((form) => (
                            <FormCard 
                              key={form.id} 
                              form={form} 
                              isSelected={selectedForm?.id === form.id}
                              onSelect={handleFormChange}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Gigantamax Forms */}
                    {pokemonForms.forms.gigantamax.length > 0 && (
                      <div>
                        <h4 className="text-purple-400 font-semibold text-sm mb-2 flex items-center gap-1">
                          <Sparkles size={14} />
                          Gigantamax Forms
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {pokemonForms.forms.gigantamax.map((form) => (
                            <FormCard 
                              key={form.id} 
                              form={form} 
                              isSelected={selectedForm?.id === form.id}
                              onSelect={handleFormChange}
                              requiresItem="Dynamax Band"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Special Forms */}
                    {pokemonForms.forms.special.length > 0 && (
                      <div>
                        <h4 className="text-green-400 font-semibold text-sm mb-2">Special Forms</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {pokemonForms.forms.special.map((form) => (
                            <FormCard 
                              key={form.id} 
                              form={form} 
                              isSelected={selectedForm?.id === form.id}
                              onSelect={handleFormChange}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Basic Settings */}
            <div className="p-6 border-b border-[#7f1d1d]/30">
              <div className="grid grid-cols-3 gap-4">
                {/* Level Setting */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Level: {options.level}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={options.level}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="w-full h-2 bg-[#141414] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Nature Setting */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Nature
                  </label>
                  <select
                    value={options.nature}
                    onChange={(e) => handleNatureChange(e.target.value)}
                    className="w-full bg-[#141414] border border-[#7f1d1d]/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ef4444]/50"
                  >
                    {NATURES.map(nature => (
                      <option key={nature} value={nature} className="capitalize">
                        {nature} ({getNatureEffect(nature)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Setting */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Held Item
                  </label>
                  <select
                    value={options.item || ''}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className="w-full bg-[#141414] border border-[#7f1d1d]/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ef4444]/50"
                    disabled={loadingItems}
                  >
                    <option value="">No Item</option>
                    {Object.entries(getFilteredItems()).map(([category, items]) => (
                      items.length > 0 && (
                        <optgroup key={category} label={category}>
                          {items.map(item => (
                            <option key={item.name} value={item.name}>
                              {item.displayName || item.name.replace(/-/g, ' ')}
                            </option>
                          ))}
                        </optgroup>
                      )
                    ))}
                  </select>
                  
                  {/* Show item effect when an item is selected */}
                  {options.item && (
                    <div className="mt-2 p-2 bg-[#1a1a1a] rounded-lg border border-[#7f1d1d]/20">
                      <p className="text-gray-400 text-xs">
                        {getSelectedItemEffect()}
                      </p>
                    </div>
                  )}
                  
                  {loadingItems && (
                    <div className="text-gray-400 text-xs mt-1">Loading items...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Moves Section */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Selected Moves</h3>
                <div className="flex items-center gap-4">
                  {getLockedMovesCount() > 0 && (
                    <span className="text-yellow-500 text-sm">
                      {getLockedMovesCount()} level-up moves locked
                    </span>
                  )}
                  {tmMoves.length > 0 && (
                    <span className="text-blue-400 text-sm">
                      {tmMoves.length} TM moves available
                    </span>
                  )}
                  <button
                    onClick={() => setShowMoves(!showMoves)}
                    className="text-[#ef4444] text-sm hover:text-[#dc2626] transition-colors"
                  >
                    {showMoves ? 'Hide Moves' : 'Show Available Moves'}
                  </button>
                </div>
              </div>

              {/* Selected Moves Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {(options.moves || Array(4).fill(createEmptyMove())).map((move, index) => (
                  <div 
                    key={index} 
                    className="bg-[#141414] border border-[#7f1d1d]/20 rounded-lg p-4 min-h-[120px] flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <select
                        value={move.name}
                        onChange={(e) => {
                          if (e.target.value === '---') {
                            handleMoveClear(index);
                          } else {
                            const selectedMove = availableMoves.find(m => m.name === e.target.value);
                            if (selectedMove) {
                              handleMoveSelect(index, selectedMove);
                            }
                          }
                        }}
                        className="flex-1 bg-[#1a1a1a] border border-[#7f1d1d]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ef4444]/50"
                      >
                        <option value="---">--- Select Move ---</option>
                        <option disabled>--- Level-Up Moves ---</option>
                        {allMoves
                          .filter(m => m.levelLearned <= options.level)
                          .map(availableMove => (
                            <option 
                              key={availableMove.name} 
                              value={availableMove.name}
                              disabled={options.moves?.some((m, idx) => idx !== index && m.name === availableMove.name)}
                            >
                              {availableMove.name} (Lv. {availableMove.levelLearned})
                            </option>
                          ))
                        }
                        {tmMoves.length > 0 && (
                          <>
                            <option disabled>--- TM Moves ---</option>
                            {tmMoves.map(availableMove => (
                              <option 
                                key={availableMove.name} 
                                value={availableMove.name}
                                disabled={options.moves?.some((m, idx) => idx !== index && m.name === availableMove.name)}
                              >
                                {availableMove.name} {availableMove.tmNumber ? `(TM${availableMove.tmNumber})` : '(TM)'}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    
                    {move.name !== '---' && (
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`type-badge bg-${move.type} px-2 py-1 text-xs font-semibold`}>
                            {move.type}
                          </span>
                          <div className="flex gap-2 text-xs">
                            <span className="text-gray-300">
                              {move.power > 0 ? `Pwr: ${move.power}` : 'Status'}
                            </span>
                            <span className="text-gray-300">
                              Acc: {move.accuracy}%
                            </span>
                            <span className="text-gray-300">
                              PP: {move.pp}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-gray-400 text-xs leading-relaxed flex-1 overflow-hidden">
                          <div className="line-clamp-3">
                            {move.description || 'No description available'}
                          </div>
                        </div>
                        
                        <div className={`text-xs font-medium ${
                          move.learnMethod === 'machine' ? 'text-blue-400' : 'text-[#fbbf24]'
                        }`}>
                          {move.learnMethod === 'machine' 
                            ? `TM${move.tmNumber || ''}` 
                            : `Learned at Lv. ${move.levelLearned}`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Moves Pool */}
              {showMoves && (
                <div className="flex-1 overflow-hidden flex flex-col border-t border-[#7f1d1d]/20 pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search available moves..."
                        value={moveSearch}
                        onChange={(e) => setMoveSearch(e.target.value)}
                        className="w-full bg-[#141414] border border-[#7f1d1d]/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ef4444]/50"
                      />
                    </div>
                    <span className="text-gray-400 text-sm whitespace-nowrap px-3">
                      {filteredMoves.length} available
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {loadingMoves ? (
                      <div className="text-center text-gray-400 py-8">Loading moves...</div>
                    ) : filteredMoves.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        No moves available at level {options.level}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 pr-2">
                        {filteredMoves.map((move, index) => {
                          const isSelected = options.moves?.some(m => m.name === move.name);
                          const isTMMove = move.learnMethod === 'machine';
                          
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border cursor-pointer transition-all group ${
                                isSelected
                                  ? isTMMove 
                                    ? 'bg-[#1e3a8a] border-[#3b82f6]' 
                                    : 'bg-[#15803d] border-[#22c55e]'
                                  : 'bg-[#141414] border-[#7f1d1d]/20 hover:border-[#ef4444]/30 hover:bg-[#1f1f1f]'
                              } ${isTMMove ? 'border-l-4 border-l-blue-500' : ''}`}
                              onClick={() => {
                                if (!isSelected) {
                                  const emptySlotIndex = options.moves?.findIndex(m => m.name === '---');
                                  if (emptySlotIndex !== -1) {
                                    handleMoveSelect(emptySlotIndex, move);
                                  }
                                }
                              }}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-base group-hover:text-[#ef4444] transition-colors">
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
                                      : 'text-[#fbbf24] bg-yellow-900/30'
                                  }`}>
                                    {getMoveLearnInfo(move)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex gap-4 text-xs text-gray-300">
                                  <span>{move.power > 0 ? `Power: ${move.power}` : 'Status Move'}</span>
                                  <span>Accuracy: {move.accuracy}%</span>
                                  <span>PP: {move.pp}</span>
                                </div>
                                <span className="text-xs text-gray-400 capitalize bg-gray-800/50 px-2 py-1 rounded">
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
          </div>

          {/* Right Column - Stats Preview & Item Info */}
          <div className="w-80 bg-[#141414] border-l border-[#7f1d1d]/30 p-6 flex flex-col">
            <h3 className="text-white font-semibold mb-6 text-lg">Stats Preview</h3>
            {statsPreview ? (
              <div className="space-y-4 flex-1">
                {Object.entries(statsPreview).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm capitalize">
                      {stat.replace('_', ' ')}:
                    </span>
                    <span className="text-white font-bold text-lg">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm flex-1 flex items-center justify-center">
                Calculating stats...
              </div>
            )}
            
            {/* Form & Item Info */}
            <div className="space-y-4 mt-6">
              {/* Form Info */}
              {selectedForm && (
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#7f1d1d]/30">
                  <h4 className="text-white font-semibold mb-2">Form Details</h4>
                  <div className="text-gray-400 text-sm">
                    <div className="flex gap-2 mb-1">
                      {selectedForm.types.map(type => (
                        <span key={type} className={`type-badge bg-${type} px-2 py-1 text-xs`}>
                          {type}
                        </span>
                      ))}
                    </div>
                    <p>Base Stats Total: {selectedForm.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}</p>
                  </div>
                </div>
              )}
              
              {/* Item Info */}
              {options.item && (
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#7f1d1d]/30">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Package size={16} />
                    Held Item: {availableItems.find(item => item.name === options.item)?.displayName || options.item}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {getSelectedItemEffect()}
                  </p>
                </div>
              )}
            </div>
            
            {/* Add Button */}
            <button
            onClick={onAdd}
            className="w-full mt-6 bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl transition-colors font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Plus size={24} />
            {isEditing ? 'Update Pokémon' : 'Add to Team'} (Lv. {options.level})
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonSettings;