# Plan Implementacji - StagePrompt

- [x] 1. Inicjalizacja projektu i konfiguracja





  - Utworzenie projektu Expo z TypeScript template
  - Instalacja zależności (React Navigation, Reanimated, AsyncStorage)
  - Konfiguracja struktury katalogów (src/, types/, screens/, services/, etc.)
  - Setup Jest i fast-check dla testowania
  - _Requirements: 11.1, 11.5_

- [x] 2. Implementacja modeli danych i typów TypeScript





  - Utworzenie types/models.ts z interfejsami (LyricLine, Song, Setlist, AppSettings, KeyMapping)
  - Utworzenie utils/idGenerator.ts dla generowania unikalnych ID
  - Utworzenie utils/validation.ts z funkcjami walidacji
  - _Requirements: 2.3, 2.5_

- [x] 2.1 Napisanie testów property dla walidacji


  - **Property 29: Walidacja odrzuca niepoprawne dane importu**
  - **Validates: Requirements 12.2, 12.4**

- [x] 3. Implementacja storage service





  - Utworzenie services/storageService.ts z interfejsem StorageService
  - Implementacja metod save/load/delete dla Songs
  - Implementacja metod save/load/delete dla Setlists
  - Implementacja metod save/load dla Settings i KeyMapping
  - Obsługa błędów storage z user-friendly komunikatami
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 3.1 Napisanie testów property dla persystencji utworów


  - **Property 22: Round-trip persystencji utworu**
  - **Validates: Requirements 10.1, 10.3**

- [x] 3.2 Napisanie testów property dla persystencji setlist


  - **Property 23: Round-trip persystencji setlisty**
  - **Validates: Requirements 10.2, 10.3**

- [x] 3.3 Napisanie testów property dla błędów storage


  - **Property 24: Błąd storage nie zmienia stanu w pamięci**
  - **Validates: Requirements 10.4**

- [x] 3.4 Napisanie testów property dla usuwania danych


  - **Property 25: Usunięcie usuwa dane ze storage**
  - **Validates: Requirements 10.5**

- [x] 4. Implementacja custom hooks dla zarządzania danymi





  - Utworzenie hooks/useSongs.ts (load, save, delete songs)
  - Utworzenie hooks/useSetlists.ts (load, save, delete setlists)
  - Utworzenie hooks/useSettings.ts (load, save settings)
  - Utworzenie hooks/useKeyMapping.ts (load, save key mappings)
  - _Requirements: 1.1, 4.1, 9.5, 8.3, 8.5_

- [x] 5. Implementacja algorytmu przewijania





  - Utworzenie services/scrollAlgorithm.ts
  - Implementacja funkcji calculateScrollY z interpolacją liniową
  - Obsługa przypadków brzegowych (przed pierwszą linijką, po ostatniej)
  - _Requirements: 5.2, 5.4, 5.5, 5.6_

- [x] 5.1 Napisanie testów property dla algorytmu przewijania


  - **Property 10: Algorytm przewijania - interpolacja liniowa**
  - **Validates: Requirements 5.6**

- [x] 6. Implementacja ekranu listy setlist jako głównego widoku (SetlistListScreen)





  - Utworzenie screens/SetlistListScreen.tsx
  - Utworzenie components/SetlistListItem.tsx
  - Implementacja FlatList z wyświetlaniem setlist (nazwa, liczba utworów)
  - Implementacja FAB dla tworzenia nowej setlisty
  - Implementacja przycisku dostępu do panelu utworów
  - Implementacja empty state (komunikat gdy brak setlist)
  - Nawigacja do edytora setlisty po kliknięciu
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6.1 Napisanie testów property dla wyświetlania listy setlist


  - **Property 1: Lista setlist wyświetla wszystkie zapisane setlisty**
  - **Validates: Requirements 1.1**

- [x] 6.2 Napisanie testów property dla nawigacji do edytora setlisty


  - **Property 2: Nawigacja do edytora setlisty przekazuje poprawną setlistę**
  - **Validates: Requirements 1.2**

