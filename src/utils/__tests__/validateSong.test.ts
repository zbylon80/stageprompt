// utils/__tests__/validateSong.test.ts

import { validateSong } from '../validation';
import { Song, LyricLine } from '../../types/models';

describe('validateSong - duration validation', () => {
  const createSong = (overrides?: Partial<Song>): Song => ({
    id: 'test-song-1',
    title: 'Test Song',
    artist: 'Test Artist',
    lines: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  const createLine = (text: string, timeSeconds: number): LyricLine => ({
    id: `line-${timeSeconds}`,
    text,
    timeSeconds,
  });

  it('should reject negative duration', () => {
    const song = createSong({ durationSeconds: -10 });
    const errors = validateSong(song);
    expect(errors).toContain('Duration cannot be negative');
  });

  it('should accept positive duration', () => {
    const song = createSong({ durationSeconds: 180 });
    const errors = validateSong(song);
    expect(errors).not.toContain('Duration cannot be negative');
  });

  it('should accept zero duration', () => {
    const song = createSong({ durationSeconds: 0 });
    const errors = validateSong(song);
    expect(errors).not.toContain('Duration cannot be negative');
  });

  it('should accept undefined duration', () => {
    const song = createSong({ durationSeconds: undefined });
    const errors = validateSong(song);
    expect(errors).not.toContain('Duration cannot be negative');
  });

  it('should warn (console.warn) when duration is less than last line time', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const song = createSong({
      durationSeconds: 100,
      lines: [
        createLine('First line', 10),
        createLine('Second line', 50),
        createLine('Last line', 150), // Last line at 150s, but duration is 100s
      ],
    });
    
    const errors = validateSong(song);
    
    // Should NOT add to errors array (not a blocking error)
    expect(errors).not.toContain(expect.stringContaining('duration'));
    
    // Should call console.warn
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Song duration (100s) is less than the last line\'s time (150s)')
    );
    
    consoleWarnSpy.mockRestore();
  });

  it('should not warn when duration is greater than last line time', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const song = createSong({
      durationSeconds: 200,
      lines: [
        createLine('First line', 10),
        createLine('Second line', 50),
        createLine('Last line', 150),
      ],
    });
    
    validateSong(song);
    
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });

  it('should not warn when duration equals last line time', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const song = createSong({
      durationSeconds: 150,
      lines: [
        createLine('First line', 10),
        createLine('Second line', 50),
        createLine('Last line', 150),
      ],
    });
    
    validateSong(song);
    
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });

  it('should not warn when duration is undefined', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const song = createSong({
      durationSeconds: undefined,
      lines: [
        createLine('First line', 10),
        createLine('Last line', 150),
      ],
    });
    
    validateSong(song);
    
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });

  it('should not warn when last line has no time', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const song = createSong({
      durationSeconds: 100,
      lines: [
        createLine('First line', 10),
        { id: 'line-2', text: 'Last line', timeSeconds: undefined as any },
      ],
    });
    
    validateSong(song);
    
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });

  it('should not warn when song has no lines', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const song = createSong({
      durationSeconds: 100,
      lines: [],
    });
    
    validateSong(song);
    
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });
});
