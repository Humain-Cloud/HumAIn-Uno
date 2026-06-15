-- ============================================================
-- Humain-Uno: Workspace Schema — Comprehensive Supabase Migration
-- ============================================================
--
-- This migration creates 13 new tables for the Humain-Uno platform's
-- workspace functionality. It is designed to be IDEMPOTENT — safe to
-- run multiple times without error.
--
-- TABLES CREATED:
--   1.  agent_bookmarks        — User bookmarks for specific agents
--   2.  agent_collections      — Named collections for organizing agents
--   3.  agent_collection_items — Junction table: agents within collections
--   4.  notifications          — User notification feed
--   5.  ai_chat_history        — AI assistant conversation logs
--   6.  recently_viewed        — Recently viewed items (agents, models, knowledge)
--   7.  agent_ratings          — User ratings & reviews for agents
--   8.  user_settings          — Extended user settings (synced to user_preferences)
--   9.  agent_views            — Per-view tracking for agents (analytics)
--   10. agent_downloads        — Download tracking for agents
--   11. user_activity_log      — Audit log of user actions
--   12. api_keys               — API key management
--   13. agent_deployments      — Agent deployment records
--
-- EXISTING TABLES PRESERVED:
--   - profiles           (from 001_initial_auth_schema.sql)
--   - user_preferences   (from 001_initial_auth_schema.sql)
--   - bookmarks          (from 002_new_tables.sql, if present)
--   - collections        (from 002_new_tables.sql, if present)
--
-- ALL TABLES FEATURE:
--   - Row Level Security (RLS) enabled
--   - User-scoped SELECT / INSERT / UPDATE / DELETE policies
--   - Service role full-access policies
--   - updated_at auto-update triggers (where applicable)
--   - Appropriate indexes for common query patterns
--   - Foreign key constraints with ON DELETE CASCADE
--   - CHECK constraints for enum-like fields
--   - Idempotent DDL (IF NOT EXISTS, DO $$ ... EXCEPTION ... END $$)
--
-- SPECIAL TRIGGERS:
--   - Sync trigger: user_settings ↔ user_preferences
--   - Auto-create default collection on user signup
--
-- ============================================================

-- ============================================================
-- 0. PREREQUISITES
-- ============================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 0a. HELPER FUNCTION: update_updated_at_column()
-- Auto-updates the updated_at timestamp on any row change.
-- Uses CREATE OR REPLACE so it is idempotent regardless of
-- whether prior migrations defined a version.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. AGENT_BOOKMARKS
-- User bookmarks for specific agents.
-- agent_id is stored as text because agents live in SQLite;
-- agent_name and agent_framework are denormalised for fast display.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,           -- references agent in SQLite (stored as text ref)
  agent_name TEXT,                   -- denormalised for quick display
  agent_framework TEXT,              -- denormalised for quick display
  notes TEXT,                        -- optional user notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

COMMENT ON TABLE public.agent_bookmarks IS 'User bookmarks for specific agents with denormalised metadata for fast display.';
COMMENT ON COLUMN public.agent_bookmarks.agent_id IS 'References the agent in SQLite; stored as text reference since agents table is not in Supabase.';
COMMENT ON COLUMN public.agent_bookmarks.agent_name IS 'Denormalised agent name to avoid cross-database joins.';
COMMENT ON COLUMN public.agent_bookmarks.agent_framework IS 'Denormalised framework name for quick filtering.';

ALTER TABLE public.agent_bookmarks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_bookmarks' AND policyname = 'Users can view own agent_bookmarks'
  ) THEN
    CREATE POLICY "Users can view own agent_bookmarks"
      ON public.agent_bookmarks FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_bookmarks' AND policyname = 'Users can insert own agent_bookmarks'
  ) THEN
    CREATE POLICY "Users can insert own agent_bookmarks"
      ON public.agent_bookmarks FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_bookmarks' AND policyname = 'Users can update own agent_bookmarks'
  ) THEN
    CREATE POLICY "Users can update own agent_bookmarks"
      ON public.agent_bookmarks FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_bookmarks' AND policyname = 'Users can delete own agent_bookmarks'
  ) THEN
    CREATE POLICY "Users can delete own agent_bookmarks"
      ON public.agent_bookmarks FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_bookmarks' AND policyname = 'Service role full access on agent_bookmarks'
  ) THEN
    CREATE POLICY "Service role full access on agent_bookmarks"
      ON public.agent_bookmarks FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_agent_bookmarks_user_id ON public.agent_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_bookmarks_agent_id ON public.agent_bookmarks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_bookmarks_framework ON public.agent_bookmarks(agent_framework);
