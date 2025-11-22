// components/SongListItem.tsx

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Song } from '../types/models';

interface SongListItemProps {
  song: Song;
  onPress: (song: Song) => void;
  onAddToSetlist?: (song: Song) => void;
}

export function SongListItem({ song, onPress, onAddToSetlist }: SongListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(song)}
      activeOpacity={0.7}
      testID={`song-item-${song.id}`}
    >
      <View style={styles.content}>
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
});
