# Requirements Document - Song Search

## Introduction

This feature adds search functionality to the song list, allowing users to quickly find songs by title or artist name. This is essential for managing large song libraries where scrolling through hundreds of songs would be impractical.

## Glossary

- **Search Query**: The text input provided by the user to filter songs
- **Search Bar**: The UI component where users enter their search query
- **Filtered Results**: The subset of songs that match the search criteria
- **Case-Insensitive Search**: Search that treats uppercase and lowercase letters as equivalent

## Requirements

### Requirement 1

**User Story:** As a user, I want to search for songs by title or artist, so that I can quickly find specific songs in a large library.

#### Acceptance Criteria

1. WHEN a user types in the search bar THEN the System SHALL filter the song list in real-time to show only matching songs
2. WHEN a user searches by title THEN the System SHALL return all songs where the title contains the search query
3. WHEN a user searches by artist THEN the System SHALL return all songs where the artist name contains the search query
4. WHEN a search query matches both title and artist THEN the System SHALL return songs matching either field
5. WHEN the search is case-insensitive THEN the System SHALL treat "Beatles" and "beatles" as equivalent

### Requirement 2

**User Story:** As a user, I want to see search results update immediately as I type, so that I get instant feedback without needing to press a search button.

#### Acceptance Criteria

1. WHEN a user types a character in the search bar THEN the System SHALL update the filtered results within 100ms
2. WHEN a user clears the search bar THEN the System SHALL display all songs again
3. WHEN no songs match the search query THEN the System SHALL display an empty state message
4. WHEN the search bar is empty THEN the System SHALL display all songs

### Requirement 3

**User Story:** As a user, I want the search bar to be easily accessible, so that I can start searching without navigating through menus.

#### Acceptance Criteria

1. WHEN a user views the song list screen THEN the System SHALL display the search bar at the top of the screen
2. WHEN a user views the setlist editor songs panel THEN the System SHALL display the search bar at the top of the panel
3. WHEN a user taps the search bar THEN the System SHALL focus the input and show the keyboard
4. WHEN a user has entered a search query THEN the System SHALL display a clear button to reset the search

### Requirement 4

**User Story:** As a user, I want visual feedback about my search, so that I understand what results I'm seeing.

#### Acceptance Criteria

1. WHEN songs are filtered by search THEN the System SHALL display the count of matching songs
2. WHEN no results are found THEN the System SHALL display a message indicating no matches
3. WHEN the search bar has focus THEN the System SHALL provide visual indication of the active state
4. WHEN search results are displayed THEN the System SHALL highlight or emphasize the matching text in results
