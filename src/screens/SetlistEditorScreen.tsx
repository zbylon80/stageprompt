// screens/SetlistEditorScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Setlist, Song } from '../types/models';
import { useSetlists } from '../hooks/useSetlists';
import { useSongs } from '../hooks/useSongs';
import { generateId } from '../utils/idGenerator';
import { SongListItem } from '../components/SongListItem';
import { Toast } from '../components/Toast';

// Conditional import for drag and drop (only on mobile)
let DraggableFlatList: any = null;
let ScaleDecorator: any = null;
let GestureHandlerRootView: any = View;

if (Platform.OS !== 'web') {
  try {
    const draggableModule = require('react-native-draggable-flatlist');
    DraggableFlatList = draggableModule.default;
    ScaleDecorator = draggableModule.ScaleDecorator;
    const gestureModule = require('react-native-gesture-handler');
    GestureHandlerRootView = gestureModule.GestureHandlerRootView;
    console.log('Drag and drop loaded successfully!', {
      hasDraggableFlatList: !!DraggableFlatList,
      hasScaleDecorator: !!ScaleDecorator,
      hasGestureHandler: !!GestureHandlerRootView,
    });
  } catch (e) {
    console.warn('Drag and drop not available:', e);
  }
}

type SetlistEditorScreenProps = StackScreenProps<RootStackParamList, 'SetlistEditor'>;

