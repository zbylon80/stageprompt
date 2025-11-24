# Section-Based Timing Feature

## Przegląd

Zaimplementowano uproszczony system wprowadzania czasów dla linijek tekstu w utworach. Zamiast wymagać czasu dla każdej linijki osobno, użytkownik określa tylko:

1. **Czas rozpoczęcia sekcji** (startTime)
2. **Czas zakończenia sekcji** (endTime)

System automatycznie interpoluje czasy dla wszystkich linijek w sekcji, rozdzielając je równomiernie.

## Przykład Użycia

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

## Zmiany w Kodzie

### 1. Model Danych (`src/types/models.ts`)

Dodano opcjonalne pola `startTime` i `endTime` do interfejsu `SongSection`:

```typescript
export interface SongSection {
  type: SectionType;
  label?: string;
  number?: number;
  startTime?: number;  // NOWE: Czas rozpoczęcia sekcji w sekundach
  endTime?: number;    // NOWE: Czas zakończenia sekcji w sekundach
}
```

### 2. Utility do Interpolacji Czasów (`src/utils/timingInterpolation.ts`)

Nowy moduł zawierający:

- `calculateLineTimes(lines: LyricLine[]): LyricLine[]` - Główna funkcja obliczająca czasy dla wszystkich linijek
- `interpolateSectionTimes()` - Funkcja pomocnicza interpolująca czasy w ramach jednej sekcji
- `isFirstLineOfSection()` - Sprawdza czy linijka jest pierwszą w sekcji

**Algorytm:**
1. Grupuje linijki według sekcji
2. Dla każdej sekcji z `startTime` i `endTime`:
   - Oblicza równomierne odstępy czasowe
   - Przypisuje czasy do linijek: `time = startTime + (endTime - startTime) * (index / (count - 1))`
3. Linijki bez sekcji lub bez timing zachowują swoje `timeSeconds`

### 3. Walidacja (`src/utils/validation.ts`)

Rozszerzono walidację sekcji o:
- Sprawdzanie poprawności `startTime` (>= 0)
- Sprawdzanie poprawności `endTime` (>= 0)
- Sprawdzanie że `endTime >= startTime`

### 4. UI - SectionPicker (`src/components/SectionPicker.tsx`)

Dodano pola do wprowadzania czasów:
- Input "Start Time" (format MM:SS)
- Input "End Time" (format MM:SS)
- Funkcje pomocnicze `formatTime()` i `parseTime()` do konwersji MM:SS ↔ sekundy

### 5. Testy (`src/utils/__tests__/timingInterpolation.test.ts`)

Kompleksowe testy jednostkowe pokrywające:
- Interpolację dla pojedynczej sekcji z wieloma linijkami
- Obsługę pojedynczej linijki w sekcji
- Obsługę wielu sekcji
- Zachowanie explicit `timeSeconds` gdy brak timing w sekcji
- Linijki bez sekcji
- Mieszane sekcje (niektóre z timing, inne bez)
- Funkcję `isFirstLineOfSection()`

## Kompatybilność Wsteczna

System jest w pełni kompatybilny wstecz:

1. **Stare utwory** (bez sekcji) - działają bez zmian
2. **Utwory z sekcjami bez timing** - używają explicit `timeSeconds` dla każdej linijki
3. **Nowe utwory z section timing** - używają automatycznej interpolacji
4. **Mieszane podejście** - niektóre sekcje mogą mieć timing, inne nie

## Korzyści

1. **Szybsze wprowadzanie danych** - zamiast N pól czasu, tylko 2 pola na sekcję
2. **Mniej błędów** - automatyczna interpolacja zapewnia równomierne rozłożenie
3. **Łatwiejsze dostosowania** - zmiana czasu sekcji automatycznie aktualizuje wszystkie linijki
4. **Elastyczność** - można nadal używać explicit timing dla poszczególnych linijek jeśli potrzeba

## Dokumentacja

Zaktualizowano następujące dokumenty:
- `.kiro/specs/teleprompter-app/design.md` - dodano sekcję o section-based timing
- `.kiro/specs/song-sections/design.md` - rozszerzono o timing interpolation

## Integracja z SongEditorScreen

### Automatyczne Przeliczanie Czasów

Dodano `useEffect` w `SongEditorScreen.tsx` który:
1. Monitoruje zmiany w `startTime` i `endTime` sekcji
2. Automatycznie wywołuje `calculateLineTimes()` gdy sekcja ma timing
3. Aktualizuje `timeSeconds` dla wszystkich linijek w sekcji
4. Unika nieskończonej pętli przez sprawdzanie czy czasy rzeczywiście się zmieniły

### Propagacja Timing do Sekcji

Rozszerzono funkcję `updateLineSection()` aby:
1. Gdy użytkownik ustawia sekcję z `startTime`/`endTime` na pierwszej linijce
2. System automatycznie propaguje te wartości do wszystkich linijek w tej samej sekcji
3. Sprawdza czy linijki należą do tej samej sekcji (ten sam type, number, label)
4. Aktualizuje timing dla wszystkich linijek w sekcji

### Przepływ Danych

```
Użytkownik ustawia Start: 0:10, End: 0:30 w SectionPicker
    ↓
SectionPicker zwraca section z startTime=10, endTime=30
    ↓
updateLineSection() propaguje timing do wszystkich linijek w sekcji
    ↓
useEffect wykrywa zmianę w section timing
    ↓
calculateLineTimes() przelicza timeSeconds dla wszystkich linijek
    ↓
Auto-save zapisuje utwór z nowymi czasami
```

## Nowa Funkcjonalność: Anchor-Based Interpolation

### Przegląd

Oprócz section-based timing, dodano system **anchor-based interpolation** który pozwala na:
- Ustawianie pojedynczych kotwic (anchor points) dla wybranych linii
- Automatyczną interpolację czasów między kotwicami
- Zapisywanie wersji roboczych z częściowo ustawionymi czasami

### Szczegóły

Zobacz [TIMING-INTERPOLATION.md](./TIMING-INTERPOLATION.md) dla pełnej dokumentacji.

### Kluczowe Różnice

| Feature | Section-Based | Anchor-Based |
|---------|--------------|--------------|
| Granularność | Cała sekcja | Pojedyncze linie |
| Workflow | Ustaw sekcję → auto-interpolacja | Ustaw kotwice → kliknij Interpolate |
| Użycie | Strukturalne sekcje (verse, chorus) | Precyzyjne timowanie |
| Zapisywanie | Wymaga pełnych sekcji | Pozwala na undefined |

### Integracja

Oba systemy działają razem:
1. **Section-based** - dla strukturalnego podziału utworu
2. **Anchor-based** - dla precyzyjnego timowania linii

## Status Testów

✅ Wszystkie testy przechodzą (141 passed)
✅ Nowe testy dla timing interpolation (12 testów)
✅ Brak regresji w istniejących testach
✅ Integracja z SongEditorScreen działa poprawnie
✅ Anchor-based interpolation zaimplementowana i przetestowana
