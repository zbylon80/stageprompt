// screens/SongEditorScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Song, LyricLine } from '../types/models';
import { LyricLineEditor, LyricLineEditorRef } from '../components/LyricLineEditor';
import { useSongs } from '../hooks/useSongs';
import { generateId } from '../utils/idGenerator';
import { validateSong } from '../utils/validation';

type SongEditorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SongEditor'>;
type SongEditorScreenRouteProp = RouteProp<RootStackParamList, 'SongEditor'>;

interface SongEditorScreenProps {
  navigation: SongEditorScreenNavigationProp;
  route: SongEditorScreenRouteProp;
}

export function SongEditorScreen({ navigation, route }: SongEditorScreenProps) {
  const { saveSong, deleteSong } = useSongs();
  const [song, setSong] = useState<Song>(
    route.params?.song || {
      id: generateId(),
      title: '',
      artist: '',
      lines: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  );
  
  const scrollViewRef = useRef<ScrollView>(null);
  const lineRefs = useRef<Map<string, LyricLineEditorRef>>(new Map());
  const [lastAddedLineId, setLastAddedLineId] = useState<string | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (song.title.trim()) {
        const errors = validateSong(song);
        if (errors.length === 0) {
          saveSong({
            ...song,
            updatedAt: Date.now(),
          }).catch((error) => {
            console.error('Auto-save failed:', error);
          });
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [song, saveSong]);

  const updateTitle = (title: string) => {
    setSong((prev) => ({ ...prev, title }));
  };

  const updateArtist = (artist: string) => {
    setSong((prev) => ({ ...prev, artist }));
  };

  const addLine = useCallback(() => {
    const newLine: LyricLine = {
      id: generateId(),
      text: '',
      timeSeconds: song.lines.length > 0 
        ? song.lines[song.lines.length - 1].timeSeconds 
        : 0,
    };
    setLastAddedLineId(newLine.id);
    setSong((prev) => ({
      ...prev,
      lines: [...prev.lines, newLine],
    }));
  }, [song.lines]);

  // Auto-scroll and auto-focus on newly added line
  useEffect(() => {
    if (lastAddedLineId) {
      // Use setTimeout to ensure the component is rendered
      const timer = setTimeout(() => {
        const lineRef = lineRefs.current.get(lastAddedLineId);
        if (lineRef) {
          // Focus the input
          lineRef.focus();
          
          // Scroll to the line (only on mobile)
          if (Platform.OS !== 'web') {
            lineRef.measureLayout((x, y, width, height) => {
              scrollViewRef.current?.scrollTo({
                y: y - 100, // Offset to show some context above
                animated: true,
              });
            });
          }
        }
        setLastAddedLineId(null);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [lastAddedLineId, song.lines.length]);

  const updateLineText = (id: string, text: string) => {
    setSong((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.id === id ? { ...line, text } : line
      ),
    }));
  };

  const updateLineTime = (id: string, timeSeconds: number) => {
    setSong((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.id === id ? { ...line, timeSeconds } : line
      ),
    }));
  };

  const deleteLine = (id: string) => {
    setSong((prev) => ({
      ...prev,
      lines: prev.lines.filter((line) => line.id !== id),
    }));
  };

  const handleSplitLines = (id: string, lines: string[]) => {
    setSong((prev) => {
      const lineIndex = prev.lines.findIndex((line) => line.id === id);
      if (lineIndex === -1) return prev;

      const currentLine = prev.lines[lineIndex];
      const newLines: LyricLine[] = lines.map((text, idx) => ({
        id: idx === 0 ? id : generateId(),
        text: text.trim(),
        timeSeconds: currentLine.timeSeconds + idx,
      }));

      const updatedLines = [
        ...prev.lines.slice(0, lineIndex),
        ...newLines,
        ...prev.lines.slice(lineIndex + 1),
      ];

      return {
        ...prev,
        lines: updatedLines,
      };
    });
  };

  const handleSave = async () => {
    const errors = validateSong(song);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      await saveSong({
        ...song,
        updatedAt: Date.now(),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save song');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Song',
      `Are you sure you want to delete "${song.title || 'this song'}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSong(song.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete song');
            }
          },
        },
      ]
    );
  };

  // Render content based on platform
  const renderContent = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={song.title}
          onChangeText={updateTitle}
          placeholder="Song title..."
          placeholderTextColor="#666666"
        />

        <Text style={styles.label}>Artist</Text>
        <TextInput
          style={styles.input}
          value={song.artist}
          onChangeText={updateArtist}
          placeholder="Artist name..."
          placeholderTextColor="#666666"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lyrics</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addLine}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Add Line</Text>
          </TouchableOpacity>
        </View>
      </View>

      {song.lines.map((line, index) => (
        <LyricLineEditor
          key={line.id}
          ref={(ref) => {
            if (ref) {
              lineRefs.current.set(line.id, ref);
            } else {
              lineRefs.current.delete(line.id);
            }
          }}
          line={line}
          index={index}
          onUpdateText={updateLineText}
          onUpdateTime={updateLineTime}
          onDelete={deleteLine}
          onSplitLines={handleSplitLines}
        />
      ))}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save & Close</Text>
        </TouchableOpacity>
        
        {song.title && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete Song</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  // Web version - simple scrollable container
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {renderContent()}
      </View>
    );
  }

  // Mobile version - with KeyboardAvoidingView
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    overflow: 'auto' as any,
    height: '100vh' as any,
    paddingVertical: 16,
    paddingBottom: 50,
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 50,
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cccccc',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
