const { json } = require('../_utils')

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  return json(res, {
    listings: [
      { id: '1', name: 'Primary Residence', location: 'London, UK', type: 'Residential', value: 0, status: 'Owned' },
      { id: '2', name: 'Downtown Office', location: 'New York, US', type: 'Commercial', value: 0, status: 'Managed' },
      { id: '3', name: 'Lakeside Villa', location: 'Dubai, UAE', type: 'Residential', value: 0, status: 'Listed' },
    ],
    escrow: 'idle',
    timestamp: new Date().toISOString(),
  })
}
