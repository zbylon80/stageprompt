# API Documentation

This document describes the APIs for the main services and hooks in StagePrompt.

## Table of Contents

- [Services](#services)
  - [storageService](#storageservice)
  - [scrollAlgorithm](#scrollalgorithm)
  - [keyEventService](#keyeventservice)
  - [exportImportService](#exportimportservice)
- [Hooks](#hooks)
  - [useSongs](#usesongs)
  - [useSetlists](#usesetlists)
  - [useSettings](#usesettings)
  - [useKeyMapping](#usekeymapping)
  - [usePrompterTimer](#usepromptertimer)
- [Utilities](#utilities)
  - [validation](#validation)
  - [timeFormat](#timeformat)
  - [sectionLabels](#sectionlabels)

---

## Services

### storageService

Handles all data persistence using AsyncStorage. Provides a consistent interface for saving and loading data across platforms.

#### Methods

##### `saveSong(song: Song): Promise<void>`

Saves a song to local storage.

**Parameters:**
- `song` - Song object to save

**Returns:** Promise that resolves when save is complete

**Throws:** Error if save fails

**Example:**
```typescript
const song: Song = {
  id: 'song-123',
  title: 'My Song',
  artist: 'Artist Name',
  lines: [...],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await storageService.saveSong(song);
```

##### `loadSongs(): Promise<Song[]>`

Loads all songs from local storage.

**Returns:** Promise that resolves to array of songs

**Example:**
```typescript
const songs = await storageService.loadSongs();
console.log(`Loaded ${songs.length} songs`);
```

##### `deleteSong(id: string): Promise<void>`

Deletes a song from local storage.

**Parameters:**
- `id` - Song ID to delete

**Returns:** Promise that resolves when delete is complete

**Example:**
```typescript
await storageService.deleteSong('song-123');
```

##### `saveSetlist(setlist: Setlist): Promise<void>`

Saves a setlist to local storage.

**Parameters:**
- `setlist` - Setlist object to save

**Returns:** Promise that resolves when save is complete

**Example:**
```typescript
const setlist: Setlist = {
  id: 'setlist-456',
  name: 'My Setlist',
  songIds: ['song-123', 'song-456'],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await storageService.saveSetlist(setlist);
```

##### `loadSetlists(): Promise<Setlist[]>`

Loads all setlists from local storage.

**Returns:** Promise that resolves to array of setlists

##### `deleteSetlist(id: string): Promise<void>`

Deletes a setlist from local storage.

**Parameters:**
- `id` - Setlist ID to delete

##### `saveSettings(settings: AppSettings): Promise<void>`

Saves app settings to local storage.

**Parameters:**
- `settings` - Settings object to save

##### `loadSettings(): Promise<AppSettings>`

Loads app settings from local storage.

**Returns:** Promise that resolves to settings object (or defaults if none saved)

##### `saveKeyMapping(mapping: KeyMapping): Promise<void>`

Saves key mapping configuration to local storage.

**Parameters:**
- `mapping` - Key mapping object to save

##### `loadKeyMapping(): Promise<KeyMapping>`

Loads key mapping configuration from local storage.

**Returns:** Promise that resolves to key mapping object (or empty if none saved)

---

### scrollAlgorithm

Calculates scroll position for the teleprompter based on current time and line timings.

#### Functions

##### `calculateScrollY(params: ScrollCalculationParams): number`

Calculates the Y scroll position for the current time using linear interpolation.

**Parameters:**
```typescript
interface ScrollCalculationParams {
  currentTime: number;      // Current playback time in seconds
  lines: LyricLine[];       // Array of lyric lines with timings
  lineHeight: number;       // Height of each line in pixels
  anchorY: number;          // Y position of anchor point in pixels
}
```

**Returns:** Scroll Y position in pixels

**Algorithm:**
1. If before first line: position first line at anchor
2. If after last line: position last line at anchor
3. If between two lines: linear interpolation between them

**Example:**
```typescript
const scrollY = calculateScrollY({
  currentTime: 15.5,
  lines: song.lines,
  lineHeight: 60,
  anchorY: 400  // 40% of 1000px screen height
});

// Use scrollY to animate scroll position
scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
```

**Formula:**
```
For time t between line i (time t0) and line i+1 (time t1):
fraction = (t - t0) / (t1 - t0)
y = y0 + (y1 - y0) * fraction
scrollY = y - anchorY
```

---

### keyEventService

Handles keyboard and Bluetooth controller events across platforms.

#### Methods

##### `initialize(): void`

Initializes key event listeners. Must be called before using the service.

**Platform Behavior:**
- **Android**: Uses `react-native-keyevent` for hardware key events
- **Web/Desktop**: Uses standard `keydown` event listeners
- **iOS**: Limited support (keyboard only, no Bluetooth controllers)

**Example:**
```typescript
useEffect(() => {
  keyEventService.initialize();
  return () => keyEventService.cleanup();
}, []);
```

##### `cleanup(): void`

Removes all event listeners. Should be called on component unmount.

##### `setKeyMapping(mapping: KeyMapping): void`

Sets the key mapping configuration.

**Parameters:**
- `mapping` - Object mapping key codes to actions

**Example:**
```typescript
keyEventService.setKeyMapping({
  nextSong: 22,  // KEYCODE_DPAD_RIGHT
  prevSong: 21,  // KEYCODE_DPAD_LEFT
  pause: 66      // KEYCODE_ENTER
});
```

##### `onAction(callback: (action: PrompterAction) => void): void`

Registers a callback to be called when a mapped key is pressed.

**Parameters:**
- `callback` - Function to call with the action name

**Example:**
```typescript
keyEventService.onAction((action) => {
  switch (action) {
    case 'nextSong':
      goToNextSong();
      break;
    case 'prevSong':
      goToPrevSong();
      break;
    case 'pause':
      togglePlayPause();
      break;
  }
});
```

**Features:**
- **Debouncing**: Prevents multiple triggers within 300ms
- **Graceful degradation**: Works without Bluetooth on all platforms
- **Cross-platform**: Keyboard events work identically on web/desktop

---

### exportImportService

Handles data export and import for backup and cross-device transfer.

#### Functions

##### `exportAllData(songs: Song[], setlists: Setlist[]): string`

Exports all data to a JSON string.

**Parameters:**
- `songs` - Array of songs to export
- `setlists` - Array of setlists to export

**Returns:** JSON string containing all data

**Format:**
```json
{
  "version": "1.0",
  "exportDate": 1234567890,
  "songs": [...],
  "setlists": [...]
}
```

**Example:**
```typescript
const jsonString = exportAllData(songs, setlists);

// On web: trigger download
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// ... download logic

// On mobile: share file
await Sharing.shareAsync(fileUri);
```

##### `validateImportData(jsonString: string): boolean`

Validates imported JSON data structure.

**Parameters:**
- `jsonString` - JSON string to validate

**Returns:** `true` if valid, `false` otherwise

**Validation Checks:**
- Valid JSON syntax
- Required fields present (version, songs, setlists)
- Correct data types
- Valid song and setlist structures

**Example:**
```typescript
const isValid = validateImportData(jsonString);
if (!isValid) {
  Alert.alert('Error', 'Invalid file format');
  return;
}
```

##### `importData(jsonString: string, mode: 'merge' | 'replace'): { songs: Song[]; setlists: Setlist[] }`

Imports data from JSON string.

**Parameters:**
- `jsonString` - JSON string to import
- `mode` - Import mode:
  - `'merge'`: Add imported data to existing
  - `'replace'`: Replace all data with imported

**Returns:** Object containing imported songs and setlists

**Example:**
```typescript
try {
  const { songs, setlists } = importData(jsonString, 'merge');
  
  // Save imported data
  for (const song of songs) {
    await storageService.saveSong(song);
  }
  for (const setlist of setlists) {
    await storageService.saveSetlist(setlist);
  }
  
  Alert.alert('Success', `Imported ${songs.length} songs and ${setlists.length} setlists`);
} catch (error) {
  Alert.alert('Error', 'Import failed');
}
```

---

## Hooks

### useSongs

Manages song data with automatic loading and persistence.

#### Returns

```typescript
interface UseSongsReturn {
  songs: Song[];                              // Array of all songs
  loading: boolean;                           // Loading state
  saveSong: (song: Song) => Promise<void>;   // Save a song
  deleteSong: (id: string) => Promise<void>; // Delete a song
  reload: () => Promise<void>;                // Reload from storage
}
```

#### Example

```typescript
function SongListScreen() {
  const { songs, loading, saveSong, deleteSong } = useSongs();
  
  if (loading) {
    return <ActivityIndicator />;
  }
  
  return (
    <FlatList
      data={songs}
      renderItem={({ item }) => (
        <SongListItem
          song={item}
          onDelete={() => deleteSong(item.id)}
        />
      )}
    />
  );
}
```

---

### useSetlists

Manages setlist data with automatic loading and persistence.

#### Returns

```typescript
interface UseSetlistsReturn {
  setlists: Setlist[];                              // Array of all setlists
  loading: boolean;                                 // Loading state
  saveSetlist: (setlist: Setlist) => Promise<void>; // Save a setlist
  deleteSetlist: (id: string) => Promise<void>;     // Delete a setlist
  reload: () => Promise<void>;                      // Reload from storage
}
```

#### Example

```typescript
function SetlistListScreen() {
  const { setlists, loading, saveSetlist, deleteSetlist } = useSetlists();
  
  const handleCreateSetlist = async () => {
    const newSetlist: Setlist = {
      id: generateId(),
      name: 'New Setlist',
      songIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveSetlist(newSetlist);
  };
  
  return (
    <View>
      <FlatList data={setlists} ... />
      <TouchableOpacity onPress={handleCreateSetlist}>
        <Text>New Setlist</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### useSettings

Manages app settings with automatic loading and persistence.

#### Returns

```typescript
interface UseSettingsReturn {
  settings: AppSettings;                              // Current settings
  loading: boolean;                                   // Loading state
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>; // Update settings
  resetSettings: () => Promise<void>;                 // Reset to defaults
}
```

#### Example

```typescript
function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  
  const handleFontSizeChange = async (value: number) => {
    await updateSettings({ fontSize: value });
  };
  
  return (
    <View>
      <Text>Font Size: {settings.fontSize}</Text>
      <Slider
        value={settings.fontSize}
        minimumValue={24}
        maximumValue={72}
        onValueChange={handleFontSizeChange}
      />
    </View>
  );
}
```

---

### useKeyMapping

Manages key mapping configuration with automatic loading and persistence.

#### Returns

```typescript
interface UseKeyMappingReturn {
  mapping: KeyMapping;                              // Current key mapping
  loading: boolean;                                 // Loading state
  updateMapping: (mapping: Partial<KeyMapping>) => Promise<void>; // Update mapping
  clearMapping: (action: keyof KeyMapping) => Promise<void>;      // Clear a mapping
}
```

#### Example

```typescript
function KeyMappingDialog() {
  const { mapping, updateMapping, clearMapping } = useKeyMapping();
  const [learningAction, setLearningAction] = useState<string | null>(null);
  
  const handleLearnKey = (action: keyof KeyMapping) => {
    setLearningAction(action);
    
    // Listen for next key press
    const listener = (keyCode: number) => {
      updateMapping({ [action]: keyCode });
      setLearningAction(null);
    };
    
    keyEventService.onAction(listener);
  };
  
  return (
    <View>
      <Text>Next Song: {mapping.nextSong || 'Not mapped'}</Text>
      <Button title="Map Key" onPress={() => handleLearnKey('nextSong')} />
    </View>
  );
}
```

---

### usePrompterTimer

Manages teleprompter playback timer with play/pause/seek controls.

#### Returns

```typescript
interface UsePrompterTimerReturn {
  currentTime: number;           // Current playback time in seconds
  isPlaying: boolean;            // Playing state
  play: () => void;              // Start playback
  pause: () => void;             // Pause playback
  reset: () => void;             // Reset to 0
  seek: (time: number) => void;  // Seek to specific time
}
```

#### Example

```typescript
function PrompterScreen({ song }: { song: Song }) {
  const { currentTime, isPlaying, play, pause, reset } = usePrompterTimer();
  
  const scrollY = calculateScrollY({
    currentTime,
    lines: song.lines,
    lineHeight: 60,
    anchorY: 400
  });
  
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
  }, [scrollY]);
  
  return (
    <View>
      <ScrollView ref={scrollViewRef}>
        {song.lines.map(line => (
          <Text key={line.id}>{line.text}</Text>
        ))}
      </ScrollView>
      
      <View>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={isPlaying ? pause : play} />
        <Button title="Reset" onPress={reset} />
      </View>
    </View>
  );
}
```

**Features:**
- **Automatic cleanup**: Timer stops on unmount
- **Precise timing**: Updates every 50-100ms
- **State preservation**: Pause/resume maintains position

---

## Utilities

### validation

Provides validation functions for data models.

#### Functions

##### `validateSong(song: Partial<Song>): string[]`

Validates a song object.

**Parameters:**
- `song` - Song object to validate (can be partial)

**Returns:** Array of error messages (empty if valid)

**Validation Rules:**
- Title is required and non-empty
- Times must be non-negative
- Times must be in ascending order
- Duration (if present) must be non-negative

**Example:**
```typescript
const errors = validateSong(song);
if (errors.length > 0) {
  Alert.alert('Validation Error', errors.join('\n'));
  return;
}
```

##### `validateLyricLine(line: Partial<LyricLine>): string[]`

Validates a lyric line object.

**Parameters:**
- `line` - Lyric line to validate

**Returns:** Array of error messages (empty if valid)

##### `validateSetlist(setlist: Partial<Setlist>): string[]`

Validates a setlist object.

**Parameters:**
- `setlist` - Setlist to validate

**Returns:** Array of error messages (empty if valid)

---

### timeFormat

Provides time parsing and formatting utilities.

#### Functions

##### `parseTimeInput(input: string): number | null`

Parses time input in MM:SS or seconds format.

**Parameters:**
- `input` - Time string (e.g., "1:14", "74", "1:14.5")

**Returns:** Time in seconds, or `null` if invalid

**Supported Formats:**
- `"MM:SS"` - Minutes and seconds (e.g., "1:14" = 74 seconds)
- `"M:SS"` - Single digit minutes (e.g., "1:05" = 65 seconds)
- `"SS"` - Seconds only (e.g., "74" = 74 seconds)
- `"MM:SS.mmm"` - With milliseconds (e.g., "1:14.5" = 74.5 seconds)

**Example:**
```typescript
const time1 = parseTimeInput("1:14");  // 74
const time2 = parseTimeInput("74");    // 74
const time3 = parseTimeInput("1:14.5"); // 74.5
const time4 = parseTimeInput("invalid"); // null
```

##### `formatTimeDisplay(seconds: number): string`

Formats seconds as MM:SS for display.

**Parameters:**
- `seconds` - Time in seconds

**Returns:** Formatted string (e.g., "1:14")

**Example:**
```typescript
formatTimeDisplay(74);    // "1:14"
formatTimeDisplay(65);    // "1:05"
formatTimeDisplay(3661);  // "61:01"
```

##### `formatTimeForEdit(seconds: number): string`

Formats seconds for editing (same as display).

**Parameters:**
- `seconds` - Time in seconds

**Returns:** Formatted string (e.g., "1:14")

---

### sectionLabels

Provides utilities for song section labels.

#### Functions

##### `getSectionLabel(section: SongSection): string`

Gets display label for a section.

**Parameters:**
- `section` - Section object

**Returns:** Display label string

**Examples:**
```typescript
getSectionLabel({ type: 'verse', number: 1 });  // "Verse 1"
getSectionLabel({ type: 'chorus' });            // "Chorus"
getSectionLabel({ type: 'custom', label: 'Solo' }); // "Solo"
```

##### `getNextVerseNumber(lines: LyricLine[]): number`

Calculates the next verse number based on existing verses.

**Parameters:**
- `lines` - Array of lyric lines

**Returns:** Next verse number (e.g., if verses 1 and 2 exist, returns 3)

**Example:**
```typescript
const nextNumber = getNextVerseNumber(song.lines);
const newSection: SongSection = {
  type: 'verse',
  number: nextNumber
};
```

##### `SECTION_COLORS: Record<SectionType, string>`

Color mapping for section types.

**Values:**
```typescript
{
  verse: '#4a9eff',      // Blue
  chorus: '#4caf50',     // Green
  bridge: '#ff9800',     // Orange
  intro: '#9b59b6',      // Purple
  outro: '#9b59b6',      // Purple
  instrumental: '#2196f3', // Light blue
  custom: '#999999'      // Gray
}
```

---

## Error Handling

All async functions may throw errors. Always wrap in try-catch:

```typescript
try {
  await storageService.saveSong(song);
} catch (error) {
  console.error('Save failed:', error);
  Alert.alert('Error', 'Failed to save song');
}
```

Common error scenarios:
- **Storage full**: AsyncStorage quota exceeded
- **Invalid data**: Validation fails
- **Network issues**: (if using cloud storage in future)
- **Permission denied**: File system access denied

---

## Type Definitions

For complete type definitions, see:
- `src/types/models.ts` - Data models
- `src/types/navigation.ts` - Navigation types

---

## Best Practices

1. **Always validate data** before saving
2. **Handle errors gracefully** with user-friendly messages
3. **Use hooks** for state management instead of direct service calls
4. **Clean up** event listeners and timers on unmount
5. **Test edge cases** with property-based tests
6. **Document assumptions** in code comments

---

For more information, see:
- [Testing Guide](./TESTING.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Main README](../README.md)
