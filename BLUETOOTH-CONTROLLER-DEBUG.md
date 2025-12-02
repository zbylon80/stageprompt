# Bluetooth Controller Debugging Guide

## Problem: Nie mogę zmapować przycisku kontrolera

Naprawiłem problem! KeyMappingDialog teraz działa zarówno na web jak i na Androidzie.

## Co zostało naprawione:

1. **Dodano obsługę Android** - KeyMappingDialog teraz nasłuchuje zdarzeń z `react-native-keyevent` na Androidzie
2. **Usunięto blokadę** - Przyciski "Map" nie są już wyłączone na mobile
3. **Dodano instrukcje** - Dialog pokazuje odpowiednie instrukcje dla każdej platformy

## Jak przetestować:

### 1. Upewnij się że kontroler jest podłączony
- Sparuj kontroler Bluetooth z telefonem w ustawieniach Androida
- Kontroler powinien działać jak klawiatura (większość footswitch i pilotów Bluetooth działa w ten sposób)

### 2. Otwórz aplikację
```bash
# Jeśli używasz Expo Go:
npm run android

# Lub zbuduj APK i zainstaluj
```

### 3. Przejdź do Settings
- Otwórz aplikację
- Przejdź do ekranu Settings (Ustawienia)
- Znajdź sekcję "Bluetooth Controller"
- Kliknij "Configure Key Mapping"

### 4. Mapuj przyciski
- Kliknij "Map" przy akcji (np. "Next Song")
- Dialog pokaże "Press a key..." (zielony)
- **Naciśnij przycisk na kontrolerze Bluetooth**
- Przycisk zostanie zmapowany i zobaczysz jego kod (np. "Key 66")

### 5. Zapisz mapowanie
- Kliknij "Save" aby zapisać konfigurację
- Mapowanie zostanie zapisane w AsyncStorage

### 6. Testuj w prompterze
- Utwórz setlistę z kilkoma utworami
- Otwórz prompter
- Naciśnij zmapowane przyciski na kontrolerze
- Powinny działać akcje (next song, previous song, pause)

## Debugowanie problemów:

### Problem: Przycisk nie jest wykrywany podczas mapowania

**Możliwe przyczyny:**
1. Kontroler nie jest sparowany
2. Kontroler nie działa jako klawiatura
3. `react-native-keyevent` nie jest poprawnie zainstalowany

**Rozwiązanie:**
```bash
# 1. Sprawdź czy kontroler jest sparowany w ustawieniach Androida

# 2. Przetestuj kontroler w innej aplikacji (np. notatnik)
#    - Otwórz aplikację notatnik
#    - Naciśnij przyciski na kontrolerze
#    - Czy pojawiają się znaki?

# 3. Przebuduj aplikację
npm run android

# 4. Sprawdź logi
npx react-native log-android
```

### Problem: Mapowanie się zapisuje ale nie działa w prompterze

**Możliwe przyczyny:**
1. keyEventService nie jest zainicjalizowany
2. Mapowanie nie zostało załadowane

**Rozwiązanie:**
- Sprawdź czy w PrompterScreen jest wywołane `keyEventService.initialize()`
- Sprawdź czy mapowanie jest przekazane do `keyEventService.setKeyMapping()`

### Problem: Przyciski działają ale z opóźnieniem

**To jest normalne!** Debouncing jest ustawiony na 300ms aby zapobiec wielokrotnym akcjom.

Jeśli chcesz zmienić czas debounce, edytuj `src/services/keyEventService.ts`:
```typescript
private debounceMs = 300; // Zmień na mniejszą wartość, np. 150
```

## Testowanie bez fizycznego kontrolera:

### Na Androidzie:
Możesz użyć ADB do symulacji naciśnięć klawiszy:
```bash
# Symuluj naciśnięcie klawisza (keycode 66 = Enter)
adb shell input keyevent 66

# Symuluj naciśnięcie strzałki w prawo (keycode 22)
adb shell input keyevent 22

# Symuluj naciśnięcie spacji (keycode 62)
adb shell input keyevent 62
```

### Na Web:
Po prostu użyj klawiatury komputera - działa identycznie jak kontroler Bluetooth.

## Kody klawiszy (Android KeyEvent):

Popularne kody dla kontrolerów Bluetooth:
- **22** - KEYCODE_DPAD_RIGHT (strzałka w prawo)
- **21** - KEYCODE_DPAD_LEFT (strzałka w lewo)
- **62** - KEYCODE_SPACE (spacja)
- **66** - KEYCODE_ENTER (enter)
- **19** - KEYCODE_DPAD_UP (strzałka w górę)
- **20** - KEYCODE_DPAD_DOWN (strzałka w dół)
- **85** - KEYCODE_MEDIA_PLAY_PAUSE
- **87** - KEYCODE_MEDIA_NEXT
- **88** - KEYCODE_MEDIA_PREVIOUS

Twój kontroler może używać innych kodów - dlatego ważne jest mapowanie!

## Sprawdzanie logów:

```bash
# Android logs
npx react-native log-android

# Szukaj komunikatów:
# - "Key events not supported" - oznacza problem z platformą
# - "react-native-keyevent not available" - biblioteka nie jest zainstalowana
# - Logi z keyEventService pokazujące przechwycone kody klawiszy
```

## Jeśli nadal nie działa:

1. **Sprawdź czy aplikacja ma uprawnienia Bluetooth:**
   - Otwórz Ustawienia Android → Aplikacje → StagePrompt → Uprawnienia
   - Upewnij się że Bluetooth jest włączony

2. **Sprawdź czy kontroler działa w innych aplikacjach:**
   - Otwórz przeglądarkę lub notatnik
   - Naciśnij przyciski na kontrolerze
   - Czy coś się dzieje?

3. **Spróbuj innego kontrolera:**
   - Niektóre kontrolery mogą nie działać jako klawiatura
   - Footswitch i piloty prezentacyjne zazwyczaj działają najlepiej

4. **Przebuduj aplikację:**
   ```bash
   # Wyczyść cache
   npm start -- --clear
   
   # Lub przebuduj całkowicie
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

## Kontakt:

Jeśli problem nadal występuje, sprawdź:
- Czy kontroler jest wykrywany w ustawieniach Androida jako "Klawiatura"
- Jakie kody klawiszy wysyła kontroler (użyj aplikacji do testowania klawiatur z Google Play)
- Czy inne aplikacje wykrywają przyciski kontrolera

---

**Ostatnia aktualizacja:** December 2, 2025  
**Status:** ✅ Naprawione - KeyMappingDialog działa na Android i Web
