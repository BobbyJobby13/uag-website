import crypto from 'node:crypto'
import { cors, json, rawBody, kvEnabled, kvGet, kvSet, kvPush, kvRange } from '../../_utils.js'

function badRequest(res, message) {
  return json(res, { error: message }, 400)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    cors(res)
    return res.end()
  }

  const { bookId } = req.query
  if (!bookId) return badRequest(res, 'bookId required')

  if (!kvEnabled()) {
    return json(res, { error: 'Server storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.' }, 503)
  }

  if (req.method === 'POST') {
    return receiveWebhook(req, res, bookId)
  }

  if (req.method === 'GET') {
    return listTransactions(req, res, bookId)
  }

  return json(res, { error: 'Method not allowed' }, 405)
}

async function receiveWebhook(req, res, bookId) {
  const token = req.query.token || ''
  const storedToken = await kvGet(`webhook:token:${bookId}`)
  if (!storedToken) {
    return json(res, { error: 'Webhook not configured for this book' }, 401)
  }
  if (token !== storedToken) {
    return json(res, { error: 'Invalid webhook token' }, 401)
  }

  const secret = await kvGet(`webhook:secret:${bookId}`)
  if (!secret) {
    return json(res, { error: 'Webhook signing secret not configured' }, 401)
  }

  const raw = await rawBody(req)
  const signatureHeader = req.headers['x-treasury-signature'] || ''
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex')

  try {
    const equal = crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected))
    if (!equal) {
      return json(res, { error: 'Invalid signature' }, 401)
    }
  } catch {
    return json(res, { error: 'Invalid signature' }, 401)
  }

  let payload
  try {
    payload = JSON.parse(raw.toString('utf8'))
  } catch {
    return badRequest(res, 'Invalid JSON body')
  }

  if (!payload || typeof payload !== 'object') {
    return badRequest(res, 'Invalid payload')
  }

  const deliveryId = payload.deliveryId ?? payload.transaction?.postingId ?? Date.now()
  const dedupeKey = `webhook:delivery:${bookId}:${deliveryId}`
  const existing = await kvGet(dedupeKey)
  if (existing) {
    return json(res, { status: 'already received' })
  }

  await kvSet(dedupeKey, '1')
  await kvPush(`webhook:tx:${bookId}`, JSON.stringify(payload))

  return json(res, { status: 'ok' })
}

async function listTransactions(req, res, bookId) {
  const token = req.query.token || ''
  const storedToken = await kvGet(`webhook:token:${bookId}`)
  if (!storedToken || token !== storedToken) {
    return json(res, { error: 'Invalid webhook token' }, 401)
  }

  const rawList = await kvRange(`webhook:tx:${bookId}`, 0, -1)
  const transactions = rawList
    .map((item) => {
      try {
        return JSON.parse(item)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  return json(res, { transactions })
}
