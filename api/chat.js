const { json, parseBody } = require('./_utils')

const SYSTEM_PROMPT = `You are the UAG Portal Assistant for Utterly Amazing Group LLC inside DemocracyCraft.
You help users navigate the portal: Banking, Real Estate, Stock Exchanges, Legal, Corporate Consultancy, Capital & Funds, Discord Portal, Jobs, and general UAG services.
Keep answers short, friendly, and useful. If a question is outside the portal, answer generally but briefly.`

async function fallbackReply(question) {
  const q = question.toLowerCase()
  if (q.includes('job') || q.includes('work') || q.includes('apply')) {
    return 'You can browse and apply to open positions in the Jobs Portal. Admins and employees can post new jobs.'
  }
  if (q.includes('real') || q.includes('house') || q.includes('property') || q.includes('listing')) {
    return 'Check the Real Estate page for property listings. Admins can add or remove listings.'
  }
  if (q.includes('stock') || q.includes('tse') || q.includes('ner') || q.includes('market')) {
    return 'Visit the Stock Exchanges page for market data and a link to the TSE market.'
  }
  if (q.includes('bank') || q.includes('transfer') || q.includes('money')) {
    return 'Use the Banking Portal to send instant transfers between connected banks.'
  }
  if (q.includes('discord') || q.includes('login')) {
    return 'Log in with Discord from the sidebar to see your profile, banner, guilds, and staff access.'
  }
  if (q.includes('admin') || q.includes('brzzzes')) {
    return 'Brzzzes and other admins can manage realty listings, job postings, and portal content. Ask how to do a specific task.'
  }
  return "I'm the UAG Portal Assistant. Ask me about Banking, Real Estate, Stocks, Jobs, Discord, Consultancy, or Capital & Funds."
}

async function openaiReply(question) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
      max_tokens: 250,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'OpenAI error')
  return data.choices?.[0]?.message?.content
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const body = await parseBody(req)
  const question = (body.question || '').trim()
  if (!question) {
    return json(res, { error: 'Missing question' }, 400)
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const answer = await openaiReply(question)
      return json(res, { answer, source: 'openai' })
    } catch (err) {
      return json(res, { answer: await fallbackReply(question), source: 'fallback', error: err.message })
    }
  }

  const answer = await fallbackReply(question)
  return json(res, { answer, source: 'fallback' })
}
