import { json, parseBody } from '../_utils.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const body = await parseBody(req)
  const { fromBank, toBank, amount, account } = body || {}

  if (!fromBank || !toBank || !amount) {
    return json(res, { error: 'Missing fromBank, toBank or amount' }, 400)
  }

  return json(res, {
    status: 'success',
    transferId: `uag-tx-${Date.now()}`,
    fromBank,
    toBank,
    amount,
    account,
    timestamp: new Date().toISOString(),
    note: 'Instant transfer processed through UAG portal backend.',
  })
}
