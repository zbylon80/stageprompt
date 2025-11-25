# Implementation Plan - Prompter Scrolling Fix

- [ ] 1. Diagnose and document current scrolling issues
  - Investigate why `scrollTo` with `AnimatedFlatList` is not working
  - Test current implementation on web and mobile platforms
  - Document specific failure modes and error messages
  - Verify that `calculateScrollY` function is working correctly
  - _Requirements: 1.1, 1.2_

- [ ] 2. Create usePrompterScroll custom hook
  - Create new file `src/hooks/usePrompterScroll.ts`
  - Define TypeScript interfaces for hook options and return value
  - Implement basic hook structure with ref management
  - Add platform detection logic (Platform.OS)
  - _Requirements: 5.1, 5.2_

- [ ] 3. Implement scroll position calculation in hook
  - Integrate `calculateScrollY` function into the hook
  - Add useEffect to recalculate on currentTime changes
  - Handle edge cases (empty lines, missing timing data)
  - Add logging for debugging in development mode
  - _Requirements: 1.2, 1.4, 5.3_

- [ ] 3.1 Write property test for scroll position calculation
  - **Property 1: Scroll position updates during playback**
  - **Property 2: Scroll position correctness**
  - **Validates: Requirements 1.1, 1.2, 1.4**

- [ ] 4. Implement platform-specific scroll execution
  - Add `scrollToPosition` function with platform branching
  - Implement web scrolling using `scrollToOffset`
  - Implement mobile scrolling using `Animated.timing`
  - Handle animated vs non-animated scrolling
  - Add error handling for failed scroll operations
  - _Requirements: 2.2, 5.4_

- [ ] 4.1 Write property test for platform-appropriate scrolling
  - **Property 4: Platform-appropriate scrolling**
  - **Validates: Requirements 2.2**

- [ ] 4.2 Write unit tests for scroll execution
  - Test web scroll execution with mocked scrollToOffset
  - Test mobile scroll execution with mocked Animated.timing
  - Test error handling for failed scroll operations
  - _Requirements: 2.2_

- [ ] 5. Replace AnimatedFlatList with AnimatedScrollView in PrompterScreen
  - Import AnimatedScrollView from react-native-reanimated
  - Replace AnimatedFlatList with AnimatedScrollView
  - Convert FlatList renderItem to map over lines array
  - Maintain all existing styling and layout
  - Update ref type from FlatList to ScrollView
  - _Requirements: 1.1, 6.1_

- [ ] 6. Integrate usePrompterScroll hook into PrompterScreen
  - Replace existing scroll logic with usePrompterScroll hook
  - Pass currentTime, lines, lineHeight, anchorY to hook
  - Use scrollViewRef from hook instead of local ref
  - Remove old scrollTo calls and useEffect
  - Test basic auto-scrolling functionality
  - _Requirements: 1.1, 1.2_

- [ ] 6.1 Write property test for smooth interpolation
  - **Property 3: Smooth interpolation (continuity)**
  - **Validates: Requirements 2.1**

- [ ] 7. Implement manual scroll detection and handling
  - Add `onScroll` handler to AnimatedScrollView
  - Detect when user manually scrolls (scroll not triggered by auto-scroll)
  - Pause auto-scrolling when manual scroll detected
  - Add timer to resume auto-scrolling after manual scroll stops
  - Store manual scroll state in hook
  - _Requirements: 2.4_

- [ ] 7.1 Write property test for manual scroll detection
  - **Property 5: Manual scroll detection**
  - **Validates: Requirements 2.4**

- [ ] 8. Implement pause/resume scroll behavior
  - Add isPlaying parameter to usePrompterScroll hook
  - Stop scroll updates when isPlaying is false
  - Maintain current scroll position when paused
  - Resume scrolling from current time when play resumes
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8.1 Write property tests for pause/resume
  - **Property 6: Pause maintains position**
  - **Property 7: Resume continues from current time**
  - **Validates: Requirements 3.1, 3.2**

- [ ] 9. Implement seek functionality
  - Add seek support to usePrompterScroll hook
  - Update scroll position immediately when time changes via seek
  - Integrate with usePrompterTimer's seek function
  - Test seeking to various time positions
  - _Requirements: 3.4_

- [ ] 9.1 Write property test for seek functionality
  - **Property 8: Seek updates position**
  - **Validates: Requirements 3.4**

- [ ] 10. Implement section navigation scrolling
  - Add `scrollToLine` function to usePrompterScroll hook
  - Calculate line index from section information
  - Scroll to first line of target section
  - Update currentTime when navigating during playback
  - Integrate with existing section navigation UI
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 10.1 Write property tests for section navigation
  - **Property 9: Section navigation scrolls to section**
  - **Property 10: Section navigation during playback**
  - **Validates: Requirements 4.1, 4.2**

- [ ] 11. Add error handling and fallbacks
  - Add try-catch blocks around scroll operations
  - Implement fallback to non-animated scroll on error
  - Add user notification for persistent scroll failures
  - Validate scroll positions (clamp to valid range)
  - Handle null/undefined refs gracefully
  - _Requirements: 5.2_

- [ ] 11.1 Write unit tests for error handling
  - Test scroll with null ref
  - Test scroll with invalid position (negative, too large)
  - Test scroll operation failure
  - Test fallback to non-animated scroll
  - _Requirements: 5.2_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Test backward compatibility
  - Load existing songs with timing data
  - Verify scroll positions match expected values
  - Test with songs using interpolated timing
  - Test with songs using anchor-based timing
  - Verify timing interpolation algorithm unchanged
  - _Requirements: 5.5, 6.2_

- [ ] 13.1 Write property tests for backward compatibility
  - **Property 11: Backward compatibility with timing data**
  - **Property 12: Interpolation algorithm preserved**
  - **Validates: Requirements 5.5, 6.2**

- [ ] 14. Test preservation of existing features
  - Test keyboard controls (play, pause, next, previous)
  - Test section markers display correctly
  - Test settings (fontSize, lineHeight, anchorY, etc.)
  - Test with songs with and without timing data
  - Verify PrompterControls component still works
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 14.1 Write unit tests for feature preservation
  - Test keyboard control integration
  - Test settings integration
  - Test display with and without timing data
  - _Requirements: 6.1, 6.4, 6.5_

- [ ] 15. Cross-platform testing and optimization
  - Test on web browser (Chrome, Firefox, Safari)
  - Test on iOS simulator and device
  - Test on Android emulator and device
  - Verify smooth scrolling on all platforms
  - Profile performance with long songs (100+ lines)
  - Optimize if performance issues found
  - _Requirements: 2.2, 2.3, 5.4_

- [ ] 16. Final integration testing
  - Test complete user flow: open song → play → pause → resume → seek → navigate sections
  - Test with setlist navigation (previous/next song)
  - Test edge cases (empty song, single line, no timing data)
  - Test with various settings configurations
  - Verify no regressions in other screens
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