CREATE INDEX IF NOT EXISTS idx_agent_bookmarks_created_at ON public.agent_bookmarks(created_at DESC);


-- ============================================================
-- 2. AGENT_COLLECTIONS
-- Named collections for organising agents.
-- Each user may have one default collection (is_default = TRUE).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.agent_collections IS 'Named collections for organising agents. Each user can have one default collection.';
COMMENT ON COLUMN public.agent_collections.is_default IS 'Only one collection per user should be default; used for quick-save actions.';

ALTER TABLE public.agent_collections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collections' AND policyname = 'Users can view own agent_collections'
  ) THEN
    CREATE POLICY "Users can view own agent_collections"
      ON public.agent_collections FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collections' AND policyname = 'Users can insert own agent_collections'
  ) THEN
    CREATE POLICY "Users can insert own agent_collections"
      ON public.agent_collections FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collections' AND policyname = 'Users can update own agent_collections'
  ) THEN
    CREATE POLICY "Users can update own agent_collections"
      ON public.agent_collections FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collections' AND policyname = 'Users can delete own agent_collections'
  ) THEN
    CREATE POLICY "Users can delete own agent_collections"
      ON public.agent_collections FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collections' AND policyname = 'Service role full access on agent_collections'
  ) THEN
    CREATE POLICY "Service role full access on agent_collections"
      ON public.agent_collections FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_agent_collections_updated_at ON public.agent_collections;
CREATE TRIGGER update_agent_collections_updated_at
  BEFORE UPDATE ON public.agent_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_agent_collections_user_id ON public.agent_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_collections_is_default ON public.agent_collections(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_agent_collections_created_at ON public.agent_collections(created_at DESC);


-- ============================================================
-- 3. AGENT_COLLECTION_ITEMS
-- Junction table linking agents to collections.
-- agent_id is TEXT because agents live in SQLite.
-- ON DELETE CASCADE on collection_id means removing a collection
-- also removes all its items.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.agent_collections(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, agent_id)
);

COMMENT ON TABLE public.agent_collection_items IS 'Junction table linking agents to collections. agent_id is text because agents live in SQLite.';
COMMENT ON COLUMN public.agent_collection_items.agent_id IS 'Text reference to the agent ID in SQLite.';

ALTER TABLE public.agent_collection_items ENABLE ROW LEVEL SECURITY;

-- Collection items are visible/editable by the collection owner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collection_items' AND policyname = 'Users can view own agent_collection_items'
  ) THEN
    CREATE POLICY "Users can view own agent_collection_items"
      ON public.agent_collection_items FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.agent_collections
        WHERE agent_collections.id = agent_collection_items.collection_id
        AND agent_collections.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collection_items' AND policyname = 'Users can insert own agent_collection_items'
  ) THEN
    CREATE POLICY "Users can insert own agent_collection_items"
      ON public.agent_collection_items FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.agent_collections
        WHERE agent_collections.id = agent_collection_items.collection_id
        AND agent_collections.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collection_items' AND policyname = 'Users can delete own agent_collection_items'
  ) THEN
    CREATE POLICY "Users can delete own agent_collection_items"
      ON public.agent_collection_items FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM public.agent_collections
        WHERE agent_collections.id = agent_collection_items.collection_id
        AND agent_collections.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_collection_items' AND policyname = 'Service role full access on agent_collection_items'
  ) THEN
    CREATE POLICY "Service role full access on agent_collection_items"
      ON public.agent_collection_items FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_agent_collection_items_collection_id ON public.agent_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_agent_collection_items_agent_id ON public.agent_collection_items(agent_id);


-- ============================================================
-- 4. NOTIFICATIONS
-- User notification feed with typed categories.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'agent_update', 'new_agent', 'bookmark_reminder',
    'system', 'deployment', 'test_result'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'User notification feed. Types: agent_update, new_agent, bookmark_reminder, system, deployment, test_result.';
