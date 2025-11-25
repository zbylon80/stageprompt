# Dokument Projektowy - Format Wprowadzania Czasu

## Przegląd

Ta funkcjonalność rozszerza StagePrompt o bardziej intuicyjny sposób wprowadzania czasów oraz możliwość określenia całkowitego czasu trwania utworu. Główne cele:

1. **Format MM:SS** - Użytkownik może wpisać "1:14" zamiast "74" sekund
2. **Czas trwania utworu** - Pole `durationSeconds` określa kiedy utwór się kończy
3. **Kompatybilność wsteczna** - Istniejące dane działają bez zmian
4. **Walidacja** - Jasne komunikaty błędów dla niepoprawnych formatów

### Kluczowe Cechy Techniczne

- **Dwukierunkowa konwersja** - MM:SS ↔ sekundy
- **Elastyczny parser** - Akceptuje oba formaty
- **Zachowanie precyzji** - Części dziesiętne sekund są zachowane
- **Walidacja w czasie rzeczywistym** - Natychmiastowa informacja zwrotna
- **Kompatybilność** - Stare dane działają bez migracji

## Architektura

### Komponenty do Modyfikacji

```
src/
├── utils/
│   ├── timeFormat.ts          # NOWY - Konwersja MM:SS ↔ sekundy
│   └── validation.ts          # MODYFIKACJA - Walidacja duration
├── components/
│   └── LyricLineEditor.tsx    # MODYFIKACJA - Użycie timeFormat
├── screens/
│   └── SongEditorScreen.tsx   # MODYFIKACJA - Pole duration
└── types/
    └── models.ts              # BEZ ZMIAN - durationSeconds już istnieje
```

### Przepływ Danych

```mermaid
graph LR
    A[Użytkownik wpisuje "1:14"] --> B[parseTimeInput]
    B --> C{Walidacja}
    C -->|Poprawny| D[74 sekundy]
    C -->|Błąd| E[Komunikat błędu]
    D --> F[Zapisz do timeSeconds]
    F --> G[formatTimeDisplay]
    G --> H[Wyświetl "1:14"]
```

## Komponenty i Interfejsy

### Nowy Moduł: timeFormat.ts

```typescript
// utils/timeFormat.ts

export interface TimeParseResult {
  success: boolean;
  seconds?: number;
  error?: string;
}

/**
 * Parsuje czas z formatu MM:SS lub sekund na sekundy.
 * 
 * Akceptowane formaty:
 * - "74" -> 74 sekundy
 * - "1:14" -> 74 sekundy
 * - "1:5" -> 65 sekund
 * - "75:30" -> 4530 sekund (75 minut)
 * - "1:75" -> 135 sekund (1 minuta + 75 sekund)
 * - "1:30.5" -> 90.5 sekund
 * 
 * @param input - String wprowadzony przez użytkownika
 * @returns Obiekt z wynikiem parsowania
 */
export function parseTimeInput(input: string): TimeParseResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { success: false, error: 'Time cannot be empty' };
  }
  
  // Check for MM:SS format
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    
    // Only accept MM:SS format (not HH:MM:SS)
    if (parts.length !== 2) {
      return { 
        success: false, 
        error: 'Invalid format. Use MM:SS or seconds (e.g., "1:14" or "74")' 
      };
    }
    
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds)) {
      return { 
        success: false, 
        error: 'Invalid format. Use MM:SS or seconds (e.g., "1:14" or "74")' 
      };
    }
    
    if (minutes < 0 || seconds < 0) {
      return { 
        success: false, 
        error: 'Time cannot be negative' 
      };
    }
    
    const totalSeconds = minutes * 60 + seconds;
    return { success: true, seconds: totalSeconds };
  }
  
  // Parse as seconds
  const seconds = parseFloat(trimmed);
  
  if (isNaN(seconds)) {
    return { 
      success: false, 
      error: 'Invalid format. Use MM:SS or seconds (e.g., "1:14" or "74")' 
    };
  }
  
  if (seconds < 0) {
    return { 
      success: false, 
      error: 'Time cannot be negative' 
    };
  }
  
  return { success: true, seconds };
}

/**
 * Formatuje sekundy do wyświetlenia.
 * 
 * - Jeśli >= 60 sekund: format MM:SS (np. "1:14")
 * - Jeśli < 60 sekund: format sekund (np. "45")
 * - Zaokrągla do najbliższej sekundy dla czytelności
 * 
 * @param seconds - Liczba sekund
 * @returns Sformatowany string
 */
export function formatTimeDisplay(seconds: number | undefined): string {
  if (seconds === undefined) {
    return '';
  }
  
  // Round to nearest second for display
  const rounded = Math.round(seconds);
  
  if (rounded < 60) {
    return rounded.toString();
  }
  
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  
  // Pad seconds with leading zero if needed
  const secsStr = secs < 10 ? `0${secs}` : secs.toString();
  
  return `${minutes}:${secsStr}`;
}

/**
 * Konwertuje sekundy na format MM:SS bez zaokrąglania.
 * Używane do edycji, gdzie chcemy zachować precyzję.
 * 
 * @param seconds - Liczba sekund
 * @returns String w formacie MM:SS lub sekundy
 */
export function formatTimeForEdit(seconds: number | undefined): string {
  if (seconds === undefined) {
    return '';
  }
  
  if (seconds < 60) {
    return seconds.toString();
  }
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  // Keep decimal precision for editing
  const secsStr = secs < 10 ? `0${secs}` : secs.toString();
  
  return `${minutes}:${secsStr}`;
}
```

