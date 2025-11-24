// components/LyricLineEditor.tsx

import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LyricLine, SongSection } from '../types/models';
import { SectionMarker } from './SectionMarker';
import { SectionPicker } from './SectionPicker';

interface LyricLineEditorProps {
  line: LyricLine;
  index: number;
  nextVerseNumber: number;
  onUpdateText: (id: string, text: string) => void;
  onUpdateTime: (id: string, timeSeconds: number) => void;
  onUpdateSection: (id: string, section: SongSection | undefined) => void;
  onDelete: (id: string) => void;
  onSplitLines?: (id: string, lines: string[]) => void;
}

export interface LyricLineEditorRef {
  focus: () => void;
  measureLayout: (callback: (x: number, y: number, width: number, height: number) => void) => void;
}

export const LyricLineEditor = forwardRef<LyricLineEditorRef, LyricLineEditorProps>(({
  line,
  index,
  nextVerseNumber,
  onUpdateText,
  onUpdateTime,
  onUpdateSection,
  onDelete,
  onSplitLines,
}, ref) => {
  const [timeText, setTimeText] = React.useState(line.timeSeconds.toString());
  const [showSectionPicker, setShowSectionPicker] = React.useState(false);
  const textInputRef = React.useRef<TextInput>(null);
  const containerRef = React.useRef<View>(null);

  // Keep local text input in sync when parent updates timeSeconds
  useEffect(() => {
    const nextText = line.timeSeconds.toString();
    if (timeText !== nextText) {
      setTimeText(nextText);
    }
  }, [line.timeSeconds, timeText]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      textInputRef.current?.focus();
    },
    measureLayout: (callback: (x: number, y: number, width: number, height: number) => void) => {
      if (containerRef.current) {
        containerRef.current.measure((x, y, width, height, pageX, pageY) => {
          callback(pageX, pageY, width, height);
        });
      }
    },
  }));

  const handleTimeChange = (text: string) => {
    setTimeText(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateTime(line.id, parsed);
    }
  };

  const handleTextChange = (text: string) => {
    // Check if text contains newlines
    if (text.includes('\n') && onSplitLines) {
      // Split by newlines and filter out empty lines
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        onSplitLines(line.id, lines);
        return;
      }
    }
    onUpdateText(line.id, text);
  };

  const handleSectionSelect = (section: SongSection) => {
    onUpdateSection(line.id, section);
    setShowSectionPicker(false);
  };

  const handleSectionRemove = () => {
    onUpdateSection(line.id, undefined);
    setShowSectionPicker(false);
  };

  const handleSectionEdit = () => {
    setShowSectionPicker(true);
  };

  return (
    <View ref={containerRef} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lineNumber}>{index + 1}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(line.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Section marker or add section button */}
      <View style={styles.sectionContainer}>
        {line.section ? (
          <SectionMarker
            section={line.section}
            size="small"
            onEdit={handleSectionEdit}
          />
        ) : (
          <TouchableOpacity
            style={styles.addSectionButton}
            onPress={() => setShowSectionPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addSectionIcon}>🏷️</Text>
            <Text style={styles.addSectionText}>Add Section</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TextInput
        ref={textInputRef}
        style={styles.textInput}
        value={line.text}
        onChangeText={handleTextChange}
        placeholder="Enter lyric line..."
        placeholderTextColor="#666666"
        multiline
      />
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Time (seconds):</Text>
        <TextInput
          style={styles.timeInput}
          value={timeText}
          onChangeText={handleTimeChange}
          keyboardType="numeric"
          placeholder="0.0"
          placeholderTextColor="#666666"
        />
      </View>

      {/* Section picker modal */}
      <SectionPicker
        visible={showSectionPicker}
        currentSection={line.section}
        nextVerseNumber={nextVerseNumber}
        onSelect={handleSectionSelect}
        onRemove={handleSectionRemove}
        onCancel={() => setShowSectionPicker(false)}
      />
    </View>
  );
});

LyricLineEditor.displayName = 'LyricLineEditor';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lineNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a9eff',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  addSectionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  addSectionText: {
    fontSize: 12,
    color: '#4a9eff',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginRight: 8,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#ffffff',
  },
});
