# TC-002: Song Creation - Basic

**Requirements**: 1.2, 1.3, 2.1, 2.2, 2.3  
**Status**: ✅ PASS  
**Last Executed**: 2025-11-23

## Objective

Verify that users can create a new song, edit its metadata (title and artist), add lyric lines with timing, and that the song appears in the song list with correct information.

## Preconditions

- Application running at http://localhost:8081
- Clean state OR existing songs (test works in both scenarios)
- Browser: Chromium (via MCP Playwright)

## Test Steps

### 1. Navigate to the Application

**MCP Tool**:
```
mcp_playwright_browser_navigate({ url: "http://localhost:8081" })
```

**Expected**: Application loads and displays song list screen

---

### 2. Verify Initial State

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: Song list screen is visible with "Nowy Utwór" button/FAB

---

### 3. Click "Nowy Utwór" Button

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

First, get the snapshot to find the button reference, then:

```
mcp_playwright_browser_click({ element: "button Nowy Utwór or FAB", ref: "[use ref from snapshot]" })
```

**Expected**: Navigation to song editor screen with empty song

---

### 4. Verify Song Editor Loaded

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Song editor screen is displayed
- Title input field is visible (empty or with placeholder)
- Artist input field is visible (empty or with placeholder)
- Area for lyric lines is visible
- "Dodaj Linijkę" or similar button is visible

---

### 5. Enter Song Title

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get the title input reference, then:

```
mcp_playwright_browser_type({ element: "title input field", ref: "[use ref from snapshot]", text: "Test Song Title" })
```

**Expected**: Title field contains "Test Song Title"

---

### 6. Enter Artist Name

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get the artist input reference, then:

```
mcp_playwright_browser_type({ element: "artist input field", ref: "[use ref from snapshot]", text: "Test Artist" })
```

**Expected**: Artist field contains "Test Artist"

---

### 7. Add First Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Find and click the "Dodaj Linijkę" button:

```
mcp_playwright_browser_click({ element: "button Dodaj Linijkę", ref: "[use ref from snapshot]" })
```

**Expected**: New lyric line editor appears

---

### 8. Fill First Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get references for the new line's text and time fields, then:

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text", type: "textbox", ref: "[text field ref]", value: "First line of lyrics" },
    { name: "time seconds", type: "textbox", ref: "[time field ref]", value: "0" }
  ]
})
```

**Expected**: First lyric line contains "First line of lyrics" with time 0

---

### 9. Add Second Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Dodaj Linijkę", ref: "[use ref from snapshot]" })
```

**Expected**: Second lyric line editor appears

---

### 10. Fill Second Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get references for the second line's fields:

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 2", type: "textbox", ref: "[text field ref]", value: "Second line of lyrics" },
    { name: "time seconds 2", type: "textbox", ref: "[time field ref]", value: "5.5" }
  ]
})
```

**Expected**: Second lyric line contains "Second line of lyrics" with time 5.5

---

### 11. Add Third Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Dodaj Linijkę", ref: "[use ref from snapshot]" })
```

**Expected**: Third lyric line editor appears

---

### 12. Fill Third Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 3", type: "textbox", ref: "[text field ref]", value: "Third line of lyrics" },
    { name: "time seconds 3", type: "textbox", ref: "[time field ref]", value: "12" }
  ]
})
```

**Expected**: Third lyric line contains "Third line of lyrics" with time 12

---

### 13. Verify Song Editor State

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Title: "Test Song Title"
- Artist: "Test Artist"
- Three lyric lines with correct text and times
- All fields are editable

---

### 14. Capture Song Editor Screenshot

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/song-editor-with-lyrics.png" })
```

**Expected**: Screenshot saved showing completed song editor

---

### 15. Navigate Back to Song List

**MCP Tool**:
```
mcp_playwright_browser_navigate_back()
```

**Expected**: Return to song list screen (auto-save should have saved the song)

---

### 16. Verify Song Appears in List

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Song list displays the newly created song
- Song item shows "Test Song Title"
- Song item shows "Test Artist"
- Song is clickable

---

### 17. Capture Song List Screenshot

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/song-list-with-items.png" })
```

**Expected**: Screenshot saved showing song list with the new song

---

### 18. Click on Created Song

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Find the song item and click it:

```
mcp_playwright_browser_click({ element: "song item Test Song Title", ref: "[use ref from snapshot]" })
```

**Expected**: Navigate back to song editor for this song

---

### 19. Verify Song Data Persisted

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Title still shows "Test Song Title"
- Artist still shows "Test Artist"
- All three lyric lines are present with correct text and times
- Data was successfully saved and loaded

---

### 20. Check Console for Errors

**MCP Tool**:
```
mcp_playwright_browser_console_messages()
```

**Expected**: No error messages in console

---

## Expected Results

1. ✅ User can create a new song via "Nowy Utwór" button
2. ✅ Song editor displays with empty fields for new song
3. ✅ User can edit song title and artist
4. ✅ User can add multiple lyric lines
5. ✅ User can set text and time for each lyric line
6. ✅ Song is auto-saved when navigating away
7. ✅ Song appears in song list with correct title and artist
8. ✅ Clicking song in list navigates to editor with correct song data
9. ✅ Song data persists across navigation (round-trip)
10. ✅ No console errors during the workflow

## Actual Results

*(Fill in after execution)*

**Status**: [ ] Pass / [ ] Fail

**Observations**:
- 
- 

**Issues Found**:
- 

## Screenshots

- `song-editor-with-lyrics.png` - Song editor with completed song data
- `song-list-with-items.png` - Song list showing the newly created song

## Notes

This test validates multiple requirements:

- **Requirement 1.2**: Navigation to editor when touching a song
- **Requirement 1.3**: Creating new song via "Nowy Utwór" button
- **Requirement 2.1**: Song editor displays title, artist, and lyric lines
- **Requirement 2.2**: Modifying title and artist updates the song
- **Requirement 2.3**: Adding new lyric lines with unique IDs

This is a critical happy-path test that validates the core song creation and editing workflow.

## Related Test Cases

- TC-001: Song List - Empty State (precursor test)
- TC-003: Song Editor - Metadata (detailed metadata testing)
- TC-004: Song Editor - Lyrics (detailed lyric line testing)
