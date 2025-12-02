# Szybki przewodnik - Budowanie w WSL2

## ✅ Wszystko jest gotowe!

- ✅ WSL2 z Ubuntu 24.04
- ✅ Node.js 22.21.0
- ✅ Java 17
- ✅ Android SDK
- ✅ EAS CLI
- ✅ Projekt skopiowany do ~/stageprompt
- ✅ Git skonfigurowany i commit zrobiony

## 🚀 Teraz wykonaj te 4 kroki:

### 1. Otwórz terminal WSL

W PowerShell wpisz:
```powershell
wsl
```

### 2. Zaloguj się do Expo

```bash
eas login
```

Podaj dane:
- Username: **zbylon80**
- Password: [twoje hasło Expo]

### 3. Przejdź do projektu i zbuduj

```bash
cd ~/stageprompt
eas build --profile development --platform android --local
```

**Czas budowania:** 10-20 minut

### 4. Skopiuj APK do Windows

Po zakończeniu budowania:

```bash
cp stageprompt-*.apk /mnt/c/Users/zbylo/Downloads/
```

## 📱 Instalacja na telefonie

### Opcja 1: Przez USB

1. Podłącz telefon przez USB
2. Włącz USB Debugging (Settings → Developer options)
3. W PowerShell (Windows):
   ```powershell
   adb install C:\Users\zbylo\Downloads\stageprompt-*.apk
   ```

### Opcja 2: Ręcznie

1. Otwórz folder Downloads na telefonie
2. Kliknij na plik APK
3. Zainstaluj (może wymagać włączenia "Install from unknown sources")

## 🎮 Testowanie

Po zainstalowaniu:

1. Uruchom Metro bundler (w PowerShell Windows):
   ```powershell
   npm start
   ```

2. Otwórz aplikację na telefonie (StagePrompt)

3. Testuj KeyMapping:
   - Settings → Configure Key Mapping
   - Kliknij "Map" przy akcji
   - Naciśnij przycisk na kontrolerze S18
   - Sprawdź, czy pojawia się kod klawisza

## ⚠️ Jeśli coś nie działa

### Problem: "Not logged in"
```bash
eas login
```

### Problem: "Git repository required"
```bash
cd ~/stageprompt
git add -A
git commit -m "Update"
```

### Problem: Build fails
Sprawdź logi i prześlij mi błąd.

---

**Gotowy?** Uruchom `wsl` i zacznij od `eas login`!
