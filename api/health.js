const { json } = require('./_utils')

module.exports = async (req, res) => {
  json(res, {
    status: 'ok',
    service: 'uag-portal',
    timestamp: new Date().toISOString(),
  })
}
