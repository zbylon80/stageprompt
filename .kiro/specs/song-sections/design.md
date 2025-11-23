# Dokument Projektowy - Sekcje Utworów

## Przegląd

Funkcjonalność sekcji utworów rozszerza model danych LyricLine o informacje o strukturze piosenki. Użytkownicy mogą oznaczać początek każdej sekcji (zwrotka, refren, bridge, etc.) w edytorze, a te oznaczenia są następnie wyświetlane zarówno w edytorze jak i w prompterze.

## Architektura

### Zmiany w Modelu Danych

```typescript
// types/models.ts

export type SectionType = 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'instrumental' | 'custom';

export interface SongSection {
  type: SectionType;
  label?: string;  // Opcjonalna niestandardowa etykieta (np. "Verse 1", "Pre-Chorus")
  number?: number; // Automatyczna numeracja dla zwrotek
}

export interface LyricLine {
  id: string;
  text: string;
  timeSeconds: number;
  section?: SongSection;  // NOWE: Opcjonalna sekcja
}
```

### Domyślne Etykiety Sekcji

```typescript
// utils/sectionLabels.ts

export const DEFAULT_SECTION_LABELS: Record<SectionType, string> = {
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  intro: 'Intro',
  outro: 'Outro',
  instrumental: 'Instrumental',
  custom: 'Custom',
};

export const SECTION_COLORS: Record<SectionType, string> = {
  verse: '#4a9eff',      // Niebieski
  chorus: '#ff6b6b',     // Czerwony
  bridge: '#51cf66',     // Zielony
  intro: '#ffd43b',      // Żółty
  outro: '#9775fa',      // Fioletowy
  instrumental: '#ff922b', // Pomarańczowy
  custom: '#868e96',     // Szary
};

export function getSectionLabel(section: SongSection): string {
  if (section.label) {
    return section.label;
  }
  
  if (section.type === 'verse' && section.number) {
    return `Verse ${section.number}`;
  }
  
  return DEFAULT_SECTION_LABELS[section.type];
}

export function getNextVerseNumber(lines: LyricLine[]): number {
  const verseSections = lines
    .filter(line => line.section?.type === 'verse')
    .map(line => line.section!.number || 0);
  
  return verseSections.length > 0 ? Math.max(...verseSections) + 1 : 1;
}
```

## Komponenty

### 1. SectionPicker Component

Komponent do wyboru typu sekcji w edytorze:

```typescript
// components/SectionPicker.tsx

interface SectionPickerProps {
  currentSection?: SongSection;
  onSelectSection: (section: SongSection | undefined) => void;
  nextVerseNumber: number;
}

export function SectionPicker({ currentSection, onSelectSection, nextVerseNumber }: SectionPickerProps) {
  // Dropdown z opcjami: Verse, Chorus, Bridge, Intro, Outro, Instrumental, Custom, Remove
  // Dla Verse: automatycznie przypisuje numer
  // Dla Custom: pokazuje input do wpisania własnej etykiety
}
```

### 2. SectionMarker Component

Komponent wyświetlający znacznik sekcji:

```typescript
// components/SectionMarker.tsx

interface SectionMarkerProps {
  section: SongSection;
  size?: 'small' | 'medium' | 'large';
  onEdit?: () => void;
}

export function SectionMarker({ section, size = 'medium', onEdit }: SectionMarkerProps) {
  const label = getSectionLabel(section);
  const color = SECTION_COLORS[section.type];
  
  // Wyświetla kolorowy badge z etykietą sekcji
  // W edytorze: klikalne, pokazuje opcje edycji
  // W prompterze: tylko wyświetlanie
}
```

### 3. Zmiany w LyricLineEditor

```typescript
// components/LyricLineEditor.tsx

// Dodaj przycisk "Add Section" obok każdej linijki
// Po kliknięciu pokazuje SectionPicker
// Jeśli linijka ma sekcję, wyświetla SectionMarker z opcją edycji/usunięcia
```

### 4. Zmiany w PrompterScreen

```typescript
// screens/PrompterScreen.tsx

const renderLine = ({ item, index }: { item: LyricLine; index: number }) => {
  const showSection = item.section && (index === 0 || 
    !song.lines[index - 1].section || 
    song.lines[index - 1].section?.type !== item.section.type);
  
  return (
    <>
      {showSection && (
        <View style={styles.sectionMarkerContainer}>
          <SectionMarker section={item.section!} size="large" />
        </View>
      )}
      <View style={styles.lineContainer}>
        <Text style={styles.lineText}>{item.text}</Text>
      </View>
    </>
  );
};
```

## Walidacja

```typescript
// utils/validation.ts

export function validateSection(section: SongSection): string[] {
  const errors: string[] = [];
  
  if (!section.type) {
    errors.push('Section type is required');
  }
  
  if (section.type === 'custom' && !section.label) {
    errors.push('Custom section requires a label');
  }
  
  if (section.type === 'verse' && section.number && section.number < 1) {
    errors.push('Verse number must be positive');
  }
  
  return errors;
}
```

## Migracja Danych

Istniejące utwory nie mają pola `section` w linijkach. System musi obsługiwać:

```typescript
// services/storageService.ts

export async function loadSongs(): Promise<Song[]> {
  // ... existing code ...
  
  // Ensure backward compatibility
  const songs = loadedSongs.map(song => ({
    ...song,
    lines: song.lines.map(line => ({
      ...line,
      section: line.section || undefined, // Ensure section is optional
    })),
  }));
  
  return songs;
}
```

## UI/UX

### W Edytorze:
- Przycisk "+ Section" obok każdej linijki (lub ikona 🏷️)
- Dropdown z typami sekcji
- Kolorowy badge pokazujący aktualną sekcję
- Możliwość szybkiej edycji/usunięcia sekcji

### W Prompterze:
- Duży, wyraźny znacznik sekcji nad pierwszą linijką każdej sekcji
- Kolor znacznika odpowiada typowi sekcji
- Czcionka znacznika: 60-80% rozmiaru czcionki tekstu
- Wyśrodkowany, z marginesem górnym i dolnym

## Przykładowy Przepływ

1. Użytkownik edytuje utwór
2. Klika "+ Section" przy pierwszej linijce zwrotki
3. Wybiera "Verse" z dropdown
4. System automatycznie przypisuje "Verse 1"
5. Użytkownik klika "+ Section" przy refren
6. Wybiera "Chorus"
7. W prompterze widzi:
   ```
   [Verse 1]
   Pierwsza linijka zwrotki...
   Druga linijka zwrotki...
   
   [Chorus]
   Pierwsza linijka refrenu...
   ```

## Testowanie

### Unit Tests:
- `getSectionLabel()` - zwraca poprawne etykiety
- `getNextVerseNumber()` - oblicza następny numer zwrotki
- `validateSection()` - waliduje dane sekcji

### Property Tests:
- Round-trip: zapisanie i odczytanie utworu z sekcjami
- Sekcje są zachowane podczas eksportu/importu
- Numeracja zwrotek jest spójna

### Integration Tests:
- Dodawanie sekcji w edytorze
- Wyświetlanie sekcji w prompterze
- Edycja i usuwanie sekcji
