#!/usr/bin/env node
/**
 * Print ordered migration paths for manual apply (Supabase SQL Editor or psql).
 */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('..', import.meta.url)))
const dir = join(root, 'packages/database/migrations')

const files = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

console.log('Apply these migrations in order:\n')
for (const file of files) {
  console.log(`  packages/database/migrations/${file}`)
}
console.log('\nSee packages/database/README.md for setup steps.')
