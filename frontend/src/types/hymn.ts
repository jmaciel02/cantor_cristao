export interface Stanza {
  number: number | null;
  is_chorus: boolean;
  text: string;
  lines: string[];
}

export interface Hymn {
  id: number;
  number: number;
  title: string;
  raw_title: string;
  first_line: string;
  author: string | null;
  composer: string | null;
  category: string;
  stanzas: Stanza[];
  lyrics: string;
  lyrics_normalized: string;
  content_hash: string;
}

export interface HymnSummary {
  id: number;
  number: number;
  title: string;
  first_line: string;
  category: string;
  author: string | null;
  search_key: string;
}

export interface FavoriteItem {
  id: number;
  number: number;
  title: string;
  first_line: string;
  category: string;
  savedAt: number;
}

export interface HistoryItem {
  id: number;
  number: number;
  title: string;
  first_line: string;
  viewedAt: number;
}

export interface HymnList {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  hymnIds: number[];
}

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  fontSize: number; // in pixels, default 18
  seniorMode: boolean; // higher contrast, larger buttons & fonts
  keepScreenOn: boolean; // Screen Wake Lock in reading view
}
