// screens/PrompterScreen.tsx

import React, { useState, useEffect } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Song, LyricLine } from '../types/models';
import { storageService } from '../services/storageService';
import { useSettings } from '../hooks/useSettings';

type PrompterScreenRouteProp = RouteProp<RootStackParamList, 'Prompter'>;
type PrompterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Prompter'>;

interface PrompterScreenProps {
  route: PrompterScreenRouteProp;
  navigation: PrompterScreenNavigationProp;
}

export function PrompterScreen({ route, navigation }: PrompterScreenProps) {
  const { songId, setlistId } = route.params;
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setlistSongIds, setSetlistSongIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { settings } = useSettings();

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

  // Render lyric line
  const renderLine = ({ item }: { item: LyricLine }) => (
    <View
      style={[
        styles.lineContainer,
        {
          height: lineHeight,
          paddingHorizontal: marginHorizontal,
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
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Hide status bar for fullscreen mode */}
      <StatusBar hidden />
      
      {/* Exit button */}
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
        
        {/* Navigation controls (only show if in setlist) */}
        {setlistId && (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, !hasPrevious && styles.controlButtonDisabled]}
              onPress={handlePreviousSong}
              disabled={!hasPrevious}
              activeOpacity={0.7}
            >
              <Text style={[styles.controlButtonText, { color: textColor }]}>◀</Text>
            </TouchableOpacity>
            
            <View style={styles.controlInfo}>
              <Text style={[styles.controlInfoText, { color: textColor }]}>
                {currentIndex + 1} / {setlistSongIds.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.controlButton, !hasNext && styles.controlButtonDisabled]}
              onPress={handleNextSong}
              disabled={!hasNext}
              activeOpacity={0.7}
            >
              <Text style={[styles.controlButtonText, { color: textColor }]}>▶</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lyrics display */}
      <FlatList
        data={song.lines}
        renderItem={renderLine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={Platform.OS !== 'web'}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
      />
    </View>
  );
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
    justifyContent: 'center',
    alignItems: 'center',
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
});