### Modyfikacja: LyricLineEditor.tsx

Zmiany w komponencie:

```typescript
// W komponencie LyricLineEditor

import { parseTimeInput, formatTimeForEdit } from '../utils/timeFormat';

// Zmiana w handleTimeChange:
const handleTimeChange = (text: string) => {
  setTimeText(text);
  
  const result = parseTimeInput(text);
  if (result.success && result.seconds !== undefined) {
    onUpdateTime(line.id, result.seconds);
  }
  // Nie pokazujemy błędu podczas wpisywania, tylko przy blur
};

// Zmiana w useEffect (synchronizacja z parent):
useEffect(() => {
  const nextText = formatTimeForEdit(line.timeSeconds);
  if (timeText !== nextText && !textInputRef.current?.isFocused()) {
    setTimeText(nextText);
  }
}, [line.timeSeconds]);

// Nowa funkcja handleTimeBlur:
const handleTimeBlur = () => {
  const result = parseTimeInput(timeText);
  if (!result.success) {
    // Przywróć ostatnią poprawną wartość
    setTimeText(formatTimeForEdit(line.timeSeconds));
    // Opcjonalnie: pokaż toast z błędem
  }
};
```

### Modyfikacja: SongEditorScreen.tsx

Dodanie pola Duration:

```typescript
// W SongEditorScreen, po polach Title i Artist:

<Text style={styles.label}>Duration (optional)</Text>
<TextInput
  style={styles.input}
  value={durationText}
  onChangeText={handleDurationChange}
  onBlur={handleDurationBlur}
  placeholder="e.g., 3:45 or 225"
  placeholderTextColor="#666666"
/>

{/* Ostrzeżenie jeśli duration < ostatnia linijka */}
{song.durationSeconds !== undefined && 
 song.lines.length > 0 && 
 song.lines[song.lines.length - 1].timeSeconds !== undefined &&
 song.durationSeconds < song.lines[song.lines.length - 1].timeSeconds! && (
  <View style={styles.warningContainer}>
    <Text style={styles.warningText}>
      ⚠️ Duration is shorter than the last line's time
    </Text>
  </View>
)}
```

Stan i handlery:

```typescript
const [durationText, setDurationText] = useState(
  formatTimeForEdit(song.durationSeconds)
);

const handleDurationChange = (text: string) => {
  setDurationText(text);
  
  const result = parseTimeInput(text);
  if (result.success) {
    setSong(prev => ({
      ...prev,
      durationSeconds: result.seconds,
    }));
    setIsDirty(true);
  }
};

const handleDurationBlur = () => {
  const result = parseTimeInput(durationText);
  if (!result.success && durationText.trim()) {
    // Pokaż błąd
    showToast(result.error || 'Invalid time format', 'error');
    // Przywróć ostatnią poprawną wartość
    setDurationText(formatTimeForEdit(song.durationSeconds));
  } else if (!durationText.trim()) {
    // Puste pole = undefined
    setSong(prev => ({
      ...prev,
      durationSeconds: undefined,
    }));
    setIsDirty(true);
  }
};
```

### Modyfikacja: PrompterScreen.tsx

Zatrzymanie przewijania po osiągnięciu duration:

```typescript
// W usePrompterTimer hook:

useEffect(() => {
  if (!isPlaying) return;
  
  const interval = setInterval(() => {
    setCurrentTime(prev => {
      const next = prev + 0.05; // 50ms
      
      // Zatrzymaj jeśli osiągnięto duration
      if (song.durationSeconds !== undefined && next >= song.durationSeconds) {
        setIsPlaying(false);
        return song.durationSeconds;
      }
      
      return next;
    });
  }, 50);
  
  return () => clearInterval(interval);
}, [isPlaying, song.durationSeconds]);
```

### Modyfikacja: validation.ts

Dodanie walidacji duration:

```typescript
export function validateSong(song: Partial<Song>): string[] {
  const errors: string[] = [];
  
  // ... istniejące walidacje ...
  
  // Walidacja duration
  if (song.durationSeconds !== undefined) {
    if (song.durationSeconds < 0) {
      errors.push('Duration cannot be negative');
    }
    
    // Ostrzeżenie (nie błąd) jeśli duration < ostatnia linijka
    if (song.lines && song.lines.length > 0) {
      const lastLine = song.lines[song.lines.length - 1];
      if (lastLine.timeSeconds !== undefined && 
          song.durationSeconds < lastLine.timeSeconds) {
        // To jest ostrzeżenie, nie błąd - nie dodajemy do errors
        console.warn('Duration is shorter than last line time');
      }
    }
  }
  
  return errors;
}
```

## Modele Danych

Brak zmian w modelach - `durationSeconds` już istnieje w `Song`:

```typescript
export interface Song {
  id: string;
  title: string;
  artist?: string;
  durationSeconds?: number;  // ← Już istnieje
  lines: LyricLine[];
  createdAt: number;
  updatedAt: number;
}
```

## Właściwości Poprawności (Correctness Properties)

*Właściwość to charakterystyka lub zachowanie, które powinno być prawdziwe dla wszystkich poprawnych wykonań systemu - zasadniczo formalne stwierdzenie o tym, co system powinien robić. Właściwości służą jako pomost między specyfikacją czytelną dla człowieka a gwarancjami poprawności weryfikowalnymi maszynowo.*

### Property 1: Konwersja MM:SS na sekundy jest poprawna

*Dla dowolnego* poprawnego formatu MM:SS (np. "1:14", "75:30", "1:5"), konwersja na sekundy powinna dać matematycznie poprawny wynik (minuty * 60 + sekundy).

**Validates: Requirements 1.1, 1.3, 3.1, 4.3, 4.4**

### Property 2: Konwersja sekund na format jest poprawna

*Dla dowolnej* liczby sekund, formatowanie powinno zwrócić poprawny format (MM:SS dla >= 60s, sekundy dla < 60s).

**Validates: Requirements 1.5, 3.2**

### Property 3: Round-trip konwersji zachowuje wartość

*Dla dowolnej* poprawnej wartości czasu, parse(format(x)) powinno dać wartość równoważną x (z tolerancją zaokrąglenia do sekundy).

**Validates: Requirements 1.1, 1.5, 5.1**

