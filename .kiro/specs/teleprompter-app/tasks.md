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

- [ ] 5. Implementacja algorytmu przewijania
  - Utworzenie services/scrollAlgorithm.ts
  - Implementacja funkcji calculateScrollY z interpolacją liniową
  - Obsługa przypadków brzegowych (przed pierwszą linijką, po ostatniej)
  - _Requirements: 5.2, 5.4, 5.5, 5.6_

- [ ] 5.1 Napisanie testów property dla algorytmu przewijania
  - **Property 10: Algorytm przewijania - interpolacja liniowa**
  - **Validates: Requirements 5.6**

- [ ] 6. Implementacja ekranu listy utworów (SongListScreen)
  - Utworzenie screens/SongListScreen.tsx
  - Utworzenie components/SongListItem.tsx
  - Implementacja FlatList z wyświetlaniem utworów (tytuł, artysta)
  - Implementacja FAB dla tworzenia nowego utworu
  - Implementacja empty state (komunikat gdy brak utworów)
  - Nawigacja do edytora po kliknięciu utworu
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 6.1 Napisanie testów property dla wyświetlania listy
  - **Property 1: Lista utworów wyświetla wszystkie zapisane utwory**
  - **Validates: Requirements 1.1**

- [ ] 6.2 Napisanie testów property dla nawigacji
  - **Property 2: Nawigacja do edytora przekazuje poprawny utwór**
  - **Validates: Requirements 1.2**

- [ ] 6.3 Napisanie testu unit dla empty state
  - Test przypadku brzegowego: pusta lista utworów
  - _Requirements: 1.5_

- [ ] 7. Implementacja ekranu edytora utworu (SongEditorScreen)
  - Utworzenie screens/SongEditorScreen.tsx
  - Utworzenie components/LyricLineEditor.tsx
  - Implementacja pól edycji tytułu i wykonawcy
  - Implementacja FlatList z edycją linijek tekstu
  - Implementacja dodawania nowych linijek
  - Implementacja usuwania linijek
  - Implementacja ręcznej edycji czasów dla linijek
  - Auto-save przy każdej zmianie
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7.1 Napisanie testów property dla dodawania linijek
  - **Property 3: Dodawanie linijki zwiększa liczbę linijek**
  - **Validates: Requirements 2.3**

- [ ] 7.2 Napisanie testów property dla usuwania linijek
  - **Property 4: Usuwanie linijki zmniejsza liczbę linijek**
  - **Validates: Requirements 2.4**

- [ ] 7.3 Napisanie testów property dla modyfikacji metadanych
  - **Property 5: Modyfikacja metadanych aktualizuje utwór**
  - **Validates: Requirements 2.2**

- [ ] 8. Implementacja trybu nagrywania timingu
  - Utworzenie hooks/useRecordingTimer.ts
  - Implementacja stopera (start, stop, reset)
  - Implementacja UI dla trybu nagrywania (wyświetlanie czasu)
  - Implementacja przycisku "Ustaw Czas" przy każdej linijce
  - Przypisywanie aktualnego czasu stopera do linijki
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.1 Napisanie testów unit dla trybu nagrywania
  - Test aktywacji trybu (stoper na 0)
  - Test resetu stopera
  - _Requirements: 3.1, 3.5_

- [ ] 9. Checkpoint - Upewnij się że wszystkie testy przechodzą
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implementacja zarządzania setlistami
  - Utworzenie screens/SetlistEditorScreen.tsx
  - Implementacja tworzenia nowej setlisty (prompt dla nazwy)
  - Implementacja dodawania utworów do setlisty
  - Instalacja i konfiguracja react-native-draggable-flatlist
  - Implementacja drag & drop dla zmiany kolejności
  - Implementacja usuwania utworów z setlisty
  - Implementacja usuwania całej setlisty
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10.1 Napisanie testów property dla kolejności w setliście
  - **Property 6: Kolejność utworów w setliście jest zachowana**
  - **Validates: Requirements 4.2**

- [ ] 10.2 Napisanie testów property dla zmiany kolejności
  - **Property 7: Zmiana kolejności aktualizuje songIds**
  - **Validates: Requirements 4.3**

- [ ] 10.3 Napisanie testów property dla usuwania z setlisty
  - **Property 8: Usunięcie utworu z setlisty nie usuwa utworu**
  - **Validates: Requirements 4.4**

