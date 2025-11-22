// types/models.ts

export interface LyricLine {
  id: string;
  text: string;
  timeSeconds: number;
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
}

export interface KeyMapping {
  nextSong?: number;    // keyCode
  prevSong?: number;    // keyCode
  pause?: number;       // keyCode
}

export type PrompterAction = 'nextSong' | 'prevSong' | 'pause';
