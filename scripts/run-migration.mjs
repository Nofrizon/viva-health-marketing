import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://cfsrmvlbleqjqttnxblz.supabase.co'
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmc3JtdmxibGVxanF0dG54Ymx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTQ5NzcsImV4cCI6MjA5MzQzMDk3N30.PYMBVV79R9RCnhtrAMpGOGojr3dXQ-UXn2He4YYvEJM'

const sql = fs.readFileSync(
  path.join(process.cwd(), 'supabase', 'migrations', '001_create_tables.sql'),
  'utf8'
)

// Try to run each statement separately
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith('--'))

async function runSql(statement) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pgrest_exec`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: statement + ';' }),
  })
  const text = await res.text()
  return { status: res.status, text }
}

console.log('Running', statements.length, 'SQL statements...')

for (const stmt of statements) {
  const clean = stmt.replace(/\n/g, ' ').substring(0, 80)
  console.log('\n>', clean + '...')
  const result = await runSql(stmt)
  console.log(' ', result.status, result.text?.substring(0, 200))
  if (result.status >= 400) {
    console.error('  FAILED!')
  }
}

console.log('\nDone. Checking tables...')

// Verify tables exist
async function checkTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  })
  const text = await res.text()
  return { status: res.status, text: text.substring(0, 200) }
}

console.log('\nstores:', await checkTable('stores'))
console.log('store_keywords:', await checkTable('store_keywords'))