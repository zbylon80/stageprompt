# Gradle Build - Przewodnik Szybki

**Data:** December 2, 2025  
**Metoda:** Bezpośrednie budowanie przez Gradle (bez EAS)  
**Czas:** ~10-15 minut

## 🎯 Kroki do wykonania

### 1. Otwórz terminal WSL

W PowerShell uruchom:
```powershell
wsl
```

### 2. Przejdź do projektu

```bash
cd ~/stageprompt
```

### 3. Wygeneruj natywny kod Android

```bash
npx expo prebuild --platform android
```

To wygeneruje folder `android/` z natywnym kodem.

### 4. Zbuduj APK przez Gradle

```bash
cd android
./gradlew assembleDebug
```

**Czas budowania:** 10-15 minut (pierwsze budowanie)

### 5. Znajdź zbudowany APK

APK będzie w:
```bash
android/app/build/outputs/apk/debug/app-debug.apk
```

### 6. Skopiuj APK do Windows

```bash
cp app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/zbylo/Downloads/stageprompt-debug.apk
```

### 7. Zainstaluj na telefonie

**Opcja A: Przez ADB (telefon podłączony przez USB)**

W PowerShell (Windows):
```powershell
adb install C:\Users\zbylo\Downloads\stageprompt-debug.apk
```

**Opcja B: Ręcznie**
1. Otwórz folder Downloads na telefonie
2. Kliknij na plik `stageprompt-debug.apk`
3. Zainstaluj aplikację

## 🚀 Szybkie komendy (wszystko w jednym)

Otwórz WSL i uruchom:

```bash
cd ~/stageprompt
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/zbylo/Downloads/stageprompt-debug.apk
```

Następnie w PowerShell (Windows):
```powershell
adb install C:\Users\zbylo\Downloads\stageprompt-debug.apk
```

## ⚠️ Rozwiązywanie problemów

### Problem: "Permission denied: ./gradlew"

**Rozwiązanie:**
```bash
chmod +x gradlew
./gradlew assembleDebug
```

### Problem: "ANDROID_HOME not set"

**Rozwiązanie:**
```bash
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
./gradlew assembleDebug
```

### Problem: "SDK location not found"

**Rozwiązanie:**
Stwórz plik `local.properties` w folderze `android/`:
```bash
cd ~/stageprompt/android
echo "sdk.dir=$HOME/android-sdk" > local.properties
./gradlew assembleDebug
```

### Problem: Build fails z błędem NDK

**Rozwiązanie:**
```bash
# Zainstaluj NDK
cd ~
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "ndk;27.1.12297006"

# Spróbuj ponownie
cd ~/stageprompt/android
./gradlew assembleDebug
```

## 💡 Wskazówki

### Kolejne buildy
Po pierwszym buildzie, kolejne będą szybsze (2-5 minut):
```bash
cd ~/stageprompt/android
./gradlew assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/zbylo/Downloads/stageprompt-debug.apk
```

### Czyszczenie przed buildem
Jeśli coś nie działa, wyczyść cache:
```bash
cd ~/stageprompt/android
./gradlew clean
./gradlew assembleDebug
```

### Release build (mniejszy APK)
Dla wersji produkcyjnej:
```bash
./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release-unsigned.apk /mnt/c/Users/zbylo/Downloads/
```

## 📊 Porównanie z EAS

| Aspekt | Gradle | EAS |
|--------|--------|-----|
| Logowanie | Nie wymaga | Wymaga konta Expo |
| Czas setup | 0 minut | Wymaga logowania |
| Czas budowania | 10-15 min | 10-20 min |
| Złożoność | Prosta | Średnia |
| Kontrola | Pełna | Ograniczona |

## ✅ Gotowe!

Po wykonaniu tych kroków będziesz miał:
- ✅ Zbudowany APK w folderze Downloads
- ✅ Gotowy do instalacji na telefonie
- ✅ Możliwość szybkich kolejnych buildów

---

**Gotowy?** Uruchom `wsl` w PowerShell i wykonaj komendy!