COMMENT ON COLUMN public.notifications.type IS 'Notification category — determines icon and behavior in the UI.';
COMMENT ON COLUMN public.notifications.action_url IS 'Optional URL the user is directed to when clicking the notification.';
COMMENT ON COLUMN public.notifications.read IS 'Whether the user has marked this notification as read.';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications'
  ) THEN
    CREATE POLICY "Users can view own notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can insert own notifications'
  ) THEN
    CREATE POLICY "Users can insert own notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete own notifications'
  ) THEN
    CREATE POLICY "Users can delete own notifications"
      ON public.notifications FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Service role full access on notifications'
  ) THEN
    CREATE POLICY "Service role full access on notifications"
      ON public.notifications FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);


-- ============================================================
-- 5. AI_CHAT_HISTORY
-- AI assistant conversation logs per agent.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ai_chat_history IS 'AI assistant conversation logs. Each message is tied to a user and optionally an agent.';
COMMENT ON COLUMN public.ai_chat_history.agent_id IS 'The agent this conversation is about. NULL for general chat.';
COMMENT ON COLUMN public.ai_chat_history.tokens_used IS 'Number of tokens consumed by this message (for usage tracking).';
COMMENT ON COLUMN public.ai_chat_history.model IS 'The LLM model used to generate this response.';

ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_history' AND policyname = 'Users can view own ai_chat_history'
  ) THEN
    CREATE POLICY "Users can view own ai_chat_history"
      ON public.ai_chat_history FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_history' AND policyname = 'Users can insert own ai_chat_history'
  ) THEN
    CREATE POLICY "Users can insert own ai_chat_history"
      ON public.ai_chat_history FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_history' AND policyname = 'Users can delete own ai_chat_history'
  ) THEN
    CREATE POLICY "Users can delete own ai_chat_history"
      ON public.ai_chat_history FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_history' AND policyname = 'Service role full access on ai_chat_history'
  ) THEN
    CREATE POLICY "Service role full access on ai_chat_history"
      ON public.ai_chat_history FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON public.ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_agent_id ON public.ai_chat_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_agent ON public.ai_chat_history(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON public.ai_chat_history(created_at DESC);


-- ============================================================
-- 6. RECENTLY_VIEWED
-- Track recently viewed items (agents, models, knowledge).
-- UNIQUE(user_id, item_type, item_id) ensures one entry per
-- user/item pair — upsert replaces the old viewed_at timestamp.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('agent', 'model', 'knowledge')),
  item_id TEXT NOT NULL,
  item_name TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

COMMENT ON TABLE public.recently_viewed IS 'Recently viewed items. Upsert on (user_id, item_type, item_id) to update viewed_at.';
COMMENT ON COLUMN public.recently_viewed.item_type IS 'Category of the viewed item: agent, model, or knowledge.';
COMMENT ON COLUMN public.recently_viewed.item_name IS 'Denormalised name for quick display without cross-database joins.';

ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can view own recently_viewed'
  ) THEN
    CREATE POLICY "Users can view own recently_viewed"
      ON public.recently_viewed FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can insert own recently_viewed'
  ) THEN
    CREATE POLICY "Users can insert own recently_viewed"
      ON public.recently_viewed FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can update own recently_viewed'
  ) THEN
    CREATE POLICY "Users can update own recently_viewed"
      ON public.recently_viewed FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can delete own recently_viewed'
  ) THEN
    CREATE POLICY "Users can delete own recently_viewed"
      ON public.recently_viewed FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Service role full access on recently_viewed'
  ) THEN
    CREATE POLICY "Service role full access on recently_viewed"
      ON public.recently_viewed FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_item ON public.recently_viewed(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(user_id, viewed_at DESC);


-- ============================================================
-- 7. AGENT_RATINGS
-- User ratings and reviews for agents.
-- One rating per user per agent (UNIQUE constraint).
-- Rating is 1–5 inclusive.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

COMMENT ON TABLE public.agent_ratings IS 'User ratings and reviews for agents. One rating per user per agent.';
COMMENT ON COLUMN public.agent_ratings.rating IS 'Star rating from 1 (lowest) to 5 (highest).';
COMMENT ON COLUMN public.agent_ratings.review IS 'Optional free-text review.';

ALTER TABLE public.agent_ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Anyone can view ratings (for displaying averages)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_ratings' AND policyname = 'Anyone can view agent_ratings'
  ) THEN
    CREATE POLICY "Anyone can view agent_ratings"
      ON public.agent_ratings FOR SELECT
      USING (TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_ratings' AND policyname = 'Users can insert own agent_ratings'
  ) THEN
    CREATE POLICY "Users can insert own agent_ratings"
      ON public.agent_ratings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_ratings' AND policyname = 'Users can update own agent_ratings'
  ) THEN
    CREATE POLICY "Users can update own agent_ratings"
      ON public.agent_ratings FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_ratings' AND policyname = 'Users can delete own agent_ratings'
  ) THEN
    CREATE POLICY "Users can delete own agent_ratings"
      ON public.agent_ratings FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_ratings' AND policyname = 'Service role full access on agent_ratings'
  ) THEN
    CREATE POLICY "Service role full access on agent_ratings"
      ON public.agent_ratings FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_agent_ratings_updated_at ON public.agent_ratings;
