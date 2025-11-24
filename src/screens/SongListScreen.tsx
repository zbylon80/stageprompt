// screens/SongListScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSongs } from '../hooks/useSongs';
import { SongListItem } from '../components/SongListItem';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RootStackParamList } from '../types/navigation';
import { Song } from '../types/models';
import { generateId } from '../utils/idGenerator';

type SongListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SongList'>;

interface SongListScreenProps {
  navigation: SongListScreenNavigationProp;
}

export function SongListScreen({ navigation }: SongListScreenProps) {
  const { songs, loading, error, reload, deleteSong } = useSongs();
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Reload songs when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const handleSongPress = (song: Song) => {
    navigation.navigate('SongEditor', { song });
  };

  const handleSongPreview = (song: Song) => {
    navigation.navigate('Prompter', { songId: song.id });
  };

  const handleNewSong = () => {
    const newSong: Song = {
      id: generateId(),
      title: '',
      artist: '',
      lines: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    navigation.navigate('SongEditor', { song: newSong });
  };

  const handleDeleteSong = (song: Song) => {
    setSongToDelete(song);
  };

  const handleConfirmDelete = async () => {
    if (songToDelete) {
      try {
        await deleteSong(songToDelete.id);
      } catch (err) {
        console.error('Failed to delete song:', err);
      }
    }
    setSongToDelete(null);
  };

  const handleCancelDelete = () => {
    setSongToDelete(null);
  };

  // Filter and sort songs
  const filteredAndSortedSongs = useMemo(() => {
    let filtered = songs;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        (song.artist && song.artist.toLowerCase().includes(query))
      );
    }
    
    // Sort alphabetically by title
    return [...filtered].sort((a, b) => 
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
  }, [songs, searchQuery]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No songs</Text>
      <Text style={styles.emptyText}>
        Tap the + button to create your first song
      </Text>
      <Text style={styles.emptySubtext}>
        Use the ♫ button to create setlists
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Song }) => (
    <SongListItem 
      song={item} 
      onPress={handleSongPress} 
      onDelete={handleDeleteSong}
      onPreview={handleSongPreview}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4a9eff" />
        <Text style={styles.loadingText}>Loading songs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const handleSetlistsPress = () => {
    navigation.navigate('SetlistList');
  };

  // Render list content
  const renderList = () => {
    const displaySongs = filteredAndSortedSongs;
    const isEmpty = displaySongs.length === 0;
    
    if (Platform.OS === 'web') {
      return (
        <ScrollView 
          style={styles.flatList} 
          contentContainerStyle={isEmpty ? styles.emptyListContent : styles.listContent}
          // @ts-ignore - web-only style
          dataSet={{ scrollable: 'true' }}
        >
          {isEmpty ? (
            searchQuery.trim() ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No results</Text>
                <Text style={styles.emptyText}>
                  No songs match "{searchQuery}"
                </Text>
              </View>
            ) : renderEmptyState()
          ) : displaySongs.map((item) => (
            <View key={item.id}>
              {renderItem({ item })}
            </View>
          ))}
        </ScrollView>
      );
    }
    
    return (
      <FlatList
        data={displaySongs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          isEmpty ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={
          searchQuery.trim() ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptyText}>
                No songs match "{searchQuery}"
              </Text>
            </View>
          ) : renderEmptyState()
        }
      />
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search songs..."
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {renderList()}
        {/* FIX: SafeAreaView prevents FAB buttons from colliding with Android navigation bar */}
        <SafeAreaView edges={['bottom']} style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleNewSong}
            activeOpacity={0.8}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabSetlists}
            onPress={handleSetlistsPress}
            activeOpacity={0.8}
          >
            <Text style={styles.fabSetlistsText}>♫</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
      <ConfirmDialog
        visible={songToDelete !== null}
        title="Delete Song"
        message={`Are you sure you want to delete "${songToDelete?.title || 'this song'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    // @ts-ignore - web-only styles
    height: '100vh',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#666',
  },
  flatList: {
    flex: 1,
    // @ts-ignore - web-only styles
    maxHeight: 'calc(100vh - 140px)',
    // @ts-ignore - web-only styles
    overflowY: 'auto',
    // @ts-ignore - web-only styles
    overflowX: 'hidden',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#cccccc',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 0,
    pointerEvents: 'box-none',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    paddingBottom: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a9eff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 32,
  },
  fabSetlists: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    marginBottom: 10,
  },
  fabSetlistsText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '400',
  },
});
