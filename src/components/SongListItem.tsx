// components/SongListItem.tsx

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Song } from '../types/models';

interface SongListItemProps {
  song: Song;
  onPress: (song: Song) => void;
  onDelete?: (song: Song) => void;
}

export function SongListItem({ song, onPress, onDelete }: SongListItemProps) {
  const handleDelete = (e: any) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(song);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(song)}
      activeOpacity={0.7}
      testID={`song-item-${song.id}`}
    >
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={1}>
            {song.title}
          </Text>
          {song.artist && (
            <Text style={styles.artist} numberOfLines={1}>
              {song.artist}
            </Text>
          )}
          <Text style={styles.info}>
            {song.lines.length} {song.lines.length === 1 ? 'line' : 'lines'}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
            testID={`delete-song-${song.id}`}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 28,
  },
});