export function SetlistEditorScreen({ route, navigation }: SetlistEditorScreenProps) {
  const { setlistId } = route.params || {};
  const { setlists, saveSetlist, deleteSetlist, loading: setlistsLoading, reload: reloadSetlists } = useSetlists();
  const { songs, loading: songsLoading, reload: reloadSongs } = useSongs();
  const { width } = useWindowDimensions();

  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [name, setName] = useState('');
  const [songIds, setSongIds] = useState<string[]>([]);
  const [isNewSetlist, setIsNewSetlist] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Determine if we should show split view (wider screens)
  const useSplitView = width >= 768;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      reloadSongs();
      reloadSetlists();
    }, [reloadSongs, reloadSetlists])
  );

  // Load existing setlist or create new one
  useEffect(() => {
    if (setlistId) {
      const existingSetlist = setlists.find(s => s.id === setlistId);
      if (existingSetlist) {
        setSetlist(existingSetlist);
        setName(existingSetlist.name);
        setSongIds(existingSetlist.songIds);
        setIsNewSetlist(false);
      }
    } else if (!setlist) {
      // New setlist - start with empty name (only if we don't have a setlist yet)
      setIsNewSetlist(true);
      setName('');
    }
  }, [setlistId, setlists]);

  const handleSave = useCallback(async () => {
    // Use default name if empty
    const finalName = name.trim() || 'New Setlist';
    const wasNewSetlist = isNewSetlist;

    // Check for duplicate names (excluding current setlist if editing)
    const duplicateSetlist = setlists.find(
      s => s.name.toLowerCase() === finalName.toLowerCase() && s.id !== setlist?.id
    );

    if (duplicateSetlist) {
      showToast(`A setlist named "${finalName}" already exists!`, 'error');
      return;
    }

    try {
      const now = Date.now();
      const setlistToSave: Setlist = {
        id: setlist?.id || generateId(),
        name: finalName,
        songIds,
        createdAt: setlist?.createdAt || now,
        updatedAt: now,
      };

      await saveSetlist(setlistToSave);
      setSetlist(setlistToSave);
      setName(finalName); // Update the name state with the final name
      setIsNewSetlist(false);

      // Show success message
      if (wasNewSetlist) {
        showToast(`Setlist "${finalName}" created successfully!`, 'success');
      } else {
        showToast(`Setlist "${finalName}" updated successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error saving setlist:', error);
      showToast('Failed to save setlist', 'error');
    }
  }, [name, songIds, setlist, saveSetlist, isNewSetlist, setlists]);

  const handleDeleteSetlist = () => {
    if (!setlist) return;

    const confirmMessage = `Are you sure you want to delete "${name}"?`;
    
    if (Platform.OS === 'web') {
      if (confirm(confirmMessage)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Setlist',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  const performDelete = async () => {
    if (!setlist) return;

    try {
      const setlistId = setlist.id;
      await deleteSetlist(setlistId);
      // Navigate after successful delete
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting setlist:', error);
      Alert.alert('Error', 'Failed to delete setlist');
    }
  };

  const handleAddSong = async (songId: string) => {
    if (!songIds.includes(songId)) {
      const newSongIds = [...songIds, songId];
      setSongIds(newSongIds);
      
      // Auto-save after adding song
      if (setlist && name.trim()) {
        try {
          const now = Date.now();
          const setlistToSave: Setlist = {
            ...setlist,
            name: name.trim(),
            songIds: newSongIds,
            updatedAt: now,
          };
          await saveSetlist(setlistToSave);
          setSetlist(setlistToSave);
        } catch (error) {
          console.error('Error saving setlist:', error);
        }
      }
    }
  };

  const handleSongPress = (song: Song) => {
    navigation.navigate('SongEditor', { song });
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

  const handleRemoveSong = async (songId: string) => {
    const newSongIds = songIds.filter(id => id !== songId);
    setSongIds(newSongIds);
    
    // Auto-save after removing song
    if (setlist && name.trim()) {
      try {
        const now = Date.now();
        const setlistToSave: Setlist = {
          ...setlist,
          name: name.trim(),
          songIds: newSongIds,
          updatedAt: now,
        };
        await saveSetlist(setlistToSave);
        setSetlist(setlistToSave);
      } catch (error) {
        console.error('Error saving setlist:', error);
      }
    }
  };

  const handleDragEnd = async ({ data }: { data: string[] }) => {
    setSongIds(data);
    
    // Auto-save after reordering
    if (setlist && name.trim()) {
      try {
        const now = Date.now();
        const setlistToSave: Setlist = {
          ...setlist,
          name: name.trim(),
          songIds: data,
          updatedAt: now,
        };
        await saveSetlist(setlistToSave);
        setSetlist(setlistToSave);
      } catch (error) {
        console.error('Error saving setlist:', error);
      }
    }
  };

  const getSongById = (id: string): Song | undefined => {
    return songs.find(song => song.id === id);
  };

  const renderSongItem = ({ item, drag, isActive }: any) => {
    const song = getSongById(item);
    if (!song) return null;

    const ItemWrapper = ScaleDecorator || View;

    return (
      <ItemWrapper>
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={200}
          disabled={isActive}
          activeOpacity={0.7}
          style={[styles.songItem, isActive && styles.songItemActive]}
        >
          <View style={styles.dragHandle}>
            <Text style={styles.dragHandleText}>☰</Text>
          </View>
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{song.title}</Text>
            {song.artist && <Text style={styles.songArtist}>{song.artist}</Text>}
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveSong(item)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ItemWrapper>
    );
  };

  // Web drag and drop handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: any, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: any, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newSongIds = [...songIds];
    const [removed] = newSongIds.splice(draggedIndex, 1);
    newSongIds.splice(dropIndex, 0, removed);
    
    setSongIds(newSongIds);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Auto-save after reordering
    if (setlist && name.trim()) {
      try {
        const now = Date.now();
        const setlistToSave: Setlist = {
          ...setlist,
          name: name.trim(),
          songIds: newSongIds,
          updatedAt: now,
        };
        await saveSetlist(setlistToSave);
        setSetlist(setlistToSave);
      } catch (error) {
        console.error('Error saving setlist:', error);
      }
    }
  };

  const handleWebDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Simple render for web with drag and drop
  const renderSongItemSimple = ({ item, index }: any) => {
    const song = getSongById(item);
    if (!song) return null;

    const isDragging = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    const itemStyle = [
      styles.songItem,
      isDragging && styles.songItemDragging,
      isDragOver && styles.songItemDragOver,
    ];

    const content = (
      <>
        <View style={styles.dragHandle}>
          <Text style={styles.dragHandleText}>☰</Text>
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{song.title}</Text>
          {song.artist && <Text style={styles.songArtist}>{song.artist}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveSong(item)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </>
    );

    if (Platform.OS === 'web') {
      // Use native div for web to support HTML5 drag and drop
      return (
        <div
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleWebDragEnd}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDragging ? 'rgba(42, 42, 42, 0.5)' : '#2a2a2a',
            padding: 16,
            marginLeft: 16,
            marginRight: 16,
            marginTop: 4,
            marginBottom: 4,
            borderRadius: 8,
            cursor: isDragging ? 'grabbing' : 'grab',
            borderTop: isDragOver ? '3px solid #4a9eff' : 'none',
            opacity: isDragging ? 0.5 : 1,
          }}
        >
          {content}
        </div>
      );
    }

    return <View style={itemStyle}>{content}</View>;
  };

  if (setlistsLoading || songsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  // Render songs panel (right side)
  const renderSongsPanel = () => (
    <View style={[styles.songsPanel, useSplitView && styles.songsPanelSplit]}>
      <View style={styles.songsPanelHeader}>
        <View style={styles.songsPanelHeaderContent}>
          <View>
            <Text style={styles.songsPanelTitle}>All Songs</Text>
            <Text style={styles.songsPanelSubtitle}>
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newSongButton}
            onPress={handleNewSong}
            activeOpacity={0.8}
          >
            <Text style={styles.newSongButtonText}>+ New Song</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={songs}
        keyExtractor={(song) => song.id}
        renderItem={({ item: song }) => {
          const isInSetlist = songIds.includes(song.id);
          return (
            <View style={styles.songsPanelItemWrapper}>
              <SongListItem song={song} onPress={handleSongPress} />
              <TouchableOpacity
                style={[
                  styles.addToSetlistButton,
                  isInSetlist && styles.addToSetlistButtonDisabled,
                ]}
                onPress={() => handleAddSong(song.id)}
                disabled={isInSetlist}
              >
                <Text style={styles.addToSetlistButtonText}>
                  {isInSetlist ? '✓' : '+'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No songs available</Text>
            <Text style={styles.emptySubtext}>Tap "New Song" to create one</Text>
          </View>
        }
      />
    </View>
  );

  // Render setlist content (left side)
  const renderSetlistContent = () => (
    <View style={[styles.setlistContent, useSplitView && styles.setlistContentSplit]}>
      <View style={styles.header}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Enter setlist name..."
          placeholderTextColor="#666"
          autoFocus={isNewSetlist}
        />
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {setlist ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
          {setlist && (
            <TouchableOpacity
              onPress={handleDeleteSetlist}
              style={styles.deleteSetlistButton}
            >
              <Text style={styles.deleteSetlistButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {songIds.length > 0 && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {Platform.OS === 'web' 
              ? '💡 Drag songs by the ☰ handle to reorder' 
              : '💡 Long press and drag to reorder'}
          </Text>
        </View>
      )}

      {songIds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No songs in this setlist</Text>
          <Text style={styles.emptySubtext}>
            {useSplitView 
              ? 'Click + on songs from the right panel' 
              : 'Tap songs from the panel below'}
          </Text>
        </View>
      ) : Platform.OS === 'web' || !DraggableFlatList ? (
        <FlatList
          data={songIds}
          renderItem={({ item, index }) => renderSongItemSimple({ item, index })}
          keyExtractor={(item) => item}
          style={styles.listContainer}
        />
      ) : (
        <DraggableFlatList
          data={songIds}
          renderItem={renderSongItem}
          keyExtractor={(item: string) => item}
          onDragEnd={handleDragEnd}
          containerStyle={styles.listContainer}
        />
      )}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {useSplitView ? (
        // Split view for wider screens (desktop/tablet landscape)
        <View style={styles.splitViewContainer}>
          {renderSetlistContent()}
          <View style={styles.divider} />
          {renderSongsPanel()}
        </View>
      ) : (
        // Stacked view for narrow screens (mobile)
        <View style={styles.stackedContainer}>
          {renderSetlistContent()}
          <View style={styles.divider} />
          {renderSongsPanel()}
        </View>
      )}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitViewContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  stackedContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  setlistContent: {
    flex: 1,
  },
  setlistContentSplit: {
    flex: 1,
    minWidth: 300,
  },
  songsPanel: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  songsPanelSplit: {
    flex: 1,
    minWidth: 300,
  },
  songsPanelHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#252525',
  },
  songsPanelHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songsPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  songsPanelSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  newSongButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  newSongButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  songsPanelItemWrapper: {
    position: 'relative',
  },
  addToSetlistButton: {
    position: 'absolute',
    right: 24,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a9eff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addToSetlistButtonDisabled: {
    backgroundColor: '#2a5a8f',
  },
  addToSetlistButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  divider: {
    width: 1,
    backgroundColor: '#333',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  hintContainer: {
    padding: 12,
    backgroundColor: '#252525',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  hintText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4a9eff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteSetlistButton: {
    flex: 1,
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteSetlistButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    // @ts-ignore - web-only cursor
    cursor: Platform.OS === 'web' ? 'grab' : undefined,
  },
  songItemActive: {
    backgroundColor: '#3a3a3a',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  songItemDragging: {
    opacity: 0.5,
    // @ts-ignore - web-only cursor
    cursor: Platform.OS === 'web' ? 'grabbing' : undefined,
  },
  songItemDragOver: {
    borderTopWidth: 3,
    borderTopColor: '#4a9eff',
  },
  dragHandle: {
    marginRight: 12,
    padding: 8,
  },
  dragHandleText: {
    fontSize: 20,
    color: '#666',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  songArtist: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#ff4444',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
});
