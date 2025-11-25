# Plan Implementacji - Format Wprowadzania Czasu

- [ ] 1. Implementacja modułu konwersji czasu
  - Stwórz `src/utils/timeFormat.ts` z funkcjami parsowania i formatowania
  - Zaimplementuj `parseTimeInput()` - parser akceptujący MM:SS i sekundy
  - Zaimplementuj `formatTimeDisplay()` - formatowanie do wyświetlenia
  - Zaimplementuj `formatTimeForEdit()` - formatowanie do edycji
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 3.1, 3.2_

- [ ]* 1.1 Napisz testy property-based dla konwersji czasu
  - **Property 1: Konwersja MM:SS na sekundy jest poprawna**
  - **Property 3: Round-trip konwersji zachowuje wartość**
  - **Property 4: Parser akceptuje format sekund**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 5.1**

- [ ]* 1.2 Napisz testy property-based dla walidacji
  - **Property 5: Parser odrzuca niepoprawne formaty**
  - **Validates: Requirements 1.4, 4.1, 4.2**

- [ ] 2. Modyfikacja komponentu LyricLineEditor
  - Zaimportuj funkcje z `timeFormat.ts`
  - Zmień `handleTimeChange` aby używać `parseTimeInput()`
  - Zmień `useEffect` aby używać `formatTimeForEdit()`
  - Dodaj `handleTimeBlur` do przywracania poprawnej wartości przy błędzie
  - Zaktualizuj placeholder w polu czasu na "e.g., 1:14 or 74"
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 4.5_

- [ ]* 2.1 Napisz testy jednostkowe dla LyricLineEditor
  - Test wprowadzania czasu w formacie MM:SS
  - Test wprowadzania czasu w formacie sekund
  - Test przywracania wartości przy błędzie (blur)
  - _Requirements: 1.1, 1.2, 4.5_

- [ ] 3. Dodanie pola Duration w SongEditorScreen
  - Dodaj stan `durationText` i handlery `handleDurationChange`, `handleDurationBlur`
  - Dodaj pole TextInput dla duration po polu Artist
  - Dodaj komponent ostrzeżenia gdy duration < ostatnia linijka
  - Zaktualizuj placeholder na "e.g., 3:45 or 225"
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 3.1 Napisz testy property-based dla duration
  - **Property 6: Duration jest zapisywany poprawnie**
  - **Property 7: Ostrzeżenie gdy duration < ostatnia linijka**
  - **Validates: Requirements 2.2, 2.4**

- [ ]* 3.2 Napisz testy jednostkowe dla pola duration
  - Test wprowadzania duration w formacie MM:SS
  - Test wprowadzania duration w formacie sekund
  - Test pustego pola (undefined)
  - Test wyświetlania ostrzeżenia
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Modyfikacja PrompterScreen - zatrzymanie przy duration
  - Zmień `usePrompterTimer` aby sprawdzać `song.durationSeconds`
  - Zatrzymaj timer gdy `currentTime >= durationSeconds`
  - Ustaw `isPlaying = false` przy osiągnięciu duration
  - _Requirements: 2.5_

- [ ]* 4.1 Napisz testy property-based dla zatrzymania przewijania
  - **Property 8: Przewijanie zatrzymuje się przy duration**
  - **Validates: Requirements 2.5**

- [ ]* 4.2 Napisz testy jednostkowe dla PrompterScreen
  - Test zatrzymania przy duration
  - Test działania bez duration (undefined)
  - _Requirements: 2.5_

- [ ] 5. Aktualizacja walidacji w validation.ts
  - Dodaj walidację `durationSeconds` (odrzuć ujemne wartości)
  - Dodaj ostrzeżenie (console.warn) gdy duration < ostatnia linijka
  - Nie dodawaj ostrzeżenia do tablicy errors (to nie jest błąd blokujący)
  - _Requirements: 2.4, 4.2_

- [ ]* 5.1 Napisz testy jednostkowe dla walidacji
  - Test walidacji ujemnego duration
  - Test ostrzeżenia gdy duration < ostatnia linijka
  - _Requirements: 2.4, 4.2_

- [ ] 6. Testy kompatybilności wstecznej
  - Stwórz testowe dane w starym formacie (timeSeconds jako liczby)
  - Sprawdź ładowanie starych danych
  - Sprawdź zapis danych (powinien zachować format sekund)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 6.1 Napisz testy property-based dla kompatybilności
  - **Property 9: Kompatybilność wsteczna - ładowanie**
  - **Property 10: Kompatybilność wsteczna - zapis**
  - **Validates: Requirements 5.1, 5.3, 5.4, 5.5**

- [ ] 7. Checkpoint - Upewnij się że wszystkie testy przechodzą
  - Uruchom wszystkie testy jednostkowe
  - Uruchom wszystkie testy property-based
  - Sprawdź czy nie ma regresji w istniejącej funkcjonalności
  - Zapytaj użytkownika jeśli pojawią się pytania

- [ ] 8. Testy manualne i dokumentacja
  - Przetestuj wprowadzanie czasu w różnych formatach
  - Przetestuj pole duration
  - Przetestuj zatrzymanie przewijania
  - Przetestuj kompatybilność ze starymi danymi
  - Zaktualizuj dokumentację jeśli potrzebne
  - _Requirements: wszystkie_
