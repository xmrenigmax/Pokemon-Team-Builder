export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    message: 'Dynamic route test',
    id: req.query.id,
    allQueryParams: req.query
  });
}