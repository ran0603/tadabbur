export type RevelationType = 'مكية' | 'مدنية';

export interface Virtue {
  text: string;
  source: string;
}

export interface ThematicTopic {
  topic: string;
  verses_range: string;
}

export interface Surah {
  id: number;                                // Surah number (1 to 114)
  name_ar: string;                           // Standard name (e.g. الفاتحة)
  other_names: string[];                     // Axis 1: Alternative names
  naming_reason?: string;                    // Axis 2: Naming context
  revelation_type: RevelationType;          // Axis 3: Makkah or Madinah
  verses_count: number;                      // Axis 3: Number of verses
  virtues: Virtue[];                         // Axis 4: Authentic virtues (Hadiths)
  first_last_harmony?: string | null;        // Axis 5: Harmony between start & end (null from Al-Mulk 67 onwards)
  central_theme: string;                     // Axis 6: General objective / central theme
  thematic_topics: ThematicTopic[] | null;  // Axis 7: Sequential topics breakdown (null from Al-Balad 90 onwards)
  benefits_and_gems: string[];              // Axis 8: Takeaways & spiritual gems
  juz_start: number;                         // Juz index
}

export interface LocalReflection {
  id: string;
  user_id?: string;
  surah_id: number;
  verse_reference?: string;
  reflection_text: string;
  action_item?: string;
  created_at: string;
  updated_at: string;
  is_synced: number; // 0 for offline modified/new, 1 for synced
}

export interface LocalBookmark {
  id: string;
  user_id?: string;
  surah_id: number;
  axis_tag?: string;
  note?: string;
  created_at: string;
}

export interface SalafStory {
  id: string;
  figure: string;
  title: string;
  narrative: string;
  takeaway: string;
}

export interface RecommendedBook {
  title: string;
  author: string;
  description: string;
  stage: 1 | 2;
  highlights: string[];
}
