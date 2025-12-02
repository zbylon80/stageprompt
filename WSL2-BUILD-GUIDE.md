# WSL2 Development Build - Przewodnik

**Data:** December 2, 2025  
**Platforma:** Windows + WSL2 (Ubuntu)  
**Cel:** Zbudować development build lokalnie przez WSL2

## ✅ Status

- ✅ WSL2 zainstalowane
- ✅ Ubuntu 24.04 zainstalowane i działa
- ⏳ Konfiguracja środowiska w Ubuntu

## 🚀 Kroki do wykonania

### Krok 1: Otwórz terminal WSL

W PowerShell uruchom:
```powershell
wsl
```

To otworzy terminal Ubuntu.

### Krok 2: Zaktualizuj system

W terminalu WSL uruchom:
```bash
sudo apt update && sudo apt upgrade -y
```

### Krok 3: Zainstaluj Node.js i npm

```bash
# Zainstaluj nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Załaduj nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Zainstaluj Node.js 22
nvm install 22
nvm use 22

# Sprawdź instalację
node --version
npm --version
```

### Krok 4: Zainstaluj Java JDK 17

```bash
sudo apt install openjdk-17-jdk -y

# Sprawdź instalację
java -version
```

### Krok 5: Zainstaluj Android SDK

```bash
# Zainstaluj wymagane narzędzia
sudo apt install unzip wget -y

# Pobierz Android Command Line Tools
cd ~
mkdir -p android-sdk/cmdline-tools
cd android-sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools latest
rm commandlinetools-linux-11076708_latest.zip

# Ustaw zmienne środowiskowe
echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Zainstaluj wymagane pakiety SDK
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

### Krok 6: Zainstaluj EAS CLI

```bash
npm install -g eas-cli
```

### Krok 7: Zaloguj się do Expo

```bash
eas login
```

Podaj swoje dane logowania (zbylon80).

### Krok 8: Skopiuj projekt do WSL

Masz dwie opcje:

**Opcja A: Pracuj bezpośrednio na plikach Windows (wolniejsze)**
```bash
cd /mnt/c/Users/zbylo/[ścieżka-do-projektu]
```

**Opcja B: Skopiuj projekt do WSL (szybsze budowanie)**
```bash
# Skopiuj projekt
cp -r /mnt/c/Users/zbylo/[ścieżka-do-projektu] ~/stageprompt

# Przejdź do projektu
cd ~/stageprompt
```

### Krok 9: Zainstaluj zależności projektu

```bash
npm install
```

### Krok 10: Zbuduj development build

```bash
eas build --profile development --platform android --local
```

**Czas budowania:** 10-20 minut (pierwsze budowanie)

### Krok 11: Pobierz APK z WSL do Windows

Po zakończeniu budowania:

```bash
# Znajdź plik APK
ls -la *.apk

# Skopiuj do Windows
cp stageprompt-*.apk /mnt/c/Users/zbylo/Downloads/
```

Teraz możesz zainstalować APK na telefonie z folderu Downloads.

## 🎯 Szybkie komendy

### Uruchom WSL
```powershell
wsl
```

### Przejdź do projektu (w WSL)
```bash
cd ~/stageprompt
```

### Zbuduj aplikację (w WSL)
```bash
eas build --profile development --platform android --local
```

### Skopiuj APK do Windows (w WSL)
```bash
cp stageprompt-*.apk /mnt/c/Users/zbylo/Downloads/
```

## ⚠️ Rozwiązywanie problemów

### Problem: "sdkmanager: command not found"

**Rozwiązanie:**
```bash
source ~/.bashrc
echo $ANDROID_HOME  # Powinno pokazać ścieżkę
```

### Problem: "Java not found"

**Rozwiązanie:**
```bash
sudo apt install openjdk-17-jdk -y
java -version
```

### Problem: "Out of memory"

**Rozwiązanie:**
Zwiększ pamięć dla WSL. Stwórz plik `.wslconfig` w Windows:

```powershell
# W PowerShell (Windows)
notepad $env:USERPROFILE\.wslconfig
```

Dodaj:
```
[wsl2]
memory=8GB
processors=4
```

Zrestartuj WSL:
```powershell
wsl --shutdown
wsl
```

### Problem: Budowanie bardzo wolne

**Rozwiązanie:**
Upewnij się, że projekt jest w systemie plików WSL (`~/stageprompt`), nie w `/mnt/c/...`

## 💡 Wskazówki

### Dostęp do plików WSL z Windows
- Otwórz Explorer
- Wpisz w pasku adresu: `\\wsl$\Ubuntu\home\[username]\stageprompt`

### Edytowanie plików
- Możesz edytować pliki w WSL używając VS Code z Windows
- Zainstaluj rozszerzenie "WSL" w VS Code
- Otwórz folder: `\\wsl$\Ubuntu\home\[username]\stageprompt`

### Kolejne buildy
- Nie musisz instalować wszystkiego ponownie
- Po prostu: `wsl` → `cd ~/stageprompt` → `eas build --profile development --platform android --local`

## 📊 Porównanie opcji

| Aspekt | WSL2 | Serwery Expo |
|--------|------|--------------|
| Koszt | Za darmo | 30 min/miesiąc |
| Czas setup | ~30 minut | 0 minut |
| Czas budowania | 10-20 min | 10-20 min |
| Limity | Brak | 30 min/miesiąc |
| Złożoność | Średnia | Prosta |

## ✅ Status Instalacji

- ✅ WSL2 zainstalowane i działa
- ✅ Ubuntu 24.04 zainstalowane
- ✅ Node.js 22.21.0 zainstalowany
- ✅ npm 10.9.4 zainstalowany
- ✅ Java 17 zainstalowany
- ✅ Android SDK zainstalowany i skonfigurowany
- ✅ EAS CLI zainstalowany
- ✅ Projekt skopiowany do ~/stageprompt
- ⏳ Logowanie do Expo - **MUSISZ TO ZROBIĆ TERAZ**

## 🎯 Następne kroki - DO WYKONANIA TERAZ

### 1. Zaloguj się do Expo

Otwórz terminal WSL (wpisz `wsl` w PowerShell) i uruchom:

```bash
eas login
```

Podaj dane logowania:
- Username: **zbylon80**
- Password: [twoje hasło]

### 2. Przejdź do projektu

```bash
cd ~/stageprompt
```

### 3. Zbuduj development build

```bash
eas build --profile development --platform android --local
```

**Czas budowania:** 10-20 minut

### 4. Skopiuj APK do Windows

Po zakończeniu budowania:

```bash
cp stageprompt-*.apk /mnt/c/Users/zbylo/Downloads/
```

APK będzie w folderze Downloads w Windows.

### 5. Zainstaluj na telefonie

1. Podłącz telefon przez USB
2. Włącz USB Debugging
3. W PowerShell (Windows):
   ```powershell
   adb install C:\Users\zbylo\Downloads\stageprompt-*.apk
   ```

---

**Gotowy?** Uruchom `wsl` w PowerShell i zaloguj się do Expo!
