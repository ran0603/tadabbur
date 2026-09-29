-- ==========================================================
-- Schema for "أول مرة أتدبر القرآن" (The Path to Divine Understanding)
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ==========================================================

-- 1. Surahs Metadata & Core Content
CREATE TABLE IF NOT EXISTS surahs (
  id INT PRIMARY KEY,                       -- Surah number (1 to 114)
  name_ar TEXT NOT NULL,                    -- Standard name (e.g., الفاتحة)
  other_names JSONB DEFAULT '[]',           -- Alternative names (Axis 1)
  naming_reason TEXT,                       -- Reason for naming (Axis 2)
  revelation_type TEXT CHECK (revelation_type IN ('مكية', 'مدنية')), -- (Axis 3)
  verses_count INT NOT NULL,                -- (Axis 3)
  virtues JSONB DEFAULT '[]',               -- Authentic Hadiths regarding virtues (Axis 4)
  first_last_harmony TEXT,                  -- Connection between start & end (Axis 5, null from Al-Mulk onwards)
  central_theme TEXT NOT NULL,              -- General objective / central axis (Axis 6)
  thematic_topics JSONB DEFAULT '[]',       -- Array of { topic: string, verses_range: string } (Axis 7, null from Al-Balad onwards)
  benefits_and_gems JSONB DEFAULT '[]',     -- Spiritual takeaways & subtle gems (Axis 8)
  juz_start INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Profiles & Reading Progress
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  daily_wird_target INT DEFAULT 1,          -- Number of pages/surahs planned per day
  last_active_surah INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Personal Reflections (تدبر وعمل)
CREATE TABLE IF NOT EXISTS user_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  surah_id INT REFERENCES surahs(id),
  verse_reference TEXT,
  reflection_text TEXT NOT NULL,
  action_item TEXT,                         -- Practical commitment based on "سر القرآن هو العمل به"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT TRUE
);

-- 4. Bookmarks & Reading Ledger
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  surah_id INT REFERENCES surahs(id),
  axis_tag TEXT,                            -- Bookmark specific section (e.g., 'gems', 'themes')
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can manage own reflections"
  ON user_reflections FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
  ON user_bookmarks FOR ALL
  USING (auth.uid() = user_id);
