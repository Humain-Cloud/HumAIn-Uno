import { NextResponse } from 'next/server'

// ──────────────────────────────────────────────────────────────
// Supabase Setup API Route
// GET  /api/setup-supabase  → Check current table setup status
// POST /api/setup-supabase  → Create missing tables/policies
// ──────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** SQL to create the profiles table and all supporting objects. */
const PROFILES_SQL = `
-- ─── Profiles Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  company TEXT,
  job_title TEXT,
  location TEXT,
  website TEXT,
  preferred_framework TEXT,
  preferred_industry TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── User Preferences Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  default_view TEXT DEFAULT 'grid' CHECK (default_view IN ('grid', 'list', 'compact')),
  items_per_page INTEGER DEFAULT 24,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  framework_filter JSONB DEFAULT '[]',
  industry_filter JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create preferences when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ─── Updated-at triggers ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
`

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

interface TableCheckResult {
  exists: boolean
  error: string | null
  errorCode: string | null
  rowCount: number | null
  columns: string[]
}

async function checkTable(
  tableName: string,
): Promise<TableCheckResult> {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=1`

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const code = body.code ?? String(res.status)
      // PostgREST error code 42P01 = relation does not exist
      if (code === '42P01' || body.message?.includes('not find the table')) {
        return { exists: false, error: body.message, errorCode: code, rowCount: null, columns: [] }
      }
      return { exists: false, error: body.message ?? `HTTP ${res.status}`, errorCode: code, rowCount: null, columns: [] }
    }

    const data = await res.json()
    const columns = data.length > 0 ? Object.keys(data[0]) : []

    // Get column info from OpenAPI spec
    const specRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    })
    let specColumns: string[] = columns
    if (specRes.ok) {
      const spec = await specRes.json()
      const def = spec?.definitions?.[tableName]
      if (def?.properties) {
        specColumns = Object.keys(def.properties)
      }
    }

    return {
      exists: true,
      error: null,
      errorCode: null,
      rowCount: Array.isArray(data) ? data.length : 0,
      columns: specColumns.length > 0 ? specColumns : columns,
    }
  } catch (err: any) {
    return { exists: false, error: err.message, errorCode: 'NETWORK', rowCount: null, columns: [] }
  }
}

/** Try to execute DDL SQL via a direct PostgreSQL connection (pg package). */
async function tryPgConnection(sql: string): Promise<{ ok: boolean; method: string; detail: string }> {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    return { ok: false, method: 'pg', detail: 'SUPABASE_DB_URL not set' }
  }

  try {
    const pg = await import('pg')
    const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
    const client = await pool.connect()
    try {
      await client.query(sql)
      return { ok: true, method: 'direct_postgresql', detail: 'Tables created via direct PostgreSQL connection' }
    } finally {
      client.release()
      await pool.end()
    }
  } catch (err: any) {
    return { ok: false, method: 'pg', detail: err.message }
  }
}

/** Try to execute SQL via the Supabase Management API. */
async function tryManagementApi(sql: string): Promise<{ ok: boolean; method: string; detail: string }> {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (!accessToken) {
    return { ok: false, method: 'management_api', detail: 'SUPABASE_ACCESS_TOKEN not set' }
  }

  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      },
    )

    if (res.ok) {
      return { ok: true, method: 'management_api', detail: 'Tables created via Supabase Management API' }
    }

    const text = await res.text()
    return { ok: false, method: 'management_api', detail: `HTTP ${res.status}: ${text.substring(0, 200)}` }
  } catch (err: any) {
    return { ok: false, method: 'management_api', detail: err.message }
  }
}

/** Try to execute SQL via an RPC function (exec_sql) if one exists. */
async function tryRpc(sql: string): Promise<{ ok: boolean; method: string; detail: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_query: sql }),
    })

    if (res.ok) {
      return { ok: true, method: 'rpc', detail: 'Tables created via exec_sql RPC' }
    }

    return { ok: false, method: 'rpc', detail: `HTTP ${res.status}` }
  } catch (err: any) {
    return { ok: false, method: 'rpc', detail: err.message }
  }
}

// ──────────────────────────────────────────────────────────────
// GET handler – check current setup status
// ──────────────────────────────────────────────────────────────

export async function GET() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({
      configured: false,
      error: 'Supabase environment variables are not set. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      tablesExist: false,
    })
  }

  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

  // Check both tables in parallel
  const [profilesCheck, prefsCheck] = await Promise.all([
    checkTable('profiles'),
    checkTable('user_preferences'),
  ])

  const allExist = profilesCheck.exists && prefsCheck.exists

  const result: Record<string, any> = {
    configured: true,
    tablesExist: allExist,
    supabaseUrl: SUPABASE_URL,
    projectRef,
    tables: {
      profiles: {
        exists: profilesCheck.exists,
        columns: profilesCheck.columns,
        error: profilesCheck.error,
      },
      user_preferences: {
        exists: prefsCheck.exists,
        columns: prefsCheck.columns,
        error: prefsCheck.error,
      },
    },
  }

  // If tables are missing, include the SQL and instructions
  if (!allExist) {
    result.sqlContent = PROFILES_SQL
    result.instructions = [
      `1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql`,
      '2. Click "New Query"',
      '3. Paste the SQL content from the sqlContent field',
      '4. Click "Run"',
      '5. Call GET /api/setup-supabase again to verify',
    ]
    result.dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}/sql`
  }

  return NextResponse.json(result)
}