- [x] 6.3 Napisanie testu unit dla empty state


  - Test przypadku brzegowego: pusta lista setlist
  - _Requirements: 1.4_

- [x] 6.4 Implementacja ekranu listy utworów jako panelu (SongListScreen)





  - Utworzenie screens/SongListScreen.tsx
  - Utworzenie components/SongListItem.tsx
  - Implementacja FlatList z wyświetlaniem utworów (tytuł, artysta)
  - Implementacja FAB dla tworzenia nowego utworu
  - Implementacja empty state (komunikat gdy brak utworów)
  - Nawigacja do edytora po kliknięciu utworu
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6.5 Napisanie testów property dla panelu utworów





  - **Property 3: Panel utworów wyświetla wszystkie utwory**
  - **Property 3a: Nawigacja z panelu utworów do edytora**
  - **Validates: Requirements 2.1, 2.2**

- [x] 7. Implementacja ekranu edytora utworu (SongEditorScreen)





  - Utworzenie screens/SongEditorScreen.tsx
  - Utworzenie components/LyricLineEditor.tsx
  - Implementacja pól edycji tytułu i wykonawcy
  - Implementacja FlatList z edycją linijek tekstu
  - Implementacja dodawania nowych linijek
  - Implementacja usuwania linijek
  - Implementacja ręcznej edycji czasów dla linijek
  - Auto-save przy każdej zmianie
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7.1 Napisanie testów property dla dodawania linijek


  - **Property 3: Dodawanie linijki zwiększa liczbę linijek**
  - **Validates: Requirements 2.3**

- [x] 7.2 Napisanie testów property dla usuwania linijek

  - **Property 4: Usuwanie linijki zmniejsza liczbę linijek**
  - **Validates: Requirements 2.4**

- [x] 7.3 Napisanie testów property dla modyfikacji metadanych

  - **Property 5: Modyfikacja metadanych aktualizuje utwór**
  - **Validates: Requirements 2.2**

- [x] 7.4 Dopracowanie nawigacji i scrollowania w edytorze





  - Implementacja KeyboardAvoidingView dla uniknięcia zakrywania inputów przez klawiaturę
  - Automatyczne scrollowanie do nowo dodanej linijki
  - Automatyczne fokusowanie na nowej linijce po dodaniu
  - Obsługa scrollowania przy długich listach linijek (>10 linijek)
  - Testowanie na web (scroll z myszą/klawiaturą) i mobile (touch scroll)
  - Zapewnienie że wszystkie inputy są dostępne niezależnie od liczby linijek
  - _Requirements: 2.3, 2.4_

- [x] 8. Konfiguracja MCP Playwright dla testów E2E





  - Utworzenie .kiro/settings/mcp.json z konfiguracją MCP Playwright server
  - Konfiguracja auto-approve dla podstawowych narzędzi Playwright
  - Ustawienie zmiennej środowiskowej PLAYWRIGHT_BROWSER=chromium
  - Utworzenie katalogu e2e/ dla dokumentacji testów
  - Utworzenie e2e/test-cases/ dla test case'ów w formacie markdown
  - Utworzenie e2e/screenshots/ dla screenshotów z testów
  - Dodanie instrukcji testowania do e2e/README.md
  - _Requirements: 11.1, 11.2_

- [x]* 8.1 Napisanie test case'ów E2E dla listy utworów (MCP Playwright)


  - Utworzenie e2e/test-cases/TC-001-song-list-empty.md
  - Utworzenie e2e/test-cases/TC-002-song-creation-basic.md
  - Wykonanie testów manualnie przez MCP tools w Kiro IDE
  - Zapisanie screenshotów: empty-state.png, song-list-with-items.png
  - Weryfikacja nawigacji do edytora
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

- [x] 9. Checkpoint - Upewnij się że wszystkie testy przechodzą





  - Ensure all tests pass, ask the user if questions arise.

