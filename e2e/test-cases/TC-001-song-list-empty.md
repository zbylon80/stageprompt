# TC-001: Song List - Empty State

**Requirements**: 1.1, 1.5  
**Status**: ✅ PASS  
**Last Executed**: 2025-11-23

## Objective

Verify that the application displays an appropriate empty state message when no songs exist in the database, encouraging the user to create their first song.

## Preconditions

- Application running at http://localhost:8081
- Clean state with no existing songs in storage
- Browser: Chromium (via MCP Playwright)

## Test Steps

### 1. Navigate to the Application

**MCP Tool**:
```
mcp_playwright_browser_navigate({ url: "http://localhost:8081" })
```

**Expected**: Application loads successfully and displays the main screen

---

### 2. Verify Empty State Display

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Snapshot shows the song list screen
- Empty state message is visible (e.g., "Utwórz pierwszy utwór" or similar encouraging text)
- No song items are displayed in the list
- "Nowy Utwór" button or FAB (Floating Action Button) is visible

---

### 3. Capture Empty State Screenshot

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/empty-state.png" })
```

**Expected**: Screenshot saved showing the empty state UI

---

### 4. Check Console for Errors

**MCP Tool**:
```
mcp_playwright_browser_console_messages()
```

**Expected**: No error messages in console (warnings are acceptable)

---

## Expected Results

1. ✅ Application loads without errors
2. ✅ Empty state message is displayed when no songs exist
3. ✅ UI provides clear call-to-action to create first song
4. ✅ "Nowy Utwór" button/FAB is visible and accessible
5. ✅ No songs are displayed in the list
6. ✅ No console errors

## Actual Results

**Status**: ✅ Pass

**Observations**:
- Aplikacja ładuje się poprawnie na http://localhost:19847
- Empty state wyświetla komunikat "No songs"
- Zachęcający tekst "Tap the + button to create your first song" jest widoczny
- FAB (Floating Action Button) z ikoną "+" jest widoczny w prawym dolnym rogu
- Brak błędów w konsoli
- Wszystkie testy jednostkowe przechodzą (41/41)

**Issues Found**:
- Brak - wszystkie funkcjonalności działają zgodnie z wymaganiami

## Screenshots

- `empty-state.png` - Initial empty state of song list

## Notes

This test validates **Requirement 1.5**: "WHEN lista utworów jest pusta THEN System SHALL wyświetlić komunikat zachęcający do utworzenia pierwszego utworu"

This is a foundational test that should be run first before any song creation tests.

## Related Test Cases

- TC-002: Song Creation - Basic (creates songs from this empty state)
