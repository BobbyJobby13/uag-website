import { parse } from 'node-html-parser'
import { json, parseBody } from '../_utils.js'

const ALLOWED_HOSTS = ['www.democracycraft.net', 'democracycraft.net']

function allowedUrl(input) {
  try {
    const url = new URL(input)
    return ALLOWED_HOSTS.includes(url.hostname) ? url : null
  } catch {
    return null
  }
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  if (req.method !== 'POST') {
    return json(res, { error: 'Method not allowed' }, 405)
  }

  const body = await parseBody(req)
  const url = allowedUrl(body.url)

  if (!url) {
    return json(res, { error: 'Invalid or unsupported forum URL' }, 400)
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'UAG-Legal-Assistant/1.0 (+https://uag-website-virid.vercel.app)',
        Accept: 'text/html',
      },
    })

    if (!response.ok) {
      return json(res, { error: `Forum returned ${response.status}` }, 502)
    }

    const html = await response.text()
    const root = parse(html)

    const title = root.querySelector('title')?.text?.trim() || 'Untitled thread'

    // XenForo uses .bbWrapper for post bodies
    let postNode = root.querySelector('article .bbWrapper') || root.querySelector('.bbWrapper')

    // Fallback to message body wrapper
    if (!postNode) {
      postNode = root.querySelector('.message-body')
    }

    let text = ''
    if (postNode) {
      text = cleanText(postNode.text)
    }

    return json(res, {
      title,
      text,
      url: url.toString(),
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    return json(res, { error: err.message || 'Could not fetch thread' }, 500)
  }
}
