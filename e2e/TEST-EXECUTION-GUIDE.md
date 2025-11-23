# E2E Test Execution Guide - StagePrompt

## Status Testów

| Test Case | Status | Ostatnie wykonanie | Wynik |
|-----------|--------|-------------------|-------|
| TC-001: Song List - Empty State | ⏳ Nie wykonano | - | - |
| TC-002: Song Creation - Basic | ⏳ Nie wykonano | - | - |

## Jak Wykonać Testy E2E

### Wymagania Wstępne

1. ✅ **Aplikacja uruchomiona**: http://localhost:19847
2. ✅ **MCP Playwright skonfigurowany**: `.kiro/settings/mcp.json`
3. ⚠️ **Serwer MCP połączony**: Sprawdź w panelu MCP Server w Kiro IDE
4. ⚠️ **Browser zainstalowany**: Uruchom `mcp_playwright_browser_install` jeśli potrzeba

### Krok 1: Sprawdź Połączenie MCP

W tym oknie czatu (Kiro IDE) wpisz:

```
Czy masz dostęp do narzędzi MCP Playwright?
```

Jeśli odpowiem "tak" lub pokażę listę narzędzi, możesz przejść dalej.

### Krok 2: Wykonaj TC-001 (Empty State)

Otwórz plik `e2e/test-cases/TC-001-song-list-empty.md` i wykonaj każdy krok:

#### Krok 1: Nawigacja
```
mcp_playwright_browser_navigate({ url: "http://localhost:19847" })
```

#### Krok 2: Snapshot
```
mcp_playwright_browser_snapshot()
```
**Sprawdź**: Czy widoczny komunikat o pustej liście?

#### Krok 3: Screenshot
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/empty-state.png" })
```

#### Krok 4: Console
```
mcp_playwright_browser_console_messages()
```
**Sprawdź**: Brak błędów w konsoli?

### Krok 3: Wykonaj TC-002 (Song Creation)

Otwórz plik `e2e/test-cases/TC-002-song-creation-basic.md` i wykonaj 20 kroków testowych.

**Przykładowe kroki**:

1. Nawigacja do aplikacji
2. Kliknięcie "Nowy Utwór"
3. Wypełnienie tytułu i wykonawcy
4. Dodanie 3 linijek tekstu z czasami
5. Powrót do listy
6. Weryfikacja że utwór się pojawił

### Krok 4: Dokumentuj Wyniki

Po każdym teście zaktualizuj plik test case:

```markdown
## Actual Results

**Status**: ✅ Pass / ❌ Fail

**Observations**:
- Aplikacja załadowała się poprawnie
- Empty state wyświetlony prawidłowo
- Brak błędów w konsoli

**Issues Found**:
- (jeśli są jakieś problemy)
```

## Alternatywna Metoda: Manualne Testowanie

Jeśli narzędzia MCP nie są dostępne, możesz przetestować manualnie:

### TC-001: Empty State
1. Otwórz http://localhost:19847 w przeglądarce
2. Sprawdź czy widoczny komunikat o pustej liście
3. Zrób screenshot (F12 → Console → Screenshot)

### TC-002: Song Creation
1. Kliknij przycisk "Nowy Utwór"
2. Wpisz tytuł: "Test Song"
3. Wpisz wykonawcę: "Test Artist"
4. Dodaj 3 linijki tekstu
5. Wróć do listy
6. Sprawdź czy utwór się pojawił

## Raportowanie Błędów

Jeśli znajdziesz błędy podczas testów:

1. Zrób screenshot problemu
2. Skopiuj błędy z konsoli przeglądarki
3. Opisz kroki do reprodukcji
4. Dodaj do sekcji "Issues Found" w test case

## Następne Kroki

Po wykonaniu TC-001 i TC-002:

1. Zaktualizuj tabelę statusów na górze tego dokumentu
2. Zapisz screenshoty w `e2e/screenshots/`
3. Jeśli wszystko działa - przejdź do następnych zadań z tasks.md
4. Jeśli są błędy - zgłoś je i napraw przed kontynuacją

## Pomoc

Jeśli masz problemy:

- **MCP nie działa**: Sprawdź instalację `uv` i `uvx` (patrz `e2e/README.md`)
- **Aplikacja nie odpowiada**: Sprawdź czy `npm start` działa
- **Nie wiesz jak użyć narzędzia MCP**: Zapytaj mnie w czacie o konkretne narzędzie

---

**Uwaga**: Testy E2E są **manualne** i wymagają interakcji. To normalne - służą do weryfikacji pełnych przepływów użytkownika w rzeczywistym środowisku.
