// components/__tests__/SectionPicker.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SectionPicker } from '../SectionPicker';
import { SongSection } from '../../types/models';

describe('SectionPicker', () => {
  const mockOnSelect = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all section types', () => {
    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    expect(getByTestId('section-type-verse')).toBeTruthy();
    expect(getByTestId('section-type-chorus')).toBeTruthy();
    expect(getByTestId('section-type-bridge')).toBeTruthy();
    expect(getByTestId('section-type-intro')).toBeTruthy();
    expect(getByTestId('section-type-outro')).toBeTruthy();
    expect(getByTestId('section-type-instrumental')).toBeTruthy();
    expect(getByTestId('section-type-custom')).toBeTruthy();
  });

  it('should show custom input when custom type is selected', () => {
    const { getByTestId, queryByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    // Custom input should not be visible initially
    expect(queryByTestId('custom-label-input')).toBeNull();

    // Select custom type
    fireEvent.press(getByTestId('section-type-custom'));

    // Custom input should now be visible
    expect(getByTestId('custom-label-input')).toBeTruthy();
  });

  it('should call onSelect with verse section including automatic numbering', () => {
    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={3}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    // Verse should be selected by default
    fireEvent.press(getByTestId('confirm-button'));

    expect(mockOnSelect).toHaveBeenCalledWith({
      type: 'verse',
      number: 3,
      label: 'Verse 3',
    });
  });

  it('should call onSelect with chorus section', () => {
    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByTestId('section-type-chorus'));
    fireEvent.press(getByTestId('confirm-button'));

    expect(mockOnSelect).toHaveBeenCalledWith({
      type: 'chorus',
      label: 'Chorus',
    });
  });

  it('should call onSelect with custom section when label is provided', () => {
    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByTestId('section-type-custom'));
    fireEvent.changeText(getByTestId('custom-label-input'), 'Pre-Chorus');
    fireEvent.press(getByTestId('confirm-button'));

    expect(mockOnSelect).toHaveBeenCalledWith({
      type: 'custom',
      label: 'Pre-Chorus',
    });
  });

  it('should not call onSelect when custom is selected but label is empty', () => {
    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByTestId('section-type-custom'));
    fireEvent.press(getByTestId('confirm-button'));

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should call onRemove when remove button is pressed', () => {
    const currentSection: SongSection = {
      type: 'chorus',
      label: 'Chorus',
    };

    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        currentSection={currentSection}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByTestId('remove-section-button'));

    expect(mockOnRemove).toHaveBeenCalled();
  });

  it('should not show remove button when no current section exists', () => {
    const { queryByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    expect(queryByTestId('remove-section-button')).toBeNull();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        nextVerseNumber={1}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByTestId('cancel-button'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should preserve verse number when editing existing verse', () => {
    const currentSection: SongSection = {
      type: 'verse',
      number: 2,
      label: 'Verse 2',
    };

    const { getByTestId } = render(
      <SectionPicker
        visible={true}
        currentSection={currentSection}
        nextVerseNumber={5}
        onSelect={mockOnSelect}
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByTestId('confirm-button'));

    expect(mockOnSelect).toHaveBeenCalledWith({
      type: 'verse',
      number: 2,
      label: 'Verse 2',
    });
  });
});
