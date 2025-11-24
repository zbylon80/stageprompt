// components/SectionPicker.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { SectionType, SongSection } from '../types/models';
import { SECTION_COLORS } from '../utils/sectionLabels';

interface SectionPickerProps {
  visible: boolean;
  currentSection?: SongSection;
  nextVerseNumber: number;
  onSelect: (section: SongSection) => void;
  onRemove: () => void;
  onCancel: () => void;
}

const SECTION_TYPES: Array<{ type: SectionType; label: string }> = [
  { type: 'verse', label: 'Verse' },
  { type: 'chorus', label: 'Chorus' },
  { type: 'bridge', label: 'Bridge' },
  { type: 'intro', label: 'Intro' },
  { type: 'outro', label: 'Outro' },
  { type: 'instrumental', label: 'Instrumental' },
  { type: 'custom', label: 'Custom' },
];

/**
 * SectionPicker component provides a dropdown/modal interface for selecting section types
 * Features:
 * - Dropdown with all section types (Verse, Chorus, Bridge, Intro, Outro, Instrumental, Custom)
 * - Automatic numbering for verses
 * - Input for custom labels when "Custom" is selected
 * - Option to remove section
 */
export function SectionPicker({
  visible,
  currentSection,
  nextVerseNumber,
  onSelect,
  onRemove,
  onCancel,
}: SectionPickerProps) {
  const [selectedType, setSelectedType] = useState<SectionType>(
    currentSection?.type || 'verse'
  );
  const [customLabel, setCustomLabel] = useState<string>(
    currentSection?.type === 'custom' ? currentSection.label || '' : ''
  );
  const [startTime, setStartTime] = useState<string>(
    currentSection?.startTime !== undefined ? formatTime(currentSection.startTime) : ''
  );
  const [endTime, setEndTime] = useState<string>(
    currentSection?.endTime !== undefined ? formatTime(currentSection.endTime) : ''
  );

  const handleTypeSelect = (type: SectionType) => {
    setSelectedType(type);
    // Clear custom label when switching away from custom
    if (type !== 'custom') {
      setCustomLabel('');
    }
  };

  const handleConfirm = () => {
    let section: SongSection;

    // Parse timing values
    const parsedStartTime = parseTime(startTime);
    const parsedEndTime = parseTime(endTime);

    if (selectedType === 'verse') {
      // Automatic numbering for verses
      const verseNumber = currentSection?.type === 'verse' && currentSection.number
        ? currentSection.number
        : nextVerseNumber;
      section = {
        type: 'verse',
        number: verseNumber,
        label: `Verse ${verseNumber}`,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
      };
    } else if (selectedType === 'custom') {
      // Custom label required
      if (!customLabel.trim()) {
        // Don't allow empty custom labels
        return;
      }
      section = {
        type: 'custom',
        label: customLabel.trim(),
        startTime: parsedStartTime,
        endTime: parsedEndTime,
      };
    } else {
      // Other types use default labels
      section = {
        type: selectedType,
        label: selectedType.charAt(0).toUpperCase() + selectedType.slice(1),
        startTime: parsedStartTime,
        endTime: parsedEndTime,
      };
    }

    onSelect(section);
  };

  const handleRemove = () => {
    onRemove();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Section Type</Text>
          </View>

          <ScrollView style={styles.content}>
            {SECTION_TYPES.map(({ type, label }) => {
              const isSelected = selectedType === type;
              const backgroundColor = SECTION_COLORS[type];

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    isSelected && styles.typeOptionSelected,
                  ]}
                  onPress={() => handleTypeSelect(type)}
                  testID={`section-type-${type}`}
                >
                  <View
                    style={[styles.colorBadge, { backgroundColor }]}
                  />
                  <Text style={styles.typeLabel}>
                    {label}
                    {type === 'verse' && ` ${nextVerseNumber}`}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Custom label input - only shown when custom is selected */}
            {selectedType === 'custom' && (
              <View style={styles.customInputContainer}>
                <Text style={styles.customInputLabel}>Custom Label:</Text>
                <TextInput
                  style={styles.customInput}
                  value={customLabel}
                  onChangeText={setCustomLabel}
                  placeholder="Enter custom label"
                  placeholderTextColor="#999"
                  autoFocus
                  testID="custom-label-input"
                />
              </View>
            )}

            {/* Timing inputs */}
            <View style={styles.timingContainer}>
              <Text style={styles.timingTitle}>Section Timing (Optional)</Text>
              <Text style={styles.timingDescription}>
                Set start and end times to auto-calculate line timings
              </Text>
              
              <View style={styles.timingRow}>
                <View style={styles.timingInputGroup}>
                  <Text style={styles.timingLabel}>Start Time:</Text>
                  <TextInput
                    style={styles.timingInput}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="MM:SS"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    testID="start-time-input"
                  />
                </View>

                <View style={styles.timingInputGroup}>
                  <Text style={styles.timingLabel}>End Time:</Text>
                  <TextInput
                    style={styles.timingInput}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="MM:SS"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    testID="end-time-input"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            {currentSection && (
              <TouchableOpacity
                style={[styles.button, styles.removeButton]}
                onPress={handleRemove}
                testID="remove-section-button"
              >
                <Text style={styles.removeButtonText}>Remove Section</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                testID="cancel-button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  selectedType === 'custom' && !customLabel.trim() && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={selectedType === 'custom' && !customLabel.trim()}
                testID="confirm-button"
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: Platform.OS === 'web' ? 400 : '85%',
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    maxHeight: 400,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  typeOptionSelected: {
    backgroundColor: '#f5f5f5',
  },
  colorBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  typeLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  customInputContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  customInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  customInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    marginBottom: 12,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  timingContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  timingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timingDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  timingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timingInputGroup: {
    flex: 1,
  },
  timingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  timingInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
});

/**
 * Formats seconds to MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses MM:SS format to seconds
 * Returns undefined if input is empty or invalid
 */
function parseTime(timeStr: string): number | undefined {
  if (!timeStr || !timeStr.trim()) {
    return undefined;
  }

  const parts = timeStr.split(':');
  if (parts.length !== 2) {
    return undefined;
  }

  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);

  if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs >= 60) {
    return undefined;
  }

  return mins * 60 + secs;
}
