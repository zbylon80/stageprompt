# Lokalne Budowanie Development Build - Przewodnik

**Data:** December 2, 2025  
**Platforma:** Windows  
**Cel:** Zbudować development build lokalnie (bez kosztów)

## 📋 Wymagania

### 1. Android Studio
- **Pobierz:** https://developer.android.com/studio
- **Rozmiar:** ~1GB instalator, ~10GB po instalacji
- **Wersja:** Najnowsza stabilna (Hedgehog lub nowsza)

### 2. Java JDK
- **Wersja:** JDK 17 (zalecane) lub JDK 11
- **Pobierz:** https://adoptium.net/ (Temurin JDK)
- Android Studio może zainstalować JDK automatycznie

### 3. Miejsce na dysku
- Android Studio: ~10GB
- Android SDK: ~5GB
- Build cache: ~2-3GB
- **Razem: ~15-20GB**

## 🚀 Instalacja Krok po Kroku

### Krok 1: Pobierz i zainstaluj Android Studio

1. Pobierz z https://developer.android.com/studio
2. Uruchom instalator
3. Wybierz "Standard" installation
4. Zaakceptuj wszystkie komponenty:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
   - Performance (Intel HAXM) - opcjonalne

**Czas instalacji:** 20-30 minut

### Krok 2: Skonfiguruj Android SDK

Po uruchomieniu Android Studio:

1. Otwórz **Settings** (File → Settings lub Ctrl+Alt+S)
2. Idź do **Languages & Frameworks → Android SDK**
3. W zakładce **SDK Platforms** zaznacz:
   - ✅ Android 13.0 (Tiramisu) - API Level 33
   - ✅ Android 12.0 (S) - API Level 31
   - ✅ Show Package Details (na dole)
   
4. W zakładce **SDK Tools** zaznacz:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator (opcjonalne)
   - ✅ Intel x86 Emulator Accelerator (HAXM) (opcjonalne)

5. Kliknij **Apply** i poczekaj na pobranie (~5GB)

### Krok 3: Ustaw zmienne środowiskowe

**Windows:**

1. Otwórz **System Properties** (Win + Pause/Break)
2. Kliknij **Advanced system settings**
3. Kliknij **Environment Variables**
4. W sekcji **User variables** dodaj:

**ANDROID_HOME:**
```
C:\Users\[TwojaNazwaUżytkownika]\AppData\Local\Android\Sdk
```

**JAVA_HOME:** (jeśli Android Studio zainstalował JDK)
```
C:\Program Files\Android\Android Studio\jbr
```

5. Edytuj zmienną **Path** i dodaj:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

6. Kliknij **OK** i **zamknij wszystkie okna terminala**

### Krok 4: Zweryfikuj instalację

Otwórz **nowy** terminal PowerShell i sprawdź:

```powershell
# Sprawdź Java
java -version
# Powinno pokazać: openjdk version "17.x.x" lub podobne

# Sprawdź Android SDK
adb --version
# Powinno pokazać: Android Debug Bridge version x.x.x

# Sprawdź dostępne SDK
sdkmanager --list
# Powinno pokazać listę zainstalowanych pakietów
```

### Krok 5: Zainstaluj EAS CLI

```powershell
npm install -g eas-cli
```

### Krok 6: Zaloguj się do Expo

```powershell
eas login
```

