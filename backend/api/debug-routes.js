export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // This will show us what endpoints are actually available
  const availableEndpoints = [
    '/api',
    '/api/pokemon/search?q=pika', 
    '/api/pokemon/types',
    '/api/team/analyze (POST)',
    '/api/test',
    '/api/debug-routes',
    '/api/debug-structure'
  ];

  res.status(200).json({
    message: 'Current API Structure',
    available_endpoints: availableEndpoints,
    deployment_note: 'Dynamic routes ([id].js) may not be working properly'
  });
}