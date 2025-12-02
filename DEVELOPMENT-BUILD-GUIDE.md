# Development Build - Instrukcje

**Data:** December 2, 2025  
**Cel:** Zbudować development build, żeby `react-native-keyevent` działał

## 📋 Wymagania

1. **Konto Expo** - Zarejestruj się na https://expo.dev
2. **EAS CLI** - Narzędzie do budowania
3. **Telefon Android** - Do testowania

## 🚀 Krok po Kroku

### 1. Zainstaluj EAS CLI

```bash
npm install -g eas-cli
```

### 2. Zaloguj się do Expo

```bash
eas login
```

Podaj swoje dane logowania do konta Expo.

### 3. Skonfiguruj projekt

```bash
eas build:configure
```

To stworzy plik `eas.json` (już mamy).

### 4. Zbuduj Development Build

```bash
eas build --profile development --platform android
```

**Opcje:**
- `--profile development` - Buduje wersję development (z Expo Dev Client)
- `--platform android` - Tylko dla Android
- `--local` - Buduj lokalnie (wymaga Android Studio)

**Czas budowania:** 10-20 minut (na serwerach Expo)

### 5. Pobierz i zainstaluj APK

Po zakończeniu budowania:
1. Otrzymasz link do pobrania APK
2. Pobierz APK na telefon
3. Zainstaluj APK (może wymagać włączenia "Unknown sources")

### 6. Uruchom aplikację

```bash
npm start
```

Wybierz "Development build" zamiast "Expo Go".

## 🔧 Konfiguracja (już zrobione)

### eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguardInReleaseBuilds": false
          }
        }
      ]
    ]
  }
}
```

### package.json
- `react-native-keyevent` już zainstalowany ✅

## 🎮 Po Zbudowaniu

### Testowanie KeyMapping

1. Otwórz aplikację (development build)
2. Idź do Settings → Configure Key Mapping
3. Kliknij "Map" przy akcji
4. Naciśnij przycisk na kontrolerze S18
5. **Powinien pojawić się alert z kodem klawisza!**

### Jeśli działa:
- Zmapuj wszystkie przyciski
- Kliknij "Save"
- Otwórz prompter i testuj

### Jeśli nie działa:
- Sprawdź logi: `npx react-native log-android`
- Kontroler S18 może nadal działać jako mysz (nie klawiatura)
- W takim przypadku wrócimy do PrompterTouchControls

## 💰 Koszty

### Expo Free Plan:
- **30 minut budowania miesięcznie** (za darmo)
- Development build zajmuje ~10-20 minut
- Wystarczy na 1-2 buildy miesięcznie

### Expo Paid Plans:
- Production: $29/miesiąc - 60 minut budowania
- Enterprise: $99/miesiąc - 180 minut budowania

## 🔄 Alternatywy

### Opcja 1: Budowanie lokalne (za darmo)
```bash
eas build --profile development --platform android --local
```

**Wymaga:**
- Android Studio
- Android SDK
- Java JDK
- ~10GB miejsca na dysku

**Zalety:**
- Za darmo
- Szybsze (jeśli masz dobry komputer)

**Wady:**
- Skomplikowana konfiguracja
- Wymaga dużo miejsca

### Opcja 2: PrompterTouchControls (za darmo)
- Działa w Expo Go
- Nie wymaga budowania
- Klikalne obszary zamiast mapowania klawiszy

## 📝 Notatki

### react-native-keyevent w Development Build
- Powinien działać bez problemu
- Automatyczne wykrywanie klawiszy zadziała
- Ale kontroler S18 może nadal nie wysyłać kodów klawiszy (działa jako mysz)

### Kontroler S18
- Według poprzednich testów, działa jako mysz/touchpad
- Może nie wysyłać kodów klawiszy nawet w development build
- Jeśli tak, PrompterTouchControls jest lepszym rozwiązaniem

## 🎯 Następne Kroki

1. **Zdecyduj, czy chcesz zbudować development build**
   - Wymaga konta Expo
   - Zajmuje 10-20 minut
   - Zużywa kredyty budowania

2. **Jeśli tak:**
   ```bash
   eas login
   eas build --profile development --platform android
   ```

3. **Jeśli nie:**
   - Możemy wrócić do PrompterTouchControls
   - Lub spróbować mapowania ręcznego (wpisywanie kodów)

## ❓ Pytania

**Q: Czy development build będzie działał na zawsze?**
A: Tak, po zbudowaniu możesz używać go bez limitu czasu.

**Q: Czy muszę budować za każdym razem, gdy zmienię kod?**
A: Nie! Development build działa jak Expo Go - możesz aktualizować kod przez hot reload.

**Q: Czy mogę używać Expo Go i development build jednocześnie?**
A: Nie, to dwie osobne aplikacje. Musisz wybrać jedną.

**Q: Co jeśli kontroler S18 nadal nie będzie działał?**
A: Wrócimy do PrompterTouchControls (klikalne obszary).

---

**Gotowy do budowania?** Uruchom:
```bash
eas login
eas build --profile development --platform android
```
