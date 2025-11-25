// screens/SongEditorScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../types/navigation';
import { Song, LyricLine, SongSection } from '../types/models';
import { LyricLineEditor, LyricLineEditorRef } from '../components/LyricLineEditor';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { useSongs } from '../hooks/useSongs';
import { generateId } from '../utils/idGenerator';
import { validateSong } from '../utils/validation';
import { getNextVerseNumber } from '../utils/sectionLabels';
import { calculateLineTimes } from '../utils/timingInterpolation';
import { interpolateAnchorTimes, findAnchorPoints } from '../utils/anchorBasedTiming';
import { parseTimeInput, formatTimeForEdit } from '../utils/timeFormat';

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
  const [showResetTimesDialog, setShowResetTimesDialog] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [durationText, setDurationText] = useState<string>(
    formatTimeForEdit(song.durationSeconds)
  );

  // Update durationText when song.durationSeconds changes (e.g., when loading a different song)
  useEffect(() => {
    setDurationText(formatTimeForEdit(song.durationSeconds));
  }, [song.id]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Auto-calculate line times based on section timing
  useEffect(() => {
    // Check if any section has timing information
    const hasSectionTiming = song.lines.some(
      line => line.section?.startTime !== undefined || line.section?.endTime !== undefined
    );
    
    if (hasSectionTiming) {
      const linesWithCalculatedTimes = calculateLineTimes(song.lines);
      
      // Only update if times actually changed to avoid infinite loop
      const timesChanged = linesWithCalculatedTimes.some((line, index) => 
        line.timeSeconds !== song.lines[index]?.timeSeconds
      );
      
      if (timesChanged) {
        setSong(prev => ({
          ...prev,
          lines: linesWithCalculatedTimes,
        }));
        setIsDirty(true);
      }
    }
  }, [song.lines.map(l => `${l.id}-${l.section?.startTime}-${l.section?.endTime}`).join(',')]);

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

  const handleDurationChange = (text: string) => {
    setDurationText(text);
  };

  const handleDurationBlur = () => {
    if (!durationText.trim()) {
      // Empty duration is valid (undefined)
      setSong((prev) => ({ ...prev, durationSeconds: undefined }));
      setDurationText('');
      setIsDirty(true);
      return;
    }

    const result = parseTimeInput(durationText);
    if (result.success && result.seconds !== undefined) {
      setSong((prev) => ({ ...prev, durationSeconds: result.seconds }));
      setDurationText(formatTimeForEdit(result.seconds));
      setIsDirty(true);
    } else {
      // Restore previous valid value on error
      setDurationText(formatTimeForEdit(song.durationSeconds));
      if (result.error) {
        showToast(result.error, 'error');
      }
    }
  };

  const addLine = useCallback(() => {
    const newLine: LyricLine = {
      id: generateId(),
      text: '',
      timeSeconds: undefined, // undefined means time not set yet
    };
    setLastAddedLineId(newLine.id);
    setSong((prev) => ({
      ...prev,
      lines: [...prev.lines, newLine],
    }));
    setIsDirty(true);
  }, [song.lines]);

  const insertLineAfter = useCallback((index: number) => {
    const newLine: LyricLine = {
      id: generateId(),
      text: '',
      timeSeconds: undefined, // undefined means time not set yet
    };
    
    setLastAddedLineId(newLine.id);
    setSong((prev) => ({
      ...prev,
      lines: [
        ...prev.lines.slice(0, index + 1),
        newLine,
        ...prev.lines.slice(index + 1),
      ],
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

  const updateLineSection = (id: string, section: SongSection | undefined) => {
    setSong((prev) => {
      const lineIndex = prev.lines.findIndex(line => line.id === id);
      if (lineIndex === -1) return prev;
      
      const updatedLines = [...prev.lines];
      const currentLine = updatedLines[lineIndex];
      
      // Update the current line with the new section
      updatedLines[lineIndex] = { ...currentLine, section };
      
      // If section has timing info, propagate it to all lines in the same section
      if (section && (section.startTime !== undefined || section.endTime !== undefined)) {
        // Find all lines that belong to this section (same type, number, label)
        for (let i = lineIndex; i < updatedLines.length; i++) {
          const line = updatedLines[i];
          
          // Check if this line is part of the same section
          if (line.section &&
              line.section.type === section.type &&
              line.section.number === section.number &&
              line.section.label === section.label) {
            // Update section timing for all lines in this section
            updatedLines[i] = {
              ...line,
              section: {
                ...line.section,
                startTime: section.startTime,
                endTime: section.endTime,
              },
            };
          } else if (i > lineIndex) {
            // Stop when we reach a different section
            break;
          }
        }
      }
      
      return {
        ...prev,
        lines: updatedLines,
      };
    });
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

      const newLines: LyricLine[] = lines.map((text, idx) => ({
        id: idx === 0 ? id : generateId(),
        text: text.trim(),
        timeSeconds: undefined, // undefined means time not set yet
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

  const handleDragEnd = useCallback(({ data }: { data: LyricLine[] }) => {
    setSong((prev) => ({
      ...prev,
      lines: data,
    }));
    setIsDirty(true);
  }, []);

  const handleSave = async () => {
    console.log('=== SAVE CLICKED ===');
    console.log('Song to save:', { title: song.title, lineCount: song.lines.length });
    console.log('Lines:', song.lines.map((l, i) => ({ index: i, time: l.timeSeconds })));
    
    const errors = validateSong(song);
    console.log('Validation errors:', errors);
    
    if (errors.length > 0) {
      showToast(errors.join(', '), 'error');
      return;
    }

    try {
      console.log('Calling saveSong...');
      await saveSong({
        ...song,
        updatedAt: Date.now(),
      });
      console.log('Save successful!');
      setIsDirty(false);
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save song', 'error');
    }
  };

  const handleInterpolateTimes = () => {
    console.log('=== INTERPOLATE CLICKED ===');
    console.log('Current lines:', song.lines.map((l, i) => ({ index: i, id: l.id, time: l.timeSeconds })));
    
    // Find anchor points (lines with explicitly set times)
    const anchors = findAnchorPoints(song.lines);
    console.log('Found anchors:', anchors);
    
    if (anchors.length < 2) {
      console.log('Not enough anchors, showing toast');
      showToast('Set times for at least 2 lines to interpolate between them', 'info');
      return;
    }
    
    // Interpolate times between anchors
    const interpolatedLines = interpolateAnchorTimes(song.lines, anchors);
    console.log('Interpolated lines:', interpolatedLines.map((l, i) => ({ index: i, id: l.id, time: l.timeSeconds })));
    
    setSong(prev => ({
      ...prev,
      lines: interpolatedLines,
    }));
    setIsDirty(true);
    console.log('State updated');
  };

  const handleResetTimes = () => {
    setShowResetTimesDialog(true);
  };

  const handleConfirmResetTimes = () => {
    setShowResetTimesDialog(false);
    console.log('Resetting all times to undefined');
    setSong(prev => ({
      ...prev,
      lines: prev.lines.map(line => ({
        ...line,
        timeSeconds: undefined,
      })),
    }));
    setIsDirty(true);
    console.log('Times reset complete');
  };

  const handleCancelResetTimes = () => {
    setShowResetTimesDialog(false);
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
      console.error('Delete error:', error);
      showToast('Failed to delete song', 'error');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  // Render content based on platform
  const renderContent = () => (
    <>
      {/* Top action bar - only on web (sticky top) */}
      {Platform.OS === 'web' && (
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>Save</Text>
          </TouchableOpacity>
          
          {song.lines.length > 0 && (
            <TouchableOpacity
              style={[styles.topButton, styles.resetButton]}
              onPress={handleResetTimes}
              activeOpacity={0.7}
            >
              <Text style={styles.topButtonText}>Clear Times</Text>
            </TouchableOpacity>
          )}
          
          {song.lines.length >= 2 && (
            <TouchableOpacity
              style={[styles.topButton, styles.interpolateButton]}
              onPress={handleInterpolateTimes}
              activeOpacity={0.7}
            >
              <Text style={styles.topButtonText}>Auto-Time</Text>
            </TouchableOpacity>
          )}
          
          {song.title && song.lines.length > 0 && (
            <TouchableOpacity
              style={[styles.topButton, styles.previewButton]}
              onPress={() => navigation.navigate('Prompter', { songId: song.id })}
              activeOpacity={0.7}
            >
              <Text style={styles.topButtonText}>Preview</Text>
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
      )}

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

        <Text style={styles.label}>Duration (optional)</Text>
        <TextInput
          style={styles.input}
          value={durationText}
          onChangeText={handleDurationChange}
          onBlur={handleDurationBlur}
          placeholder="e.g., 3:45 or 225"
          placeholderTextColor="#666666"
          keyboardType="numeric"
        />
        
        {song.durationSeconds !== undefined && song.lines.length > 0 && (() => {
          const lastLineTime = song.lines
            .map(line => line.timeSeconds)
            .filter((time): time is number => time !== undefined)
            .reduce((max, time) => Math.max(max, time), 0);
          
          if (lastLineTime > song.durationSeconds) {
            return (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Duration ({formatTimeForEdit(song.durationSeconds)}) is shorter than the last line ({formatTimeForEdit(lastLineTime)})
                </Text>
              </View>
            );
          }
          return null;
        })()}

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

      <GestureHandlerRootView style={styles.linesContainer}>
        <DraggableFlatList
          data={song.lines}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.webScrollContent}
          renderItem={({ item: line, drag, isActive, getIndex }: RenderItemParams<LyricLine>) => {
            const nextVerseNumber = getNextVerseNumber(song.lines);
            const index = getIndex() ?? 0;
            
            return (
              <ScaleDecorator>
                <View>
                  <LyricLineEditor
                    ref={(ref) => {
                      if (ref) {
                        lineRefs.current.set(line.id, ref);
                      } else {
                        lineRefs.current.delete(line.id);
                      }
                    }}
                    line={line}
                    index={index}
                    nextVerseNumber={nextVerseNumber}
                    onUpdateText={updateLineText}
                    onUpdateTime={updateLineTime}
                    onUpdateSection={updateLineSection}
                    onDelete={deleteLine}
                    onSplitLines={handleSplitLines}
                    onLongPress={drag}
                    isActive={isActive}
                  />
                  
                  {/* Insert button after each line */}
                  <TouchableOpacity
                    style={styles.insertButton}
                    onPress={() => insertLineAfter(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.insertButtonText}>+ Insert Line</Text>
                  </TouchableOpacity>
                </View>
              </ScaleDecorator>
            );
          }}
        />
      </GestureHandlerRootView>
    </>
  );

  // Web version - simple scrollable container
  if (Platform.OS === 'web') {
    return (
      <>
        <View style={styles.container}>
          {renderContent()}
        </View>
        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
        <ConfirmDialog
          visible={showDeleteDialog}
          title="Delete Song"
          message={`Are you sure you want to delete "${song.title || 'this song'}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          destructive
        />
        <ConfirmDialog
          visible={showResetTimesDialog}
          title="Reset Times"
          message="Are you sure you want to reset all times? You will be able to set new anchors and use interpolation."
          confirmText="Reset"
          cancelText="Cancel"
          onConfirm={handleConfirmResetTimes}
          onCancel={handleCancelResetTimes}
          destructive
        />
      </>
    );
  }

  // Mobile version - with KeyboardAvoidingView and sticky bottom buttons
  // FIX: Don't nest DraggableFlatList inside ScrollView
  // FIX: Keep TextInputs outside FlatList to prevent focus loss on state change
  return (
    <>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header with Title/Artist inputs - outside FlatList to maintain focus */}
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

          <Text style={styles.label}>Duration (optional)</Text>
          <TextInput
            style={styles.input}
            value={durationText}
            onChangeText={handleDurationChange}
            onBlur={handleDurationBlur}
            placeholder="e.g., 3:45 or 225"
            placeholderTextColor="#666666"
            keyboardType="numeric"
          />
          
          {song.durationSeconds !== undefined && song.lines.length > 0 && (() => {
            const lastLineTime = song.lines
              .map(line => line.timeSeconds)
              .filter((time): time is number => time !== undefined)
              .reduce((max, time) => Math.max(max, time), 0);
            
            if (lastLineTime > song.durationSeconds) {
              return (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    ⚠️ Duration ({formatTimeForEdit(song.durationSeconds)}) is shorter than the last line ({formatTimeForEdit(lastLineTime)})
                  </Text>
                </View>
              );
            }
            return null;
          })()}

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

        <GestureHandlerRootView style={styles.linesContainer}>
          <DraggableFlatList
            data={song.lines}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No lyrics yet</Text>
                <Text style={styles.emptySubtext}>Tap "+ Add Line" to start</Text>
              </View>
            }
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: line, drag, isActive, getIndex }: RenderItemParams<LyricLine>) => {
              const nextVerseNumber = getNextVerseNumber(song.lines);
              const index = getIndex() ?? 0;
              
              return (
                <ScaleDecorator>
                  <View>
                    <LyricLineEditor
                      ref={(ref) => {
                        if (ref) {
                          lineRefs.current.set(line.id, ref);
                        } else {
                          lineRefs.current.delete(line.id);
                        }
                      }}
                      line={line}
                      index={index}
                      nextVerseNumber={nextVerseNumber}
                      onUpdateText={updateLineText}
                      onUpdateTime={updateLineTime}
                      onUpdateSection={updateLineSection}
                      onDelete={deleteLine}
                      onSplitLines={handleSplitLines}
                      onLongPress={drag}
                      isActive={isActive}
                    />
                    
                    {/* Insert button after each line */}
                    <TouchableOpacity
                      style={styles.insertButton}
                      onPress={() => insertLineAfter(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.insertButtonText}>+ Insert Line</Text>
                    </TouchableOpacity>
                  </View>
                </ScaleDecorator>
              );
            }}
          />
        </GestureHandlerRootView>
        
        {/* Sticky bottom action bar for mobile - always visible */}
        {/* FIX: SafeAreaView prevents collision with Android navigation bar */}
        <SafeAreaView edges={['bottom']} style={styles.bottomActions}>
          <View style={styles.bottomActionsContent}>
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomButtonText}>Save</Text>
            </TouchableOpacity>
            
            {song.lines.length > 0 && (
              <TouchableOpacity
                style={[styles.bottomButton, styles.resetButton]}
                onPress={handleResetTimes}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
            
            {song.lines.length >= 2 && (
              <TouchableOpacity
                style={[styles.bottomButton, styles.interpolateButton]}
                onPress={handleInterpolateTimes}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomButtonText}>Auto</Text>
              </TouchableOpacity>
            )}
            
            {song.title && song.lines.length > 0 && (
              <TouchableOpacity
                style={[styles.bottomButton, styles.previewButton]}
                onPress={() => navigation.navigate('Prompter', { songId: song.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomButtonText}>Play</Text>
              </TouchableOpacity>
            )}
            
            {song.title && (
              <TouchableOpacity
                style={[styles.bottomButton, styles.deleteTopButton]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Song"
        message={`Are you sure you want to delete "${song.title || 'this song'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive
      />
      <ConfirmDialog
        visible={showResetTimesDialog}
        title="Reset Times"
        message="Are you sure you want to reset all times? You will be able to set new anchors and use interpolation."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={handleConfirmResetTimes}
        onCancel={handleCancelResetTimes}
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
    // FIX: Extra padding at bottom to prevent content from being hidden
    // behind the sticky bottom action bar (mobile only)
    paddingBottom: 100,
  },
  webScrollContent: {
    paddingVertical: 16,
    // FIX: Extra padding at bottom for web to ensure last insert button is visible
    paddingBottom: 150,
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
    backgroundColor: '#1a1a1a',
    // FIX: position: sticky only works on web, not on Android
    position: 'sticky' as any,
    top: 0,
    zIndex: 100,
  },
  bottomActions: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
    // FIX: On mobile, buttons are pinned to bottom instead of top
    // SafeAreaView with edges={['bottom']} prevents collision with Android nav bar
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bottomActionsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  bottomButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  topButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#ff9f40',
  },
  interpolateButton: {
    backgroundColor: '#9b59b6',
  },
  previewButton: {
    backgroundColor: '#2ecc71',
  },
  deleteTopButton: {
    backgroundColor: '#ff5757',
  },
  topButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
  linesContainer: {
    flex: 1,
  },
  insertButton: {
    alignSelf: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderStyle: 'dashed',
  },
  insertButtonText: {
    fontSize: 12,
    color: '#4a9eff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#555',
  },
  warningContainer: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
});