- [x]* 10. Napisanie test case'ów E2E dla edytora utworu (MCP Playwright)





  - Utworzenie e2e/test-cases/TC-003-song-editor-metadata.md
  - Utworzenie e2e/test-cases/TC-004-song-editor-lyrics.md
  - Utworzenie e2e/test-cases/TC-005-song-editor-timing.md
  - Testowanie dodawania/usuwania linijek przez MCP
  - Testowanie edycji metadanych (tytuł, wykonawca)
  - Screenshots: editor-empty.png, editor-with-lyrics.png
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [x]* 11. Checkpoint - Weryfikacja testów E2E dla utworów





  - Przejście przez test case'y TC-001 do TC-005
  - Wykonanie każdego test case'a manualnie przez MCP Playwright
  - Weryfikacja że wszystkie funkcje działają zgodnie z wymaganiami
  - Fix błędów wykrytych podczas testowania
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implementacja edytora setlisty z panelem utworów





  - Utworzenie screens/SetlistEditorScreen.tsx z split view layout
  - Implementacja edycji nazwy setlisty
  - Implementacja wyświetlania utworów w setliście (lewa strona)
  - Implementacja panelu wszystkich utworów (prawa strona)
  - Instalacja i konfiguracja react-native-draggable-flatlist
  - Implementacja drag & drop utworów z panelu do setlisty
  - Implementacja drag & drop dla zmiany kolejności w setliście
  - Implementacja usuwania utworów z setlisty
  - Implementacja usuwania całej setlisty
  - Implementacja nawigacji do edytora utworu z panelu
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 12.1 Napisanie testów property dla przeciągania utworów


  - **Property 6: Przeciągnięcie utworu dodaje go do setlisty**
  - **Validates: Requirements 3.2**

- [x] 12.2 Napisanie testów property dla zmiany kolejności


  - **Property 7: Zmiana kolejności aktualizuje songIds**
  - **Validates: Requirements 3.3**

- [x] 12.3 Napisanie testów property dla usuwania z setlisty


  - **Property 8: Usunięcie utworu z setlisty nie usuwa utworu**
  - **Validates: Requirements 3.4**

- [x] 12.4 Napisanie testów property dla usuwania setlisty


  - **Property 9: Usunięcie setlisty nie wpływa na utwory**
  - **Validates: Requirements 3.5**

- [x] 12.6 Napisanie testów property dla usuwania utworu ze wszystkich setlist





  - **Property 3b: Usunięcie utworu usuwa go ze wszystkich setlist**
  - **Validates: Requirements 2.5**

- [x]* 12.5 Napisanie test case'ów E2E dla setlist (MCP Playwright)

  - Utworzenie e2e/test-cases/TC-006-setlist-creation.md
  - Utworzenie e2e/test-cases/TC-007-setlist-management.md
  - Utworzenie e2e/test-cases/TC-008-setlist-reorder.md
  - Testowanie drag & drop przez MCP
  - Screenshots: setlist-empty.png, setlist-with-songs.png
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ]* 13. Checkpoint - Weryfikacja testów E2E dla setlist
  - Przejście przez test case'y TC-006 do TC-008
  - Weryfikacja drag & drop functionality
  - Fix błędów wykrytych podczas testowania
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implementacja ekranu promptera - podstawy





  - Utworzenie screens/PrompterScreen.tsx
  - Implementacja fullscreen mode
  - Implementacja wyświetlania tekstu (duża czcionka, ciemne tło)
  - Implementacja FlatList z linijkami tekstu
  - Zastosowanie ustawień wyglądu (fontSize, colors, margins)
  - Dodanie przycisków nawigacji i wyjścia
  - Dodanie wyszukiwania i sortowania list utworów
  - _Requirements: 4.1_

