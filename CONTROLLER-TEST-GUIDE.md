# 🎮 Przewodnik Testowania Kontrolera S18

**Data:** December 2, 2025  
**Cel:** Przetestować kontroler Bluetooth S18 z aplikacją StagePrompt

---

## ✅ Przed Testem - Checklist

- [ ] Aplikacja działa na telefonie (development build)
- [ ] Metro bundler działa w WSL
- [ ] Telefon jest podłączony przez ADB
- [ ] Kontroler S18 jest naładowany

---

## 🔧 Krok 1: Przygotowanie

### 1.1 Sprawdź czy aplikacja działa

```bash
# W WSL - sprawdź czy Metro działa
# Powinno być uruchomione z poprzedniej sesji
# Jeśli nie, uruchom:
npm start
```

### 1.2 Otwórz logi w osobnym terminalu

```bash
# W nowym terminalu WSL
npx react-native log-android
```

Zostaw ten terminal otwarty - będziesz tu widział wszystkie logi z aplikacji.

---

## 📱 Krok 2: Sparuj Kontroler S18

### 2.1 Włącz kontroler
- Naciśnij przycisk power na kontrolerze S18
- LED powinien zacząć migać (tryb parowania)

### 2.2 Sparuj przez Bluetooth

**Na telefonie:**
1. Otwórz **Ustawienia** → **Bluetooth**
2. Upewnij się że Bluetooth jest **włączony**
3. Poczekaj aż zobaczysz **"S18"** lub podobną nazwę na liście
4. Kliknij na nazwę kontrolera
5. Poczekaj na komunikat **"Połączono"**

### 2.3 Sprawdź połączenie przez ADB (opcjonalnie)

```bash
# W WSL
adb shell dumpsys bluetooth_manager | grep -A 5 "Bonded"
```

Powinieneś zobaczyć kontroler S18 na liście sparowanych urządzeń.

---

## 🎵 Krok 3: Przygotuj Dane Testowe

### Opcja A: Użyj istniejących danych (jeśli masz)

Jeśli już masz utwory i setlisty w aplikacji, przejdź do **Kroku 4**.

### Opcja B: Stwórz testowe dane ręcznie

**W aplikacji na telefonie:**

1. **Stwórz pierwszy utwór:**
   - Otwórz aplikację
   - Przejdź do **"Songs"**
   - Kliknij **"+"** (Add Song)
   - Wpisz:
     - Title: `Test Song 1`
     - Artist: `Test Artist`
     - Duration: `3:00`
   - W sekcji Lyrics wpisz kilka linijek tekstu:
     ```
     First line of lyrics
     Second line of lyrics
     Third line of lyrics
     Fourth line of lyrics
     ```
   - Kliknij **"Save"**

2. **Stwórz drugi utwór:**
   - Powtórz proces dla `Test Song 2`

3. **Stwórz trzeci utwór:**
   - Powtórz proces dla `Test Song 3`

4. **Stwórz setlistę:**
   - Przejdź do **"Setlists"**
   - Kliknij **"+"** (Add Setlist)
   - Wpisz nazwę: `Test Setlist`
   - Dodaj wszystkie 3 utwory do setlisty
   - Kliknij **"Save"**

### Opcja C: Załaduj sample data przez kod (szybsze)

Jeśli chcesz, mogę dodać przycisk w Settings do załadowania przykładowych danych. Powiedz mi, jeśli chcesz to zrobić.

---

## 🎬 Krok 4: Testuj Kontroler w Prompterze

### 4.1 Otwórz Prompter

**W aplikacji:**
1. Przejdź do **"Setlists"**
2. Kliknij na swoją setlistę (np. `Test Setlist`)
3. Kliknij **"Start Prompter"** (duży niebieski przycisk)

### 4.2 Sprawdź interfejs

**Powinieneś zobaczyć:**
- Tekst pierwszej piosenki na czarnym tle
- Na dole ekranu: ikony **← ⏸ →**
- Tekst powinien powoli scrollować w górę

### 4.3 Testuj kontroler S18

**Poruszaj kursorem:**
- Poruszaj kontrolerem S18
- **Powinien pojawić się kursor myszy** na ekranie telefonu
- Jeśli nie widzisz kursora, sprawdź czy kontroler jest połączony

**Test 1: Next Song (Następna piosenka)**
- Przesuń kursor na **prawą stronę ekranu**
- **Kliknij** przyciskiem na kontrolerze
- ✅ **Oczekiwany rezultat:** Prompter przechodzi do następnej piosenki

**Test 2: Previous Song (Poprzednia piosenka)**
- Przesuń kursor na **lewą stronę ekranu**
- **Kliknij** przyciskiem na kontrolerze
- ✅ **Oczekiwany rezultat:** Prompter wraca do poprzedniej piosenki

