// utils/__tests__/sectionLabels.test.ts

import { getSectionLabel, getNextVerseNumber, SECTION_COLORS } from '../sectionLabels';
import { SongSection, LyricLine } from '../../types/models';

describe('sectionLabels utilities', () => {
  describe('SECTION_COLORS', () => {
    it('should have colors for all section types', () => {
      expect(SECTION_COLORS.verse).toBeDefined();
      expect(SECTION_COLORS.chorus).toBeDefined();
      expect(SECTION_COLORS.bridge).toBeDefined();
      expect(SECTION_COLORS.intro).toBeDefined();
      expect(SECTION_COLORS.outro).toBeDefined();
      expect(SECTION_COLORS.instrumental).toBeDefined();
      expect(SECTION_COLORS.custom).toBeDefined();
    });

    it('should have valid hex color values', () => {
      Object.values(SECTION_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('getSectionLabel', () => {
    it('should return custom label when provided', () => {
      const section: SongSection = {
        type: 'verse',
        label: 'Pre-Chorus',
      };
      expect(getSectionLabel(section)).toBe('Pre-Chorus');
    });

    it('should return "Verse X" for verses with numbers', () => {
      const section: SongSection = {
        type: 'verse',
        number: 1,
      };
      expect(getSectionLabel(section)).toBe('Verse 1');
    });

    it('should return capitalized type for other sections', () => {
      expect(getSectionLabel({ type: 'chorus' })).toBe('Chorus');
      expect(getSectionLabel({ type: 'bridge' })).toBe('Bridge');
      expect(getSectionLabel({ type: 'intro' })).toBe('Intro');
      expect(getSectionLabel({ type: 'outro' })).toBe('Outro');
      expect(getSectionLabel({ type: 'instrumental' })).toBe('Instrumental');
    });

    it('should prioritize custom label over number', () => {
      const section: SongSection = {
        type: 'verse',
        number: 2,
        label: 'Special Verse',
      };
      expect(getSectionLabel(section)).toBe('Special Verse');
    });
  });

  describe('getNextVerseNumber', () => {
    it('should return 1 when no verses exist', () => {
      const lines: LyricLine[] = [];
      expect(getNextVerseNumber(lines)).toBe(1);
    });

    it('should return 1 when no verse sections exist', () => {
      const lines: LyricLine[] = [
        {
          id: '1',
          text: 'Line 1',
          timeSeconds: 0,
          section: { type: 'chorus' },
        },
        {
          id: '2',
          text: 'Line 2',
          timeSeconds: 5,
          section: { type: 'bridge' },
        },
      ];
      expect(getNextVerseNumber(lines)).toBe(1);
    });

    it('should return next number after highest verse', () => {
      const lines: LyricLine[] = [
        {
          id: '1',
          text: 'Line 1',
          timeSeconds: 0,
          section: { type: 'verse', number: 1 },
        },
        {
          id: '2',
          text: 'Line 2',
          timeSeconds: 5,
          section: { type: 'chorus' },
        },
        {
          id: '3',
          text: 'Line 3',
          timeSeconds: 10,
          section: { type: 'verse', number: 2 },
        },
      ];
      expect(getNextVerseNumber(lines)).toBe(3);
    });

    it('should handle non-sequential verse numbers', () => {
      const lines: LyricLine[] = [
        {
          id: '1',
          text: 'Line 1',
          timeSeconds: 0,
          section: { type: 'verse', number: 1 },
        },
        {
          id: '2',
          text: 'Line 2',
          timeSeconds: 5,
          section: { type: 'verse', number: 5 },
        },
      ];
      expect(getNextVerseNumber(lines)).toBe(6);
    });

    it('should ignore verses without numbers', () => {
      const lines: LyricLine[] = [
        {
          id: '1',
          text: 'Line 1',
          timeSeconds: 0,
          section: { type: 'verse', number: 2 },
        },
        {
          id: '2',
          text: 'Line 2',
          timeSeconds: 5,
          section: { type: 'verse' }, // No number
        },
      ];
      expect(getNextVerseNumber(lines)).toBe(3);
    });
  });
});
