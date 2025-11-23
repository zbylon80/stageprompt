// utils/__tests__/validateSection.test.ts

import { validateSection } from '../validation';
import { SongSection } from '../../types/models';

describe('validateSection', () => {
  it('should accept valid verse section with number', () => {
    const section: SongSection = {
      type: 'verse',
      number: 1,
    };
    const errors = validateSection(section);
    expect(errors).toHaveLength(0);
  });

  it('should accept valid chorus section', () => {
    const section: SongSection = {
      type: 'chorus',
    };
    const errors = validateSection(section);
    expect(errors).toHaveLength(0);
  });

  it('should accept section with custom label', () => {
    const section: SongSection = {
      type: 'custom',
      label: 'Pre-Chorus',
    };
    const errors = validateSection(section);
    expect(errors).toHaveLength(0);
  });

  it('should reject section without type', () => {
    const section = {} as SongSection;
    const errors = validateSection(section);
    expect(errors).toContain('Section type is required');
  });

  it('should reject section with invalid type', () => {
    const section = {
      type: 'invalid',
    } as any;
    const errors = validateSection(section);
    expect(errors).toContain('Invalid section type');
  });

  it('should reject section with negative number', () => {
    const section: Partial<SongSection> = {
      type: 'verse',
      number: -1,
    };
    const errors = validateSection(section);
    expect(errors).toContain('Section number must be at least 1');
  });

  it('should reject section with zero number', () => {
    const section: Partial<SongSection> = {
      type: 'verse',
      number: 0,
    };
    const errors = validateSection(section);
    expect(errors).toContain('Section number must be at least 1');
  });

  it('should reject section with non-integer number', () => {
    const section: Partial<SongSection> = {
      type: 'verse',
      number: 1.5,
    };
    const errors = validateSection(section);
    expect(errors).toContain('Section number must be an integer');
  });

  it('should reject section with non-string label', () => {
    const section: any = {
      type: 'custom',
      label: 123,
    };
    const errors = validateSection(section);
    expect(errors).toContain('Section label must be a string');
  });

  it('should reject section with empty label', () => {
    const section: Partial<SongSection> = {
      type: 'custom',
      label: '   ',
    };
    const errors = validateSection(section);
    expect(errors).toContain('Section label cannot be empty');
  });

  it('should accept all valid section types', () => {
    const types = ['verse', 'chorus', 'bridge', 'intro', 'outro', 'instrumental', 'custom'];
    types.forEach(type => {
      const section = { type } as SongSection;
      const errors = validateSection(section);
      expect(errors).toHaveLength(0);
    });
  });
});