Podaj dane logowania do konta Expo (lub stwórz nowe na https://expo.dev).

## 🔨 Budowanie Lokalnie

### Przygotowanie projektu

1. Upewnij się, że jesteś w katalogu projektu:
```powershell
cd C:\path\to\stageprompt
```

2. Zainstaluj zależności (jeśli jeszcze nie):
```powershell
npm install
```

### Budowanie Development Build

```powershell
eas build --profile development --platform android --local
```

**Co się stanie:**
1. EAS sprawdzi konfigurację
2. Zapyta o kilka rzeczy (naciśnij Enter dla domyślnych)
3. Rozpocznie budowanie (~10-20 minut)
4. Stworzy plik APK w katalogu projektu

**Czas budowania:** 10-20 minut (pierwsze budowanie może trwać dłużej)

### Monitorowanie budowania

Terminal pokaże postęp:
```
✔ Build environment set up
✔ Gradle dependencies installed
✔ Running Gradle build
✔ Build completed
```

### Po zakończeniu

Znajdziesz plik APK w katalogu projektu:
```
stageprompt-[hash].apk
```

## 📱 Instalacja na telefonie

### Opcja 1: Przez USB

1. Włącz **Developer Options** na telefonie:
   - Settings → About phone
   - Kliknij 7 razy na "Build number"
   
2. Włącz **USB Debugging**:
   - Settings → Developer options → USB debugging

3. Podłącz telefon do komputera przez USB

4. Zainstaluj APK:
```powershell
adb install stageprompt-[hash].apk
```

### Opcja 2: Przez plik

1. Skopiuj APK na telefon (przez USB, email, cloud)
2. Na telefonie otwórz plik APK
3. Włącz "Install from unknown sources" jeśli potrzeba
4. Zainstaluj

## 🎮 Testowanie

### Uruchom Metro bundler

```powershell
npm start
```

### Otwórz aplikację na telefonie

1. Uruchom zainstalowaną aplikację (StagePrompt)
2. Powinna połączyć się z Metro bundler
3. Jeśli nie, wpisz adres IP komputera ręcznie

### Testuj KeyMapping

1. Otwórz Settings → Configure Key Mapping
2. Kliknij "Map" przy akcji
3. Naciśnij przycisk na kontrolerze S18
4. **Sprawdź, czy pojawia się kod klawisza**

## ⚠️ Rozwiązywanie Problemów

### Problem: "ANDROID_HOME is not set"

**Rozwiązanie:**
1. Sprawdź zmienne środowiskowe (Krok 3)
2. Zamknij i otwórz ponownie terminal
3. Sprawdź: `echo $env:ANDROID_HOME`

### Problem: "Java not found"

**Rozwiązanie:**
1. Zainstaluj JDK 17 z https://adoptium.net/
2. Ustaw JAVA_HOME (Krok 3)
3. Sprawdź: `java -version`

### Problem: "SDK not found"

**Rozwiązanie:**
1. Otwórz Android Studio
2. Settings → Android SDK
3. Zainstaluj brakujące komponenty

### Problem: "Build failed - Gradle error"

**Rozwiązanie:**
1. Usuń cache:
```powershell
cd android
.\gradlew clean
cd ..
```

2. Spróbuj ponownie:
```powershell
eas build --profile development --platform android --local
```

### Problem: "Out of memory"

**Rozwiązanie:**
1. Zamknij inne aplikacje
2. Zwiększ pamięć dla Gradle:
   - Stwórz plik `android/gradle.properties`
   - Dodaj: `org.gradle.jvmargs=-Xmx4096m`

### Problem: Metro bundler nie łączy się

**Rozwiązanie:**
1. Sprawdź, czy telefon i komputer są w tej samej sieci WiFi
2. Wyłącz firewall tymczasowo
3. Użyj tunelowania:
```powershell
npm start -- --tunnel
```

## 📊 Porównanie: Lokalnie vs Serwery Expo

| Aspekt | Lokalnie | Serwery Expo |
|--------|----------|--------------|
| Koszt | Za darmo | 30 min/miesiąc darmowo |
| Czas budowania | 10-20 min | 10-20 min |
| Wymagania | Android Studio (~15GB) | Tylko internet |
| Konfiguracja | Skomplikowana | Prosta |
| Limity | Brak | 30 min/miesiąc |

## 🎯 Następne Kroki

### Po zainstalowaniu Android Studio:

1. **Zweryfikuj instalację:**
```powershell
java -version
adb --version
echo $env:ANDROID_HOME
```

2. **Zaloguj się do Expo:**
```powershell
eas login
```

3. **Zbuduj aplikację:**
```powershell
eas build --profile development --platform android --local
```

4. **Zainstaluj na telefonie i testuj!**

## 💡 Wskazówki

### Przyspieszenie kolejnych buildów:
- Pierwsze budowanie: ~20 minut
- Kolejne budowania: ~5-10 minut (cache)

### Oszczędzanie miejsca:
- Możesz usunąć stare APK po zainstalowaniu
- Cache Gradle można czyścić: `.\gradlew clean`

### Aktualizacje kodu:
- Nie musisz budować ponownie dla zmian w JS/TS
- Metro bundler zaktualizuje kod automatycznie (hot reload)
- Buduj ponownie tylko przy zmianach w native code

## ❓ FAQ

**Q: Czy muszę mieć Android Studio otwarte podczas budowania?**
A: Nie, wystarczy że jest zainstalowane.

**Q: Czy mogę usunąć Android Studio po zbudowaniu?**
A: Nie, będziesz go potrzebować do kolejnych buildów.

**Q: Ile razy mogę budować?**
A: Bez limitu! To lokalne budowanie.

**Q: Czy development build wygasa?**
A: Nie, działa bez limitu czasu.

---

**Gotowy?** Zacznij od instalacji Android Studio, potem wróć tutaj po instrukcje budowania!
