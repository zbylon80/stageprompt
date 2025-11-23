# Implementation Plan - Song Search

- [ ] 1. Create search utility function
  - Implement filterSongs function in src/utils/searchUtils.ts
  - Handle empty queries, case-insensitive matching, substring search
  - Export function for use in screens
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.4_

- [ ]* 1.1 Write property test for filterSongs
  - **Property 1: Filter returns only matching songs**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ]* 1.2 Write property test for case-insensitive matching
  - **Property 2: Case-insensitive matching**
  - **Validates: Requirements 1.5**

- [ ]* 1.3 Write property test for empty query
  - **Property 3: Empty query returns all songs**
  - **Validates: Requirements 2.2, 2.4**

- [ ]* 1.4 Write property test for substring matching
  - **Property 5: Substring matching**
  - **Validates: Requirements 1.2, 1.3**

- [ ]* 1.5 Write property test for no false positives
  - **Property 6: No false positives**
  - **Validates: Requirements 1.1**

- [ ]* 1.6 Write unit tests for edge cases
  - Test with null/undefined input
  - Test with special characters
  - Test with very long queries
  - Test with empty song list
  - _Requirements: 1.1, 2.2_

- [ ] 2. Create SearchBar component
  - Create src/components/SearchBar.tsx
  - Implement TextInput with search icon
  - Add clear button (X) that appears when text is present
  - Style component to match app theme
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 2.1 Write unit tests for SearchBar component
  - Test component renders correctly
  - Test onChangeText callback
  - Test clear button functionality
  - Test placeholder text
  - _Requirements: 3.3, 3.4_

- [ ] 3. Integrate search into SongListScreen
  - Add search state (query string) to SongListScreen
  - Add SearchBar component at top of screen
  - Use filterSongs to filter displayed songs
  - Display result count or empty state message
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.2_

- [ ] 4. Integrate search into SetlistEditorScreen
  - Add search state to songs panel in SetlistEditorScreen
  - Add SearchBar component at top of songs panel
  - Use filterSongs to filter songs in panel
  - Display result count in panel header
  - _Requirements: 1.1, 2.1, 3.2, 4.1, 4.2_

- [ ] 5. Add visual feedback and polish
  - Add result count display ("Found X songs")
  - Add empty state message when no results
  - Ensure search bar is sticky/visible when scrolling
  - Add focus styling to search bar
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
