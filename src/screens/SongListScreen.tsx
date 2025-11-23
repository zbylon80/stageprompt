// screens/SongListScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
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

  // Reload songs when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

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
    <SongListItem song={item} onPress={handleSongPress} onDelete={handleDeleteSong} />
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
    if (Platform.OS === 'web') {
      return (
        <ScrollView 
          style={styles.flatList} 
          contentContainerStyle={songs.length === 0 ? styles.emptyListContent : styles.listContent}
          // @ts-ignore - web-only style
          dataSet={{ scrollable: 'true' }}
        >
          {songs.length === 0 ? renderEmptyState() : songs.map((item) => (
            <View key={item.id}>
              {renderItem({ item })}
            </View>
          ))}
        </ScrollView>
      );
    }
    
    return (
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          songs.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
      />
    );
  };

  return (
    <>
      <View style={styles.container}>
        {renderList()}
        <TouchableOpacity
          style={styles.fabSetlists}
          onPress={handleSetlistsPress}
          activeOpacity={0.8}
        >
          <Text style={styles.fabSetlistsText}>♫</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewSong}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
      <ConfirmDialog
        visible={songToDelete !== null}
        title="Usuń utwór"
        message={`Czy na pewno chcesz usunąć "${songToDelete?.title || 'ten utwór'}"?`}
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
    flex: 1,
    backgroundColor: '#1a1a1a',
    // @ts-ignore - web-only styles
    height: '100vh',
  },
  flatList: {
    flex: 1,
    // @ts-ignore - web-only styles
    maxHeight: 'calc(100vh - 80px)',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
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
    position: 'absolute',
    right: 20,
    bottom: 150,
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
  },
  fabSetlistsText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '400',
  },
});