CREATE TRIGGER update_agent_ratings_updated_at
  BEFORE UPDATE ON public.agent_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_agent_ratings_user_id ON public.agent_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_ratings_agent_id ON public.agent_ratings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_ratings_rating ON public.agent_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_agent_ratings_created_at ON public.agent_ratings(created_at DESC);


-- ============================================================
-- 8. USER_SETTINGS
-- Extended user settings that sync with user_preferences.
--
-- SYNC TRIGGER: When user_settings is inserted or updated,
-- relevant fields are propagated to user_preferences so both
-- tables stay consistent. This allows user_preferences to
-- remain the source of truth for UI preferences while
-- user_settings holds workspace-specific configuration.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_framework TEXT,
  default_llm TEXT,
  default_privacy TEXT DEFAULT 'PRIVATE' CHECK (default_privacy IN ('PRIVATE', 'PUBLIC', 'UNLISTED')),
  auto_save BOOLEAN DEFAULT TRUE,
  editor_theme TEXT DEFAULT 'default',
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_settings IS 'Extended workspace settings per user. Synced with user_preferences via trigger.';
COMMENT ON COLUMN public.user_settings.default_framework IS 'Default AI framework selection for new agents.';
COMMENT ON COLUMN public.user_settings.default_llm IS 'Default LLM model selection for new agents.';
COMMENT ON COLUMN public.user_settings.default_privacy IS 'Default privacy setting for new agents: PRIVATE, PUBLIC, or UNLISTED.';
COMMENT ON COLUMN public.user_settings.auto_save IS 'Whether to auto-save agent configurations.';
COMMENT ON COLUMN public.user_settings.editor_theme IS 'Code editor theme name.';
COMMENT ON COLUMN public.user_settings.sidebar_collapsed IS 'Whether the sidebar is collapsed in the workspace UI.';

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can view own user_settings'
  ) THEN
    CREATE POLICY "Users can view own user_settings"
      ON public.user_settings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can insert own user_settings'
  ) THEN
    CREATE POLICY "Users can insert own user_settings"
      ON public.user_settings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can update own user_settings'
  ) THEN
    CREATE POLICY "Users can update own user_settings"
      ON public.user_settings FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can delete own user_settings'
  ) THEN
    CREATE POLICY "Users can delete own user_settings"
      ON public.user_settings FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Service role full access on user_settings'
  ) THEN
    CREATE POLICY "Service role full access on user_settings"
      ON public.user_settings FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- ============================================================
