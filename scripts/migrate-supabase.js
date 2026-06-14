#!/usr/bin/env node

/**
 * Supabase Database Migration Script
 *
 * Connects to the Supabase PostgreSQL database and applies the
 * SQL migration from supabase/migrations/001_initial_auth_schema.sql
 *
 * Usage:
 *   node migrate-supabase.js <password>
 *   SUPABASE_DB_PASSWORD=<password> node migrate-supabase.js
 *
 * The migration creates:
 *   - profiles table (linked to auth.users)
 *   - user_preferences table
 *   - handle_new_user() trigger function (auto-create profile on signup)
 *   - update_updated_at_column() trigger function
 *   - RLS policies for both tables
 *   - Indexes for performance
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PROJECT_REF = 'iwjjiddydmnpjdzwlckn';
const DB_NAME = 'postgres';

const CONNECTION_METHODS = [
  {
    name: 'Direct connection',
    buildUrl: (password) =>
      `postgresql://postgres:${encodeURIComponent(password)}@db.${PROJECT_REF}.supabase.co:5432/${DB_NAME}`,
  },
  {
    name: 'Pooler connection (Supavisor)',
    buildUrl: (password) =>
      `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/${DB_NAME}`,
  },
];

const MIGRATION_FILE = path.resolve(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '001_initial_auth_schema.sql'
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPassword() {
  // CLI argument takes priority, then env variable
  if (process.argv.length >= 3 && process.argv[2]) {
    return process.argv[2];
  }
  if (process.env.SUPABASE_DB_PASSWORD) {
    return process.env.SUPABASE_DB_PASSWORD;
  }
  return null;
}

function printInstructions() {
  console.log('');
  console.log('============================================================');
  console.log('  Supabase Database Migration — Instructions');
  console.log('============================================================');
  console.log('');
  console.log('  No database password was provided.');
  console.log('');
  console.log('  To run this migration you need your Supabase project');
  console.log('  database password. You can find it in:');
  console.log('');
  console.log('    Supabase Dashboard → Settings → Database → Database password');
  console.log('');
  console.log('  Then run one of:');
  console.log('');
  console.log('    node scripts/migrate-supabase.js <YOUR_DB_PASSWORD>');
  console.log('');
  console.log('    SUPABASE_DB_PASSWORD=<YOUR_DB_PASSWORD> node scripts/migrate-supabase.js');
  console.log('');
  console.log('  The migration file that will be applied is:');
  console.log(`    ${MIGRATION_FILE}`);
  console.log('');
  console.log('  It will create:');
  console.log('    • profiles table (with RLS policies)');
  console.log('    • user_preferences table (with RLS policies)');
  console.log('    • handle_new_user() trigger (auto-create profile on signup)');
  console.log('    • update_updated_at_column() trigger');
  console.log('    • Performance indexes');
  console.log('');
  console.log('============================================================');
  console.log('');
}

function logSuccess(message) {
  console.log(`\x1b[32m✔\x1b[0m ${message}`);
}

function logError(message) {
  console.log(`\x1b[31m✖\x1b[0m ${message}`);
}

function logInfo(message) {
  console.log(`\x1b[36m→\x1b[0m ${message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const password = getPassword();

  if (!password) {
    printInstructions();
    process.exit(1);
  }

  // Read the migration SQL
  if (!fs.existsSync(MIGRATION_FILE)) {
    logError(`Migration file not found: ${MIGRATION_FILE}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  logInfo(`Read migration file (${sql.length} bytes)`);

  // Try each connection method in order
  let lastError = null;

  for (const method of CONNECTION_METHODS) {
    const connectionString = method.buildUrl(password);
    logInfo(`Trying ${method.name}...`);

    const client = new Client({ connectionString, connectionTimeoutMillis: 15000 });

    try {
      await client.connect();
      logSuccess(`Connected via ${method.name}`);

      // Execute the migration
      logInfo('Executing migration SQL...');
      await client.query(sql);
      logSuccess('Migration applied successfully!');

      // Verify by checking that the profiles table exists
      const result = await client.query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') AS profiles_exists"
      );

      if (result.rows[0]?.profiles_exists) {
        logSuccess('Verification: profiles table exists');
      } else {
        logError('Verification: profiles table NOT found — migration may have partially failed');
      }

      await client.end();
      console.log('');
      console.log('\x1b[32m====================================\x1b[0m');
      console.log('\x1b[32m  Migration completed successfully!\x1b[0m');
      console.log('\x1b[32m====================================\x1b[0m');
      console.log('');
      process.exit(0);
    } catch (err) {
      lastError = err;
      logError(`${method.name} failed: ${err.message}`);

      try {
        await client.end();
      } catch {
        // ignore close errors
      }

      console.log(''); // blank line before next attempt
    }
  }

  // All connection methods failed
  console.log('');
  console.log('\x1b[31m====================================\x1b[0m');
  console.log('\x1b[31m  Migration FAILED\x1b[0m');
  console.log('\x1b[31m====================================\x1b[0m');
  console.log('');
  logError('Could not connect to the Supabase database with any method.');
  console.log('');
  console.log('Common causes:');
  console.log('  • Incorrect database password');
  console.log('  • IP not allowed (check Supabase Dashboard → Settings → Database → Connection pooling)');
  console.log('  • Project is paused (visit Supabase Dashboard to resume)');
  console.log('  • Network/firewall blocking outbound connections on port 5432 / 6543');
  console.log('');
  if (lastError) {
    console.log(`Last error: ${lastError.message}`);
  }
  console.log('');
  process.exit(1);
}

main().catch((err) => {
  logError(`Unexpected error: ${err.message}`);
  process.exit(1);
});
