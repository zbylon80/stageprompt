# Key Mapping w Expo Go - Instrukcja

## Problem z Expo Go

Expo Go **nie obsługuje** `react-native-keyevent` (custom native module). Dlatego automatyczne wykrywanie klawiszy nie działa na Androidzie w Expo Go.

## ✅ Rozwiązanie: Ręczne mapowanie

Stworzyłem uproszczoną wersję dialogu mapowania, która pozwala:
1. Wybrać z popularnych kodów klawiszy
2. Ręcznie wprowadzić kod klawisza

## 📱 Jak używać (Expo Go):

### Krok 1: Znajdź kody klawiszy swojego kontrolera

1. **Otwórz dowolną aplikację tekstową** (Notatki, Wiadomości, Chrome)
2. **Naciśnij przyciski na kontrolerze Bluetooth**
3. **Sprawdź które przyciski działają:**
   - Czy wpisują znaki?
   - Czy działają jak strzałki?
   - Czy działają jak media controls?

### Krok 2: Użyj popularnych kodów

W aplikacji StagePrompt:
1. Przejdź do **Settings**
2. Kliknij **"Configure Key Mapping"**
3. Dla każdej akcji zobaczysz **"Common codes"**:

**Next Song:**
- Right Arrow (22)
- Media Next (87)
- Enter (66)

**Previous Song:**
- Left Arrow (21)
- Media Previous (88)
- Backspace (67)

**Play/Pause:**
- Space (62)
- Media Play/Pause (85)
- Up Arrow (19)

4. **Kliknij na kod** który odpowiada Twojemu przyciskowi
5. Kod zostanie zmapowany (przycisk zmieni kolor na niebieski)

### Krok 3: Lub wprowadź ręcznie

Jeśli Twój kontroler używa innych kodów:
1. Kliknij **"Manual"**
2. Wprowadź **kod klawisza** (0-255)
3. Kliknij **✓** aby zapisać

### Krok 4: Zapisz mapowanie

1. Kliknij **"Save"** na dole dialogu
2. Zobaczysz komunikat "Key mapping saved successfully"

### Krok 5: Testuj w prompterze

1. Utwórz setlistę z kilkoma utworami
2. Otwórz prompter
3. **Naciśnij zmapowane przyciski na kontrolerze**
4. Powinny działać!

## 🔍 Jak znaleźć kody klawiszy?

### Metoda 1: Testuj popularne kody

Większość kontrolerów Bluetooth używa standardowych kodów:
- **Strzałki:** 19 (góra), 20 (dół), 21 (lewo), 22 (prawo)
- **Media:** 85 (play/pause), 87 (next), 88 (previous)
- **Podstawowe:** 62 (space), 66 (enter), 67 (backspace)

Spróbuj każdego z nich i zobacz który działa!

### Metoda 2: Aplikacja do testowania

Zainstaluj aplikację "Bluetooth Keyboard Tester" z Google Play:
1. Otwórz aplikację
2. Naciśnij przyciski na kontrolerze
3. Aplikacja pokaże kody klawiszy

### Metoda 3: Dokumentacja kontrolera

Sprawdź dokumentację swojego kontrolera - może podawać kody klawiszy.

## 📋 Popularne kontrolery i ich kody:

### Footswitch (typowy):
- Lewy przycisk: 21 (Left Arrow)
- Prawy przycisk: 22 (Right Arrow)

### Pilot prezentacyjny:
- Next: 22 (Right Arrow) lub 87 (Media Next)
- Previous: 21 (Left Arrow) lub 88 (Media Previous)
- Play/Pause: 62 (Space) lub 85 (Media Play/Pause)

### Gamepad (niektóre modele):
- A button: 66 (Enter)
- B button: 67 (Backspace)
- D-pad: 19, 20, 21, 22 (strzałki)

## ⚠️ Ważne uwagi:

1. **Expo Go ma ograniczenia** - automatyczne wykrywanie nie działa
2. **Kontroler musi działać jako klawiatura** - nie wszystkie kontrolery to robią
3. **Testuj w aplikacji tekstowej** - upewnij się że kontroler w ogóle działa
4. **Zapisz mapowanie** - nie zapomnij kliknąć "Save"!

## 🚀 Dla pełnej funkcjonalności:

Jeśli chcesz automatyczne wykrywanie klawiszy (jak na webie), musisz:
1. Zbudować **development build** (nie Expo Go)
2. Lub użyć **EAS Build** z Expo

Ale dla większości użytkowników, ręczne mapowanie jest wystarczające!

## ✅ Przykład mapowania:

```
Next Song: Right Arrow (22)
Previous Song: Left Arrow (21)
Play/Pause: Space (62)
```

Zapisz, otwórz prompter, naciśnij przyciski - działa! 🎉

---

**Ostatnia aktualizacja:** December 2, 2025  
**Status:** ✅ Działa w Expo Go z ręcznym mapowaniem