- [x] 14.1. Rozszerzenie modelu danych o sekcje utworów





  - Dodanie typu `SectionType` i interfejsu `SongSection` do `types/models.ts`
  - Dodanie opcjonalnego pola `section` do interfejsu `LyricLine`
  - Zapewnienie kompatybilności wstecznej z istniejącymi utworami
  - _Feature: Song Sections_

- [x] 14.2. Utworzenie utilities dla sekcji





  - Utworzenie `utils/sectionLabels.ts`
  - Implementacja `getSectionLabel()` - zwraca etykietę dla sekcji
  - Implementacja `getNextVerseNumber()` - oblicza następny numer zwrotki
  - Implementacja `SECTION_COLORS` - mapowanie kolorów dla typów sekcji
  - Dodanie `validateSection()` do `utils/validation.ts`
  - _Feature: Song Sections_

- [x] 14.3. Komponent SectionMarker





  - Utworzenie `components/SectionMarker.tsx`
  - Implementacja wyświetlania kolorowego badge'a z etykietą
  - Wsparcie dla różnych rozmiarów (small, medium, large)
  - Opcjonalna funkcja `onEdit` dla trybu edycji
  - _Feature: Song Sections_

- [x] 14.4. Komponent SectionPicker




  - Utworzenie `components/SectionPicker.tsx`
  - Implementacja dropdown z typami sekcji (Verse, Chorus, Bridge, Intro, Outro, Instrumental, Custom)
  - Automatyczna numeracja dla zwrotek
  - Input dla niestandardowych etykiet (Custom)
  - Opcja usunięcia sekcji
  - _Feature: Song Sections_

- [x] 14.5. Integracja sekcji z LyricLineEditor





  - Dodanie przycisku "+ Section" lub ikony 🏷️ do `components/LyricLineEditor.tsx`
  - Wyświetlanie `SectionMarker` gdy linijka ma sekcję
  - Integracja z `SectionPicker` do dodawania/edycji sekcji
  - Obsługa usuwania sekcji
  - _Feature: Song Sections_

- [x] 14.6. Aktualizacja SongEditorScreen dla sekcji





  - Przekazywanie informacji o sekcjach do `LyricLineEditor`
  - Obsługa zapisywania sekcji wraz z utworem
  - Obliczanie `nextVerseNumber` dla nowych zwrotek
  - Aktualizacja `storageService.ts` do obsługi opcjonalnego pola `section`
  - _Feature: Song Sections_

- [x] 14.7. Integracja sekcji z PrompterScreen




  - Modyfikacja `renderLine` do wyświetlania znaczników sekcji
  - Wyświetlanie `SectionMarker` tylko przy pierwszej linijce sekcji
  - Zastosowanie ustawień wyglądu do znaczników
  - Stylowanie znaczników w prompterze (duża czcionka, wyraźne kolory)
  - _Feature: Song Sections_

- [x] 14.8. Eksport i import sekcji




  - Upewnienie się że `exportImportService.ts` zachowuje sekcje
  - Walidacja sekcji podczas importu
  - Obsługa błędnych danych sekcji (ignorowanie, nie blokowanie importu)
  - Testowanie round-trip z sekcjami
  - _Feature: Song Sections_

- [ ]* 14.9. Testy dla sekcji utworów
  - Testy jednostkowe dla `getSectionLabel()`, `getNextVerseNumber()`, `validateSection()`
  - Property test: round-trip zapisania i odczytania utworu z sekcjami
  - Property test: eksport i import zachowuje sekcje
  - Testy integracyjne: dodawanie, edycja, usuwanie sekcji
  - _Feature: Song Sections_

- [ ] 15. Implementacja timera i przewijania w prompterze
  - Utworzenie hooks/usePrompterTimer.ts (play, pause, reset, seek)
  - Implementacja timer loop (setInterval 50-100ms)
  - Integracja calculateScrollY z timerem
  - Implementacja animowanego przewijania z Reanimated 2
  - _Requirements: 4.2, 4.3_

