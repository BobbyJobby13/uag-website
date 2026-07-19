import { json, parseBody } from './_utils.js'

const SYSTEM_PROMPTS = {
  accounting: `You are the UAG Accounting Assistant. Help UAG accountants with bookkeeping, ledger entries, debits and credits, balance sheets, income statements, tax planning, and financial reports. Keep answers concise and practical. You do not provide licensed financial or tax advice; suggest standard practices and draft-style outputs.`,
  legal: `You are the UAG Legal Assistant. Help UAG lawyers draft case files, motions, memos, contract clauses, and case strategy based on provided facts. Keep answers concise and professional. You are not a licensed attorney; always label outputs as drafts and recommend review by qualified counsel.`,
  investigations: `You are the UAG Investigations Assistant. Help UAG investigators organize case notes, build timelines, summarize evidence, and draft factual reports. Keep answers concise and objective. You do not draw legal conclusions; present analysis as a draft.`,
  general: `You are the UAG Portal Assistant for Utterly Amazing Group LLC inside DemocracyCraft. You help users navigate the portal: Banking, Real Estate, Stock Exchanges, Legal, Corporate Consultancy, Capital & Funds, Discord Portal, Jobs, and general UAG services. Keep answers short, friendly, and useful.`,
}

const ALLOWED_SERVICES = Object.keys(SYSTEM_PROMPTS)

async function openaiReply(question, service) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[service] || SYSTEM_PROMPTS.general },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'OpenAI error')
  return data.choices?.[0]?.message?.content
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const body = await parseBody(req)
  const question = (body.question || '').trim()
  const service = (body.service || 'general').toLowerCase()

  if (!question) {
    return json(res, { error: 'Missing question' }, 400)
  }

  if (!ALLOWED_SERVICES.includes(service)) {
    return json(res, { error: 'AI service not allowed' }, 403)
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const answer = await openaiReply(question, service)
      return json(res, { answer, source: 'openai', service })
    } catch (err) {
      return json(res, { answer: 'AI is unavailable right now. Try again later.', source: 'fallback', service, error: err.message })
    }
  }

  return json(res, { answer: 'AI is not configured.', source: 'fallback', service })
}
