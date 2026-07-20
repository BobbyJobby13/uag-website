import { json, parseBody } from '../_utils.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const body = await parseBody(req)
  const { tier, amount, investor } = body || {}

  if (!tier || !amount) {
    return json(res, { error: 'Missing tier or amount' }, 400)
  }

  return json(res, {
    status: 'submitted',
    investmentId: `uag-cap-${Date.now()}`,
    tier,
    amount,
    investor,
    timestamp: new Date().toISOString(),
    note: 'Your investment request has been received and will be reviewed by UAG Capital.',
  })
}
