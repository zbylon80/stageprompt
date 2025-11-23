# TC-003: Song Editor - Metadata Editing

**Requirements**: 2.1, 2.2  
**Status**: Not Run  
**Last Executed**: N/A

## Objective

Verify that users can edit song metadata (title and artist) in the song editor, and that changes are immediately reflected and auto-saved. This test focuses specifically on metadata editing functionality.

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

### 2. Verify Song List

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: Song list screen shows at least one existing song

---

### 3. Click on Existing Song

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get the song item reference, then:

```
mcp_playwright_browser_click({ element: "song item", ref: "[use ref from snapshot]" })
```

**Expected**: Navigate to song editor screen with the selected song's data

---

### 4. Verify Initial Song Editor State

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Song editor screen is displayed
- Title input field contains the song's current title
- Artist input field contains the song's current artist (or is empty)
- "Save" button is visible at the top
- "Delete" button is visible at the top (if song has a title)

---

### 5. Capture Initial Editor State

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/editor-before-metadata-edit.png" })
```

**Expected**: Screenshot saved showing initial editor state

---

### 6. Clear and Update Title

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get the title input reference, then clear and type new title:

```
mcp_playwright_browser_evaluate({ function: "() => { const input = document.querySelector('[placeholder*=\"Song title\"]'); if (input) input.value = ''; }" })
```

Then type new title:

```
mcp_playwright_browser_type({ element: "title input field", ref: "[use ref from snapshot]", text: "Updated Song Title" })
```

**Expected**: Title field now contains "Updated Song Title"

---

### 7. Verify Title Update

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: Title input shows "Updated Song Title"

---

### 8. Clear and Update Artist

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get the artist input reference, then clear and type new artist:

```
mcp_playwright_browser_evaluate({ function: "() => { const input = document.querySelector('[placeholder*=\"Artist name\"]'); if (input) input.value = ''; }" })
```

Then type new artist:

```
mcp_playwright_browser_type({ element: "artist input field", ref: "[use ref from snapshot]", text: "Updated Artist Name" })
```

**Expected**: Artist field now contains "Updated Artist Name"

---

### 9. Verify Artist Update

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: Artist input shows "Updated Artist Name"

---

### 10. Wait for Auto-Save

**MCP Tool**:
```
mcp_playwright_browser_wait_for({ time: 1 })
```

**Expected**: Auto-save should trigger (500ms debounce + buffer)

---

### 11. Capture Updated Editor State

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/editor-after-metadata-edit.png" })
```

**Expected**: Screenshot saved showing updated metadata

---

### 12. Navigate Back to Song List

**MCP Tool**:
```
mcp_playwright_browser_navigate_back()
```

**Expected**: Return to song list screen (auto-save should have persisted changes)

---

### 13. Verify Updated Song in List

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Song list displays the song with updated metadata
- Song item shows "Updated Song Title"
- Song item shows "Updated Artist Name"

---

### 14. Click on Updated Song Again

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Get the updated song item reference:

```
mcp_playwright_browser_click({ element: "song item Updated Song Title", ref: "[use ref from snapshot]" })
```

**Expected**: Navigate back to song editor

---

### 15. Verify Metadata Persisted

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Title field shows "Updated Song Title"
- Artist field shows "Updated Artist Name"
- Changes were successfully saved and loaded (round-trip validation)

---

### 16. Test Empty Title Validation

**MCP Tool**:
```
mcp_playwright_browser_evaluate({ function: "() => { const input = document.querySelector('[placeholder*=\"Song title\"]'); if (input) input.value = ''; }" })
```

Then try to save:

```
mcp_playwright_browser_snapshot()
```

Get the Save button reference:

```
mcp_playwright_browser_click({ element: "button Save", ref: "[use ref from snapshot]" })
```

**Expected**: 
- Validation should prevent saving (title is required)
- Alert or error message may appear
- Song should not be saved with empty title

---

### 17. Restore Valid Title

**MCP Tool**:
```
mcp_playwright_browser_type({ element: "title input field", ref: "[use ref from snapshot]", text: "Valid Title Again" })
```

**Expected**: Title field contains "Valid Title Again"

---

### 18. Test Special Characters in Metadata

**MCP Tool**:
```
mcp_playwright_browser_evaluate({ function: "() => { const input = document.querySelector('[placeholder*=\"Artist name\"]'); if (input) input.value = ''; }" })
```

Then type artist with special characters:

```
mcp_playwright_browser_type({ element: "artist input field", ref: "[use ref from snapshot]", text: "Artist & The Band (feat. Guest)" })
```

**Expected**: Artist field accepts and displays special characters correctly

---

### 19. Wait for Auto-Save

**MCP Tool**:
```
mcp_playwright_browser_wait_for({ time: 1 })
```

**Expected**: Auto-save triggers with special characters

---

### 20. Verify Special Characters Persist

**MCP Tool**:
```
mcp_playwright_browser_navigate_back()
```

Then navigate back to the song:

```
mcp_playwright_browser_snapshot()
mcp_playwright_browser_click({ element: "song item Valid Title Again", ref: "[use ref from snapshot]" })
```

Then verify:

```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Artist field shows "Artist & The Band (feat. Guest)" correctly
- Special characters are preserved through save/load cycle

---

### 21. Check Console for Errors

**MCP Tool**:
```
mcp_playwright_browser_console_messages()
```

**Expected**: No error messages in console (warnings are acceptable)

---

## Expected Results

1. ✅ User can edit song title in the editor
2. ✅ User can edit artist name in the editor
3. ✅ Changes to metadata are immediately reflected in the UI
4. ✅ Auto-save persists metadata changes (500ms debounce)
5. ✅ Updated metadata appears in song list after navigation
6. ✅ Metadata persists through save/load cycle (round-trip)
7. ✅ Empty title validation prevents saving invalid songs
8. ✅ Special characters in metadata are handled correctly
9. ✅ No console errors during metadata editing

## Actual Results

*(Fill in after execution)*

**Status**: [ ] Pass / [ ] Fail

**Observations**:
- 
- 

**Issues Found**:
- 

## Screenshots

- `editor-before-metadata-edit.png` - Initial editor state before changes
- `editor-after-metadata-edit.png` - Editor state after metadata updates
- Additional screenshots as needed

## Notes

This test validates:

- **Requirement 2.1**: "WHEN użytkownik wchodzi do edytora utworu THEN System SHALL wyświetlić tytuł utworu, pole wykonawcy i listę linijek tekstu"
- **Requirement 2.2**: "WHEN użytkownik modyfikuje tytuł utworu lub wykonawcę THEN System SHALL zaktualizować dane utworu natychmiast"

This test focuses specifically on metadata editing and validation, complementing TC-002 which covers the full song creation workflow.

## Related Test Cases

- TC-002: Song Creation - Basic (creates songs with initial metadata)
- TC-004: Song Editor - Lyrics (tests lyric line editing)
- TC-005: Song Editor - Timing (tests timing functionality)