- [ ] 10.4 Napisanie testów property dla usuwania setlisty
  - **Property 9: Usunięcie setlisty nie wpływa na utwory**
  - **Validates: Requirements 4.5**

- [ ] 11. Implementacja ekranu promptera - podstawy
  - Utworzenie screens/PrompterScreen.tsx
  - Implementacja fullscreen mode
  - Implementacja wyświetlania tekstu (duża czcionka, ciemne tło)
  - Implementacja FlatList z linijkami tekstu
  - Zastosowanie ustawień wyglądu (fontSize, colors, margins)
  - _Requirements: 5.1_

- [ ] 12. Implementacja timera i przewijania w prompterze
  - Utworzenie hooks/usePrompterTimer.ts (play, pause, reset, seek)
  - Implementacja timer loop (setInterval 50-100ms)
  - Integracja calculateScrollY z timerem
  - Implementacja animowanego przewijania z Reanimated 2
  - _Requirements: 5.2, 5.3_

- [ ] 12.1 Napisanie testów unit dla timera
  - Test play/pause/reset funkcjonalności
  - _Requirements: 6.1, 6.2_

- [ ] 13. Implementacja kontroli odtwarzania w prompterze
  - Utworzenie components/PrompterControls.tsx
  - Implementacja przycisków play/pause
  - Implementacja przycisków next/previous song
  - Implementacja nawigacji między utworami w setliście
  - Obsługa przypadku brzegowego (ostatni utwór w setliście)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 13.1 Napisanie testów property dla pauzy i wznowienia
  - **Property 11: Pauza i wznowienie zachowuje pozycję**
  - **Validates: Requirements 6.2**

- [ ] 13.2 Napisanie testów property dla nawigacji w setliście
  - **Property 12: Nawigacja do następnego utworu w setliście**
  - **Property 13: Nawigacja do poprzedniego utworu w setliście**
  - **Validates: Requirements 6.3, 6.4**

- [ ] 13.3 Napisanie testu unit dla przypadku brzegowego
  - Test ostatniego utworu w setliście
  - _Requirements: 6.5_

- [ ] 14. Checkpoint - Upewnij się że wszystkie testy przechodzą
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implementacja obsługi zdarzeń klawiatury
  - Utworzenie utils/platform.ts (platform detection)
  - Utworzenie services/keyEventService.ts
  - Instalacja react-native-keyevent (dla Android)
  - Implementacja obsługi keyboard events (dla web/desktop)
  - Implementacja debouncing (300ms)
  - Implementacja graceful degradation (brak Bluetooth)
  - _Requirements: 7.1, 7.3, 7.4, 7.5, 11.3, 11.4_

- [ ] 15.1 Napisanie testów property dla zmapowanych klawiszy
  - **Property 14: Zmapowany klawisz wykonuje akcję**
  - **Validates: Requirements 7.2**

- [ ] 15.2 Napisanie testów property dla niezmapowanych klawiszy
  - **Property 15: Niezmapowany klawisz nie zmienia stanu**
  - **Validates: Requirements 7.3**

- [ ] 15.3 Napisanie testów property dla debounce
  - **Property 16: Debounce zapobiega wielokrotnym akcjom**
  - **Validates: Requirements 7.5**

- [ ] 15.4 Napisanie testów property dla cross-platform
  - **Property 26: Klawiatura działa jak kontroler na web/desktop**
  - **Property 27: Graceful degradation bez Bluetooth**
  - **Validates: Requirements 11.3, 11.4**

- [ ] 16. Integracja key events z prompterem
  - Podłączenie keyEventService do PrompterScreen
  - Mapowanie akcji (nextSong, prevSong, pause) do funkcji promptera
  - Testowanie z klawiaturą (na web/desktop)
  - _Requirements: 7.2_

- [ ] 17. Implementacja ekranu ustawień - wygląd
  - Utworzenie screens/SettingsScreen.tsx
  - Implementacja sekcji Appearance
  - Implementacja sliderów dla fontSize, anchorYPercent, marginHorizontal
  - Implementacja color pickerów dla textColor, backgroundColor
  - Live preview zmian w prompterze
  - Auto-save ustawień
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 17.1 Napisanie testów property dla ustawień
  - **Property 20: Zmiana ustawień aktualizuje konfigurację**
  - **Property 21: Round-trip persystencji ustawień**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ] 18. Implementacja mapowania klawiszy w ustawieniach
  - Utworzenie components/KeyMappingDialog.tsx
  - Implementacja UI dla mapowania klawiszy (lista akcji)
  - Implementacja "learn mode" (naciśnij klawisz aby zmapować)
  - Implementacja capture keyCode podczas mapowania
  - Implementacja czyszczenia mapowań
  - Wyświetlanie aktualnych mapowań
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 18.1 Napisanie testów property dla mapowania klawiszy
  - **Property 17: Mapowanie klawisza tworzy powiązanie**
  - **Property 18: Round-trip persystencji mapowań klawiszy**
  - **Property 19: Czyszczenie mapowania usuwa powiązanie**
  - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**

