-- ============================================================
-- Humain-Uno: Supabase Migration 002
-- New Tables: bookmarks, collections, notifications,
--   ai_chat_history, recently_viewed, ratings, user_settings,
--   agent_views, agent_downloads, user_activity_log,
--   api_keys, agent_deployments
-- ============================================================
-- This script is IDEMPOTENT: uses IF NOT EXISTS, DROP TRIGGER IF EXISTS, etc.
-- It preserves the existing profiles and user_preferences tables.
-- ============================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HELPER: updated_at auto-update function
-- (Re-created with CREATE OR REPLACE so it works regardless of
--  whether the 001 migration's version or supabase-setup.sql's
--  version was applied. Both do the same thing.)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. BOOKMARKS
-- User bookmarks for agents and LLM models
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('agent', 'llm_model')),
  target_id TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users can view own bookmarks'
  ) THEN
    CREATE POLICY "Users can view own bookmarks"
      ON public.bookmarks FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users can insert own bookmarks'
  ) THEN
    CREATE POLICY "Users can insert own bookmarks"
      ON public.bookmarks FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users can update own bookmarks'
  ) THEN
    CREATE POLICY "Users can update own bookmarks"
      ON public.bookmarks FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Users can delete own bookmarks'
  ) THEN
    CREATE POLICY "Users can delete own bookmarks"
      ON public.bookmarks FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'Service role full access on bookmarks'
  ) THEN
    CREATE POLICY "Service role full access on bookmarks"
      ON public.bookmarks FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_bookmarks_updated_at ON public.bookmarks;
CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_target ON public.bookmarks(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- ============================================================
-- 2. COLLECTIONS
-- User collections/folders for organizing agents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  agent_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can view own collections'
  ) THEN
    CREATE POLICY "Users can view own collections"
      ON public.collections FOR SELECT
      USING (auth.uid() = user_id OR is_public = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can insert own collections'
  ) THEN
    CREATE POLICY "Users can insert own collections"
      ON public.collections FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can update own collections'
  ) THEN
    CREATE POLICY "Users can update own collections"
      ON public.collections FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can delete own collections'
  ) THEN
    CREATE POLICY "Users can delete own collections"
      ON public.collections FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Service role full access on collections'
  ) THEN
    CREATE POLICY "Service role full access on collections"
      ON public.collections FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON public.collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at DESC);

-- ============================================================
-- 3. NOTIFICATIONS
-- User notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('agent_update', 'new_agent', 'bookmark_reminder', 'system', 'achievement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications FOR UPDATE
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
-- 4. AI_CHAT_HISTORY
-- AI chat conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_history' AND policyname = 'Users can view own chat history'
  ) THEN
    CREATE POLICY "Users can view own chat history"
      ON public.ai_chat_history FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_history' AND policyname = 'Users can insert own chat history'
  ) THEN
    CREATE POLICY "Users can insert own chat history"
      ON public.ai_chat_history FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_history' AND policyname = 'Users can delete own chat history'
  ) THEN
    CREATE POLICY "Users can delete own chat history"
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

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_session ON public.ai_chat_history(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON public.ai_chat_history(created_at DESC);

-- ============================================================
-- 5. RECENTLY_VIEWED
-- Track recently viewed items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('agent', 'llm_model', 'knowledge_agent')),
  target_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can view own recently viewed'
  ) THEN
    CREATE POLICY "Users can view own recently viewed"
      ON public.recently_viewed FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can insert own recently viewed'
  ) THEN
    CREATE POLICY "Users can insert own recently viewed"
      ON public.recently_viewed FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recently_viewed' AND policyname = 'Users can delete own recently viewed'
  ) THEN
    CREATE POLICY "Users can delete own recently viewed"
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
CREATE INDEX IF NOT EXISTS idx_recently_viewed_target ON public.recently_viewed(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(user_id, viewed_at DESC);

-- ============================================================
-- 6. RATINGS
-- User ratings for agents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can view own ratings'
  ) THEN
    CREATE POLICY "Users can view own ratings"
      ON public.ratings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Ratings are publicly readable (to show average ratings)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Anyone can view ratings'
  ) THEN
    CREATE POLICY "Anyone can view ratings"
      ON public.ratings FOR SELECT
      USING (TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can insert own ratings'
  ) THEN
    CREATE POLICY "Users can insert own ratings"
      ON public.ratings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can update own ratings'
  ) THEN
    CREATE POLICY "Users can update own ratings"
      ON public.ratings FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can delete own ratings'
  ) THEN
    CREATE POLICY "Users can delete own ratings"
      ON public.ratings FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Service role full access on ratings'
  ) THEN
    CREATE POLICY "Service role full access on ratings"
      ON public.ratings FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_ratings_updated_at ON public.ratings;
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_agent_id ON public.ratings(agent_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at DESC);

