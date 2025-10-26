/**
 * CORS utility for API routes
 */
export function setCorsHeaders(res) {
  if (!res) return;
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleOptions(req, res) {
  if (!req || !res) return false;
  
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}