- [ ] 15.1 Napisanie testów unit dla timera
  - Test play/pause/reset funkcjonalności
  - _Requirements: 5.1, 5.2_

- [ ] 16. Implementacja kontroli odtwarzania w prompterze
  - Utworzenie components/PrompterControls.tsx
  - Implementacja przycisków play/pause
  - Implementacja przycisków next/previous song
  - Implementacja nawigacji między utworami w setliście
  - Obsługa przypadku brzegowego (ostatni utwór w setliście)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 16.1 Napisanie testów property dla pauzy i wznowienia
  - **Property 11: Pauza i wznowienie zachowuje pozycję**
  - **Validates: Requirements 5.2**

- [ ] 16.2 Napisanie testów property dla nawigacji w setliście
  - **Property 12: Nawigacja do następnego utworu w setliście**
  - **Property 13: Nawigacja do poprzedniego utworu w setliście**
  - **Validates: Requirements 5.3, 5.4**

- [ ] 16.3 Napisanie testu unit dla przypadku brzegowego
  - Test ostatniego utworu w setliście
  - _Requirements: 5.5_

- [ ]* 16.4 Napisanie test case'ów E2E dla promptera (MCP Playwright)
  - Utworzenie e2e/test-cases/TC-009-prompter-display.md
  - Utworzenie e2e/test-cases/TC-010-prompter-controls.md
  - Utworzenie e2e/test-cases/TC-011-prompter-scrolling.md
  - Testowanie fullscreen mode przez snapshoty
  - Weryfikacja scrollowania przez evaluate (sprawdzenie scrollY)
  - Screenshots: prompter-paused.png, prompter-playing.png
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ]* 17. Checkpoint - Weryfikacja testów E2E dla promptera
  - Przejście przez test case'y TC-009 do TC-011
  - Weryfikacja że scrollowanie działa płynnie
  - Testowanie kontroli play/pause/next/prev
  - Fix błędów wykrytych podczas testowania
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Implementacja obsługi zdarzeń klawiatury
  - Utworzenie utils/platform.ts (platform detection)
  - Utworzenie services/keyEventService.ts
  - Instalacja react-native-keyevent (dla Android)
  - Implementacja obsługi keyboard events (dla web/desktop)
  - Implementacja debouncing (300ms)
  - Implementacja graceful degradation (brak Bluetooth)
  - _Requirements: 6.1, 6.3, 6.4, 6.5, 10.3, 10.4_

- [ ] 18.1 Napisanie testów property dla zmapowanych klawiszy
  - **Property 14: Zmapowany klawisz wykonuje akcję**
  - **Validates: Requirements 6.2**

- [ ] 18.2 Napisanie testów property dla niezmapowanych klawiszy
  - **Property 15: Niezmapowany klawisz nie zmienia stanu**
  - **Validates: Requirements 6.3**

- [ ] 18.3 Napisanie testów property dla debounce
  - **Property 16: Debounce zapobiega wielokrotnym akcjom**
  - **Validates: Requirements 6.5**

- [ ] 18.4 Napisanie testów property dla cross-platform
  - **Property 26: Klawiatura działa jak kontroler na web/desktop**
  - **Property 27: Graceful degradation bez Bluetooth**
  - **Validates: Requirements 10.3, 10.4**

- [ ] 19. Integracja key events z prompterem
  - Podłączenie keyEventService do PrompterScreen
  - Mapowanie akcji (nextSong, prevSong, pause) do funkcji promptera
  - Testowanie z klawiaturą (na web/desktop)
  - _Requirements: 6.2_

