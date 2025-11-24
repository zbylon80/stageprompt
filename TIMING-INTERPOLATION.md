# Interpolacja Czasów dla Linii Tekstu

## Przegląd

System interpolacji czasów pozwala na efektywne ustawianie czasów dla linii tekstu piosenki poprzez:
- Ustawianie kluczowych punktów czasowych (kotwic)
- Automatyczne obliczanie czasów dla linii pomiędzy kotwicami
- Możliwość zapisywania wersji roboczych z częściowo ustawionymi czasami

## Kluczowe Koncepcje

### Kotwice (Anchor Points)
Kotwice to linie, dla których użytkownik ręcznie ustawił czas. System automatycznie interpoluje czasy dla linii między kotwicami.

### Undefined vs 0
- `undefined` - czas nie został jeszcze ustawiony (domyślnie dla nowych linii)
- `> 0` - czas został ustawiony przez użytkownika lub interpolację

## Workflow Użytkownika

### 1. Dodawanie Tekstu
```
Dodaj tekst piosenki → wszystkie linie mają timeSeconds: undefined
```

### 2. Ustawianie Kotwic
```
Linia 1: ustaw 8s (kotwica)
Linia 6: ustaw 25s (kotwica)
Pozostałe: undefined
```

### 3. Interpolacja
```
Kliknij "⚡ Interpolate"
→ Linie 2-5 dostaną równomiernie rozłożone czasy między 8s a 25s
→ Pozostałe linie (7+) pozostają undefined
```

### 4. Zapisywanie
```
Możesz zapisać piosenkę w każdym momencie
- Nie musisz ustawiać czasów dla wszystkich linii
- Walidacja pozwala na undefined
```

## Funkcje UI

### Przyciski (Sticky Top Bar)
Przyciski są zawsze widoczne na górze ekranu podczas scrollowania:

- **Save** - zapisuje piosenkę (działa nawet z undefined czasami)
- **🔄 Reset Times** - resetuje wszystkie czasy do undefined
- **⚡ Interpolate** - interpoluje czasy między kotwicami
- **▶ Preview** - podgląd w prompterze
- **Delete** - usuwa piosenkę

### Reset Times
- Pokazuje dialog potwierdzenia (ConfirmDialog)
- Resetuje wszystkie czasy do `undefined`
- Pozwala zacząć od nowa z ustawianiem czasów

### Interpolate
- Wymaga minimum 2 kotwic (linii z ustawionym czasem > 0)
- Oblicza czasy dla linii między kotwicami
- Nie modyfikuje linii po ostatniej kotwicy (pozostają undefined)
- Interpoluje również linie przed pierwszą kotwicą

## Implementacja Techniczna

### Typy

```typescript
export interface LyricLine {
  id: string;
  text: string;
  timeSeconds?: number;  // Opcjonalne - undefined = nie ustawione
  section?: SongSection;
}
```

### Funkcje Kluczowe

#### `findAnchorPoints(lines: LyricLine[]): number[]`
Znajduje indeksy linii, które są kotwicami (mają ustawiony czas > 0).

```typescript
// Zwraca indeksy linii z timeSeconds !== undefined && timeSeconds > 0
```

#### `interpolateAnchorTimes(lines: LyricLine[], anchorIndices: number[]): LyricLine[]`
Interpoluje czasy między kotwicami.

**Algorytm:**
1. Dla każdej pary kotwic (start, end):
   - Oblicz liczbę linii między nimi
   - Rozłóż czasy równomiernie
2. Dla linii przed pierwszą kotwicą:
   - Oblicz czas na linię: `firstAnchorTime / (firstAnchorIndex + 1)`
   - Przypisz czasy proporcjonalnie
3. Linie po ostatniej kotwicy:
   - Pozostają bez zmian (undefined)

### Walidacja

```typescript
// Walidacja pozwala na undefined
if (line.timeSeconds !== undefined && line.timeSeconds < 0) {
  errors.push('Time cannot be negative');
}

// Sprawdza kolejność tylko dla linii z ustawionym czasem
if (prevTime !== undefined && currentTime !== undefined && 
    currentTime < prevTime) {
  errors.push('Time must be greater than previous line');
}
```

## Przykład Użycia

### Scenariusz: Piosenka z 10 liniami

**Krok 1: Dodanie tekstu**
```
Linia 1: "Verse 1 line 1" - undefined
Linia 2: "Verse 1 line 2" - undefined
...
Linia 10: "Chorus line 3" - undefined
```

**Krok 2: Ustawienie kotwic**
```
Linia 1: "Verse 1 line 1" - 10s (kotwica)
Linia 5: "Verse 2 line 1" - 30s (kotwica)
Linia 10: "Chorus line 3" - 60s (kotwica)
```

**Krok 3: Interpolacja**
```
Linia 1: 10s (kotwica)
Linia 2: 15s (interpolowane)
Linia 3: 20s (interpolowane)
Linia 4: 25s (interpolowane)
Linia 5: 30s (kotwica)
Linia 6: 37.5s (interpolowane)
Linia 7: 45s (interpolowane)
Linia 8: 52.5s (interpolowane)
Linia 9: 56.25s (interpolowane)
Linia 10: 60s (kotwica)
```

## Pliki Zmodyfikowane

### Typy
- `src/types/models.ts` - `timeSeconds` jest opcjonalne

### Komponenty
- `src/screens/SongEditorScreen.tsx` - UI i logika interpolacji
- `src/components/LyricLineEditor.tsx` - obsługa undefined czasów

### Utilities
- `src/utils/anchorBasedTiming.ts` - algorytm interpolacji
- `src/utils/validation.ts` - walidacja z undefined

### Style
- Sticky top bar dla przycisków (position: sticky, top: 0, zIndex: 100)

## Korzyści

1. **Szybsze ustawianie czasów** - wystarczy kilka kotwic zamiast wszystkich linii
2. **Wersje robocze** - możliwość zapisywania bez pełnych czasów
3. **Elastyczność** - można dodawać kotwice stopniowo
4. **Intuicyjność** - prosty workflow: kotwice → interpolacja → zapisz
5. **Sticky UI** - przyciski zawsze dostępne podczas scrollowania

## Przyszłe Ulepszenia

- [ ] Wizualne oznaczenie kotwic w UI
- [ ] Możliwość usunięcia pojedynczej kotwicy
- [ ] Podgląd interpolacji przed zatwierdzeniem
- [ ] Eksport/import kotwic
- [ ] Automatyczne wykrywanie kotwic z audio
