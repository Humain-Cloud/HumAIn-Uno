-- ============================================================
-- Humain-Uno: Supabase Migration 003
-- Verification Script: Checks all tables exist with proper
-- RLS, policies, triggers, and indexes
-- ============================================================
-- Run this in Supabase SQL Editor after applying 002_new_tables.sql
-- All queries return results; empty results indicate a problem.
-- ============================================================

-- ============================================================
-- 1. CHECK ALL TABLES EXIST
-- Expected: 14 rows (2 existing + 12 new)
-- ============================================================
SELECT
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================
-- 2. CHECK RLS IS ENABLED ON ALL TABLES
-- Expected: 14 rows, all with 'true'
-- ============================================================
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================
-- 3. CHECK ALL POLICIES EXIST
-- Expected: Each new table should have at least a
--   "Users can view own..." and "Service role full access..."
--   policy
-- ============================================================
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS operation,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- 4. CHECK UPDATED_AT TRIGGERS
-- Expected triggers on tables with updated_at:
--   bookmarks, collections, ratings, user_settings,
--   agent_deployments
--   (plus existing: profiles, user_preferences)
-- ============================================================
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_timing AS timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- ============================================================
-- 5. CHECK ALL INDEXES
-- ============================================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================
-- 6. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================
-- 7. CHECK UNIQUE CONSTRAINTS
-- ============================================================
SELECT
  tc.table_name,
  kcu.column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================
-- 8. CHECK CHECK CONSTRAINTS (enum-like validations)
-- ============================================================
SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
  AND tc.constraint_schema = cc.constraint_schema
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'bookmarks', 'collections', 'notifications',
    'ai_chat_history', 'recently_viewed', 'ratings',
    'user_settings', 'agent_downloads', 'user_activity_log',
    'api_keys', 'agent_deployments'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================
-- 9. QUICK TABLE COUNT SUMMARY
-- Should show 14 tables total
-- ============================================================
SELECT
  COUNT(*) AS total_tables,
  SUM(CASE WHEN tablename IN ('profiles', 'user_preferences') THEN 1 ELSE 0 END) AS existing_tables,
  SUM(CASE WHEN tablename IN (
    'bookmarks', 'collections', 'notifications',
    'ai_chat_history', 'recently_viewed', 'ratings',
    'user_settings', 'agent_views', 'agent_downloads',
    'user_activity_log', 'api_keys', 'agent_deployments'
  ) THEN 1 ELSE 0 END) AS new_tables
FROM pg_tables
WHERE schemaname = 'public';

-- ============================================================
-- 10. VERIFY SPECIFIC NEW TABLES WITH COLUMN CHECKS
-- ============================================================

-- bookmarks columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookmarks'
ORDER BY ordinal_position;

-- collections columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'collections'
ORDER BY ordinal_position;

-- notifications columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

-- ai_chat_history columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ai_chat_history'
ORDER BY ordinal_position;

-- recently_viewed columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'recently_viewed'
ORDER BY ordinal_position;

-- ratings columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ratings'
ORDER BY ordinal_position;

-- user_settings columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_settings'
ORDER BY ordinal_position;

-- agent_views columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_views'
ORDER BY ordinal_position;

-- agent_downloads columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_downloads'
ORDER BY ordinal_position;

-- user_activity_log columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_activity_log'
ORDER BY ordinal_position;

-- api_keys columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'api_keys'
ORDER BY ordinal_position;

-- agent_deployments columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_deployments'
ORDER BY ordinal_position;

-- ============================================================
-- VERIFICATION COMPLETE
-- ============================================================
-- Expected results:
--   Query 9 (total count):  total_tables=14, existing=2, new=12
--   Query 2 (RLS):          All 14 tables have rls_enabled=true
--   Query 3 (policies):     Each new table has user + service_role policies
--   Query 4 (triggers):     7 tables with updated_at triggers
--   Query 5 (indexes):      All expected indexes present
--   Query 6 (FKs):          All user_id FKs pointing to auth.users
--   Query 7 (unique):       bookmarks(user_id,target_type,target_id),
--                           ratings(user_id,agent_id),
--                           user_settings(user_id),
--                           agent_views(agent_id)
--   Query 8 (checks):       All CHECK constraints for enum fields
--   Query 10 (columns):     All expected columns present per table
--
-- If any query returns unexpected results, re-run 002_new_tables.sql
-- ============================================================
