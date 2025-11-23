# StagePrompt

Aplikacja teleprompter na tablet z Androidem, zbudowana w React Native + TypeScript.

## Wymagania

- Node.js (v18 lub nowszy)
- npm lub yarn
- Expo CLI
- Android Studio (dla developmentu na Android)

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
- **React Navigation** - Nawigacja
- **Reanimated 2** - Animacje
- **AsyncStorage** - Lokalne przechowywanie danych
- **Jest** - Unit testing
- **fast-check** - Property-based testing

## Licencja

ISC
