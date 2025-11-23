# TC-004: Song Editor - Lyrics Management

**Requirements**: 2.3, 2.4  
**Status**: Not Run  
**Last Executed**: N/A

## Objective

Verify that users can add, edit, and delete lyric lines in the song editor. This test focuses on the core lyrics management functionality including adding multiple lines, editing line text, and removing lines.

## Preconditions

- Application running at http://localhost:8081
- At least one song exists in the database (can be created via TC-002)
- Browser: Chromium (via MCP Playwright)

## Test Steps

### 1. Navigate to the Application

**MCP Tool**:
```
mcp_playwright_browser_navigate({ url: "http://localhost:8081" })
```

**Expected**: Application loads and displays song list screen

---

### 2. Create New Song for Testing

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Click the "Nowy Utwór" button:

```
mcp_playwright_browser_click({ element: "button Nowy Utwór or FAB", ref: "[use ref from snapshot]" })
```

**Expected**: Navigate to song editor with empty song

---

### 3. Set Basic Metadata

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Add title and artist:

```
mcp_playwright_browser_type({ element: "title input field", ref: "[use ref from snapshot]", text: "Lyrics Test Song" })
```

```
mcp_playwright_browser_type({ element: "artist input field", ref: "[use ref from snapshot]", text: "Test Artist" })
```

**Expected**: Title and artist fields are populated

---

### 4. Verify Initial Empty Lyrics State

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- "Lyrics" section header is visible
- "+ Add Line" button is visible
- No lyric lines are displayed yet

---

### 5. Capture Empty Lyrics State

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/editor-empty-lyrics.png" })
```

**Expected**: Screenshot saved showing editor with no lyrics

---

### 6. Add First Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Click the "+ Add Line" button:

```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: 
- New lyric line editor appears
- Line has text input field
- Line has time input field
- Line has delete button

---

### 7. Fill First Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get the text field reference and fill it:

```
mcp_playwright_browser_type({ element: "lyric text input", ref: "[use ref from snapshot]", text: "This is the first line of lyrics" })
```

**Expected**: First line text field contains "This is the first line of lyrics"

---

### 8. Add Second Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Click "+ Add Line" again:

```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: Second lyric line editor appears below the first

---

### 9. Fill Second Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill the second line:

```
mcp_playwright_browser_type({ element: "lyric text input 2", ref: "[use ref from snapshot]", text: "This is the second line of lyrics" })
```

**Expected**: Second line text field contains "This is the second line of lyrics"

---

### 10. Add Third Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: Third lyric line editor appears

---

### 11. Fill Third Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill the third line:

```
mcp_playwright_browser_type({ element: "lyric text input 3", ref: "[use ref from snapshot]", text: "This is the third line of lyrics" })
```

**Expected**: Third line text field contains "This is the third line of lyrics"

---

### 12. Add Fourth Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: Fourth lyric line editor appears

---

### 13. Fill Fourth Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill the fourth line:

```
mcp_playwright_browser_type({ element: "lyric text input 4", ref: "[use ref from snapshot]", text: "This is the fourth line of lyrics" })
```

**Expected**: Fourth line text field contains "This is the fourth line of lyrics"

---

### 14. Verify All Lines Present

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Four lyric lines are visible
- Each line has correct text
- Each line has a delete button
- Lines are displayed in order (1, 2, 3, 4)

---

### 15. Capture Editor with Multiple Lines

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/editor-with-lyrics.png" })
```

**Expected**: Screenshot saved showing editor with four lyric lines

---

### 16. Edit Existing Line Text

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Clear and update the second line:

```
mcp_playwright_browser_evaluate({ function: "() => { const inputs = document.querySelectorAll('input[placeholder*=\"Lyric text\"]'); if (inputs[1]) inputs[1].value = ''; }" })
```

Then type new text:

```
mcp_playwright_browser_type({ element: "lyric text input 2", ref: "[use ref from snapshot]", text: "This is the EDITED second line" })
```

**Expected**: Second line now shows "This is the EDITED second line"

---

### 17. Verify Line Edit

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: Second line text has been updated correctly

---

### 18. Delete Third Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Find and click the delete button for the third line:

