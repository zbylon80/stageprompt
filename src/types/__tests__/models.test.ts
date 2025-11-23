// Test to verify backward compatibility of models

import { LyricLine, Song, SongSection, SectionType } from '../models';

describe('Models - Backward Compatibility', () => {
  it('should allow LyricLine without section field', () => {
    const line: LyricLine = {
      id: 'test-1',
      text: 'Test line',
      timeSeconds: 10.5,
    };
    
    expect(line.section).toBeUndefined();
    expect(line.id).toBe('test-1');
    expect(line.text).toBe('Test line');
    expect(line.timeSeconds).toBe(10.5);
  });

  it('should allow LyricLine with section field', () => {
    const section: SongSection = {
      type: 'verse',
      number: 1,
    };
    
    const line: LyricLine = {
      id: 'test-2',
      text: 'Test line with section',
      timeSeconds: 20.5,
      section,
    };
    
    expect(line.section).toBeDefined();
    expect(line.section?.type).toBe('verse');
    expect(line.section?.number).toBe(1);
  });

  it('should support all section types', () => {
    const types: SectionType[] = ['verse', 'chorus', 'bridge', 'intro', 'outro', 'instrumental', 'custom'];
    
    types.forEach(type => {
      const section: SongSection = { type };
      expect(section.type).toBe(type);
    });
  });

  it('should allow Song with lines without sections', () => {
    const song: Song = {
      id: 'song-1',
      title: 'Test Song',
      artist: 'Test Artist',
      lines: [
        { id: 'line-1', text: 'Line 1', timeSeconds: 0 },
        { id: 'line-2', text: 'Line 2', timeSeconds: 5 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    expect(song.lines).toHaveLength(2);
    expect(song.lines[0].section).toBeUndefined();
    expect(song.lines[1].section).toBeUndefined();
  });

  it('should allow Song with mixed lines (with and without sections)', () => {
    const song: Song = {
      id: 'song-2',
      title: 'Test Song',
      lines: [
        { id: 'line-1', text: 'Intro', timeSeconds: 0, section: { type: 'intro' } },
        { id: 'line-2', text: 'Verse line', timeSeconds: 5 },
        { id: 'line-3', text: 'Chorus line', timeSeconds: 10, section: { type: 'chorus' } },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    expect(song.lines[0].section?.type).toBe('intro');
    expect(song.lines[1].section).toBeUndefined();
    expect(song.lines[2].section?.type).toBe('chorus');
  });
});
