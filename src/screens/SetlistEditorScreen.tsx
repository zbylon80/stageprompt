// screens/SetlistEditorScreen.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  FlatList,
  ScrollView,
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
import { ConfirmDialog } from '../components/ConfirmDialog';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    if (!setlist) return;

    try {
      const setlistId = setlist.id;
      await deleteSetlist(setlistId);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting setlist:', error);
      showToast('Failed to delete setlist', 'error');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
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

  const handleSongPreview = (song: Song) => {
    navigation.navigate('Prompter', { songId: song.id, setlistId: setlist?.id });
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

  // Filter and sort songs for the songs panel
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
            <Text style={styles.songLineCount}>
              {song.lines.length} {song.lines.length === 1 ? 'line' : 'lines'}
            </Text>
          </View>
          <View style={styles.songItemActions}>
            {song.lines.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSongPreview(song)}
                style={styles.previewButtonInline}
              >
                <Text style={styles.previewButtonText}>▶</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleRemoveSong(item)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={styles.songLineCount}>
            {song.lines.length} {song.lines.length === 1 ? 'line' : 'lines'}
          </Text>
        </View>
        <View style={styles.songItemActions}>
          {song.lines.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSongPreview(song)}
              style={styles.previewButtonInline}
            >
              <Text style={styles.previewButtonText}>▶</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleRemoveSong(item)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
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
            marginTop: 6,
            marginBottom: 6,
            borderRadius: 8,
            boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
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
  const renderSongsPanel = () => {
    const displaySongs = filteredAndSortedSongs;
    
    const renderSongItem = (song: Song) => {
      const isInSetlist = songIds.includes(song.id);
      return (
        <View key={song.id} style={styles.songsPanelItemWrapper}>
          <SongListItem song={song} onPress={handleSongPress} onPreview={handleSongPreview} />
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
    };

    return (
      <View style={[styles.songsPanel, useSplitView && styles.songsPanelSplit]}>
        <View style={styles.songsPanelHeader}>
          <View style={styles.songsPanelHeaderTop}>
            <View style={styles.songsPanelTitleContainer}>
              <Text style={styles.songsPanelTitle}>All Songs</Text>
              <Text style={styles.songsPanelSubtitle}>
                {displaySongs.length} {displaySongs.length === 1 ? 'song' : 'songs'}
                {searchQuery.trim() && ` (filtered from ${songs.length})`}
              </Text>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
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
            <TouchableOpacity
              style={styles.newSongButton}
              onPress={handleNewSong}
              activeOpacity={0.8}
            >
              <Text style={styles.newSongButtonText}>+ New</Text>
            </TouchableOpacity>
          </View>
        </View>
        {Platform.OS === 'web' ? (
          <ScrollView 
            style={styles.songsPanelList}
            // @ts-ignore - web-only style
            dataSet={{ scrollable: 'true' }}
          >
            {displaySongs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim() ? `No results for "${searchQuery}"` : 'No songs available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery.trim() ? 'Try a different search' : 'Tap "New Song" to create one'}
                </Text>
              </View>
            ) : (
              displaySongs.map(renderSongItem)
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={displaySongs}
            keyExtractor={(song) => song.id}
            renderItem={({ item: song }) => renderSongItem(song)}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim() ? `No results for "${searchQuery}"` : 'No songs available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery.trim() ? 'Try a different search' : 'Tap "New Song" to create one'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    );
  };

  // Render setlist content (left side)
  // FIX: The left column needs proper scrolling on both web and native.
  // On web, we use overflow: auto in CSS. On native (Android/iOS), we must wrap
  // the entire content in a ScrollView because View doesn't scroll.
  // The header stays sticky at the top, and the song list scrolls below it.
  const renderSetlistContent = () => (
    <View style={[styles.setlistContent, useSplitView && styles.setlistContentSplit]}>
      {/* Sticky header - stays at top */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
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
      </View>

      {/* Scrollable content area */}
      {songIds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No songs in this setlist</Text>
          <Text style={styles.emptySubtext}>
            {useSplitView 
              ? 'Click + on songs from the right panel' 
              : 'Tap songs from the panel below'}
          </Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <ScrollView 
          style={styles.listContainer}
          // @ts-ignore - web-only style
          dataSet={{ scrollable: 'true' }}
        >
          {songIds.map((item, index) => renderSongItemSimple({ item, index }))}
        </ScrollView>
      ) : !DraggableFlatList ? (
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
          scrollEnabled={true}
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
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Setlist"
        message={`Are you sure you want to delete "${name || 'this setlist'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    // @ts-ignore - web-only styles
    overflow: 'hidden',
    // @ts-ignore - web-only styles
    height: '100vh',
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
    // @ts-ignore - web-only styles
    overflow: 'hidden',
  },
  stackedContainer: {
    flex: 1,
    flexDirection: 'column',
    // @ts-ignore - web-only styles
    overflow: 'hidden',
  },
  setlistContent: {
    flex: 1,
    // FIX: SCROLL BLOCKER WAS HERE - overflow: 'auto' on parent container caused the
    // ScrollView child to grow infinitely without scrolling. The parent must have
    // overflow: 'hidden' so the child ScrollView with maxHeight can scroll properly.
    // @ts-ignore - web-only styles
    overflow: 'hidden',
    // @ts-ignore - web-only styles
    display: 'flex',
    // @ts-ignore - web-only styles
    flexDirection: 'column',
  },
  setlistContentSplit: {
    flex: 1,
    minWidth: 300,
    // @ts-ignore - web-only styles
    overflow: 'hidden',
    // @ts-ignore - web-only styles
    display: 'flex',
    // @ts-ignore - web-only styles
    flexDirection: 'column',
  },
  songsPanel: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    // @ts-ignore - web-only styles
    overflow: 'auto',
  },
  songsPanelSplit: {
    flex: 1,
    minWidth: 300,
    // @ts-ignore - web-only styles
    overflow: 'auto',
  },
  songsPanelHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#252525',
  },
  songsPanelHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  songsPanelTitleContainer: {
    flex: 0,
    minWidth: 100,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#ffffff',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 70,
    alignItems: 'center',
  },
  newSongButtonText: {
    color: '#ffffff',
    fontSize: 13,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteSetlistButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSetlistButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    // FIX: On web, we need maxHeight to constrain the ScrollView so it can scroll.
    // Without maxHeight, the ScrollView grows to fit all content and nothing scrolls.
    // On native, FlatList/ScrollView handles scrolling automatically with flex: 1.
    ...(Platform.OS === 'web' && {
      maxHeight: 'calc(100vh - 150px)' as any,
      overflow: 'auto' as any,
    }),
  },
  songsPanelList: {
    flex: 1,
    // @ts-ignore - web-only styles
    maxHeight: 'calc(100vh - 150px)',
    // @ts-ignore - web-only styles
    overflowY: 'auto',
    // @ts-ignore - web-only styles
    overflowX: 'hidden',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 0,
  },
  songLineCount: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  songItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewButtonInline: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4a9eff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    marginLeft: 0,
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
