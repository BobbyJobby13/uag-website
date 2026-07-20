export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function json(res, data, status = 200) {
  cors(res)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === 'GET' || req.method === 'HEAD') return resolve({})
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

export function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

const kvUrl = process.env.KV_REST_API_URL
const kvToken = process.env.KV_REST_API_TOKEN

export function kvEnabled() {
  return !!(kvUrl && kvToken)
}

async function kvCommand(command, ...args) {
  if (!kvUrl || !kvToken) throw new Error('KV not configured')
  const path = args.map((a) => encodeURIComponent(String(a))).join('/')
  const res = await fetch(`${kvUrl}/${command}/${path}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  })
  if (!res.ok) throw new Error(`KV ${command} failed: ${res.status}`)
  return res.json()
}

export async function kvGet(key) {
  const data = await kvCommand('get', key)
  if (data.result === null) return undefined
  return data.result
}

export async function kvSet(key, value) {
  return kvCommand('set', key, value)
}

export async function kvDel(key) {
  return kvCommand('del', key)
}

export async function kvPush(key, value) {
  return kvCommand('lpush', key, value)
}

export async function kvRange(key, start = 0, stop = -1) {
  const data = await kvCommand('lrange', key, start, stop)
  return Array.isArray(data.result) ? data.result : []
}

export async function kvTrim(key, start, stop) {
  return kvCommand('ltrim', key, start, stop)
}
