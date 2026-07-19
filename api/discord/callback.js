const { json, parseBody } = require('../_utils')

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const { code, redirect_uri } = await parseBody(req)
  if (!code) {
    return json(res, { error: 'Missing code' }, 400)
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const finalRedirect = redirect_uri || process.env.DISCORD_REDIRECT_URI || `${process.env.VERCEL_URL || ''}/`

  if (!clientId || !clientSecret) {
    return json(res, { error: 'Discord OAuth not configured on the server' }, 500)
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: finalRedirect,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      return json(res, { error: 'Discord token exchange failed', details: err }, 400)
    }

    const tokenData = await tokenRes.json()
    const authHeader = `${tokenData.token_type} ${tokenData.access_token}`

    const [userRes, guildsRes] = await Promise.all([
      fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: authHeader } }),
      fetch('https://discord.com/api/v10/users/@me/guilds', { headers: { Authorization: authHeader } }),
    ])

    const user = userRes.ok ? await userRes.json() : null
    const guilds = guildsRes.ok ? await guildsRes.json() : []

    return json(res, {
      token: tokenData,
      user,
      guilds,
    })
  } catch (err) {
    return json(res, { error: 'Discord callback failed', message: err.message }, 500)
  }
}
