const { json } = require('./_utils')

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  return json(res, { error: 'AI access is disabled.' }, 403)
}