- [ ] 20. Implementacja ekranu ustawień - wygląd
  - Utworzenie screens/SettingsScreen.tsx
  - Implementacja sekcji Appearance
  - Implementacja sliderów dla fontSize, anchorYPercent, marginHorizontal
  - Implementacja color pickerów dla textColor, backgroundColor
  - Live preview zmian w prompterze
  - Auto-save ustawień
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 20.1 Napisanie testów property dla ustawień
  - **Property 20: Zmiana ustawień aktualizuje konfigurację**
  - **Property 21: Round-trip persystencji ustawień**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [ ]* 20.2 Napisanie test case'ów E2E dla ustawień (MCP Playwright)
  - Utworzenie e2e/test-cases/TC-012-settings-appearance.md
  - Utworzenie e2e/test-cases/TC-013-settings-persistence.md
  - Testowanie sliderów i color pickerów przez MCP fill_form
  - Weryfikacja live preview w prompterze
  - Screenshots: settings-default.png, settings-customized.png
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ] 21. Implementacja mapowania klawiszy w ustawieniach
  - Utworzenie components/KeyMappingDialog.tsx
  - Implementacja UI dla mapowania klawiszy (lista akcji)
  - Implementacja "learn mode" (naciśnij klawisz aby zmapować)
  - Implementacja capture keyCode podczas mapowania
  - Implementacja czyszczenia mapowań
  - Wyświetlanie aktualnych mapowań
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 21.1 Napisanie testów property dla mapowania klawiszy
  - **Property 17: Mapowanie klawisza tworzy powiązanie**
  - **Property 18: Round-trip persystencji mapowań klawiszy**
  - **Property 19: Czyszczenie mapowania usuwa powiązanie**
  - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**

- [ ]* 21.2 Napisanie test case'ów E2E dla mapowania klawiszy (MCP Playwright)
  - Utworzenie e2e/test-cases/TC-014-key-mapping.md
  - Testowanie "learn mode" przez symulację key events
  - Użycie mcp_playwright_browser_press_key do symulacji klawiszy
  - Weryfikacja mapowań przez snapshoty UI
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [ ]* 22. Checkpoint - Weryfikacja testów E2E dla ustawień
  - Przejście przez test case'y TC-012 do TC-014
  - Weryfikacja że ustawienia są persystowane
  - Testowanie mapowania klawiszy
  - Fix błędów wykrytych podczas testowania
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Implementacja eksportu i importu danych z cross-platform support
  - Utworzenie services/exportImportService.ts
  - Implementacja exportAllData (serializacja do JSON)
  - Implementacja validateImportData (walidacja struktury)
  - Implementacja importData (merge/replace modes)
  - Integracja z SettingsScreen (przyciski Export/Import)
  - Implementacja file picker dla importu (web: input file, mobile: DocumentPicker)
  - Implementacja download/share dla eksportu (web: download, mobile: share dialog)
  - Zapewnienie kompatybilności formatów między platformami
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.3, 12.4_

- [ ] 23.1 Napisanie testów property dla eksportu/importu
  - **Property 28: Round-trip eksportu i importu**
  - **Validates: Requirements 11.1, 11.3**

- [ ] 23.2 Napisanie testów property dla cross-platform kompatybilności
  - **Property 30: Cross-platform kompatybilność danych**
  - **Validates: Requirements 12.4, 12.5**

- [ ]* 23.3 Napisanie test case'ów E2E dla eksportu/importu (MCP Playwright)
  - Utworzenie e2e/test-cases/TC-015-export-import.md
  - Utworzenie e2e/test-cases/TC-016-cross-platform-workflow.md
  - Użycie mcp_playwright_browser_evaluate do weryfikacji localStorage
  - Weryfikacja struktury JSON przez console logs
  - Testowanie round-trip (eksport → import → weryfikacja)
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5**

- [ ]* 24. Checkpoint - Weryfikacja testów E2E dla eksportu/importu
  - Przejście przez test case'y TC-015 do TC-016
  - Weryfikacja że dane są poprawnie eksportowane i importowane
  - Testowanie kompatybilności cross-platform
  - Fix błędów wykrytych podczas testowania
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Implementacja nawigacji aplikacji
  - Konfiguracja React Navigation (Stack Navigator)
  - Definicja types/navigation.ts z typami nawigacji
  - Utworzenie głównego App.tsx z NavigationContainer
  - Podłączenie wszystkich ekranów do nawigacji
  - Konfiguracja header options dla każdego ekranu
  - _Requirements: 1.2, 1.3_

