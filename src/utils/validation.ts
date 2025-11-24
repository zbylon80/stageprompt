// utils/validation.ts

import { Song, LyricLine, Setlist, AppSettings, KeyMapping, SongSection, SectionType } from '../types/models';

export function validateSong(song: Partial<Song>): string[] {
  const errors: string[] = [];

  if (!song.title?.trim()) {
    errors.push('Title is required');
  }

  if (song.lines) {
    song.lines.forEach((line, index) => {
      // Only validate if time is set (not undefined)
      if (line.timeSeconds !== undefined && line.timeSeconds < 0) {
        errors.push(`Line ${index + 1}: time cannot be negative`);
      }
      // Check ordering only for lines that have times set
      const prevLine = song.lines![index - 1];
      if (index > 0 && 
          line.timeSeconds !== undefined && 
          prevLine?.timeSeconds !== undefined &&
          line.timeSeconds < prevLine.timeSeconds) {
        errors.push(`Line ${index + 1}: time must be greater than previous line`);
      }
    });
  }

  return errors;
}

export function validateLyricLine(line: Partial<LyricLine>): string[] {
  const errors: string[] = [];

  if (line.text === undefined || line.text === null) {
    errors.push('Line text is required');
  }

  if (line.timeSeconds !== undefined && line.timeSeconds < 0) {
    errors.push('Time cannot be negative');
  }

  return errors;
}

export function validateSetlist(setlist: Partial<Setlist>): string[] {
  const errors: string[] = [];

  if (!setlist.name?.trim()) {
    errors.push('Setlist name is required');
  }

  if (setlist.songIds && !Array.isArray(setlist.songIds)) {
    errors.push('songIds must be an array.');
  }

  return errors;
}

export function validateAppSettings(settings: Partial<AppSettings>): string[] {
  const errors: string[] = [];

  if (settings.fontSize !== undefined) {
    if (settings.fontSize < 24 || settings.fontSize > 72) {
      errors.push('fontSize must be between 24 and 72');
    }
  }

  if (settings.anchorYPercent !== undefined) {
    if (settings.anchorYPercent < 0 || settings.anchorYPercent > 1) {
      errors.push('anchorYPercent must be between 0.0 and 1.0');
    }
  }

  if (settings.textColor !== undefined) {
    if (!isValidHexColor(settings.textColor)) {
      errors.push('textColor must be a valid hex color');
    }
  }

  if (settings.backgroundColor !== undefined) {
    if (!isValidHexColor(settings.backgroundColor)) {
      errors.push('backgroundColor must be a valid hex color');
    }
  }

  if (settings.marginHorizontal !== undefined) {
    if (settings.marginHorizontal < 0) {
      errors.push('marginHorizontal cannot be negative');
    }
  }

  if (settings.lineHeight !== undefined) {
    if (settings.lineHeight <= 0) {
      errors.push('lineHeight must be greater than 0');
    }
  }

  return errors;
}

export function validateKeyMapping(mapping: Partial<KeyMapping>): string[] {
  const errors: string[] = [];

  if (mapping.nextSong !== undefined && typeof mapping.nextSong !== 'number') {
    errors.push('nextSong must be a number.');
  }

  if (mapping.prevSong !== undefined && typeof mapping.prevSong !== 'number') {
    errors.push('prevSong must be a number.');
  }

  if (mapping.pause !== undefined && typeof mapping.pause !== 'number') {
    errors.push('pause must be a number.');
  }

  return errors;
}

export function validateSection(section: Partial<SongSection>): string[] {
  const errors: string[] = [];

  // Validate section type
  if (!section.type) {
    errors.push('Section type is required');
  } else {
    const validTypes: SectionType[] = ['verse', 'chorus', 'bridge', 'intro', 'outro', 'instrumental', 'custom'];
    if (!validTypes.includes(section.type)) {
      errors.push('Invalid section type');
    }
  }

  // Validate number if provided
  if (section.number !== undefined) {
    if (typeof section.number !== 'number') {
      errors.push('Section number must be a number');
    } else if (section.number < 1) {
      errors.push('Section number must be at least 1');
    } else if (!Number.isInteger(section.number)) {
      errors.push('Section number must be an integer');
    }
  }

  // Validate label if provided
  if (section.label !== undefined && section.label !== null) {
    if (typeof section.label !== 'string') {
      errors.push('Section label must be a string');
    } else if (section.label.trim() === '') {
      errors.push('Section label cannot be empty');
    }
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

  // Validate section if present (optional field)
  // If section data is invalid, we'll strip it during import rather than blocking
  if (line.section !== undefined && line.section !== null) {
    if (!isValidSection(line.section)) {
      // Invalid section - will be stripped during import
      // But don't fail the entire line validation
      console.warn(`Invalid section data in line ${line.id}, will be stripped during import`);
    }
  }

  return true;
}

function isValidSection(section: any): boolean {
  if (!section || typeof section !== 'object') {
    return false;
  }

  // Type is required
  if (!section.type || typeof section.type !== 'string') {
    return false;
  }

  const validTypes: SectionType[] = ['verse', 'chorus', 'bridge', 'intro', 'outro', 'instrumental', 'custom'];
  if (!validTypes.includes(section.type)) {
    return false;
  }

  // Number is optional but must be valid if present
  if (section.number !== undefined && section.number !== null) {
    if (typeof section.number !== 'number' || section.number < 1 || !Number.isInteger(section.number)) {
      return false;
    }
  }

  // Label is optional but must be valid if present
  if (section.label !== undefined && section.label !== null) {
    if (typeof section.label !== 'string' || section.label.trim() === '') {
      return false;
    }
  }

  // StartTime is optional but must be valid if present
  if (section.startTime !== undefined && section.startTime !== null) {
    if (typeof section.startTime !== 'number' || section.startTime < 0) {
      return false;
    }
  }

  // EndTime is optional but must be valid if present
  if (section.endTime !== undefined && section.endTime !== null) {
    if (typeof section.endTime !== 'number' || section.endTime < 0) {
      return false;
    }
  }

  // If both startTime and endTime are present, endTime must be >= startTime
  if (section.startTime !== undefined && section.endTime !== undefined &&
      section.startTime !== null && section.endTime !== null) {
    if (section.endTime < section.startTime) {
      return false;
    }
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