- [ ] 19. Implementacja eksportu i importu danych
  - Utworzenie services/exportImportService.ts
  - Implementacja exportAllData (serializacja do JSON)
  - Implementacja validateImportData (walidacja struktury)
  - Implementacja importData (merge/replace modes)
  - Integracja z SettingsScreen (przyciski Export/Import)
  - Implementacja file picker dla importu
  - Implementacja share dialog dla eksportu
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 19.1 Napisanie testów property dla eksportu/importu
  - **Property 28: Round-trip eksportu i importu**
  - **Validates: Requirements 12.1, 12.3**

- [ ] 20. Implementacja nawigacji aplikacji
  - Konfiguracja React Navigation (Stack Navigator)
  - Definicja types/navigation.ts z typami nawigacji
  - Utworzenie głównego App.tsx z NavigationContainer
  - Podłączenie wszystkich ekranów do nawigacji
  - Konfiguracja header options dla każdego ekranu
  - _Requirements: 1.2, 1.3_

- [ ] 21. Implementacja Context Providers
  - Utworzenie context/DataContext.tsx (songs, setlists)
  - Utworzenie context/SettingsContext.tsx (app settings)
  - Owinięcie aplikacji w providers
  - Optymalizacja re-renderów
  - _Requirements: 1.1, 9.5_

- [ ] 22. Implementacja Error Boundary
  - Utworzenie components/ErrorBoundary.tsx
  - Implementacja getDerivedStateFromError
  - Implementacja componentDidCatch
  - Utworzenie ErrorScreen z opcją reset
  - Owinięcie aplikacji w ErrorBoundary
  - _Requirements: 10.4_

- [ ] 23. Dodanie funkcji "Dodaj do Setlisty" w SongListScreen
  - Implementacja modal/dialog z listą setlist
  - Implementacja dodawania utworu do wybranej setlisty
  - Feedback dla użytkownika (toast/snackbar)
  - _Requirements: 1.4_

- [ ] 24. Checkpoint - Upewnij się że wszystkie testy przechodzą
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Optymalizacja wydajności
  - Implementacja getItemLayout dla FlatList (stała wysokość)
  - Konfiguracja windowSize dla długich list
  - Implementacja lazy loading dla setlist
  - Cleanup timerów i listenerów w useEffect
  - Throttling dla scroll calculations
  - _Requirements: 5.3_

- [ ] 26. Testowanie cross-platform
  - Testowanie na Expo Go (Android)
  - Testowanie w przeglądarce (web mode)
  - Weryfikacja graceful degradation (brak Bluetooth na web)
  - Weryfikacja keyboard events na web
  - Weryfikacja mouse events jako touch na web
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 27. Dodanie przykładowych danych (opcjonalne)
  - Utworzenie utils/sampleData.ts
  - Generowanie przykładowych utworów z timingami
  - Generowanie przykładowej setlisty
  - Opcja załadowania sample data przy pierwszym uruchomieniu
  - _Requirements: 1.5_

- [ ] 28. Napisanie testów integracyjnych dla głównych przepływów
  - Test przepływu: utworzenie utworu → edycja → dodanie do setlisty → odtwarzanie w prompterze
  - Test przepływu: import danych → weryfikacja → eksport
  - Test przepływu: mapowanie klawiszy → użycie w prompterze

- [ ] 29. Finalne testowanie i debugging
  - Przejście przez wszystkie user stories
  - Weryfikacja wszystkich acceptance criteria
  - Testowanie na fizycznym urządzeniu Android
  - Testowanie z rzeczywistym kontrolerem Bluetooth
  - Fix bugów i edge cases
  - _Requirements: All_

- [ ] 30. Dokumentacja i README
  - Utworzenie README.md z instrukcjami instalacji
  - Dokumentacja API dla głównych serwisów
  - Instrukcje użytkowania aplikacji
  - Troubleshooting guide
  - Lista kompatybilnych kontrolerów Bluetooth
