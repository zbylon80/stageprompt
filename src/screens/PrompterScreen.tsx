// screens/PrompterScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedRef, scrollTo } from 'react-native-reanimated';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Song, LyricLine } from '../types/models';
import { storageService } from '../services/storageService';
import { useSettings } from '../hooks/useSettings';
import { SectionMarker } from '../components/SectionMarker';
import { usePrompterTimer } from '../hooks/usePrompterTimer';
import { calculateScrollY } from '../services/scrollAlgorithm';

type PrompterScreenRouteProp = RouteProp<RootStackParamList, 'Prompter'>;
type PrompterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Prompter'>;

interface PrompterScreenProps {
  route: PrompterScreenRouteProp;
  navigation: PrompterScreenNavigationProp;
}

// Create Animated FlatList component
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<LyricLine>);

export function PrompterScreen({ route, navigation }: PrompterScreenProps) {
  const { songId, setlistId } = route.params;
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setlistSongIds, setSetlistSongIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { settings } = useSettings();
  
  // Timer hook for controlling playback
  const { currentTime, isPlaying, play, pause, reset } = usePrompterTimer();
  
  // Reanimated refs and values
  const scrollViewRef = useAnimatedRef<FlatList<LyricLine>>();
  const scrollY = useSharedValue(0);

  // Load song data and setlist
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const songs = await storageService.loadSongs();
        const foundSong = songs.find(s => s.id === songId);
        
        if (!foundSong) {
          setError('Song not found');
        } else {
          setSong(foundSong);
        }

        // Load setlist if provided
        if (setlistId) {
          const setlists = await storageService.loadSetlists();
          const setlist = setlists.find(s => s.id === setlistId);
          if (setlist) {
            setSetlistSongIds(setlist.songIds);
            const index = setlist.songIds.indexOf(songId);
            setCurrentIndex(index);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load song.';
        setError(errorMessage);
        console.error('Error loading song:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [songId, setlistId]);

  // Get settings with defaults
  const fontSize = settings?.fontSize ?? 48;
  const textColor = settings?.textColor ?? '#ffffff';
  const backgroundColor = settings?.backgroundColor ?? '#000000';
  const marginHorizontal = settings?.marginHorizontal ?? 40;
  const lineHeight = settings?.lineHeight ?? 60;
  const anchorYPercent = settings?.anchorYPercent ?? 0.4;
  
  // Calculate anchorY in pixels (based on screen height)
  const [screenHeight, setScreenHeight] = useState(0);
  const anchorY = screenHeight * anchorYPercent;

  // Effect to calculate and animate scroll position based on timer
  useEffect(() => {
    if (!song || !song.lines.length || screenHeight === 0) return;
    
    const targetScrollY = calculateScrollY({
      currentTime,
      lines: song.lines,
      lineHeight,
      anchorY,
    });
    
    // Animate scroll to target position
    scrollTo(scrollViewRef, 0, targetScrollY, true);
  }, [currentTime, song, lineHeight, anchorY, screenHeight]);
  
  // Reset timer when song changes
  useEffect(() => {
    reset();
  }, [songId, reset]);
  
  // Navigation handlers
  const handlePreviousSong = () => {
    if (currentIndex > 0 && setlistSongIds.length > 0) {
      const prevSongId = setlistSongIds[currentIndex - 1];
      navigation.replace('Prompter', { songId: prevSongId, setlistId });
    }
  };

  const handleNextSong = () => {
    if (currentIndex < setlistSongIds.length - 1 && setlistSongIds.length > 0) {
      const nextSongId = setlistSongIds[currentIndex + 1];
      navigation.replace('Prompter', { songId: nextSongId, setlistId });
    }
  };
  
  // Play/Pause toggle handler
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < setlistSongIds.length - 1;

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar hidden />
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  // Render error state
  if (error || !song) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar hidden />
        <Text style={[styles.errorText, { color: textColor }]}>
          {error || 'Song not found'}
        </Text>
      </View>
    );
  }

  // Helper function to check if this is the first line of a section
  const isFirstLineOfSection = (line: LyricLine, index: number): boolean => {
    if (!line.section) return false;
    if (index === 0) return true;
    
    const previousLine = song?.lines[index - 1];
    if (!previousLine || !previousLine.section) return true;
    
    // Check if section changed
    return (
      previousLine.section.type !== line.section.type ||
      previousLine.section.label !== line.section.label ||
      previousLine.section.number !== line.section.number
    );
  };

  // Render lyric line
  const renderLine = ({ item, index }: { item: LyricLine; index: number }) => {
    const showSectionMarker = isFirstLineOfSection(item, index);
    
    return (
      <View
        style={[
          styles.lineContainer,
          {
            paddingHorizontal: marginHorizontal,
          },
        ]}
      >
        {/* Section marker - only show on first line of section */}
        {showSectionMarker && item.section && (
          <View style={styles.sectionMarkerContainer}>
            <SectionMarker section={item.section} size="large" />
          </View>
        )}
        
        {/* Lyric text */}
        <View
          style={[
            styles.lineTextContainer,
            {
              height: lineHeight,
            },
          ]}
        >
          <Text
            style={[
              styles.lineText,
              {
                fontSize,
                color: textColor,
                lineHeight,
              },
            ]}
            numberOfLines={1}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView 
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor }]}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setScreenHeight(height);
      }}
    >
      {/* Hide status bar for fullscreen mode */}
      <StatusBar hidden />
      
      {/* Exit button - SafeAreaView ensures it's not hidden by notch/camera */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={[styles.exitButtonText, { color: textColor }]}>✕</Text>
      </TouchableOpacity>
      
      {/* Song title header (optional, can be hidden in performance mode) */}
      <View style={[styles.header, { paddingHorizontal: marginHorizontal }]}>
        <Text style={[styles.titleText, { color: textColor, fontSize: fontSize * 0.5 }]}>
          {song.title}
        </Text>
        {song.artist && (
          <Text style={[styles.artistText, { color: textColor, fontSize: fontSize * 0.35 }]}>
            {song.artist}
          </Text>
        )}
        
        {/* Playback controls */}
        <View style={styles.controls}>
          {/* Previous song button (only show if in setlist) */}
          {setlistId && (
            <TouchableOpacity
              style={[styles.controlButton, !hasPrevious && styles.controlButtonDisabled]}
              onPress={handlePreviousSong}
              disabled={!hasPrevious}
              activeOpacity={0.7}
            >
              <Text style={[styles.controlButtonText, { color: textColor }]}>◀</Text>
            </TouchableOpacity>
          )}
          
          {/* Play/Pause button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            <Text style={[styles.controlButtonText, { color: textColor }]}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {/* Song position info (only show if in setlist) */}
          {setlistId && (
            <View style={styles.controlInfo}>
              <Text style={[styles.controlInfoText, { color: textColor }]}>
                {currentIndex + 1} / {setlistSongIds.length}
              </Text>
            </View>
          )}

          {/* Next song button (only show if in setlist) */}
          {setlistId && (
            <TouchableOpacity
              style={[styles.controlButton, !hasNext && styles.controlButtonDisabled]}
              onPress={handleNextSong}
              disabled={!hasNext}
              activeOpacity={0.7}
            >
              <Text style={[styles.controlButtonText, { color: textColor }]}>▶</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Timer display */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: textColor }]}>
            {formatTime(currentTime)}
          </Text>
        </View>
      </View>

      {/* Lyrics display with animated scrolling */}
      <AnimatedFlatList
        ref={scrollViewRef}
        data={song.lines}
        renderItem={renderLine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable manual scrolling during auto-scroll
        // Performance optimizations
        removeClippedSubviews={Platform.OS !== 'web'}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
}

// Helper function to format time as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exitButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  exitButtonText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  artistText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 20,
  },
  lineContainer: {
    alignItems: 'center',
  },
  sectionMarkerContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  lineTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lineText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  controlInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
  },
  controlInfoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
