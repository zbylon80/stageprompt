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
  label?: string;      // Opcjonalna niestandardowa etykieta (np. "Verse 1", "Pre-Chorus")
  number?: number;     // Automatyczna numeracja dla zwrotek
  startTime?: number;  // NOWE: Czas rozpoczęcia sekcji w sekundach (opcjonalny)
  endTime?: number;    // NOWE: Czas zakończenia sekcji w sekundach (opcjonalny)
}

export interface LyricLine {
  id: string;
  text: string;
  timeSeconds: number;  // Może być auto-obliczony z timing sekcji
  section?: SongSection;  // Opcjonalna sekcja
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

## Section-Based Timing (Uproszczone Wprowadzanie Czasów)

### Koncepcja

Zamiast wymagać czasu dla każdej linijki, użytkownik określa tylko:
1. **Czas rozpoczęcia sekcji** (startTime) - dla pierwszej linijki sekcji
2. **Czas zakończenia sekcji** (endTime) - dla ostatniej linijki sekcji

Linijki pośrednie są automatycznie interpolowane równomiernie w czasie trwania sekcji.

### Przykład

```
[Verse 1] Start: 0:10, End: 0:30
  - "First line"      → auto: 10.0s
  - "Second line"     → auto: 16.67s
  - "Third line"      → auto: 23.33s
  - "Fourth line"     → auto: 30.0s

[Chorus] Start: 0:35, End: 0:50
  - "Chorus line 1"   → auto: 35.0s
  - "Chorus line 2"   → auto: 42.5s
  - "Chorus line 3"   → auto: 50.0s
```

### UI w Edytorze

Przy pierwszej linijce sekcji pokazują się dwa pola:
- **Start sekcji**: Input dla `section.startTime` (format MM:SS)
- **Koniec sekcji**: Input dla `section.endTime` (format MM:SS)

Czasy poszczególnych linijek są automatycznie obliczane i wyświetlane jako podpowiedź (szary tekst).

### Algorytm Interpolacji

```typescript
// utils/timingInterpolation.ts

export function calculateLineTimes(lines: LyricLine[]): LyricLine[] {
  const result: LyricLine[] = [];
  let currentSectionLines: LyricLine[] = [];
  let currentSection: SongSection | undefined;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is the start of a new section
    const isNewSection = line.section && (
      !currentSection ||
      line.section.type !== currentSection.type ||
      line.section.number !== currentSection.number ||
      line.section.label !== currentSection.label
    );
    
    // Process previous section if we're starting a new one
    if (isNewSection && currentSectionLines.length > 0) {
      result.push(...interpolateSectionTimes(currentSectionLines, currentSection));
      currentSectionLines = [];
    }
    
    // Update current section
    if (line.section) {
      currentSection = line.section;
    }
    
    currentSectionLines.push(line);
  }
  
  // Process last section
  if (currentSectionLines.length > 0) {
    result.push(...interpolateSectionTimes(currentSectionLines, currentSection));
  }
  
  return result;
}

function interpolateSectionTimes(
  lines: LyricLine[],
  section: SongSection | undefined
): LyricLine[] {
  // If no section or no timing info, return as-is
  if (!section || section.startTime === undefined || section.endTime === undefined) {
    return lines;
  }
  
  const { startTime, endTime } = section;
  const count = lines.length;
  
  if (count === 0) return lines;
  if (count === 1) {
    return [{
      ...lines[0],
      timeSeconds: startTime,
    }];
  }
  
  // Interpolate times evenly across the section
  return lines.map((line, index) => {
    const fraction = index / (count - 1);
    const interpolatedTime = startTime + (endTime - startTime) * fraction;
    
    return {
      ...line,
      timeSeconds: interpolatedTime,
    };
  });
}
```

### Kompatybilność Wsteczna

- Linijki bez sekcji używają `timeSeconds` bezpośrednio (stary sposób)
- Linijki z sekcją ale bez `startTime`/`endTime` również używają `timeSeconds`
- System obsługuje mieszane podejście (niektóre sekcje z timing, inne bez)

## Przykładowy Przepływ

1. Użytkownik edytuje utwór
2. Klika "+ Section" przy pierwszej linijce zwrotki
3. Wybiera "Verse" z dropdown
4. System automatycznie przypisuje "Verse 1"
5. Użytkownik wprowadza Start: 0:10 i End: 0:30 dla sekcji
6. System automatycznie oblicza czasy dla wszystkich linijek w sekcji
7. Użytkownik klika "+ Section" przy refrenie
8. Wybiera "Chorus"
9. Wprowadza Start: 0:35 i End: 0:50
10. W prompterze widzi:
   ```
   [Verse 1]
   Pierwsza linijka zwrotki... (10.0s)
   Druga linijka zwrotki... (16.67s)
   Trzecia linijka zwrotki... (23.33s)
   Czwarta linijka zwrotki... (30.0s)
   
   [Chorus]
   Pierwsza linijka refrenu... (35.0s)
   Druga linijka refrenu... (42.5s)
   Trzecia linijka refrenu... (50.0s)
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
