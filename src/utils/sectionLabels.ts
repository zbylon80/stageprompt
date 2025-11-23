// utils/sectionLabels.ts

import { SectionType, SongSection, LyricLine } from '../types/models';

/**
 * Color mapping for different section types
 * Used for visual distinction in UI components
 */
export const SECTION_COLORS: Record<SectionType, string> = {
  verse: '#4A90E2',        // Blue
  chorus: '#E24A4A',       // Red
  bridge: '#F5A623',       // Orange
  intro: '#7ED321',        // Green
  outro: '#9013FE',        // Purple
  instrumental: '#50E3C2', // Teal
  custom: '#B8E986',       // Light Green
};

/**
 * Returns a human-readable label for a section
 * @param section - The song section to get label for
 * @returns Formatted label string (e.g., "Verse 1", "Chorus", "Bridge")
 */
export function getSectionLabel(section: SongSection): string {
  // If custom label is provided, use it
  if (section.label) {
    return section.label;
  }

  // For verses with numbers, include the number
  if (section.type === 'verse' && section.number !== undefined) {
    return `Verse ${section.number}`;
  }

  // For other types, capitalize the first letter
  return section.type.charAt(0).toUpperCase() + section.type.slice(1);
}

/**
 * Calculates the next verse number based on existing lines
 * Scans through all lines to find the highest verse number and returns next
 * @param lines - Array of lyric lines to scan
 * @returns Next verse number (1 if no verses exist)
 */
export function getNextVerseNumber(lines: LyricLine[]): number {
  let maxVerseNumber = 0;

  for (const line of lines) {
    if (line.section?.type === 'verse' && line.section.number !== undefined) {
      maxVerseNumber = Math.max(maxVerseNumber, line.section.number);
    }
  }

  return maxVerseNumber + 1;
}
