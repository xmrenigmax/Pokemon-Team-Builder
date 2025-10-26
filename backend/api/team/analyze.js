import pokeAPI from '../../../lib/pokeapi';
import TypeCalculator from '../../../lib/typeCalculator';

/**
 * API endpoint for team analysis
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { team } = req.body;

  if (!team || !Array.isArray(team)) {
    return res.status(400).json({ error: 'Team array is required' });
  }

  if (team.length > 6) {
    return res.status(400).json({ error: 'Team cannot exceed 6 Pokémon' });
  }

  try {
    // Get Pokémon data for all team members
    const teamData = await Promise.all(
      team.map(pokemonId => pokeAPI.getPokemon(pokemonId))
    );

    // Get type relationships for analysis
    const typeRelations = await pokeAPI.getTypeRelationships();
    const calculator = new TypeCalculator(typeRelations);

    // Perform team analysis
    const analysis = {
      typeCoverage: calculator.getTeamTypeCoverage(teamData),
      weaknesses: calculator.analyzeTeamWeaknesses(teamData),
      teamStats: {
        totalHP: teamData.reduce((sum, p) => sum + (p.stats.find(s => s.name === 'hp')?.base_stat || 0), 0),
        totalAttack: teamData.reduce((sum, p) => sum + (p.stats.find(s => s.name === 'attack')?.base_stat || 0), 0),
        totalDefense: teamData.reduce((sum, p) => sum + (p.stats.find(s => s.name === 'defense')?.base_stat || 0), 0),
        totalSpecialAttack: teamData.reduce((sum, p) => sum + (p.stats.find(s => s.name === 'special_attack')?.base_stat || 0), 0),
        totalSpecialDefense: teamData.reduce((sum, p) => sum + (p.stats.find(s => s.name === 'special_defense')?.base_stat || 0), 0),
        totalSpeed: teamData.reduce((sum, p) => sum + (p.stats.find(s => s.name === 'speed')?.base_stat || 0), 0),
      }
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Team analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze team' });
  }
}