-- 8a. SYNC TRIGGER: user_settings → user_preferences
-- When user_settings is created or updated, sync relevant
-- fields to the user_preferences table:
--   default_framework → framework_filter (as single-element array)
--   default_privacy   → (no direct mapping; preferences doesn't have this)
--   sidebar_collapsed → (no direct mapping; preferences doesn't have this)
--
-- The primary sync is: default_framework in user_settings updates
-- the preferred_framework in profiles AND framework_filter in
-- user_preferences so both stay consistent.
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_user_settings_to_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync default_framework → profiles.preferred_framework
  IF NEW.default_framework IS DISTINCT FROM OLD.default_framework OR (TG_OP = 'INSERT' AND NEW.default_framework IS NOT NULL) THEN
    UPDATE public.profiles
    SET preferred_framework = NEW.default_framework
    WHERE id = NEW.user_id;
  END IF;

  -- Sync default_framework → user_preferences.framework_filter
  -- Only update if the framework changed and we have a value
  IF NEW.default_framework IS DISTINCT FROM OLD.default_framework OR (TG_OP = 'INSERT' AND NEW.default_framework IS NOT NULL) THEN
    UPDATE public.user_preferences
    SET framework_filter = ARRAY[NEW.default_framework]
    WHERE user_id = NEW.user_id
      AND (framework_filter = '{}' OR framework_filter IS NULL OR framework_filter = ARRAY[OLD.default_framework]);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_settings_to_prefs ON public.user_settings;
CREATE TRIGGER sync_user_settings_to_prefs
  AFTER INSERT OR UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_settings_to_preferences();


-- ============================================================
-- 9. AGENT_VIEWS
-- Per-view tracking for agents (analytics).
-- Each row is one view event. viewer_id is nullable for
-- anonymous views. This enables detailed analytics like
-- unique viewers, view trends, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable for anonymous
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.agent_views IS 'Per-view tracking for agents. Each row is a single view event for analytics.';
COMMENT ON COLUMN public.agent_views.agent_id IS 'The agent that was viewed.';
COMMENT ON COLUMN public.agent_views.viewer_id IS 'The authenticated user who viewed, or NULL for anonymous views.';

ALTER TABLE public.agent_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Anyone can view agent_views (for displaying view counts)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_views' AND policyname = 'Anyone can view agent_views'
  ) THEN
    CREATE POLICY "Anyone can view agent_views"
      ON public.agent_views FOR SELECT
      USING (TRUE);
  END IF;

  -- Any authenticated user can insert a view (for tracking)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_views' AND policyname = 'Authenticated users can insert agent_views'
  ) THEN
    CREATE POLICY "Authenticated users can insert agent_views"
      ON public.agent_views FOR INSERT
      WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_views' AND policyname = 'Service role full access on agent_views'
  ) THEN
    CREATE POLICY "Service role full access on agent_views"
      ON public.agent_views FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_agent_views_agent_id ON public.agent_views(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_views_viewed_at ON public.agent_views(agent_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_views_viewer_id ON public.agent_views(viewer_id);


-- ============================================================
-- 10. AGENT_DOWNLOADS
-- Download tracking for agents.
-- user_id is nullable for anonymous/guest downloads.
-- format specifies the download type.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable for anonymous
  format TEXT DEFAULT 'code' CHECK (format IN ('code', 'markdown', 'zip')),
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.agent_downloads IS 'Download tracking for agents. user_id nullable for anonymous downloads.';
COMMENT ON COLUMN public.agent_downloads.format IS 'Download format: code (source), markdown (documentation), or zip (packaged).';

ALTER TABLE public.agent_downloads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Anyone can see download counts (for display)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_downloads' AND policyname = 'Anyone can view agent_downloads'
  ) THEN
    CREATE POLICY "Anyone can view agent_downloads"
      ON public.agent_downloads FOR SELECT
      USING (TRUE);
  END IF;

  -- Any authenticated user can insert a download record
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_downloads' AND policyname = 'Authenticated users can insert agent_downloads'
  ) THEN
    CREATE POLICY "Authenticated users can insert agent_downloads"
      ON public.agent_downloads FOR INSERT
      WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  END IF;

  -- Users can view their own download history
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_downloads' AND policyname = 'Users can view own agent_downloads'
  ) THEN
    CREATE POLICY "Users can view own agent_downloads"
      ON public.agent_downloads FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_downloads' AND policyname = 'Service role full access on agent_downloads'
  ) THEN
    CREATE POLICY "Service role full access on agent_downloads"
      ON public.agent_downloads FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_agent_downloads_agent_id ON public.agent_downloads(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_user_id ON public.agent_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_format ON public.agent_downloads(format);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_downloaded_at ON public.agent_downloads(downloaded_at DESC);


-- ============================================================
-- 11. USER_ACTIVITY_LOG
-- Audit log of user actions across the platform.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('agent', 'model', 'knowledge', 'collection')),
  target_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_activity_log IS 'Audit log of user actions across the platform. Used for analytics and activity feeds.';
