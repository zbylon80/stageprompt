/**
 * PrompterControls Component
 * 
 * Provides playback controls for the prompter screen including:
 * - Play/Pause button
 * - Previous/Next song navigation (when in setlist context)
 * - Song position indicator
 * - Timer display
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export interface PrompterControlsProps {
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  
  // Playback controls
  onPlayPause: () => void;
  
  // Navigation (optional - only when in setlist)
  onPreviousSong?: () => void;
  onNextSong?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  
  // Position in setlist (optional)
  currentIndex?: number;
  totalSongs?: number;
  
  // Styling
  textColor?: string;
  fontSize?: number;
}

export function PrompterControls({
  isPlaying,
  currentTime,
  onPlayPause,
  onPreviousSong,
  onNextSong,
  hasPrevious = false,
  hasNext = false,
  currentIndex,
  totalSongs,
  textColor = '#ffffff',
  fontSize = 48,
}: PrompterControlsProps) {
  const showNavigation = onPreviousSong !== undefined && onNextSong !== undefined;
  const showPosition = currentIndex !== undefined && totalSongs !== undefined;

  return (
    <View style={styles.container}>
      {/* Navigation and playback controls */}
      <View style={styles.controls}>
        {/* Previous song button (only show if in setlist) */}
        {showNavigation && (
          <TouchableOpacity
            style={[styles.controlButton, !hasPrevious && styles.controlButtonDisabled]}
            onPress={onPreviousSong}
            disabled={!hasPrevious}
            activeOpacity={0.7}
            accessibilityLabel="Previous song"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasPrevious }}
          >
            <Text style={[styles.controlButtonText, { color: textColor }]}>◀</Text>
          </TouchableOpacity>
        )}
        
        {/* Play/Pause button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.playPauseButton]}
          onPress={onPlayPause}
          activeOpacity={0.7}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          accessibilityRole="button"
        >
          <Text style={[styles.controlButtonText, { color: textColor }]}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {/* Song position info (only show if in setlist) */}
        {showPosition && (
          <View style={styles.controlInfo}>
            <Text style={[styles.controlInfoText, { color: textColor }]}>
              {currentIndex + 1} / {totalSongs}
            </Text>
          </View>
        )}

        {/* Next song button (only show if in setlist) */}
        {showNavigation && (
          <TouchableOpacity
            style={[styles.controlButton, !hasNext && styles.controlButtonDisabled]}
            onPress={onNextSong}
            disabled={!hasNext}
            activeOpacity={0.7}
            accessibilityLabel="Next song"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasNext }}
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
  );
}

/**
 * Helper function to format time as MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
  playPauseButton: {
    backgroundColor: '#4caf50', // Success green from UI standards
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
