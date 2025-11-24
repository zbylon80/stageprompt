// components/__tests__/LyricLineEditor.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LyricLineEditor } from '../LyricLineEditor';
import { LyricLine, SongSection } from '../../types/models';

describe('LyricLineEditor - Section Integration', () => {
  const mockLine: LyricLine = {
    id: 'line-1',
    text: 'Test lyric line',
    timeSeconds: 10.5,
  };

  const mockLineWithSection: LyricLine = {
    id: 'line-2',
    text: 'Test lyric with section',
    timeSeconds: 20.0,
    section: {
      type: 'verse',
      number: 1,
      label: 'Verse 1',
    },
  };

  const mockProps = {
    index: 0,
    nextVerseNumber: 2,
    onUpdateText: jest.fn(),
    onUpdateTime: jest.fn(),
    onUpdateSection: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display "Add Section" button when line has no section', () => {
    const { getByText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    expect(getByText('Add Section')).toBeTruthy();
  });

  it('should display SectionMarker when line has a section', () => {
    const { queryByText, getByTestId } = render(
      <LyricLineEditor line={mockLineWithSection} {...mockProps} />
    );

    // Should not show "Add Section" button
    expect(queryByText('Add Section')).toBeNull();
    
    // Should show section marker
    expect(getByTestId('section-marker-editable')).toBeTruthy();
  });

  it('should open SectionPicker when "Add Section" button is pressed', () => {
    const { getByText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const addButton = getByText('Add Section');
    fireEvent.press(addButton);

    // SectionPicker modal should be visible
    expect(getByText('Select Section Type')).toBeTruthy();
  });

  it('should call onUpdateSection when section is selected', () => {
    const { getByText, getByTestId } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    // Open section picker
    fireEvent.press(getByText('Add Section'));

    // Select verse type
    fireEvent.press(getByTestId('section-type-verse'));

    // Confirm selection
    fireEvent.press(getByTestId('confirm-button'));

    // Should call onUpdateSection with the new section
    expect(mockProps.onUpdateSection).toHaveBeenCalledWith(
      'line-1',
      expect.objectContaining({
        type: 'verse',
        number: 2, // nextVerseNumber
        label: 'Verse 2',
      })
    );
  });

  it('should call onUpdateSection with undefined when section is removed', () => {
    const { getByTestId } = render(
      <LyricLineEditor line={mockLineWithSection} {...mockProps} />
    );

    // Click on section marker to edit
    fireEvent.press(getByTestId('section-marker-editable'));

    // Click remove button
    fireEvent.press(getByTestId('remove-section-button'));

    // Should call onUpdateSection with undefined
    expect(mockProps.onUpdateSection).toHaveBeenCalledWith('line-2', undefined);
  });

  it('should close SectionPicker when cancel is pressed', () => {
    const { getByText, getByTestId, queryByText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    // Open section picker
    fireEvent.press(getByText('Add Section'));
    expect(getByText('Select Section Type')).toBeTruthy();

    // Cancel
    fireEvent.press(getByTestId('cancel-button'));

    // Modal should be closed (title not visible)
    expect(queryByText('Select Section Type')).toBeNull();
  });
});
