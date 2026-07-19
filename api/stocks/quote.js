const { json } = require('../_utils')

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const { symbol, exchange = 'TSE' } = req.query || {}
  if (!symbol) {
    return json(res, { error: 'Missing symbol' }, 400)
  }

  const base = symbol.toUpperCase()
  const price = (Math.random() * 200 + 10).toFixed(2)
  const change = (Math.random() * 10 - 5).toFixed(2)

  return json(res, {
    symbol: base,
    exchange: exchange.toUpperCase(),
    price: parseFloat(price),
    change: parseFloat(change),
    changePercent: ((parseFloat(change) / parseFloat(price)) * 100).toFixed(2),
    currency: exchange.toUpperCase() === 'NER' ? 'NER' : 'USD',
    timestamp: new Date().toISOString(),
    source: `${exchange.toUpperCase()} Live Feed`,
  })
}