**Test 3: Play/Pause**
- Przesuń kursor na **środek ekranu**
- **Kliknij** przyciskiem na kontrolerze
- ✅ **Oczekiwany rezultat:** Scrollowanie zatrzymuje się
- Kliknij ponownie → scrollowanie wznawia się

### 4.4 Sprawdź logi

**W terminalu z logami powinieneś zobaczyć:**
```
Touch control action: nextSong
Touch control action: previousSong
Touch control action: playPause
```

---

## 🐛 Rozwiązywanie Problemów

### Problem 1: Nie widzę kursora myszy

**Możliwe przyczyny:**
- Kontroler nie jest połączony
- Kontroler jest w trybie uśpienia

**Rozwiązanie:**
1. Sprawdź w Ustawieniach Bluetooth czy kontroler jest "Połączony"
2. Naciśnij dowolny przycisk na kontrolerze aby go "obudzić"
3. Spróbuj rozłączyć i połączyć ponownie

### Problem 2: Kursor się porusza ale kliknięcia nie działają

**Możliwe przyczyny:**
- Nie jesteś w prompterze (jesteś w edytorze lub liście)
- PrompterTouchControls nie jest aktywny

**Rozwiązanie:**
1. Upewnij się że jesteś w widoku promptera (czarny ekran z tekstem)
2. Sprawdź logi - powinny pokazywać "Touch control action"
3. Spróbuj kliknąć palcem w te same obszary - jeśli palec działa, problem jest z kontrolerem

### Problem 3: Kliknięcia działają ale z opóźnieniem

**To jest normalne!**
- Debouncing jest ustawiony na 300ms
- Zapobiega to wielokrotnym akcjom przy jednym kliknięciu

### Problem 4: Kontroler się rozłącza

**Rozwiązanie:**
1. Sprawdź baterię kontrolera
2. Upewnij się że kontroler nie jest za daleko od telefonu
3. Sprawdź czy inne urządzenia Bluetooth nie zakłócają sygnału

### Problem 5: Aplikacja się crashuje

**Sprawdź logi:**
```bash
npx react-native log-android
```

Poszukaj błędów (czerwony tekst). Jeśli widzisz błędy, skopiuj je i pokaż mi.

---

## 📊 Checklist Testów

Po zakończeniu testów, sprawdź:

- [ ] Kursor myszy pojawia się na ekranie
- [ ] Kliknięcie w prawą stronę → Next Song działa
- [ ] Kliknięcie w lewą stronę → Previous Song działa
- [ ] Kliknięcie w środek → Play/Pause działa
- [ ] Ikony ← ⏸ → są widoczne na dole
- [ ] Gesty palcem również działają (backup)
- [ ] Logi pokazują "Touch control action"

---

## 🎯 Alternatywne Testy (bez kontrolera)

Jeśli kontroler nie działa, możesz przetestować funkcjonalność gestami:

**Gesty palcem:**
1. Otwórz prompter
2. **Swipe w prawo** (od lewej do prawej) → Next Song
3. **Swipe w lewo** (od prawej do lewej) → Previous Song
4. **Tap** (dotknij ekran) → Play/Pause

---

## 📝 Notatki

### Co działa:
- PrompterTouchControls - klikalne obszary
- Gesty dotykowe (swipe, tap)
- Kontroler S18 jako mysz

### Co NIE działa (w Expo Go):
- Mapowanie klawiszy (wymaga development build + prawdziwa klawiatura)
- `react-native-keyevent` (custom native module)

### Dlaczego to rozwiązanie jest dobre:
- ✅ Działa w Expo Go
- ✅ Działa z kontrolerem S18 (mysz)
- ✅ Działa z palcem (gesty)
- ✅ Nie wymaga konfiguracji
- ✅ Intuicyjne (ikony pokazują obszary)

---

## 🚀 Następne Kroki

Po pomyślnym teście:

1. **Jeśli wszystko działa:**
   - Możesz używać aplikacji z kontrolerem S18
   - Możesz wyłączyć ikony w Settings (jeśli przeszkadzają)

2. **Jeśli chcesz mapowanie klawiszy:**
   - Potrzebujesz development build (nie Expo Go)
   - Potrzebujesz prawdziwej klawiatury Bluetooth (nie S18)
   - To wymaga więcej pracy - daj znać jeśli chcesz to zrobić

3. **Jeśli chcesz dodać sample data:**
   - Mogę dodać przycisk w Settings do załadowania przykładowych piosenek
   - Daj znać jeśli chcesz

---

**Powodzenia z testami! 🎉**

Jeśli napotkasz problemy, pokaż mi logi i opowiedz co się dzieje.