- [ ] 26. Implementacja Context Providers
  - Utworzenie context/DataContext.tsx (songs, setlists)
  - Utworzenie context/SettingsContext.tsx (app settings)
  - Owinięcie aplikacji w providers
  - Optymalizacja re-renderów
  - _Requirements: 1.1, 8.5_

- [ ] 27. Implementacja Error Boundary
  - Utworzenie components/ErrorBoundary.tsx
  - Implementacja getDerivedStateFromError
  - Implementacja componentDidCatch
  - Utworzenie ErrorScreen z opcją reset
  - Owinięcie aplikacji w ErrorBoundary
  - _Requirements: 9.4_

- [ ] 28. Dodanie funkcji "Dodaj do Setlisty" w SongListScreen
  - Implementacja modal/dialog z listą setlist
  - Implementacja dodawania utworu do wybranej setlisty
  - Feedback dla użytkownika (toast/snackbar)
  - _Requirements: 1.4_

- [ ] 29. Checkpoint - Upewnij się że wszystkie testy przechodzą
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 30. Optymalizacja wydajności
  - Implementacja getItemLayout dla FlatList (stała wysokość)
  - Konfiguracja windowSize dla długich list
  - Implementacja lazy loading dla setlist
  - Cleanup timerów i listenerów w useEffect
  - Throttling dla scroll calculations
  - _Requirements: 4.3_

- [ ] 31. Optymalizacja UI dla różnych platform
  - Implementacja responsywnych layoutów (szersze na desktop)
  - Dodanie skrótów klawiszowych dla edycji na web/desktop
  - Optymalizacja touch targets dla mobile
  - Implementacja drag & drop plików dla importu na web
  - Testowanie orientacji pionowej i poziomej na mobile
  - _Requirements: 12.1, 12.2_

- [ ] 31.1 Napisanie testów property dla funkcjonalności edycji cross-platform
  - **Property 31: Pełna funkcjonalność edycji na komputerze**
  - **Validates: Requirements 12.1, 12.2**

- [ ] 32. Testowanie cross-platform workflow
  - Testowanie pełnego workflow: edycja na web → eksport → import na mobile
  - Testowanie na Expo Go (Android)
  - Testowanie w przeglądarce (web mode)
  - Weryfikacja graceful degradation (brak Bluetooth na web)
  - Weryfikacja keyboard events na web
  - Weryfikacja mouse events jako touch na web
  - Testowanie transferu danych między platformami
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 33. Dodanie przykładowych danych (opcjonalne)
  - Utworzenie utils/sampleData.ts
  - Generowanie przykładowych utworów z timingami
  - Generowanie przykładowej setlisty
  - Opcja załadowania sample data przy pierwszym uruchomieniu
  - _Requirements: 1.5_

- [ ] 34. Finalne testowanie i debugging
  - Przejście przez wszystkie user stories
  - Weryfikacja wszystkich acceptance criteria przez test case'y E2E
  - Testowanie na fizycznym urządzeniu Android
  - Testowanie z rzeczywistym kontrolerem Bluetooth
  - Testowanie workflow web → mobile
  - Fix bugów i edge cases
  - _Requirements: All_

- [ ] 35. Dokumentacja i README
  - Utworzenie README.md z instrukcjami instalacji
  - Dokumentacja workflow: praca na komputerze → eksport → import na tablet
  - Dokumentacja API dla głównych serwisów
  - Instrukcje użytkowania aplikacji (web i mobile)
  - Dokumentacja uruchamiania testów (unit, property, E2E z MCP)
  - Dokumentacja test case'ów E2E (e2e/README.md)
  - Troubleshooting guide
  - Lista kompatybilnych kontrolerów Bluetooth
  - Instrukcje transferu danych między urządzeniami