// ──────────────────────────────────────────────────────────────
// POST handler – attempt to create tables
// ──────────────────────────────────────────────────────────────

export async function POST() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not set' },
      { status: 500 },
    )
  }

  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

  // First check if tables already exist
  const [profilesCheck, prefsCheck] = await Promise.all([
    checkTable('profiles'),
    checkTable('user_preferences'),
  ])

  if (profilesCheck.exists && prefsCheck.exists) {
    return NextResponse.json({
      success: true,
      method: 'already_exists',
      message: 'Both profiles and user_preferences tables already exist in Supabase.',
      tables: {
        profiles: { exists: true, columns: profilesCheck.columns },
        user_preferences: { exists: true, columns: prefsCheck.columns },
      },
    })
  }

  // Tables don't exist — try to create them using available strategies
  const attempts: Array<{ ok: boolean; method: string; detail: string }> = []

  // Strategy 1: Direct PostgreSQL via pg package
  const pgResult = await tryPgConnection(PROFILES_SQL)
  attempts.push(pgResult)
  if (pgResult.ok) {
    return NextResponse.json({
      success: true,
      method: pgResult.method,
      message: pgResult.detail,
      attempts,
    })
  }

  // Strategy 2: Supabase Management API
  const mgmtResult = await tryManagementApi(PROFILES_SQL)
  attempts.push(mgmtResult)
  if (mgmtResult.ok) {
    return NextResponse.json({
      success: true,
      method: mgmtResult.method,
      message: mgmtResult.detail,
      attempts,
    })
  }

  // Strategy 3: RPC exec_sql (if a custom function exists)
  const rpcResult = await tryRpc(PROFILES_SQL)
  attempts.push(rpcResult)
  if (rpcResult.ok) {
    return NextResponse.json({
      success: true,
      method: rpcResult.method,
      message: rpcResult.detail,
      attempts,
    })
  }

  // All automatic methods failed — return SQL for manual execution
  return NextResponse.json({
    success: false,
    method: 'manual',
    message:
      'Could not create tables automatically. Please run the SQL migration manually in the Supabase Dashboard SQL Editor.',
    attempts,
    sqlContent: PROFILES_SQL,
    instructions: [
      `1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql`,
      '2. Click "New Query"',
      '3. Paste the SQL content below and click "Run"',
      '4. Call GET /api/setup-supabase to verify',
    ],
    dashboardUrl: `https://supabase.com/dashboard/project/${projectRef}/sql`,
  })
}