### Property 4: Parser akceptuje format sekund

*Dla dowolnej* nieujemnej liczby sekund jako string (np. "74", "0", "1000.5"), parser powinien zaakceptować wartość i zwrócić success: true.

**Validates: Requirements 1.2**

### Property 5: Parser odrzuca niepoprawne formaty

*Dla dowolnego* niepoprawnego formatu (np. "1:5:30", "abc", "1:", "-5"), parser powinien zwrócić success: false z komunikatem błędu.

**Validates: Requirements 1.4, 4.1, 4.2**

### Property 6: Duration jest zapisywany poprawnie

*Dla dowolnego* poprawnego formatu czasu wprowadzonego jako duration, wartość powinna być zapisana jako durationSeconds w modelu Song.

**Validates: Requirements 2.2**

### Property 7: Ostrzeżenie gdy duration < ostatnia linijka

*Dla dowolnego* utworu gdzie durationSeconds < timeSeconds ostatniej linijki, system powinien wyświetlić ostrzeżenie (ale pozwolić na zapisanie).

**Validates: Requirements 2.4**

### Property 8: Przewijanie zatrzymuje się przy duration

*Dla dowolnego* utworu z durationSeconds, gdy currentTime osiągnie durationSeconds, przewijanie powinno się zatrzymać i isPlaying powinno być false.

**Validates: Requirements 2.5**

### Property 9: Kompatybilność wsteczna - ładowanie

*Dla dowolnego* utworu z timeSeconds zapisanym jako liczba (stary format), system powinien poprawnie załadować i wyświetlić wartość bez utraty danych.

**Validates: Requirements 5.1, 5.4**

### Property 10: Kompatybilność wsteczna - zapis

*Dla dowolnego* utworu, zapis do storage powinien zachować timeSeconds jako liczby (sekundy) dla kompatybilności wstecznej.

**Validates: Requirements 5.3, 5.5**

## Obsługa Błędów

### Strategie Obsługi Błędów

#### 1. Błędy Parsowania

```typescript
const result = parseTimeInput(input);
if (!result.success) {
  // Podczas wpisywania: nie pokazuj błędu
  // Przy blur: pokaż toast i przywróć ostatnią poprawną wartość
  showToast(result.error, 'error');
  setTimeText(formatTimeForEdit(lastValidTime));
}
```

#### 2. Ostrzeżenia Walidacji

```typescript
// Duration < ostatnia linijka: ostrzeżenie, nie błąd
if (song.durationSeconds < lastLineTime) {
  // Wyświetl ostrzeżenie w UI
  <Text style={styles.warning}>
    ⚠️ Duration is shorter than the last line's time
  </Text>
  // Ale pozwól na zapisanie
}
```

#### 3. Kompatybilność Wsteczna

```typescript
// Stare dane bez durationSeconds
if (song.durationSeconds === undefined) {
  // Działaj normalnie, nie pokazuj błędu
  // Pole duration pozostaje puste
}
```

## Strategia Testowania

### Testy Jednostkowe

**timeFormat.ts:**
- Parsowanie różnych formatów MM:SS
- Parsowanie sekund
- Formatowanie do wyświetlenia
- Formatowanie do edycji
- Edge cases: pojedyncze cyfry, duże wartości, części dziesiętne

**validation.ts:**
- Walidacja duration (ujemne wartości)
- Ostrzeżenie gdy duration < ostatnia linijka

### Testy Property-Based

Używamy biblioteki `fast-check` (już używana w projekcie).

**Property 1-5: Konwersja i parsowanie**
- Generuj losowe czasy w różnych formatach
- Sprawdź poprawność konwersji
- Sprawdź round-trip
- Sprawdź odrzucanie niepoprawnych formatów

**Property 6-8: Duration**
- Generuj losowe utwory z duration
- Sprawdź zapis
- Sprawdź ostrzeżenia
- Sprawdź zatrzymanie przewijania

