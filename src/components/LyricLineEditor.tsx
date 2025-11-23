// components/LyricLineEditor.tsx

import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LyricLine } from '../types/models';

interface LyricLineEditorProps {
  line: LyricLine;
  index: number;
  onUpdateText: (id: string, text: string) => void;
  onUpdateTime: (id: string, timeSeconds: number) => void;
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
  onUpdateText,
  onUpdateTime,
  onDelete,
  onSplitLines,
}, ref) => {
  const [timeText, setTimeText] = React.useState(line.timeSeconds.toString());
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
