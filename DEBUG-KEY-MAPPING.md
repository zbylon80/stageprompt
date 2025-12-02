# Debug: Key Mapping Issue

## Problem
Kliknięcie "Map" nie pokazuje "Press a key..."

## Kroki debugowania:

### 1. Sprawdź logi w konsoli

Dodałem logi debugowania. Uruchom aplikację i sprawdź logi:

```bash
# Android
npx react-native log-android

# Lub w Metro bundler
# Logi powinny pokazać się w terminalu gdzie uruchomiłeś npm run android
```

### 2. Szukaj tych komunikatów:

Gdy klikniesz "Map":
```
Starting learning mode for action: nextSong
Learning mode active for: nextSong Platform: android
```

Gdy naciśniesz klawisz na kontrolerze:
```
Android key captured: 66 for action: nextSong
```

### 3. Możliwe problemy:

#### A) Nie widzisz "Starting learning mode"
**Problem:** Przycisk nie wywołuje funkcji
**Rozwiązanie:** 
- Sprawdź czy aplikacja została przebudowana
- Uruchom ponownie: `npm run android`

#### B) Widzisz "Starting learning mode" ale nie "Press a key..."
**Problem:** Stan się aktualizuje ale UI się nie renderuje
**Rozwiązanie:**
- To może być problem z React state
- Sprawdź czy `learningAction` jest ustawiony:
  ```typescript
  console.log('learningAction state:', learningAction);
  ```

#### C) Widzisz "Press a key..." ale nie "Android key captured"
**Problem:** react-native-keyevent nie działa
**Rozwiązanie:**
- Sprawdź czy biblioteka jest zainstalowana: `npm list react-native-keyevent`
- Sprawdź czy kontroler jest sparowany
- Sprawdź czy kontroler działa w innych aplikacjach

### 4. Przebuduj aplikację

Ważne! Po zmianach w kodzie musisz przebudować aplikację:

```bash
# Zatrzymaj aplikację (Ctrl+C w terminalu Metro)

# Wyczyść cache
npm start -- --clear

# Lub przebuduj całkowicie
cd android
./gradlew clean
cd ..

# Uruchom ponownie
npm run android
```

### 5. Test manualny

Jeśli nadal nie działa, przetestuj ręcznie:

1. Otwórz aplikację
2. Przejdź do Settings
3. Kliknij "Configure Key Mapping"
4. Kliknij "Map" przy "Next Song"
5. **Sprawdź czy widzisz zielony box z "Press a key..."**
6. Naciśnij przycisk na kontrolerze
7. **Sprawdź czy widzisz kod klawisza (np. "Key 66")**

### 6. Alternatywne testowanie (bez kontrolera)

Możesz przetestować z ADB:

```bash
# Otwórz dialog mapowania w aplikacji
# Kliknij "Map"
# Następnie wyślij keyevent przez ADB:

adb shell input keyevent 66  # Enter
# lub
adb shell input keyevent 62  # Space
# lub
adb shell input keyevent 22  # Right arrow
```

### 7. Sprawdź czy react-native-keyevent działa

Dodaj tymczasowy test w App.tsx:

```typescript
useEffect(() => {
  if (Platform.OS === 'android') {
    try {
      const KeyEvent = require('react-native-keyevent');
      
      const testListener = (keyEvent: any) => {
        console.log('TEST: Key pressed:', keyEvent.keyCode);
      };
      
      KeyEvent.onKeyDownListener(testListener);
      
      return () => {
        KeyEvent.removeKeyDownListener();
      };
    } catch (error) {
      console.error('TEST: react-native-keyevent error:', error);
    }
  }
}, []);
```

Jeśli to działa (widzisz logi gdy naciskasz przyciski), to problem jest w KeyMappingDialog.

### 8. Sprawdź czy modal jest widoczny

Dodaj log w render:

```typescript
console.log('KeyMappingDialog render - visible:', visible, 'learningAction:', learningAction);
```

### 9. Upewnij się że używasz najnowszej wersji

```bash
# Sprawdź czy zmiany są w pliku
cat src/components/KeyMappingDialog.tsx | grep "Starting learning mode"

# Powinno pokazać linię z console.log
```

## Oczekiwane zachowanie:

1. Kliknięcie "Map" → `learningAction` ustawiony na akcję (np. 'nextSong')
2. Render → Pokazuje zielony box "Press a key..."
3. Naciśnięcie klawisza → `handleKeyDown` wywołany
4. Klawisz zmapowany → `learningAction` ustawiony na `null`
5. Render → Pokazuje przycisk "Remap" zamiast "Map"

## Jeśli nic nie pomaga:

Wyślij mi logi z konsoli pokazujące:
1. Co się dzieje gdy klikasz "Map"
2. Co się dzieje gdy naciskasz klawisz na kontrolerze
3. Czy widzisz jakieś błędy

---

**Ostatnia aktualizacja:** December 2, 2025