**Property 9-10: Kompatybilność**
- Generuj losowe utwory w starym formacie
- Sprawdź ładowanie
- Sprawdź zapis

### Testy Integracyjne

**SongEditorScreen:**
- Wprowadzanie czasu w formacie MM:SS
- Wprowadzanie duration
- Wyświetlanie ostrzeżeń
- Zachowanie wartości przy przełączaniu pól

**PrompterScreen:**
- Zatrzymanie przewijania przy duration
- Zachowanie bez duration (undefined)

## Migracja Danych

**Nie wymagana** - istniejące dane są kompatybilne:
- `timeSeconds` jako liczba działa bez zmian
- `durationSeconds` jako undefined działa bez zmian
- Nowy kod obsługuje oba przypadki

## Harmonogram Implementacji

1. **Faza 1: Utilities** (1-2h)
   - Implementacja `timeFormat.ts`
   - Testy jednostkowe i property-based

2. **Faza 2: Komponenty** (2-3h)
   - Modyfikacja `LyricLineEditor.tsx`
   - Modyfikacja `SongEditorScreen.tsx`
   - Testy komponentów

3. **Faza 3: Prompter** (1h)
   - Modyfikacja `PrompterScreen.tsx`
   - Testy zatrzymania przewijania

4. **Faza 4: Walidacja i Testy** (1-2h)
   - Modyfikacja `validation.ts`
   - Testy integracyjne
   - Testy kompatybilności wstecznej

**Całkowity czas: 5-8 godzin**

## Alternatywy Rozważone

### 1. Format HH:MM:SS

**Odrzucone** - Zbyt skomplikowane dla typowych utworów (3-5 minut). Format MM:SS jest wystarczający i prostszy.

### 2. Osobne pola dla minut i sekund

**Odrzucone** - Mniej intuicyjne niż jedno pole z elastycznym parserem. Użytkownik musi przełączać się między polami.

### 3. Slider do ustawiania czasu

**Odrzucone** - Mniej precyzyjny niż wpisywanie. Trudny do użycia dla dużych wartości.

### 4. Automatyczne wykrywanie duration z ostatniej linijki

**Odrzucone** - Nie zawsze ostatnia linijka to koniec utworu (może być outro instrumentalne). Lepiej dać użytkownikowi kontrolę.

## Ryzyka i Ograniczenia

### Ryzyka

1. **Zmiana UX** - Użytkownicy przyzwyczajeni do sekund mogą być zdezorientowani
   - **Mitigacja**: Akceptuj oba formaty, pokaż przykłady w placeholder

2. **Błędy parsowania** - Użytkownicy mogą wpisać nieoczekiwane formaty
   - **Mitigacja**: Jasne komunikaty błędów, przywracanie ostatniej poprawnej wartości

3. **Kompatybilność** - Stare dane mogą nie działać
   - **Mitigacja**: Testy kompatybilności wstecznej, brak wymaganej migracji

### Ograniczenia

1. **Brak wsparcia dla HH:MM:SS** - Utwory > 99 minut wymagają formatu sekund
2. **Zaokrąglanie przy wyświetlaniu** - Części dziesiętne są ukryte (ale zachowane w danych)
3. **Brak automatycznego duration** - Użytkownik musi ręcznie wprowadzić

## Metryki Sukcesu

1. **Funkcjonalność**
   - ✅ Parser akceptuje oba formaty (MM:SS i sekundy)
   - ✅ Konwersja jest matematycznie poprawna
   - ✅ Duration zatrzymuje przewijanie
   - ✅ Stare dane działają bez zmian

2. **Jakość Kodu**
   - ✅ 100% pokrycie testami dla `timeFormat.ts`
   - ✅ Property-based testy dla konwersji
   - ✅ Testy kompatybilności wstecznej

3. **UX**
   - ✅ Jasne komunikaty błędów
   - ✅ Natychmiastowa walidacja
   - ✅ Zachowanie wartości przy przełączaniu pól
