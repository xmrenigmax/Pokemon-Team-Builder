// api/team/analyze.js
import pokeAPI from '../../lib/pokeapi';
import TypeCalculator from '../../lib/typeCalculator';
import { setCorsHeaders, handleOptions } from '../../lib/cors';

/**
 * API endpoint for team analysis
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://pokemon-team-builder-plum.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    console.log('Starting team analysis for:', team);
    
    // Get Pokémon data for all team members
    const teamData = await Promise.all(
      team.map(async (pokemonId) => {
        try {
          return await pokeAPI.getPokemon(pokemonId);
        } catch (error) {
          console.error(`Failed to fetch Pokémon ${pokemonId}:`, error.message);
          throw new Error(`Failed to fetch Pokémon ${pokemonId}`);
        }
      })
    );

    console.log('Fetched team data, getting type relationships...');

    // Get type relationships for analysis
    const typeRelations = await pokeAPI.getTypeRelationships();
    const calculator = new TypeCalculator(typeRelations);

    console.log('Performing team analysis...');

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
      },
      teamMembers: teamData.map(p => ({
        id: p.id,
        name: p.name,
        types: p.types.map(t => t.type.name)
      }))
    };

    console.log('Team analysis completed successfully');

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Team analysis error:', error.message);
    console.error('Error stack:', error.stack);
    
    // More specific error messages
    if (error.message.includes('Failed to fetch Pokémon')) {
      res.status(400).json({ error: error.message });
    } else if (error.message.includes('type relationships')) {
      res.status(500).json({ error: 'Failed to load type data for analysis' });
    } else {
      res.status(500).json({ error: 'Failed to analyze team: ' + error.message });
    }
  }
}