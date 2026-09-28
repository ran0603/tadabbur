-- Migration: 20260928000000_content_schema.sql
-- Description: Initial content & user schema with Row Level Security (RLS) and block validation.

-- 1. CONTENT TABLES

CREATE TABLE IF NOT EXISTS content_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT CHECK (status IN ('draft', 'published', 'retired')) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS surah (
  id INT NOT NULL,
  content_version_id UUID NOT NULL REFERENCES content_version(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  revelation_type TEXT CHECK (revelation_type IN ('makki', 'madani')) NOT NULL,
  verse_count INT NOT NULL,
  names JSONB DEFAULT '[]'::jsonb,
  virtues JSONB DEFAULT '[]'::jsonb,
  central_theme TEXT,
  opening_closing_link JSONB,
  review_status TEXT CHECK (review_status IN ('draft', 'in_review', 'approved')) NOT NULL DEFAULT 'draft',
  reviewer_id UUID,
  reviewed_at TIMESTAMPTZ,
  PRIMARY KEY (id, content_version_id)
);

CREATE TABLE IF NOT EXISTS thematic_block (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_version_id UUID NOT NULL REFERENCES content_version(id) ON DELETE CASCADE,
  surah_id INT NOT NULL,
  title TEXT NOT NULL,
  verse_start INT NOT NULL,
  verse_end INT NOT NULL,
  summary TEXT,
  review_status TEXT CHECK (review_status IN ('draft', 'in_review', 'approved')) NOT NULL DEFAULT 'draft',
  reviewer_id UUID,
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS verse (
  ref TEXT NOT NULL,
  content_version_id UUID NOT NULL REFERENCES content_version(id) ON DELETE CASCADE,
  surah_id INT NOT NULL,
  verse_number INT NOT NULL,
  text_uthmani TEXT NOT NULL,
  text_checksum TEXT NOT NULL,
  juz INT NOT NULL,
  block_id UUID REFERENCES thematic_block(id) ON DELETE SET NULL,
  PRIMARY KEY (ref, content_version_id)
);

CREATE TABLE IF NOT EXISTS action_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_version_id UUID NOT NULL REFERENCES content_version(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  text TEXT NOT NULL,
  review_status TEXT CHECK (review_status IN ('draft', 'in_review', 'approved')) NOT NULL DEFAULT 'draft',
  reviewer_id UUID
);

CREATE TABLE IF NOT EXISTS audio_asset (
  verse_ref TEXT NOT NULL,
  reciter_id TEXT NOT NULL,
  url TEXT NOT NULL,
  duration_ms INT,
  words JSONB,
  PRIMARY KEY (verse_ref, reciter_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diff JSONB
);

-- 2. USER TABLES

CREATE TABLE IF NOT EXISTS profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS key_wrap (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wrapped_dek BYTEA NOT NULL,
  kdf_params JSONB NOT NULL,
  recovery_wrapped_dek BYTEA,
  key_id TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS journal_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  ciphertext BYTEA NOT NULL,
  nonce BYTEA NOT NULL,
  key_id TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS action_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID,
  verse_ref TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'archived')) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_completion (
  action_id UUID NOT NULL REFERENCES action_item(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  PRIMARY KEY (action_id, day)
);

-- 3. ENABLE ROW LEVEL SECURITY ON ALL TABLES

ALTER TABLE content_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE surah ENABLE ROW LEVEL SECURITY;
ALTER TABLE thematic_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_wrap ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_completion ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR PUBLIC READ & USER ISOLATION

-- Public Read for Published Content
CREATE POLICY "Public can read published content_version" ON content_version
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published surah" ON surah
  FOR SELECT USING (content_version_id IN (SELECT id FROM content_version WHERE status = 'published'));

CREATE POLICY "Public can read published thematic_block" ON thematic_block
  FOR SELECT USING (content_version_id IN (SELECT id FROM content_version WHERE status = 'published'));

CREATE POLICY "Public can read published verse" ON verse
  FOR SELECT USING (content_version_id IN (SELECT id FROM content_version WHERE status = 'published'));

CREATE POLICY "Public can read published action_template" ON action_template
  FOR SELECT USING (content_version_id IN (SELECT id FROM content_version WHERE status = 'published'));

CREATE POLICY "Public can read audio assets" ON audio_asset
  FOR SELECT USING (true);

-- User Data Isolation (User A cannot read or write User B)
CREATE POLICY "User can manage own profile" ON profile
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User can manage own key_wrap" ON key_wrap
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User can manage own journal_entry" ON journal_entry
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User can manage own action_item" ON action_item
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User can manage own action_completion" ON action_completion
  FOR ALL USING (auth.uid() = user_id);

-- 5. POSTGRES VALIDATION FUNCTION (Block Verse Range Gaps / Overlaps Check)

CREATE OR REPLACE FUNCTION validate_block_ranges(p_surah_id INT, p_content_version_id UUID)
RETURNS TABLE (valid BOOLEAN, message TEXT) AS $$
DECLARE
  v_expected_start INT := 1;
  r RECORD;
BEGIN
  FOR r IN
    SELECT verse_start, verse_end, title
    FROM thematic_block
    WHERE surah_id = p_surah_id AND content_version_id = p_content_version_id
    ORDER BY verse_start ASC
  LOOP
    IF r.verse_start > v_expected_start THEN
      RETURN QUERY SELECT false, format('Gap detected in Surah %s before block "%s" (expected verse %s, found %s)', p_surah_id, r.title, v_expected_start, r.verse_start);
      RETURN;
    END IF;
    IF r.verse_start < v_expected_start THEN
      RETURN QUERY SELECT false, format('Overlap detected in Surah %s at block "%s" (overlap at verse %s)', p_surah_id, r.title, r.verse_start);
      RETURN;
    END IF;
    v_expected_start := r.verse_end + 1;
  END LOOP;

  RETURN QUERY SELECT true, 'Block ranges are valid without gaps or overlaps.'::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;
