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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSongs } from '../hooks/useSongs';
import { useSetlists } from '../hooks/useSetlists';
import { SongListItem } from '../components/SongListItem';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { RootStackParamList } from '../types/navigation';
import { Song, Setlist } from '../types/models';
import { generateId } from '../utils/idGenerator';

type SongListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SongList'>;

interface SongListScreenProps {
  navigation: SongListScreenNavigationProp;
}

export function SongListScreen({ navigation }: SongListScreenProps) {
  const { songs, loading, error, reload, deleteSong } = useSongs();
  const { setlists, saveSetlist, reload: reloadSetlists } = useSetlists();
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [songToAddToSetlist, setSongToAddToSetlist] = useState<Song | null>(null);
  const [showSetlistModal, setShowSetlistModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Reload songs and setlists when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      reload();
      reloadSetlists();
    }, [reload, reloadSetlists])
  );

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

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

  const handleAddToSetlist = (song: Song) => {
    setSongToAddToSetlist(song);
    setShowSetlistModal(true);
  };

  const handleSelectSetlist = async (setlist: Setlist) => {
    if (!songToAddToSetlist) return;

    try {
      // Check if song is already in the setlist
      if (setlist.songIds.includes(songToAddToSetlist.id)) {
        showToast(`"${songToAddToSetlist.title}" is already in "${setlist.name}"`, 'info');
        setShowSetlistModal(false);
        setSongToAddToSetlist(null);
        return;
      }

      // Add song to setlist
      const updatedSetlist: Setlist = {
        ...setlist,
        songIds: [...setlist.songIds, songToAddToSetlist.id],
        updatedAt: Date.now(),
      };

      await saveSetlist(updatedSetlist);
      showToast(`Added "${songToAddToSetlist.title}" to "${setlist.name}"`, 'success');
      setShowSetlistModal(false);
      setSongToAddToSetlist(null);
    } catch (err) {
      console.error('Failed to add song to setlist:', err);
      showToast('Failed to add song to setlist', 'error');
    }
  };

  const handleCancelAddToSetlist = () => {
    setShowSetlistModal(false);
    setSongToAddToSetlist(null);
  };

  const handleCreateNewSetlist = () => {
    if (!songToAddToSetlist) return;

    const newSetlist: Setlist = {
      id: generateId(),
      name: 'New Setlist',
      songIds: [songToAddToSetlist.id],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveSetlist(newSetlist)
      .then(() => {
        showToast(`Created "New Setlist" with "${songToAddToSetlist.title}"`, 'success');
        setShowSetlistModal(false);
        setSongToAddToSetlist(null);
      })
      .catch((err) => {
        console.error('Failed to create setlist:', err);
        showToast('Failed to create setlist', 'error');
      });
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
      onAddToSetlist={handleAddToSetlist}
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
        // Performance optimizations
        removeClippedSubviews={Platform.OS !== 'web'}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        // Approximate item height for better performance
        getItemLayout={(data, index) => ({
          length: 88, // Approximate height of SongListItem
          offset: 88 * index,
          index,
        })}
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

      <Modal
        visible={showSetlistModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelAddToSetlist}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Setlist</Text>
            <Text style={styles.modalSubtitle}>
              {songToAddToSetlist?.title}
            </Text>

            <ScrollView style={styles.setlistList}>
              {setlists.length === 0 ? (
                <View style={styles.emptySetlistContainer}>
                  <Text style={styles.emptySetlistText}>
                    No setlists yet. Create one below!
                  </Text>
                </View>
              ) : (
                setlists.map((setlist) => (
                  <TouchableOpacity
                    key={setlist.id}
                    style={styles.setlistItem}
                    onPress={() => handleSelectSetlist(setlist)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.setlistItemContent}>
                      <Text style={styles.setlistItemName}>{setlist.name}</Text>
                      <Text style={styles.setlistItemInfo}>
                        {setlist.songIds.length} {setlist.songIds.length === 1 ? 'song' : 'songs'}
                      </Text>
                    </View>
                    <Text style={styles.setlistItemArrow}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={handleCreateNewSetlist}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonSecondaryText}>+ New Setlist</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleCancelAddToSetlist}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonPrimaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 20,
  },
  setlistList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  emptySetlistContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptySetlistText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  setlistItem: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setlistItemContent: {
    flex: 1,
  },
  setlistItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  setlistItemInfo: {
    fontSize: 12,
    color: '#999999',
  },
  setlistItemArrow: {
    fontSize: 24,
    color: '#666666',
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#9b59b6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
