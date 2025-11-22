// screens/SongListScreen.tsx

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSongs } from '../hooks/useSongs';
import { SongListItem } from '../components/SongListItem';
import { RootStackParamList } from '../types/navigation';
import { Song } from '../types/models';
import { generateId } from '../utils/idGenerator';

type SongListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SongList'>;

interface SongListScreenProps {
  navigation: SongListScreenNavigationProp;
}

export function SongListScreen({ navigation }: SongListScreenProps) {
  const { songs, loading, error } = useSongs();

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No songs</Text>
      <Text style={styles.emptyText}>
        Tap the + button to create your first song
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Song }) => (
    <SongListItem song={item} onPress={handleSongPress} />
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

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          songs.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewSong}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    bottom: 20,
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
});
