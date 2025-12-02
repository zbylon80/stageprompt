# Rozwiązanie dla kontrolera S18 (Mouse Mode)

## Problem
Kontroler S18 działa jako **Bluetooth Mouse/Touchpad**, nie jako klawiatura.
- Pokazuje kursor na ekranie
- Przyciski działają jak kliknięcia myszy
- `react-native-keyevent` nie wykrywa zdarzeń

## ✅ Rozwiązanie: Klikalne obszary

Dodamy **niewidoczne przyciski** na ekranie promptera:
- **Lewa strona ekranu** → Previous Song
- **Prawa strona ekranu** → Next Song  
- **Środek ekranu** → Play/Pause

### Jak to będzie działać:
1. Poruszasz kursorem kontrolera S18
2. Klikasz w odpowiedni obszar ekranu
3. Akcja się wykonuje!

### Zalety:
- ✅ Działa z kontrolerem S18
- ✅ Działa z dowolnym kontrolerem typu mysz
- ✅ Działa w Expo Go
- ✅ Nie wymaga mapowania klawiszy
- ✅ Intuicyjne (lewo/prawo/środek)

### Layout ekranu:

```
┌─────────────────────────────────┐
│                                 │
│  [PREV]    [PAUSE]    [NEXT]   │
│   ←          ⏸         →       │
│                                 │
│         TEKST UTWORU            │
│                                 │
│                                 │
└─────────────────────────────────┘
```

Lub alternatywnie - pełnoekranowe obszary:

```
┌──────┬──────────┬──────┐
│      │          │      │
│      │          │      │
│ PREV │  PAUSE   │ NEXT │
│  ←   │    ⏸     │  →   │
│      │          │      │
│      │          │      │
└──────┴──────────┴──────┘
```

## Implementacja

Dodam do PrompterScreen:
1. Trzy niewidoczne TouchableOpacity obszary
2. Opcjonalne wizualne wskazówki (można wyłączyć)
3. Feedback po kliknięciu

## Alternatywa: Gesty dotykowe

Jeśli wolisz dotykać ekran palcem zamiast kontrolera:
- **Swipe w prawo** → Next
- **Swipe w lewo** → Previous
- **Tap** → Play/Pause

## Pytanie:

Którą opcję wolisz?

**A) Klikalne obszary** (dla kontrolera S18 jako mysz)
- Poruszasz kursorem i klikasz

**B) Gesty dotykowe** (dla palca)
- Przesuwasz palcem po ekranie

**C) Obie opcje** (uniwersalne)
- Działa z kontrolerem i palcem

---

Powiedz którą opcję wybrać, a dodam to do aplikacji! 🎯
