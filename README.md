# StagePrompt

Aplikacja teleprompter na tablet z Androidem, zbudowana w React Native + TypeScript.

## Funkcjonalności

### Zarządzanie Piosenkami
- ✅ Tworzenie i edycja piosenek z metadanymi (tytuł, artysta)
- ✅ Edytor tekstów z obsługą linii i timingów
- ✅ **Interpolacja czasów** - inteligentne ustawianie timingów
  - Ustawianie kotwic (anchor points) dla kluczowych linii
  - Automatyczna interpolacja czasów między kotwicami
  - Przycisk "Reset Times" do resetowania wszystkich czasów
  - Możliwość zapisywania wersji roboczych (bez pełnych timingów)
- ✅ Lista wszystkich piosenek z możliwością przeglądania
- ✅ Automatyczne zapisywanie zmian
- ✅ Sticky toolbar - przyciski zawsze widoczne podczas scrollowania

### Zarządzanie Setlistami
- ✅ Tworzenie i edycja setlist
- ✅ Dodawanie piosenek do setlisty
- ✅ Drag-and-drop do zmiany kolejności piosenek
  - Web: Przeciągnij za uchwyt ☰
  - Mobile: Long-press i przeciągnij
- ✅ Walidacja duplikatów nazw setlist
- ✅ Split-view layout z panelem wszystkich piosenek
- ✅ Auto-save po każdej zmianie

### UI/UX
- ✅ Toast notifications dla akcji użytkownika
- ✅ Responsywny design (mobile i tablet)
- ✅ Ciemny motyw
- ✅ Płynne animacje i przejścia

## Wymagania

- Node.js (v18 lub nowszy)
- npm lub yarn
- Expo CLI
- Android Studio (dla developmentu na Android)
- Expo Go (dla testowania na urządzeniu fizycznym)

## Instalacja

```bash
npm install
```

## Uruchamianie

### Development

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Testowanie

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Struktura Projektu

```
src/
├── types/        # Definicje TypeScript
├── screens/      # Ekrany aplikacji
├── components/   # Komponenty wielokrotnego użytku
├── services/     # Logika biznesowa
├── hooks/        # Custom React hooks
├── context/      # React Context dla globalnego stanu
└── utils/        # Funkcje pomocnicze
```

## Technologie

- **React Native** - Framework mobilny
- **Expo** - Narzędzia development
- **TypeScript** - Typowanie statyczne
- **React Navigation** - Nawigacja w aplikacji
- **React Native Reanimated** - Płynne animacje
- **React Native Gesture Handler** - Obsługa gestów
- **React Native Draggable FlatList** - Drag-and-drop na mobile
- **AsyncStorage** - Lokalne przechowywanie danych
- **Jest** - Unit testing
- **fast-check** - Property-based testing

## Architektura

Aplikacja wykorzystuje:
- **Custom Hooks** - Zarządzanie stanem (useSongs, useSetlists, useSettings)
- **Service Layer** - Logika biznesowa (storageService, scrollAlgorithm)
- **Type Safety** - Pełne typowanie TypeScript
- **Property-Based Testing** - Testowanie właściwości uniwersalnych

### Android SafeAreaView Pattern

Wszystkie ekrany używają `SafeAreaView` z `react-native-safe-area-context` aby zapobiec kolizjom z systemowym paskiem nawigacji Androida:

**FAB Buttons (Floating Action Buttons):**
```typescript
// Kontener z flexDirection: 'column' zamiast position: absolute dla każdego przycisku
<SafeAreaView edges={['bottom']} style={styles.fabContainer}>
  <TouchableOpacity style={styles.fab}>...</TouchableOpacity>
  <TouchableOpacity style={styles.fabSecondary}>...</TouchableOpacity>
</SafeAreaView>

// Style
fabContainer: {
  position: 'absolute',
  right: 20,
  bottom: 0,
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 10,
  paddingBottom: 10,
  pointerEvents: 'box-none', // Pozwala klikać przez kontener
}
```

**Bottom Action Bars:**
```typescript
// Sticky bottom bar z przyciskami akcji
<SafeAreaView edges={['bottom']} style={styles.bottomActions}>
  <View style={styles.bottomActionsContent}>
    {/* Przyciski */}
  </View>
</SafeAreaView>

// Style
bottomActions: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#1a1a1a',
  borderTopWidth: 1,
  borderTopColor: '#2a2a2a',
}
```

**Fullscreen Screens (Prompter):**
```typescript
// Cały ekran w SafeAreaView
<SafeAreaView edges={['top', 'bottom']} style={styles.container}>
  {/* Zawartość */}
</SafeAreaView>
```

**Kluczowe zasady:**
- Używaj `edges={['bottom']}` dla elementów na dole ekranu
- Używaj `edges={['top', 'bottom']}` dla ekranów pełnoekranowych
- Dla FAB buttons: użyj `flexDirection: 'column'` zamiast `position: absolute` dla każdego przycisku
- SafeAreaView automatycznie doda odpowiedni padding (20-30px na Androidzie)

### Keyboard Handling

Wszystkie ekrany z polami tekstowymi używają `KeyboardAvoidingView` aby zapobiec zasłanianiu inputów przez klawiaturę:

```typescript
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
>
  {/* Zawartość ekranu */}
</KeyboardAvoidingView>
```

**Konfiguracja w app.json:**
```json
"android": {
  "softwareKeyboardLayoutMode": "resize"
}
```

- `behavior="padding"` na iOS - dodaje padding na dole
- `behavior="height"` na Android - zmniejsza wysokość kontenera
- `softwareKeyboardLayoutMode="resize"` - zmienia rozmiar ekranu i automatycznie focusuje na aktywnym polu tekstowym

## Dokumentacja

- [Interpolacja Czasów](./TIMING-INTERPOLATION.md) - Szczegółowy opis systemu interpolacji timingów
- [Sekcje Piosenek](./SECTION-TIMING-FEATURE.md) - Funkcjonalność sekcji i timingów

## Roadmap

### W trakcie rozwoju
- 🔄 Wyszukiwanie piosenek (tytuł, artysta)
- 🔄 Teleprompter view z auto-scrollem
- 🔄 Ustawienia prędkości scrollowania
- 🔄 Eksport/import setlist

### Planowane
- 📋 Sortowanie piosenek (alfabetycznie, data utworzenia)
- 📋 Kategorie/tagi dla piosenek
- 📋 Backup do chmury
- 📋 Tryb pełnoekranowy dla telepromptera

## Licencja

ISC
