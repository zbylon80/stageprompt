# Design Document - Song Search

## Overview

The song search feature provides real-time filtering of songs based on user input. The search will be implemented as a reusable component that can be integrated into both the SongListScreen and the SetlistEditorScreen's songs panel. The search will filter songs by matching the query against both title and artist fields using case-insensitive substring matching.

## Architecture

The search functionality will follow a simple, reactive architecture:

1. **Search Input Component**: A controlled TextInput that captures user queries
2. **Filter Function**: A pure function that takes a song list and query, returns filtered results
3. **Integration Points**: 
   - SongListScreen: Search bar above the song list
   - SetlistEditorScreen: Search bar in the "All Songs" panel

The search will be client-side only, filtering the in-memory song list without requiring backend calls.

## Components and Interfaces

### SearchBar Component

```typescript
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}
```

A reusable search input component with:
- Text input field
- Clear button (X) when text is present
- Search icon
- Placeholder text

### Filter Function

```typescript
function filterSongs(songs: Song[], query: string): Song[] {
  if (!query.trim()) {
    return songs;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return songs.filter(song => {
    const titleMatch = song.title.toLowerCase().includes(lowerQuery);
    const artistMatch = song.artist.toLowerCase().includes(lowerQuery);
    return titleMatch || artistMatch;
  });
}
```

## Data Models

No new data models are required. The feature uses existing `Song` interface:

```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  lines: SongLine[];
  createdAt: number;
  updatedAt: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Filter returns only matching songs

*For any* song list and search query, all songs in the filtered results should have either their title or artist containing the query (case-insensitive)

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Case-insensitive matching

*For any* song list and search query, filtering with the query in uppercase should return the same results as filtering with the query in lowercase

**Validates: Requirements 1.5**

### Property 3: Empty query returns all songs

*For any* song list, filtering with an empty string or whitespace-only string should return the complete original song list

**Validates: Requirements 2.2, 2.4**

### Property 4: Result count matches filtered length

*For any* song list and search query, the count of matching songs should equal the length of the filtered results array

**Validates: Requirements 4.1**

### Property 5: Substring matching

*For any* song list and search query, if a song's title or artist contains the query as a substring, that song should appear in the filtered results

**Validates: Requirements 1.2, 1.3**

### Property 6: No false positives

*For any* song list and search query, no song in the filtered results should have both title and artist that do not contain the query

**Validates: Requirements 1.1**

## Error Handling

The search feature has minimal error cases:

1. **Null/Undefined Input**: Treat as empty query, return all songs
2. **Special Characters**: Handle gracefully, no escaping needed for substring matching
3. **Very Long Queries**: No special handling needed, substring matching works regardless of length
4. **Empty Song List**: Return empty array, display appropriate empty state

## Testing Strategy

### Unit Tests

- Test filterSongs with empty query returns all songs
- Test filterSongs with query matching title only
- Test filterSongs with query matching artist only
- Test filterSongs with query matching both title and artist
- Test filterSongs with no matches returns empty array
- Test filterSongs with special characters
- Test SearchBar component renders correctly
- Test SearchBar clear button functionality

### Property-Based Tests

Using fast-check library, we will implement property-based tests for all correctness properties listed above. Each test will:

- Generate random song lists (varying sizes, titles, artists)
- Generate random search queries (varying lengths, cases, special characters)
- Run a minimum of 100 iterations
- Tag each test with the format: **Feature: song-search, Property {number}: {property_text}**

Example property test structure:

```typescript
describe('Song Search Properties', () => {
  it('Property 1: Filter returns only matching songs', () => {
    fc.assert(
      fc.property(
        fc.array(songArbitrary),
        fc.string(),
        (songs, query) => {
          const results = filterSongs(songs, query);
          const lowerQuery = query.toLowerCase().trim();
          
          if (!lowerQuery) {
            return results.length === songs.length;
          }
          
          return results.every(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Performance Considerations

- **Client-Side Filtering**: For lists up to 1000 songs, client-side filtering is performant
- **Debouncing**: Not initially required, but can be added if performance issues arise
- **Memoization**: Consider using useMemo for filtered results if re-renders become an issue

## UI/UX Considerations

- Search bar should be sticky at the top when scrolling
- Clear button (X) appears only when text is present
- Placeholder text: "Search by title or artist..."
- Empty state message: "No songs found matching '{query}'"
- Result count displayed: "Found X songs" or "X songs"
