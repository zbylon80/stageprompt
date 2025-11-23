// components/SectionMarker.tsx

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SongSection } from '../types/models';
import { getSectionLabel, SECTION_COLORS } from '../utils/sectionLabels';

export type SectionMarkerSize = 'small' | 'medium' | 'large';

interface SectionMarkerProps {
  section: SongSection;
  size?: SectionMarkerSize;
  onEdit?: () => void;
}

/**
 * SectionMarker component displays a colored badge with a section label
 * Supports different sizes and optional edit functionality
 */
export function SectionMarker({ section, size = 'medium', onEdit }: SectionMarkerProps) {
  const label = getSectionLabel(section);
  const backgroundColor = SECTION_COLORS[section.type];

  const containerStyle = [
    styles.container,
    styles[`container_${size}`],
    { backgroundColor },
  ];

  const textStyle = [
    styles.text,
    styles[`text_${size}`],
  ];

  // If onEdit is provided, make it touchable
  if (onEdit) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onEdit}
        activeOpacity={0.7}
        testID="section-marker-editable"
      >
        <Text style={textStyle}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // Otherwise, just a view
  return (
    <View style={containerStyle} testID="section-marker">
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  container_small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  container_medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  container_large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
  },
  text_small: {
    fontSize: 10,
  },
  text_medium: {
    fontSize: 12,
  },
  text_large: {
    fontSize: 16,
  },
});