```
mcp_playwright_browser_click({ element: "delete button for line 3", ref: "[use ref from snapshot]" })
```

**Expected**: 
- Third line is removed from the editor
- Only three lines remain (1, 2, 4)
- Fourth line moves up to become the new third line

---

### 19. Verify Line Deletion

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Only three lyric lines are visible
- Lines show: "first line", "EDITED second line", "fourth line"
- Original third line is gone

---

### 20. Add New Line After Deletion

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: New line is added at the end (becomes the fourth line)

---

### 21. Fill New Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill the new line:

```
mcp_playwright_browser_type({ element: "lyric text input 4", ref: "[use ref from snapshot]", text: "This is a newly added line" })
```

**Expected**: New line contains "This is a newly added line"

---

### 22. Wait for Auto-Save

**MCP Tool**:
```
mcp_playwright_browser_wait_for({ time: 1 })
```

**Expected**: Auto-save triggers and persists all changes

---

### 23. Navigate Back to Song List

**MCP Tool**:
```
mcp_playwright_browser_navigate_back()
```

**Expected**: Return to song list screen

---

### 24. Verify Song in List

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: "Lyrics Test Song" appears in the song list

---

### 25. Reopen Song to Verify Persistence

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Click on the song:

```
mcp_playwright_browser_click({ element: "song item Lyrics Test Song", ref: "[use ref from snapshot]" })
```

**Expected**: Navigate back to song editor

---

### 26. Verify All Changes Persisted

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Four lyric lines are present
- Line 1: "This is the first line of lyrics"
- Line 2: "This is the EDITED second line"
- Line 3: "This is the fourth line of lyrics" (original 4th)
- Line 4: "This is a newly added line"
- Original third line is still deleted
- All changes persisted through save/load cycle

---

### 27. Test Empty Line Handling

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: New empty line is added

---

### 28. Leave Line Empty and Save

**MCP Tool**:
```
mcp_playwright_browser_wait_for({ time: 1 })
```

**Expected**: 
- Auto-save should handle empty lines
- Empty line should be saved (text can be empty)

---

### 29. Test Multi-Line Text Input

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Try to paste multi-line text into a line:

```
mcp_playwright_browser_type({ element: "lyric text input 5", ref: "[use ref from snapshot]", text: "Line with\nnewline character" })
```

**Expected**: 
- Text is entered (may be on single line or split)
- No errors occur

---

### 30. Check Console for Errors

**MCP Tool**:
```
mcp_playwright_browser_console_messages()
```

**Expected**: No error messages in console

---

## Expected Results

1. ✅ User can add new lyric lines via "+ Add Line" button
2. ✅ Each new line gets a unique ID
3. ✅ User can edit text in existing lyric lines
4. ✅ User can delete lyric lines via delete button
5. ✅ Deleting a line removes it from the song
6. ✅ Line count increases when adding lines
7. ✅ Line count decreases when deleting lines
8. ✅ Lines can be added after deletion
9. ✅ All lyric changes are auto-saved
10. ✅ Lyric changes persist through save/load cycle
11. ✅ Empty lines are handled gracefully
12. ✅ No console errors during lyrics management

## Actual Results

*(Fill in after execution)*

**Status**: [ ] Pass / [ ] Fail

**Observations**:
- 
- 

**Issues Found**:
- 

## Screenshots

- `editor-empty-lyrics.png` - Editor with no lyric lines
- `editor-with-lyrics.png` - Editor with multiple lyric lines
- Additional screenshots as needed

## Notes

This test validates:

- **Requirement 2.3**: "WHEN użytkownik dodaje nową linijkę tekstu THEN System SHALL utworzyć nowy LyricLine z unikalnym ID i domyślną wartością czasu"
- **Requirement 2.4**: "WHEN użytkownik usuwa linijkę tekstu THEN System SHALL usunąć tę linijkę z utworu i zaktualizować wyświetlanie"

This test focuses on lyrics management operations (add, edit, delete) and complements TC-003 (metadata) and TC-005 (timing).

## Related Test Cases

- TC-002: Song Creation - Basic (creates songs with initial lyrics)
- TC-003: Song Editor - Metadata (tests metadata editing)
- TC-005: Song Editor - Timing (tests timing functionality)

