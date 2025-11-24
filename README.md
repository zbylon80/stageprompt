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