COMMENT ON COLUMN public.user_activity_log.action IS 'The action performed, e.g. create, fork, bookmark, rate, download, deploy.';
COMMENT ON COLUMN public.user_activity_log.target_type IS 'Category of the target: agent, model, knowledge, or collection.';
COMMENT ON COLUMN public.user_activity_log.metadata IS 'Additional JSON data about the action, e.g. { "framework": "langchain" }.';

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can view own user_activity_log'
  ) THEN
    CREATE POLICY "Users can view own user_activity_log"
      ON public.user_activity_log FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can insert own user_activity_log'
  ) THEN
    CREATE POLICY "Users can insert own user_activity_log"
      ON public.user_activity_log FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Service role full access on user_activity_log'
  ) THEN
    CREATE POLICY "Service role full access on user_activity_log"
      ON public.user_activity_log FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON public.user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_target ON public.user_activity_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_created ON public.user_activity_log(user_id, created_at DESC);


-- ============================================================
-- 12. API_KEYS
-- API key management for programmatic access.
-- key_hash stores a one-way hash; key_prefix stores the first
-- 8 characters for user-facing identification.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.api_keys IS 'API key management. key_hash is one-way; key_prefix (first 8 chars) for identification.';
COMMENT ON COLUMN public.api_keys.key_hash IS 'SHA-256 hash of the API key. The raw key is never stored.';
COMMENT ON COLUMN public.api_keys.key_prefix IS 'First 8 characters of the original key, for user identification in the UI.';
COMMENT ON COLUMN public.api_keys.permissions IS 'JSON array of permission strings, e.g. ["read:agents", "write:deployments"].';
COMMENT ON COLUMN public.api_keys.is_active IS 'Whether this API key is currently active. Inactive keys are rejected.';

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can view own api_keys'
  ) THEN
    CREATE POLICY "Users can view own api_keys"
      ON public.api_keys FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can insert own api_keys'
  ) THEN
    CREATE POLICY "Users can insert own api_keys"
      ON public.api_keys FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can update own api_keys'
  ) THEN
    CREATE POLICY "Users can update own api_keys"
      ON public.api_keys FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can delete own api_keys'
  ) THEN
    CREATE POLICY "Users can delete own api_keys"
      ON public.api_keys FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Service role full access on api_keys'
  ) THEN
    CREATE POLICY "Service role full access on api_keys"
      ON public.api_keys FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON public.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON public.api_keys(created_at DESC);


-- ============================================================
-- 13. AGENT_DEPLOYMENTS
-- Agent deployment records with environment, versioning,
-- and lifecycle tracking.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('production', 'staging', 'development')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'stopped', 'failed')),
  deploy_url TEXT,
  version INTEGER DEFAULT 1,
  config JSONB DEFAULT '{}',
  deployed_at TIMESTAMPTZ DEFAULT NOW(),
  stopped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.agent_deployments IS 'Agent deployment records with environment, versioning, and lifecycle tracking.';
COMMENT ON COLUMN public.agent_deployments.environment IS 'Deployment environment: production, staging, or development.';
COMMENT ON COLUMN public.agent_deployments.status IS 'Current status: pending, running, stopped, or failed.';
COMMENT ON COLUMN public.agent_deployments.deploy_url IS 'URL where the deployed agent is accessible.';
COMMENT ON COLUMN public.agent_deployments.version IS 'Deployment version number, incremented on each redeploy.';
COMMENT ON COLUMN public.agent_deployments.config IS 'Deployment configuration as JSON (environment variables, resource limits, etc.).';
COMMENT ON COLUMN public.agent_deployments.deployed_at IS 'Timestamp when the deployment became active.';
COMMENT ON COLUMN public.agent_deployments.stopped_at IS 'Timestamp when the deployment was stopped. NULL if still running.';

ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can view own agent_deployments'
  ) THEN
    CREATE POLICY "Users can view own agent_deployments"
      ON public.agent_deployments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can insert own agent_deployments'
  ) THEN
    CREATE POLICY "Users can insert own agent_deployments"
      ON public.agent_deployments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can update own agent_deployments'
  ) THEN
    CREATE POLICY "Users can update own agent_deployments"
      ON public.agent_deployments FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can delete own agent_deployments'
  ) THEN
    CREATE POLICY "Users can delete own agent_deployments"
      ON public.agent_deployments FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Service role full access on agent_deployments'
  ) THEN
    CREATE POLICY "Service role full access on agent_deployments"
      ON public.agent_deployments FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_agent_deployments_updated_at ON public.agent_deployments;
