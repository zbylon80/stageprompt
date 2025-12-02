# Development Build - Checklist

**Szybki przewodnik krok po kroku**

## ✅ Przed budowaniem

- [ ] **Android Studio zainstalowane**
  - Pobierz: https://developer.android.com/studio
  - Instalacja: ~30 minut
  - Miejsce: ~15GB

- [ ] **Android SDK skonfigurowane**
  - Settings → Android SDK
  - Zainstaluj API Level 33 i 31
  - Zainstaluj SDK Tools

- [ ] **Zmienne środowiskowe ustawione**
  - ANDROID_HOME: `C:\Users\[User]\AppData\Local\Android\Sdk`
  - Path: dodaj `%ANDROID_HOME%\platform-tools`
  - **Zamknij i otwórz ponownie terminal!**

- [ ] **Weryfikacja instalacji**
  ```powershell
  java -version        # Powinno pokazać wersję
  adb --version        # Powinno pokazać wersję
  echo $env:ANDROID_HOME  # Powinno pokazać ścieżkę
  ```

- [ ] **EAS CLI zainstalowane**
  ```powershell
  npm install -g eas-cli
  ```

- [ ] **Zalogowany do Expo**
  ```powershell
  eas login
  ```

## 🔨 Budowanie

- [ ] **Przejdź do katalogu projektu**
  ```powershell
  cd C:\path\to\stageprompt
  ```

- [ ] **Zainstaluj zależności**
  ```powershell
  npm install
  ```

- [ ] **Zbuduj development build**
  ```powershell
  eas build --profile development --platform android --local
  ```
  
  **Czas:** 10-20 minut (pierwsze budowanie)

- [ ] **Poczekaj na zakończenie**
  - Terminal pokaże postęp
  - Plik APK pojawi się w katalogu projektu

## 📱 Instalacja

- [ ] **Włącz USB Debugging na telefonie**
  - Settings → About phone → Kliknij 7x "Build number"
  - Settings → Developer options → USB debugging

- [ ] **Podłącz telefon przez USB**

- [ ] **Zainstaluj APK**
  ```powershell
  adb install stageprompt-[hash].apk
  ```

  **LUB** skopiuj APK na telefon i zainstaluj ręcznie

## 🎮 Testowanie

- [ ] **Uruchom Metro bundler**
  ```powershell
  npm start
  ```

- [ ] **Otwórz aplikację na telefonie**
  - Uruchom "StagePrompt"
  - Powinna połączyć się z Metro

- [ ] **Testuj KeyMapping**
  - Settings → Configure Key Mapping
  - Kliknij "Map"
  - Naciśnij przycisk na kontrolerze S18
  - **Sprawdź, czy pojawia się kod klawisza**

## 🎯 Jeśli KeyMapping działa

- [ ] **Zmapuj wszystkie przyciski**
  - Next Song
  - Previous Song
  - Play/Pause

- [ ] **Zapisz mapowanie**
  - Kliknij "Save"

- [ ] **Testuj w prompterze**
  - Otwórz setlistę
  - Uruchom prompter
  - Testuj przyciski kontrolera

## ❌ Jeśli KeyMapping NIE działa

Kontroler S18 prawdopodobnie działa jako mysz, nie klawiatura.

**Opcje:**
1. Spróbuj innego kontrolera Bluetooth (z prawdziwymi klawiszami)
2. Wróć do PrompterTouchControls (klikalne obszary)
3. Użyj mapowania ręcznego (wpisz kody ręcznie)

## 📝 Notatki

### Pierwsze budowanie:
- Może trwać 20-30 minut
- Gradle pobierze wszystkie zależności
- To normalne!

### Kolejne budowania:
- Będą szybsze (~5-10 minut)
- Gradle użyje cache

### Aktualizacje kodu:
- Nie musisz budować ponownie dla zmian JS/TS
- Metro bundler zaktualizuje automatycznie
- Buduj ponownie tylko dla zmian native

### Problemy?
- Sprawdź LOCAL-BUILD-SETUP.md → Rozwiązywanie Problemów
- Sprawdź logi: `adb logcat`
- Zapytaj mnie!

---

**Obecny status:** ⏳ Czekam na instalację Android Studio

**Następny krok:** Po zainstalowaniu Android Studio, wróć tutaj i zaznacz checklistę!
