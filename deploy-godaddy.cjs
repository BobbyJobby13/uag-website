require('dotenv').config({ path: '.env.godaddy' })

const { Client } = require('basic-ftp')
const { execSync } = require('child_process')
const path = require('path')

const required = ['GODADDY_FTP_HOST', 'GODADDY_FTP_USER', 'GODADDY_FTP_PASS']
const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error('Missing environment variables:', missing.join(', '))
  console.error('See .env.godaddy.example for details.')
  process.exit(1)
}

const apiBase = process.env.VITE_API_BASE_URL || process.env.API_BASE_URL
if (!apiBase) {
  console.warn(
    'Warning: VITE_API_BASE_URL or API_BASE_URL is not set. The build will use /api, which will not work on GoDaddy unless you also host the API there.'
  )
}

const buildEnv = { ...process.env }
if (apiBase && !process.env.VITE_API_BASE_URL) {
  buildEnv.VITE_API_BASE_URL = apiBase
}

console.log('Building frontend for GoDaddy...')
execSync('npm run build', { stdio: 'inherit', env: buildEnv })

const localDir = path.resolve(__dirname, 'dist')
const remoteDir = process.env.GODADDY_FTP_DIR || 'public_html'

async function main() {
  const client = new Client()
  try {
    await client.access({
      host: process.env.GODADDY_FTP_HOST,
      user: process.env.GODADDY_FTP_USER,
      password: process.env.GODADDY_FTP_PASS,
      port: Number(process.env.GODADDY_FTP_PORT) || 21,
      secure: process.env.GODADDY_FTP_SECURE !== 'false',
    })
    await client.ensureDir(remoteDir)
    console.log(`Uploading ${localDir} to /${remoteDir} ...`)
    await client.uploadFromDir(localDir)
    console.log('Done. Your site has been deployed to GoDaddy.')
  } finally {
    client.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
