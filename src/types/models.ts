// types/models.ts

export type SectionType = 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'instrumental' | 'custom';

export interface SongSection {
  type: SectionType;
  label?: string;      // Optional custom label (e.g., "Verse 1", "Pre-Chorus")
  number?: number;     // Automatic numbering for verses
  startTime?: number;  // Start time of section in seconds (optional)
  endTime?: number;    // End time of section in seconds (optional)
}

export interface LyricLine {
  id: string;
  text: string;
  timeSeconds?: number;  // Optional - undefined means time not set yet
  section?: SongSection;  // Optional section marker
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  durationSeconds?: number;
  lines: LyricLine[];
  createdAt: number;
  updatedAt: number;
}

export interface Setlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  fontSize: number;           // 24-72
  anchorYPercent: number;     // 0.0-1.0 (default 0.4)
  textColor: string;          // hex color
  backgroundColor: string;    // hex color
  marginHorizontal: number;   // pixels
  lineHeight: number;         // pixels (default 60)
  showTouchHints?: boolean;   // Show touch control hints (default true)
}

export interface KeyMapping {
  nextSong?: number;    // keyCode
  prevSong?: number;    // keyCode
  pause?: number;       // keyCode
}

export type PrompterAction = 'nextSong' | 'prevSong' | 'pause';