CREATE TRIGGER update_agent_deployments_updated_at
  BEFORE UPDATE ON public.agent_deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_agent_deployments_user_id ON public.agent_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_agent_id ON public.agent_deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_status ON public.agent_deployments(status);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_environment ON public.agent_deployments(environment);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_deployed_at ON public.agent_deployments(deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_user_agent ON public.agent_deployments(user_id, agent_id);


-- ============================================================
-- TRIGGER: AUTO-CREATE DEFAULT COLLECTION ON SIGNUP
-- Updates the handle_new_user() trigger function to also
-- create a default "My Agents" collection for each new user.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );

  -- Create default preferences
  INSERT INTO public.user_preferences (user_id, theme, default_view, experience_level)
  VALUES (
    NEW.id,
    'system',
    'grid',
    'beginner'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default user settings
  INSERT INTO public.user_settings (user_id, default_privacy, auto_save, editor_theme, sidebar_collapsed)
  VALUES (
    NEW.id,
    'PRIVATE',
    TRUE,
    'default',
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default collection "My Agents"
  INSERT INTO public.agent_collections (user_id, name, description, is_default)
  VALUES (
    NEW.id,
    'My Agents',
    'Your default collection for saved agents',
    TRUE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger (DROP + CREATE for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- TRIGGER: Auto-update stopped_at when status changes to 'stopped'
-- on agent_deployments
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_deployment_stopped_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'stopped' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.stopped_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deployment_stopped_at ON public.agent_deployments;
CREATE TRIGGER trigger_deployment_stopped_at
  BEFORE UPDATE ON public.agent_deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_deployment_stopped_at();


-- ============================================================
-- CLEANUP: Function to purge old data
-- ============================================================

-- Remove recently_viewed entries older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_recently_viewed()
RETURNS void AS $$
BEGIN
  DELETE FROM public.recently_viewed
  WHERE viewed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove old activity log entries (older than 1 year)
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_log()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_activity_log
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deactivate expired API keys
CREATE OR REPLACE FUNCTION public.deactivate_expired_api_keys()
RETURNS void AS $$
BEGIN
  UPDATE public.api_keys
  SET is_active = FALSE
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
--
-- Summary of tables created:
--   1.  agent_bookmarks        — User bookmarks for specific agents
--   2.  agent_collections      — Named collections for organizing agents
--   3.  agent_collection_items — Junction table: agents within collections
--   4.  notifications          — User notification feed (6 types)
--   5.  ai_chat_history        — AI assistant conversation logs
--   6.  recently_viewed        — Recently viewed items (agents, models, knowledge)
--   7.  agent_ratings          — User ratings & reviews for agents (1–5 stars)
--   8.  user_settings          — Extended workspace settings (synced to user_preferences)
--   9.  agent_views            — Per-view tracking (analytics)
--   10. agent_downloads        — Download tracking (code/markdown/zip)
--   11. user_activity_log      — Audit log of user actions
--   12. api_keys               — API key management (hashed, prefixed)
--   13. agent_deployments      — Agent deployment records (env, version, lifecycle)
--
-- All tables feature:
--   - RLS enabled with user-scoped CRUD policies
--   - Service role full-access policies
--   - updated_at auto-update triggers (where applicable)
--   - Proper indexes for common query patterns
--   - Foreign keys with ON DELETE CASCADE (or SET NULL for nullable)
--   - CHECK constraints for enum-like fields
--   - COMMENTs on tables and important columns
--
-- Special triggers:
--   - sync_user_settings_to_preferences: keeps user_settings ↔ user_preferences in sync
--   - handle_new_user: auto-creates profile + preferences + settings + default collection on signup
--   - update_deployment_stopped_at: auto-sets stopped_at when deployment is stopped
--
-- Cleanup functions:
--   - cleanup_old_recently_viewed(): removes entries > 90 days
--   - cleanup_old_activity_log(): removes entries > 1 year
--   - deactivate_expired_api_keys(): deactivates keys past their expires_at
--
-- Existing tables preserved: profiles, user_preferences
-- ============================================================