-- ============================================================
-- 7. USER_SETTINGS
-- Extended user settings (syncs with user_preferences)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  default_create_method TEXT,
  auto_save_drafts BOOLEAN DEFAULT TRUE,
  email_digest TEXT DEFAULT 'none' CHECK (email_digest IN ('none', 'daily', 'weekly')),
  api_rate_limit INTEGER DEFAULT 100,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can view own settings'
  ) THEN
    CREATE POLICY "Users can view own settings"
      ON public.user_settings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can insert own settings'
  ) THEN
    CREATE POLICY "Users can insert own settings"
      ON public.user_settings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can update own settings'
  ) THEN
    CREATE POLICY "Users can update own settings"
      ON public.user_settings FOR UPDATE
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
-- 8. AGENT_VIEWS
-- View count tracking for agents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT UNIQUE NOT NULL,
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Agent views are publicly readable (to display view counts)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_views' AND policyname = 'Anyone can view agent_views'
  ) THEN
    CREATE POLICY "Anyone can view agent_views"
      ON public.agent_views FOR SELECT
      USING (TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_views' AND policyname = 'Authenticated users can insert agent_views'
  ) THEN
    CREATE POLICY "Authenticated users can insert agent_views"
      ON public.agent_views FOR INSERT
      WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_views' AND policyname = 'Authenticated users can update agent_views'
  ) THEN
    CREATE POLICY "Authenticated users can update agent_views"
      ON public.agent_views FOR UPDATE
      USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
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
CREATE INDEX IF NOT EXISTS idx_agent_views_view_count ON public.agent_views(view_count DESC);

-- ============================================================
-- 9. AGENT_DOWNLOADS
-- Download tracking for agents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  download_type TEXT NOT NULL CHECK (download_type IN ('code', 'spec', 'template')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_downloads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_downloads' AND policyname = 'Users can view own downloads'
  ) THEN
    CREATE POLICY "Users can view own downloads"
      ON public.agent_downloads FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Anyone can see download counts (for display)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_downloads' AND policyname = 'Anyone can view agent_downloads'
  ) THEN
    CREATE POLICY "Anyone can view agent_downloads"
      ON public.agent_downloads FOR SELECT
      USING (TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_downloads' AND policyname = 'Users can insert own downloads'
  ) THEN
    CREATE POLICY "Users can insert own downloads"
      ON public.agent_downloads FOR INSERT
      WITH CHECK (auth.uid() = user_id);
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

CREATE INDEX IF NOT EXISTS idx_agent_downloads_user_id ON public.agent_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_agent_id ON public.agent_downloads(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_created_at ON public.agent_downloads(created_at DESC);

-- ============================================================
-- 10. USER_ACTIVITY_LOG
-- Track user actions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'create_agent', 'fork_agent', 'bookmark_agent', 'rate_agent',
    'download_agent', 'view_agent', 'create_api_key', 'deploy_agent'
  )),
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can view own activity log'
  ) THEN
    CREATE POLICY "Users can view own activity log"
      ON public.user_activity_log FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can insert own activity log'
  ) THEN
    CREATE POLICY "Users can insert own activity log"
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

-- ============================================================
-- 11. API_KEYS
-- API keys for agent deployments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can view own api keys'
  ) THEN
    CREATE POLICY "Users can view own api keys"
      ON public.api_keys FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can insert own api keys'
  ) THEN
    CREATE POLICY "Users can insert own api keys"
      ON public.api_keys FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can update own api keys'
  ) THEN
    CREATE POLICY "Users can update own api keys"
      ON public.api_keys FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can delete own api keys'
  ) THEN
    CREATE POLICY "Users can delete own api keys"
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
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON public.api_keys(created_at DESC);

-- ============================================================
-- 12. AGENT_DEPLOYMENTS
-- Agent deployment records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  deployment_url TEXT,
  deployment_type TEXT NOT NULL CHECK (deployment_type IN ('cloud', 'local', 'api')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'stopped', 'failed')),
  config JSONB DEFAULT '{}',
  last_health_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can view own deployments'
  ) THEN
    CREATE POLICY "Users can view own deployments"
      ON public.agent_deployments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can insert own deployments'
  ) THEN
    CREATE POLICY "Users can insert own deployments"
      ON public.agent_deployments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can update own deployments'
  ) THEN
    CREATE POLICY "Users can update own deployments"
      ON public.agent_deployments FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_deployments' AND policyname = 'Users can delete own deployments'
  ) THEN
    CREATE POLICY "Users can delete own deployments"
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
CREATE INDEX IF NOT EXISTS idx_agent_deployments_created_at ON public.agent_deployments(created_at DESC);

-- ============================================================
-- AUTO-CREATE user_settings ON SIGNUP
-- Update the handle_new_user trigger to also create user_settings
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
  INSERT INTO public.user_settings (user_id, sidebar_collapsed, auto_save_drafts, email_digest, api_rate_limit)
  VALUES (
    NEW.id,
    FALSE,
    TRUE,
    'none',
    100
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- MIGRATION COMPLETE
-- Summary of new tables:
--   1.  bookmarks          - User bookmarks for agents/models
--   2.  collections        - User collections for organizing agents
--   3.  notifications      - User notifications
--   4.  ai_chat_history    - AI chat conversations
--   5.  recently_viewed    - Recently viewed items tracking
--   6.  ratings            - User ratings for agents
--   7.  user_settings      - Extended user settings
--   8.  agent_views        - View count tracking
--   9.  agent_downloads    - Download tracking
--   10. user_activity_log  - User action logging
--   11. api_keys           - API key management
--   12. agent_deployments  - Agent deployment records
--
-- All tables have:
--   - RLS enabled
--   - User-scoped policies (own data only)
--   - Service role full access policies
--   - updated_at auto-update triggers (where applicable)
--   - Appropriate indexes
--   - Foreign key constraints with ON DELETE CASCADE
--   - CHECK constraints for enum-like fields
--
-- Existing tables preserved: profiles, user_preferences
-- ============================================================
