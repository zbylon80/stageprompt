# Context Providers Documentation

This directory contains React Context providers for managing global application state in StagePrompt.

## Available Contexts

### DataContext

Provides access to songs and setlists data throughout the application.

**Location:** `src/context/DataContext.tsx`

**Exports:**
- `DataProvider` - Context provider component
- `useData()` - Hook to access the context

**Usage:**

```typescript
import { useData } from '../context/DataContext';

function MyComponent() {
  const { songs, setlists } = useData();
  
  // Access songs data
  const allSongs = songs.songs;
  const isLoadingSongs = songs.loading;
  const songsError = songs.error;
  
  // Access setlists data
  const allSetlists = setlists.setlists;
  const isLoadingSetlists = setlists.loading;
  const setlistsError = setlists.error;
  
  // Perform operations
  await songs.saveSong(newSong);
  await songs.deleteSong(songId);
  await songs.reload();
  
  await setlists.saveSetlist(newSetlist);
  await setlists.deleteSetlist(setlistId);
  await setlists.reload();
}
```

### SettingsContext

Provides access to application settings and key mappings.

**Location:** `src/context/SettingsContext.tsx`

**Exports:**
- `SettingsProvider` - Context provider component
- `useSettingsContext()` - Hook to access the context

**Usage:**

```typescript
import { useSettingsContext } from '../context/SettingsContext';

function MyComponent() {
  const { settings, keyMapping } = useSettingsContext();
  
  // Access settings
  const appSettings = settings.settings;
  const isLoadingSettings = settings.loading;
  const settingsError = settings.error;
  
  // Access key mappings
  const currentKeyMapping = keyMapping.keyMapping;
  const isLoadingKeyMapping = keyMapping.loading;
  const keyMappingError = keyMapping.error;
  
  // Perform operations
  await settings.saveSettings(newSettings);
  await settings.reload();
  
  await keyMapping.saveKeyMapping(newMapping);
  await keyMapping.reload();
}
```

## When to Use Context vs. Hooks Directly

### Use Context When:

1. **Multiple components need the same data** - Avoid prop drilling by using context
2. **Deep component trees** - Pass data through many levels without intermediate props
3. **Global state management** - Settings, user preferences, theme
4. **Cross-cutting concerns** - Authentication, localization, feature flags

### Use Hooks Directly When:

1. **Single component needs data** - No need for context overhead
2. **Local state management** - Component-specific data
3. **Performance optimization** - Avoid unnecessary re-renders from context updates
4. **Simple component hierarchies** - Props are sufficient

## Current Implementation

The application is wrapped with both providers in `App.tsx`:

```typescript
<DataProvider>
  <SettingsProvider>
    <NavigationContainer>
      {/* App screens */}
    </NavigationContainer>
  </SettingsProvider>
</DataProvider>
```

This makes the contexts available to all screens and components in the application.

## Performance Optimization

Both context providers use `useMemo` to optimize re-renders:

```typescript
const value = useMemo(
  () => ({
    songs,
    setlists,
  }),
  [songs, setlists]
);
```

This ensures that the context value only changes when the underlying data changes, preventing unnecessary re-renders of consuming components.

## Migration Guide

If you want to migrate a component from using hooks directly to using context:

**Before:**
```typescript
import { useSongs } from '../hooks/useSongs';
import { useSetlists } from '../hooks/useSetlists';

function MyComponent() {
  const { songs, loading, saveSong } = useSongs();
  const { setlists, loading: setlistsLoading } = useSetlists();
  // ...
}
```

**After:**
```typescript
import { useData } from '../context/DataContext';

function MyComponent() {
  const { songs, setlists } = useData();
  const allSongs = songs.songs;
  const isLoading = songs.loading;
  const allSetlists = setlists.setlists;
  // ...
}
```

## Testing

Both contexts have comprehensive test coverage in `src/context/__tests__/`:

- `DataContext.test.tsx` - Tests for DataContext
- `SettingsContext.test.tsx` - Tests for SettingsContext

Run tests with:
```bash
npm test -- src/context/__tests__
```

## Best Practices

1. **Always use the provided hooks** - Don't access context directly with `useContext`
2. **Handle loading states** - Check `loading` before rendering data
3. **Handle errors** - Display error messages from `error` property
4. **Reload when needed** - Use `reload()` to refresh data after navigation
5. **Memoize expensive computations** - Use `useMemo` for derived data
6. **Avoid unnecessary context updates** - Keep context values stable

## Requirements Validation

This implementation satisfies:
- **Requirement 1.1** - Centralized data management for songs and setlists
- **Requirement 8.5** - Settings persistence and access throughout the app
