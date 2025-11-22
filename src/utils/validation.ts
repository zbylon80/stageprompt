// utils/validation.ts

import { Song, LyricLine, Setlist, AppSettings, KeyMapping } from '../types/models';

export function validateSong(song: Partial<Song>): string[] {
  const errors: string[] = [];
  
  if (!song.title?.trim()) {
    errors.push('Tytuł jest wymagany');
  }
  
  if (song.lines) {
    song.lines.forEach((line, index) => {
      if (line.timeSeconds < 0) {
        errors.push(`Linijka ${index + 1}: czas nie może być ujemny`);
      }
      if (index > 0 && line.timeSeconds < song.lines![index - 1].timeSeconds) {
        errors.push(`Linijka ${index + 1}: czas musi być większy niż poprzednia linijka`);
      }
    });
  }
  
  return errors;
}

export function validateLyricLine(line: Partial<LyricLine>): string[] {
  const errors: string[] = [];
  
  if (line.text === undefined || line.text === null) {
    errors.push('Tekst linijki jest wymagany');
  }
  
  if (line.timeSeconds !== undefined && line.timeSeconds < 0) {
    errors.push('Czas nie może być ujemny');
  }
  
  return errors;
}

export function validateSetlist(setlist: Partial<Setlist>): string[] {
  const errors: string[] = [];
  
  if (!setlist.name?.trim()) {
    errors.push('Nazwa setlisty jest wymagana');
  }
  
  if (setlist.songIds && !Array.isArray(setlist.songIds)) {
    errors.push('songIds musi być tablicą');
  }
  
  return errors;
}

export function validateAppSettings(settings: Partial<AppSettings>): string[] {
  const errors: string[] = [];
  
  if (settings.fontSize !== undefined) {
    if (settings.fontSize < 24 || settings.fontSize > 72) {
      errors.push('fontSize musi być między 24 a 72');
    }
  }
  
  if (settings.anchorYPercent !== undefined) {
    if (settings.anchorYPercent < 0 || settings.anchorYPercent > 1) {
      errors.push('anchorYPercent musi być między 0.0 a 1.0');
    }
  }
  
  if (settings.textColor !== undefined) {
    if (!isValidHexColor(settings.textColor)) {
      errors.push('textColor musi być poprawnym kolorem hex');
    }
  }
  
  if (settings.backgroundColor !== undefined) {
    if (!isValidHexColor(settings.backgroundColor)) {
      errors.push('backgroundColor musi być poprawnym kolorem hex');
    }
  }
  
  if (settings.marginHorizontal !== undefined) {
    if (settings.marginHorizontal < 0) {
      errors.push('marginHorizontal nie może być ujemny');
    }
  }
  
  if (settings.lineHeight !== undefined) {
    if (settings.lineHeight <= 0) {
      errors.push('lineHeight musi być większy niż 0');
    }
  }
  
  return errors;
}

export function validateKeyMapping(mapping: Partial<KeyMapping>): string[] {
  const errors: string[] = [];
  
  if (mapping.nextSong !== undefined && typeof mapping.nextSong !== 'number') {
    errors.push('nextSong musi być liczbą');
  }
  
  if (mapping.prevSong !== undefined && typeof mapping.prevSong !== 'number') {
    errors.push('prevSong musi być liczbą');
  }
  
  if (mapping.pause !== undefined && typeof mapping.pause !== 'number') {
    errors.push('pause musi być liczbą');
  }
  
  return errors;
}

function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

// Export data validation for import/export functionality
export interface ExportData {
  version: string;
  exportDate: number;
  songs: Song[];
  setlists: Setlist[];
}

export function validateImportData(data: any): boolean {
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!data.version || typeof data.version !== 'string') {
    return false;
  }
  
  if (data.exportDate === undefined || data.exportDate === null || typeof data.exportDate !== 'number') {
    return false;
  }
  
  // Check songs array
  if (!Array.isArray(data.songs)) {
    return false;
  }
  
  // Validate each song
  for (const song of data.songs) {
    if (!isValidSong(song)) {
      return false;
    }
  }
  
  // Check setlists array
  if (!Array.isArray(data.setlists)) {
    return false;
  }
  
  // Validate each setlist
  for (const setlist of data.setlists) {
    if (!isValidSetlist(setlist)) {
      return false;
    }
  }
  
  return true;
}

function isValidSong(song: any): boolean {
  if (!song || typeof song !== 'object') {
    return false;
  }
  
  // Required fields
  if (!song.id || typeof song.id !== 'string') {
    return false;
  }
  
  if (!song.title || typeof song.title !== 'string') {
    return false;
  }
  
  if (!Array.isArray(song.lines)) {
    return false;
  }
  
  // Validate each line
  for (const line of song.lines) {
    if (!isValidLyricLine(line)) {
      return false;
    }
  }
  
  if (typeof song.createdAt !== 'number') {
    return false;
  }
  
  if (typeof song.updatedAt !== 'number') {
    return false;
  }
  
  // Optional fields (allow null for JSON compatibility)
  if (song.artist !== undefined && song.artist !== null && typeof song.artist !== 'string') {
    return false;
  }
  
  if (song.durationSeconds !== undefined && song.durationSeconds !== null && typeof song.durationSeconds !== 'number') {
    return false;
  }
  
  return true;
}

function isValidLyricLine(line: any): boolean {
  if (!line || typeof line !== 'object') {
    return false;
  }
  
  if (!line.id || typeof line.id !== 'string') {
    return false;
  }
  
  if (typeof line.text !== 'string') {
    return false;
  }
  
  if (typeof line.timeSeconds !== 'number') {
    return false;
  }
  
  return true;
}

function isValidSetlist(setlist: any): boolean {
  if (!setlist || typeof setlist !== 'object') {
    return false;
  }
  
  if (!setlist.id || typeof setlist.id !== 'string') {
    return false;
  }
  
  if (!setlist.name || typeof setlist.name !== 'string') {
    return false;
  }
  
  if (!Array.isArray(setlist.songIds)) {
    return false;
  }
  
  // Validate each songId is a string
  for (const songId of setlist.songIds) {
    if (typeof songId !== 'string') {
      return false;
    }
  }
  
  if (typeof setlist.createdAt !== 'number') {
    return false;
  }
  
  if (typeof setlist.updatedAt !== 'number') {
    return false;
  }
  
  return true;
}
