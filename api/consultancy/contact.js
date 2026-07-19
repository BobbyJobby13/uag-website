const { json, parseBody } = require('../_utils')

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const body = await parseBody(req)
  const { name, email, service, message } = body || {}

  if (!name || !email || !service) {
    return json(res, { error: 'Missing name, email or service' }, 400)
  }

  return json(res, {
    status: 'submitted',
    ticketId: `uag-consult-${Date.now()}`,
    name,
    email,
    service,
    message,
    timestamp: new Date().toISOString(),
    note: 'UAG consultancy will reach out via Discord or email.',
  })
}
