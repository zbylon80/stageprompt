import { calculateLineTimes, isFirstLineOfSection } from '../timingInterpolation';
import { LyricLine, SongSection } from '../../types/models';

describe('timingInterpolation', () => {
  describe('calculateLineTimes', () => {
    it('should interpolate times for a single section with multiple lines', () => {
      const section: SongSection = {
        type: 'verse',
        number: 1,
        startTime: 10,
        endTime: 30,
      };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Line 1', timeSeconds: 0, section },
        { id: '2', text: 'Line 2', timeSeconds: 0, section },
        { id: '3', text: 'Line 3', timeSeconds: 0, section },
        { id: '4', text: 'Line 4', timeSeconds: 0, section },
      ];
      
      const result = calculateLineTimes(lines);
      
      expect(result[0].timeSeconds).toBeCloseTo(10.0, 2);
      expect(result[1].timeSeconds).toBeCloseTo(16.67, 2);
      expect(result[2].timeSeconds).toBeCloseTo(23.33, 2);
      expect(result[3].timeSeconds).toBeCloseTo(30.0, 2);
    });

    it('should handle a single line in a section', () => {
      const section: SongSection = {
        type: 'intro',
        startTime: 5,
        endTime: 10,
      };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Single line', timeSeconds: 0, section },
      ];
      
      const result = calculateLineTimes(lines);
      
      expect(result[0].timeSeconds).toBe(5);
    });

    it('should handle multiple sections', () => {
      const verse: SongSection = {
        type: 'verse',
        number: 1,
        startTime: 10,
        endTime: 20,
      };
      
      const chorus: SongSection = {
        type: 'chorus',
        startTime: 25,
        endTime: 35,
      };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Verse line 1', timeSeconds: 0, section: verse },
        { id: '2', text: 'Verse line 2', timeSeconds: 0, section: verse },
        { id: '3', text: 'Chorus line 1', timeSeconds: 0, section: chorus },
        { id: '4', text: 'Chorus line 2', timeSeconds: 0, section: chorus },
        { id: '5', text: 'Chorus line 3', timeSeconds: 0, section: chorus },
      ];
      
      const result = calculateLineTimes(lines);
      
      // Verse
      expect(result[0].timeSeconds).toBe(10);
      expect(result[1].timeSeconds).toBe(20);
      
      // Chorus
      expect(result[2].timeSeconds).toBe(25);
      expect(result[3].timeSeconds).toBe(30);
      expect(result[4].timeSeconds).toBe(35);
    });

    it('should preserve explicit timeSeconds when section has no timing', () => {
      const section: SongSection = {
        type: 'verse',
        number: 1,
        // No startTime or endTime
      };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Line 1', timeSeconds: 5, section },
        { id: '2', text: 'Line 2', timeSeconds: 10, section },
      ];
      
      const result = calculateLineTimes(lines);
      
      expect(result[0].timeSeconds).toBe(5);
      expect(result[1].timeSeconds).toBe(10);
    });

    it('should handle lines without sections', () => {
      const lines: LyricLine[] = [
        { id: '1', text: 'Line 1', timeSeconds: 5 },
        { id: '2', text: 'Line 2', timeSeconds: 10 },
      ];
      
      const result = calculateLineTimes(lines);
      
      expect(result[0].timeSeconds).toBe(5);
      expect(result[1].timeSeconds).toBe(10);
    });

    it('should handle mixed sections (some with timing, some without)', () => {
      const sectionWithTiming: SongSection = {
        type: 'verse',
        number: 1,
        startTime: 10,
        endTime: 20,
      };
      
      const sectionWithoutTiming: SongSection = {
        type: 'chorus',
      };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Verse line 1', timeSeconds: 0, section: sectionWithTiming },
        { id: '2', text: 'Verse line 2', timeSeconds: 0, section: sectionWithTiming },
        { id: '3', text: 'Chorus line 1', timeSeconds: 25, section: sectionWithoutTiming },
        { id: '4', text: 'Chorus line 2', timeSeconds: 30, section: sectionWithoutTiming },
      ];
      
      const result = calculateLineTimes(lines);
      
      // Verse with timing
      expect(result[0].timeSeconds).toBe(10);
      expect(result[1].timeSeconds).toBe(20);
      
      // Chorus without timing - preserves explicit times
      expect(result[2].timeSeconds).toBe(25);
      expect(result[3].timeSeconds).toBe(30);
    });
  });

  describe('isFirstLineOfSection', () => {
    it('should return true for the first line in the song with a section', () => {
      const section: SongSection = { type: 'verse', number: 1 };
      const lines: LyricLine[] = [
        { id: '1', text: 'Line 1', timeSeconds: 0, section },
      ];
      
      expect(isFirstLineOfSection(lines[0], 0, lines)).toBe(true);
    });

    it('should return false for lines without sections', () => {
      const lines: LyricLine[] = [
        { id: '1', text: 'Line 1', timeSeconds: 0 },
      ];
      
      expect(isFirstLineOfSection(lines[0], 0, lines)).toBe(false);
    });

    it('should return true when section type changes', () => {
      const verse: SongSection = { type: 'verse', number: 1 };
      const chorus: SongSection = { type: 'chorus' };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Verse line', timeSeconds: 0, section: verse },
        { id: '2', text: 'Chorus line', timeSeconds: 5, section: chorus },
      ];
      
      expect(isFirstLineOfSection(lines[1], 1, lines)).toBe(true);
    });

    it('should return false for subsequent lines in the same section', () => {
      const section: SongSection = { type: 'verse', number: 1 };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Line 1', timeSeconds: 0, section },
        { id: '2', text: 'Line 2', timeSeconds: 5, section },
      ];
      
      expect(isFirstLineOfSection(lines[1], 1, lines)).toBe(false);
    });

    it('should return true when verse number changes', () => {
      const verse1: SongSection = { type: 'verse', number: 1 };
      const verse2: SongSection = { type: 'verse', number: 2 };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Verse 1 line', timeSeconds: 0, section: verse1 },
        { id: '2', text: 'Verse 2 line', timeSeconds: 5, section: verse2 },
      ];
      
      expect(isFirstLineOfSection(lines[1], 1, lines)).toBe(true);
    });

    it('should return true when custom label changes', () => {
      const section1: SongSection = { type: 'custom', label: 'Pre-Chorus' };
      const section2: SongSection = { type: 'custom', label: 'Post-Chorus' };
      
      const lines: LyricLine[] = [
        { id: '1', text: 'Pre-Chorus line', timeSeconds: 0, section: section1 },
        { id: '2', text: 'Post-Chorus line', timeSeconds: 5, section: section2 },
      ];
      
      expect(isFirstLineOfSection(lines[1], 1, lines)).toBe(true);
    });
  });
});
