// components/PrompterTouchControls.tsx
// Touch and click controls for Bluetooth mouse controllers and finger gestures

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  GestureResponderEvent,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface PrompterTouchControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  showHints?: boolean;
  textColor?: string;
}

export function PrompterTouchControls({
  onPrevious,
  onNext,
  onPlayPause,
  showHints = true,
  textColor = '#ffffff',
}: PrompterTouchControlsProps) {
  const [feedback, setFeedback] = useState<'left' | 'center' | 'right' | null>(null);

  // Animated values for visual feedback
  const leftOpacity = useSharedValue(0);
  const centerOpacity = useSharedValue(0);
  const rightOpacity = useSharedValue(0);

  const showFeedback = (area: 'left' | 'center' | 'right') => {
    setFeedback(area);
    
    const opacity = area === 'left' ? leftOpacity : area === 'center' ? centerOpacity : rightOpacity;
    opacity.value = withTiming(0.3, { duration: 100 }, () => {
      opacity.value = withTiming(0, { duration: 300 });
    });

    setTimeout(() => setFeedback(null), 400);
  };

  const handleLeftPress = () => {
    showFeedback('left');
    onPrevious();
  };

  const handleCenterPress = () => {
    showFeedback('center');
    onPlayPause();
  };

  const handleRightPress = () => {
    showFeedback('right');
    onNext();
  };

  // Animated styles
  const leftAnimatedStyle = useAnimatedStyle(() => ({
    opacity: leftOpacity.value,
  }));

  const centerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: centerOpacity.value,
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
  }));

  // Swipe gesture detection
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationX, translationY } = event;
      
      // Require minimum swipe distance
      const minSwipeDistance = 50;
      
      // Horizontal swipes (ignore if too much vertical movement)
      if (Math.abs(translationX) > minSwipeDistance && Math.abs(translationY) < 100) {
        if (translationX > 0) {
          // Swipe right → Next
          handleRightPress();
        } else {
          // Swipe left → Previous
          handleLeftPress();
        }
      }
      // Tap (minimal movement)
      else if (Math.abs(translationX) < 20 && Math.abs(translationY) < 20) {
        handleCenterPress();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {/* Left area - Previous */}
        <TouchableOpacity
          style={styles.touchArea}
          onPress={handleLeftPress}
          activeOpacity={1}
        >
          <Animated.View style={[styles.feedback, leftAnimatedStyle, { backgroundColor: textColor }]} />
          {showHints && (
            <View style={styles.hintContainer}>
              <Text style={[styles.hintIcon, { color: textColor }]}>←</Text>
              <Text style={[styles.hintText, { color: textColor }]}>Previous</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Center area - Play/Pause */}
        <TouchableOpacity
          style={styles.touchArea}
          onPress={handleCenterPress}
          activeOpacity={1}
        >
          <Animated.View style={[styles.feedback, centerAnimatedStyle, { backgroundColor: textColor }]} />
          {showHints && (
            <View style={styles.hintContainer}>
              <Text style={[styles.hintIcon, { color: textColor }]}>⏸</Text>
              <Text style={[styles.hintText, { color: textColor }]}>Play/Pause</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Right area - Next */}
        <TouchableOpacity
          style={styles.touchArea}
          onPress={handleRightPress}
          activeOpacity={1}
        >
          <Animated.View style={[styles.feedback, rightAnimatedStyle, { backgroundColor: textColor }]} />
          {showHints && (
            <View style={styles.hintContainer}>
              <Text style={[styles.hintIcon, { color: textColor }]}>→</Text>
              <Text style={[styles.hintText, { color: textColor }]}>Next</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    pointerEvents: 'box-none', // Allow touches to pass through to children
  },
  touchArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  feedback: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  hintContainer: {
    alignItems: 'center',
    opacity: 0.3,
  },
  hintIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
