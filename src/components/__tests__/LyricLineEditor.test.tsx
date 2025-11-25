// components/__tests__/LyricLineEditor.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LyricLineEditor } from '../LyricLineEditor';
import { LyricLine, SongSection } from '../../types/models';

describe('LyricLineEditor - Time Format', () => {
  const mockLine: LyricLine = {
    id: 'line-1',
    text: 'Test lyric line',
    timeSeconds: 74,
  };

  const mockProps = {
    index: 0,
    nextVerseNumber: 1,
    onUpdateText: jest.fn(),
    onUpdateTime: jest.fn(),
    onUpdateSection: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should accept time input in MM:SS format', () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Enter time in MM:SS format
    fireEvent.changeText(timeInput, '2:30');

    // Should call onUpdateTime with converted seconds
    expect(mockProps.onUpdateTime).toHaveBeenCalledWith('line-1', 150);
  });

  it('should accept time input in seconds format', () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Enter time in seconds format
    fireEvent.changeText(timeInput, '90');

    // Should call onUpdateTime with seconds
    expect(mockProps.onUpdateTime).toHaveBeenCalledWith('line-1', 90);
  });

  it('should restore valid value on blur when input is invalid', async () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Enter invalid time
    fireEvent.changeText(timeInput, 'invalid');
    
    // Blur the input
    fireEvent(timeInput, 'blur');

    // Should restore the original formatted value
    await waitFor(() => {
      expect(timeInput.props.value).toBe('1:14');
    });
  });

  it('should format time correctly when displaying existing value', () => {
    const lineWithTime: LyricLine = {
      id: 'line-2',
      text: 'Test line',
      timeSeconds: 125, // 2:05
    };

    const { getByPlaceholderText } = render(
      <LyricLineEditor line={lineWithTime} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Should display formatted time
    expect(timeInput.props.value).toBe('2:05');
  });

  it('should handle decimal seconds in MM:SS format', () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Enter time with decimal seconds
    fireEvent.changeText(timeInput, '1:30.5');

    // Should call onUpdateTime with converted seconds including decimals
    expect(mockProps.onUpdateTime).toHaveBeenCalledWith('line-1', 90.5);
  });

  it('should handle seconds over 60 in MM:SS format', () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Enter time with seconds > 60 (should still work)
    fireEvent.changeText(timeInput, '1:75');

    // Should call onUpdateTime with converted seconds (1*60 + 75 = 135)
    expect(mockProps.onUpdateTime).toHaveBeenCalledWith('line-1', 135);
  });

  it('should allow empty time input', () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Clear the time input
    fireEvent.changeText(timeInput, '');

    // Should call onUpdateTime with undefined
    expect(mockProps.onUpdateTime).toHaveBeenCalledWith('line-1', undefined);
  });

  it('should not restore value on blur when input is intentionally empty', async () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Clear the input
    fireEvent.changeText(timeInput, '');
    
    // Blur the input
    fireEvent(timeInput, 'blur');

    // Should remain empty
    await waitFor(() => {
      expect(timeInput.props.value).toBe('');
    });
  });

  it('should format valid input consistently on blur', async () => {
    const { getByPlaceholderText } = render(
      <LyricLineEditor line={mockLine} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Enter time without leading zero
    fireEvent.changeText(timeInput, '1:5');
    
    // Blur the input
    fireEvent(timeInput, 'blur');

    // Should format with leading zero
    await waitFor(() => {
      expect(timeInput.props.value).toBe('1:05');
    });
  });

  it('should display seconds format for times under 60 seconds', () => {
    const lineWithShortTime: LyricLine = {
      id: 'line-3',
      text: 'Test line',
      timeSeconds: 45,
    };

    const { getByPlaceholderText } = render(
      <LyricLineEditor line={lineWithShortTime} {...mockProps} />
    );

    const timeInput = getByPlaceholderText('e.g., 1:14 or 74');
    
    // Should display as seconds, not MM:SS
    expect(timeInput.props.value).toBe('45');
  });
});

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
