# Naprawa Przycisku "Map" w KeyMappingDialogSimple

**Data:** December 2, 2025  
**Problem:** Brak przycisku "Map" w dialogu mapowania na Androidzie

## 🔍 Problem

Użytkownik zgłosił, że:
- Nie ma przycisku "Map" w dialogu mapowania klawiszy
- Widzi tylko domyślne kody do wyboru
- Chce móc kliknąć "Map" i nacisnąć przycisk na kontrolerze, żeby go zmapować

## 🔧 Przyczyna

Na Androidzie używany jest `KeyMappingDialogSimple` zamiast `KeyMappingDialog`:
- `KeyMappingDialog` - używany na web, ma przycisk "Map"
- `KeyMappingDialogSimple` - używany na Android, miał tylko ręczne mapowanie

`KeyMappingDialogSimple` został stworzony jako uproszczona wersja dla Expo Go, ale brakowało mu funkcji automatycznego wykrywania klawiszy.

## ✅ Rozwiązanie

Dodano funkcjonalność "Map" do `KeyMappingDialogSimple`:

### 1. Dodano stan `learningAction`
```typescript
const [learningAction, setLearningAction] = useState<keyof KeyMapping | null>(null);
```

### 2. Dodano listener dla zdarzeń klawiatury
```typescript
useEffect(() => {
  if (!learningAction || Platform.OS !== 'android') return;

  try {
    const KeyEvent = require('react-native-keyevent');

    const handleKeyDown = (keyEvent: any) => {
      const keyCode = keyEvent.keyCode;
      console.log('🎮 Key captured:', keyCode);
      alert(`Key captured: ${keyCode}\nAction: ${learningAction}`);

      setLocalMapping((prev) => ({
        ...prev,
        [learningAction]: keyCode,
      }));

      setLearningAction(null);
    };

    KeyEvent.onKeyDownListener(handleKeyDown);
    return () => KeyEvent.removeKeyDownListener();
  } catch (error) {
    console.warn('react-native-keyevent not available:', error);
    alert(`Error: react-native-keyevent not available`);
    setLearningAction(null);
  }
}, [learningAction]);
```

### 3. Dodano przycisk "Map" do UI
```typescript
<TouchableOpacity
  style={[styles.button, styles.mapButton]}
  onPress={() => setLearningAction(action.key)}
>
  <Text style={styles.buttonText}>
    {localMapping[action.key] !== undefined ? 'Remap' : 'Map'}
  </Text>
</TouchableOpacity>
```

### 4. Dodano wskaźnik trybu uczenia
```typescript
{learningAction === action.key ? (
  <View style={styles.learningIndicator}>
    <Text style={styles.learningText}>Press a button on your controller...</Text>
  </View>
) : (
  // ... przyciski Map, Manual, Clear
)}
```

### 5. Zaktualizowano instrukcje
Zmieniono tekst w infoBox, żeby wyjaśnić nową funkcjonalność:
- Opcja 1: Automatyczne mapowanie (przycisk "Map")
- Opcja 2: Ręczne mapowanie (common codes lub "Manual")

## 🎯 Jak Używać

### Automatyczne Mapowanie (Zalecane):
1. Otwórz Settings → Configure Key Mapping
2. Kliknij przycisk **"Map"** przy akcji (np. "Next Song")
3. Zobaczysz zielony pasek "Press a button on your controller..."
4. **Naciśnij przycisk na kontrolerze Bluetooth**
5. Pojawi się alert z przechwyconym kodem klawisza
6. Kod zostanie automatycznie przypisany do akcji
7. Kliknij "Save"

### Ręczne Mapowanie (Alternatywa):
1. Wybierz jeden z "Common codes"
2. LUB kliknij "Manual" i wpisz kod ręcznie

## 📋 Pliki Zmodyfikowane

1. **src/components/KeyMappingDialogSimple.tsx**
   - Dodano stan `learningAction`
   - Dodano useEffect dla przechwytywania klawiszy
   - Dodano przycisk "Map"
   - Dodano wskaźnik trybu uczenia
   - Zaktualizowano instrukcje w infoBox
   - Dodano style dla nowych elementów

2. **src/screens/PrompterScreen.tsx**
   - Wyłączono PrompterTouchControls (zakomentowano)
   - Usunięto zdublowane przyciski

3. **src/components/KeyMappingDialog.tsx**
   - Dodano debugowanie (alerty i logi)
   - Pomoże zdiagnozować, czy kontroler wysyła kody klawiszy

## 🧪 Testowanie

### Test 1: Sprawdź, czy kontroler wysyła kody klawiszy
1. Przeładuj aplikację (`r` w Metro)
2. Otwórz Settings → Configure Key Mapping
3. Kliknij "Map" przy "Next Song"
4. Naciśnij przycisk na kontrolerze S18
5. **Sprawdź**:
   - ✅ Jeśli pojawił się alert z kodem → kontroler działa!
   - ❌ Jeśli nic się nie stało → kontroler nie wysyła kodów klawiszy

### Test 2: Zmapuj wszystkie przyciski
1. Zmapuj "Next Song"
2. Zmapuj "Previous Song"
3. Zmapuj "Play/Pause"
4. Kliknij "Save"

### Test 3: Przetestuj w prompterze
1. Otwórz setlistę
2. Uruchom prompter
3. Naciśnij przyciski na kontrolerze
4. Sprawdź, czy działają:
   - Next Song
   - Previous Song
   - Play/Pause

## 🔍 Możliwe Scenariusze

### Scenariusz A: Kontroler wysyła kody klawiszy ✅
- Alert pokazuje kod klawisza
- Mapowanie działa
- Przyciski w prompterze działają
- **Sukces!**

### Scenariusz B: Kontroler NIE wysyła kodów klawiszy ❌
- Brak alertu po naciśnięciu przycisku
- Kontroler działa tylko jako mysz
- **Rozwiązanie**: Trzeba wrócić do PrompterTouchControls (klikalne obszary)

## 📝 Uwagi

### Expo Go vs Development Build
- **Expo Go**: `react-native-keyevent` może nie działać (custom native module)
- **Development Build**: Powinno działać bez problemu
- Jeśli nie działa w Expo Go, rozważ stworzenie development build

### Kontroler S18
- Według poprzednich testów, S18 działa jako mysz/touchpad
- Może nie wysyłać kodów klawiszy
- Jeśli tak, klikalne obszary (PrompterTouchControls) są lepszym rozwiązaniem

## 🚀 Status

**GOTOWE DO TESTOWANIA**

Użytkownik powinien:
1. Przeładować aplikację
2. Przetestować przycisk "Map"
3. Sprawdzić, czy kontroler wysyła kody klawiszy
4. Dać feedback

---

**Następne kroki zależą od wyniku testów:**
- Jeśli działa → usunąć debugowanie, zostawić mapowanie
- Jeśli nie działa → przywrócić PrompterTouchControls
