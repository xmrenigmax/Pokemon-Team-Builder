// Test just the Pokémon endpoint
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test the Pokémon endpoint directly
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/25');
    const data = await response.json();
    
    res.status(200).json({
      working: true,
      pokemon: {
        id: data.id,
        name: data.name,
        types: data.types.map(t => t.type.name)
      }
    });
  } catch (error) {
    res.status(500).json({
      working: false,
      error: error.message
    });
  }
}