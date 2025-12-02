# Prosty Test Key Mapping

## Szybki test czy wszystko działa:

### Krok 1: Przebuduj aplikację

```bash
# Zatrzymaj aplikację jeśli działa (Ctrl+C)

# Wyczyść cache i przebuduj
npm start -- --clear

# W nowym terminalu:
npm run android
```

### Krok 2: Otwórz logi

W osobnym terminalu:
```bash
npx react-native log-android
```

### Krok 3: Test w aplikacji

1. Otwórz aplikację na telefonie
2. Przejdź do **Settings** (Ustawienia)
3. Przewiń w dół do sekcji **"Bluetooth Controller"**
4. Kliknij **"Configure Key Mapping"**

### Krok 4: Sprawdź co widzisz

**Powinno być:**
- Dialog z tytułem "Key Mapping"
- Niebieski box z instrukcją dla Android
- Lista 3 akcji: Next Song, Previous Song, Play/Pause
- Każda akcja ma przycisk "Map"

### Krok 5: Kliknij "Map" przy "Next Song"

**Co powinno się stać:**
- Przycisk "Map" znika
- Pojawia się **zielony box** z tekstem **"Press a key..."**
- W logach widzisz:
  ```
  Starting learning mode for action: nextSong
  Learning mode active for: nextSong Platform: android
  ```

### Krok 6: Naciśnij przycisk na kontrolerze

**Co powinno się stać:**
- Zielony box znika
- Pojawia się przycisk "Remap" i "Clear"
- Pod "Current:" widzisz kod klawisza (np. "Key 66")
- W logach widzisz:
  ```
  Android key captured: 66 for action: nextSong
  ```

## Jeśli NIE widzisz zielonego boxa:

### Test 1: Sprawdź czy stan się zmienia

Dodaj tymczasowo w `KeyMappingDialog.tsx` na początku funkcji render:

```typescript
console.log('RENDER - learningAction:', learningAction);
```

Kliknij "Map" i sprawdź logi. Powinno być:
```
RENDER - learningAction: null
RENDER - learningAction: nextSong  // Po kliknięciu Map
```

### Test 2: Sprawdź czy conditional rendering działa

W `KeyMappingDialog.tsx` znajdź:
```typescript
{learningAction === action.key ? (
  <View style={styles.learningIndicator}>
    <Text style={styles.learningText}>Press a key...</Text>
  </View>
) : (
  // przyciski Map/Clear
)}
```

Dodaj log:
```typescript
{(() => {
  console.log('Checking:', action.key, 'vs', learningAction, '=', learningAction === action.key);
  return learningAction === action.key ? (
    <View style={styles.learningIndicator}>
      <Text style={styles.learningText}>Press a key...</Text>
    </View>
  ) : (
    // przyciski
  );
})()}
```

### Test 3: Sprawdź style

Może zielony box jest niewidoczny? Sprawdź w `styles`:
```typescript
learningIndicator: {
  flex: 1,
  backgroundColor: '#4caf50',  // Zielony
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems: 'center',
},
```

## Jeśli widzisz zielony box ale klawisz nie jest przechwytywany:

### Test 1: Sprawdź czy react-native-keyevent działa

W `App.tsx` dodaj na początku:

```typescript
import { Platform } from 'react-native';
import { useEffect } from 'react';

// W komponencie App:
useEffect(() => {
  if (Platform.OS === 'android') {
    try {
      const KeyEvent = require('react-native-keyevent');
      console.log('KeyEvent loaded successfully');
      
      const listener = (keyEvent: any) => {
        console.log('🔑 GLOBAL KEY:', keyEvent.keyCode);
      };
      
      KeyEvent.onKeyDownListener(listener);
      
      return () => {
        KeyEvent.removeKeyDownListener();
      };
    } catch (error) {
      console.error('❌ KeyEvent error:', error);
    }
  }
}, []);
```

Teraz naciśnij dowolny klawisz na kontrolerze (nawet poza dialogiem).
Powinno pokazać: `🔑 GLOBAL KEY: 66`

Jeśli to działa, problem jest w KeyMappingDialog.
Jeśli to NIE działa, problem jest z react-native-keyevent.

### Test 2: Sprawdź czy kontroler jest sparowany

1. Otwórz Ustawienia Android
2. Bluetooth
3. Sprawdź czy kontroler jest na liście "Paired devices"
4. Sprawdź czy jest "Connected"

### Test 3: Sprawdź czy kontroler działa

Otwórz dowolną aplikację (np. notatnik) i naciśnij przyciski.
Czy coś się dzieje?

## Szybka naprawa jeśli nic nie działa:

```bash
# 1. Usuń node_modules i przeinstaluj
rm -rf node_modules
npm install

# 2. Wyczyść cache Android
cd android
./gradlew clean
cd ..

# 3. Przebuduj
npm run android
```

---

**Powiedz mi na którym kroku się zatrzymałeś i co widzisz w logach!**
