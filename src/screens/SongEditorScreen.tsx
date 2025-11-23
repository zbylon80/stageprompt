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
import { ConfirmDialog } from '../components/ConfirmDialog';
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
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Auto-save with debounce
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const timer = setTimeout(() => {
      if (song.title.trim()) {
        const errors = validateSong(song);
        if (errors.length === 0) {
          saveSong({
            ...song,
            updatedAt: Date.now(),
          })
            .then(() => setIsDirty(false))
            .catch((error) => {
              console.error('Auto-save failed:', error);
            });
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [song, saveSong, isDirty]);

  const updateTitle = (title: string) => {
    setSong((prev) => ({ ...prev, title }));
    setIsDirty(true);
  };

  const updateArtist = (artist: string) => {
    setSong((prev) => ({ ...prev, artist }));
    setIsDirty(true);
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
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const updateLineTime = (id: string, timeSeconds: number) => {
    setSong((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.id === id ? { ...line, timeSeconds } : line
      ),
    }));
    setIsDirty(true);
  };

  const deleteLine = (id: string) => {
    setSong((prev) => ({
      ...prev,
      lines: prev.lines.filter((line) => line.id !== id),
    }));
    setIsDirty(true);
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
    setIsDirty(true);
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
      setIsDirty(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save song');
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    try {
      await deleteSong(song.id);
      navigation.goBack();
    } catch (error) {
      if (Platform.OS === 'web') {
        Alert.alert('Error', 'Failed to delete song');
      } else {
        Alert.alert('Error', 'Failed to delete song');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  // Render content based on platform
  const renderContent = () => (
    <>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.topButtonText}>Save</Text>
        </TouchableOpacity>
        
        {song.title && song.lines.length > 0 && (
          <TouchableOpacity
            style={[styles.topButton, styles.previewButton]}
            onPress={() => navigation.navigate('Prompter', { songId: song.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>▶ Preview</Text>
          </TouchableOpacity>
        )}
        
        {song.title && (
          <TouchableOpacity
            style={[styles.topButton, styles.deleteTopButton]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

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
    </>
  );

  // Web version - simple scrollable container
  if (Platform.OS === 'web') {
    return (
      <>
        <View style={styles.container}>
          {renderContent()}
        </View>
        <ConfirmDialog
          visible={showDeleteDialog}
          title="Usuń utwór"
          message={`Czy na pewno chcesz usunąć "${song.title || 'ten utwór'}"?`}
          confirmText="Usuń"
          cancelText="Anuluj"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          destructive
        />
      </>
    );
  }

  // Mobile version - with KeyboardAvoidingView
  return (
    <>
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
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Usuń utwór"
        message={`Czy na pewno chcesz usunąć "${song.title || 'ten utwór'}"?`}
        confirmText="Usuń"
        cancelText="Anuluj"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive
      />
    </>
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
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  topButton: {
    backgroundColor: '#2a3a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3a4a3a',
  },
  previewButton: {
    backgroundColor: '#2a2a3a',
    borderColor: '#3a3a4a',
  },
  deleteTopButton: {
    backgroundColor: '#3a2a2a',
    borderColor: '#4a3a3a',
  },
  topButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#aaaaaa',
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 12,
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
});
