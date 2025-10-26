export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const routes = [
    '/api/pokemon?id=25',
    '/api/pokemon/search?q=pika', 
    '/api/pokemon/battle?id=25',
    '/api/pokemon/evolution?id=25',
    '/api/moves?id=thunderbolt',
    '/api/abilities?id=static'
  ];
  
  res.status(200).json({
    message: 'Available API Routes',
    routes: routes,
    instructions: 'Visit each route to test if it works'
  });
}