import { json } from './_utils.js'

export default async function handler(req, res) {
  json(res, {
    status: 'ok',
    service: 'uag-portal',
    timestamp: new Date().toISOString(),
  })
}
