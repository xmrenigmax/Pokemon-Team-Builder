import axios from 'axios';
import { setCorsHeaders, handleOptions } from '../../lib/cors';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) {
    return;
  }

  const { id, level = 50, nature = 'hardy' } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID parameter is required. Use /api/pokemon/battle?id=25' });
  }

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = response.data;

    // Calculate battle stats
    const baseStats = getBaseStats(data);
    const calculatedStats = calculateBattleStats(baseStats, parseInt(level), nature);

    // Get default moves
    const defaultMoves = await getDefaultMoves(data.moves);

    const battlePokemon = {
      id: data.id,
      name: data.name,
      level: parseInt(level),
      nature,
      ability: getDefaultAbility(data.abilities),
      moves: defaultMoves,
      calculatedStats,
      sprites: {
        front_default: data.sprites.front_default,
        front_shiny: data.sprites.front_shiny,
      },
      types: data.types.map(t => ({
        slot: t.slot,
        type: { name: t.type.name }
      })),
      baseStats
    };

    res.status(200).json(battlePokemon);
  } catch (error) {
    console.error(`Error fetching battle Pokémon ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch battle Pokémon data' });
  }
}

// Helper functions
function getBaseStats(pokemonData) {
  const stats = {};
  pokemonData.stats.forEach(stat => {
    stats[stat.stat.name] = stat.base_stat;
  });
  return stats;
}

function calculateBattleStats(baseStats, level, nature) {
  const calculateStat = (base, isHP = false) => {
    if (isHP) {
      return Math.floor(((2 * base + 31) * level) / 100) + level + 10;
    }
    return Math.floor(((2 * base + 31) * level) / 100) + 5;
  };

  return {
    hp: calculateStat(baseStats.hp || 0, true),
    attack: calculateStat(baseStats.attack || 0),
    defense: calculateStat(baseStats.defense || 0),
    special_attack: calculateStat(baseStats['special-attack'] || 0),
    special_defense: calculateStat(baseStats['special-defense'] || 0),
    speed: calculateStat(baseStats.speed || 0)
  };
}

async function getDefaultMoves(moves) {
  const movePromises = moves.slice(0, 4).map(async (move, index) => {
    try {
      const moveResponse = await axios.get(move.move.url);
      const moveData = moveResponse.data;
      
      return {
        name: moveData.name,
        type: moveData.type.name,
        power: moveData.power || 0,
        accuracy: moveData.accuracy || 100,
        pp: moveData.pp,
        description: getMoveDescription(moveData),
        category: moveData.damage_class?.name || 'status'
      };
    } catch (error) {
      return {
        name: `Move ${index + 1}`,
        type: 'normal',
        power: 0,
        accuracy: 0,
        pp: 0,
        description: 'Move data unavailable',
        category: 'status'
      };
    }
  });

  const fetchedMoves = await Promise.all(movePromises);
  
  while (fetchedMoves.length < 4) {
    fetchedMoves.push({
      name: '---',
      type: 'normal',
      power: 0,
      accuracy: 0,
      pp: 0,
      description: 'Empty move slot',
      category: 'status'
    });
  }

  return fetchedMoves;
}

function getMoveDescription(moveData) {
  const englishEntry = moveData.effect_entries?.find(entry => entry.language.name === 'en');
  return englishEntry?.effect || 'No description available';
}

function getDefaultAbility(abilities) {
  const nonHidden = abilities.find(ability => !ability.is_hidden);
  return nonHidden ? nonHidden.ability.name : abilities[0]?.ability.name || 'unknown';
}