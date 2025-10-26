import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID parameter is required' });
  }

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const data = response.data;

    // Extract level-up moves with actual levels
    const levelUpMoves = data.moves
      .filter(move => move.version_group_details
        .some(detail => detail.move_learn_method.name === 'level-up')
      )
      .map(move => {
        const levelDetail = move.version_group_details
          .find(detail => detail.move_learn_method.name === 'level-up');
        return {
          name: move.move.name,
          level: levelDetail.level_learned_at,
          learn_method: 'level-up',
          version_group: levelDetail.version_group.name
        };
      })
      .sort((a, b) => a.level - b.level);

    // Extract other move learning methods
    const tmMoves = data.moves
      .filter(move => move.version_group_details
        .some(detail => detail.move_learn_method.name === 'machine')
      )
      .map(move => ({
        name: move.move.name,
        learn_method: 'machine',
        machine: move.version_group_details
          .find(detail => detail.move_learn_method.name === 'machine')
          .move_learn_method.name
      }));

    const eggMoves = data.moves
      .filter(move => move.version_group_details
        .some(detail => detail.move_learn_method.name === 'egg')
      )
      .map(move => ({
        name: move.move.name,
        learn_method: 'egg'
      }));

    res.status(200).json({
      id: data.id,
      name: data.name,
      level_up_moves: levelUpMoves,
      tm_moves: tmMoves,
      egg_moves: eggMoves,
      total_moves: levelUpMoves.length + tmMoves.length + eggMoves.length
    });

  } catch (error) {
    console.error(`Error fetching learnset for ${id}:`, error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: `Pokémon with ID ${id} not found` });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch learnset data',
      details: error.message 
    });
  }
}