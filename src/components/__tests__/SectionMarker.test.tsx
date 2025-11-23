// components/__tests__/SectionMarker.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SectionMarker } from '../SectionMarker';
import { SongSection } from '../../types/models';

describe('SectionMarker', () => {
  it('should render a section marker with correct label', () => {
    const section: SongSection = {
      type: 'verse',
      number: 1,
    };

    const { getByText } = render(<SectionMarker section={section} />);
    expect(getByText('Verse 1')).toBeTruthy();
  });

  it('should render chorus section', () => {
    const section: SongSection = {
      type: 'chorus',
    };

    const { getByText } = render(<SectionMarker section={section} />);
    expect(getByText('Chorus')).toBeTruthy();
  });

  it('should render custom label when provided', () => {
    const section: SongSection = {
      type: 'custom',
      label: 'Pre-Chorus',
    };

    const { getByText } = render(<SectionMarker section={section} />);
    expect(getByText('Pre-Chorus')).toBeTruthy();
  });

  it('should render with small size', () => {
    const section: SongSection = {
      type: 'bridge',
    };

    const { getByText } = render(<SectionMarker section={section} size="small" />);
    expect(getByText('Bridge')).toBeTruthy();
  });

  it('should render with large size', () => {
    const section: SongSection = {
      type: 'intro',
    };

    const { getByText } = render(<SectionMarker section={section} size="large" />);
    expect(getByText('Intro')).toBeTruthy();
  });

  it('should call onEdit when pressed and onEdit is provided', () => {
    const section: SongSection = {
      type: 'outro',
    };
    const onEdit = jest.fn();

    const { getByTestId } = render(<SectionMarker section={section} onEdit={onEdit} />);
    const marker = getByTestId('section-marker-editable');
    
    fireEvent.press(marker);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('should not be touchable when onEdit is not provided', () => {
    const section: SongSection = {
      type: 'verse',
      number: 2,
    };

    const { getByTestId } = render(<SectionMarker section={section} />);
    const marker = getByTestId('section-marker');
    
    // Should render as View, not TouchableOpacity
    expect(marker).toBeTruthy();
  });
});
