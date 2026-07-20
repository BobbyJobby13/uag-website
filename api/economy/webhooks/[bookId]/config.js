import { cors, json, parseBody, kvEnabled, kvSet } from '../../../_utils.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      cors(res)
      return res.end()
    }

    if (req.method !== 'POST') {
      return json(res, { error: 'Method not allowed' }, 405)
    }

    if (!kvEnabled()) {
      return json(res, { error: 'Server storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.' }, 503)
    }

    const { bookId } = req.query
    if (!bookId) {
      return json(res, { error: 'bookId required' }, 400)
    }

    const body = (await parseBody(req)) || {}
    const { token, secret, masterToken } = body

    if (!masterToken) {
      return json(res, { error: 'masterToken required' }, 401)
    }
    if (masterToken !== process.env.ECONOMY_WEBHOOK_MASTER_TOKEN) {
      return json(res, { error: 'Invalid master token' }, 401)
    }
    if (!token || !secret) {
      return json(res, { error: 'token and secret required' }, 400)
    }

    await kvSet(`webhook:token:${bookId}`, token)
    await kvSet(`webhook:secret:${bookId}`, secret)

    return json(res, { status: 'ok' })
  } catch (err) {
    console.error('webhook config handler error', err)
    return json(res, { error: 'Webhook config handler failed', detail: err.message }, 500)
  }
}
