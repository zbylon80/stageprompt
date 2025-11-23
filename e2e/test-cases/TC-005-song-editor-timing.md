# TC-005: Song Editor - Timing Management

**Requirements**: 2.5  
**Status**: Not Run  
**Last Executed**: N/A

## Objective

Verify that users can manually set and edit timing values (timeSeconds) for lyric lines in the song editor. This test focuses on the timing functionality including setting initial times, editing times, and validating time constraints.

## Preconditions

- Application running at http://localhost:8081
- At least one song with multiple lyric lines exists (can be created via TC-002 or TC-004)
- Browser: Chromium (via MCP Playwright)

## Test Steps

### 1. Navigate to the Application

**MCP Tool**:
```
mcp_playwright_browser_navigate({ url: "http://localhost:8081" })
```

**Expected**: Application loads and displays song list screen

---

### 2. Create New Song for Timing Tests

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

Add title:

```
mcp_playwright_browser_type({ element: "title input field", ref: "[use ref from snapshot]", text: "Timing Test Song" })
```

**Expected**: Title field is populated

---

### 4. Add First Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Click "+ Add Line":

```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: First lyric line editor appears

---

### 5. Fill First Line with Text and Time

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill text and time:

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 1", type: "textbox", ref: "[text field ref]", value: "First line at zero seconds" },
    { name: "time seconds 1", type: "textbox", ref: "[time field ref]", value: "0" }
  ]
})
```

**Expected**: 
- First line text: "First line at zero seconds"
- First line time: 0

---

### 6. Verify Default Time Value

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Time field shows "0" (default for first line)
- Time field is editable

---

### 7. Add Second Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: Second lyric line editor appears

---

### 8. Fill Second Line with Text and Time

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill text and time:

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 2", type: "textbox", ref: "[text field ref]", value: "Second line at five seconds" },
    { name: "time seconds 2", type: "textbox", ref: "[time field ref]", value: "5" }
  ]
})
```

**Expected**: 
- Second line text: "Second line at five seconds"
- Second line time: 5

---

### 9. Add Third Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: Third lyric line editor appears

---

### 10. Fill Third Line with Decimal Time

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill text and time with decimal:

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 3", type: "textbox", ref: "[text field ref]", value: "Third line at ten point five seconds" },
    { name: "time seconds 3", type: "textbox", ref: "[time field ref]", value: "10.5" }
  ]
})
```

**Expected**: 
- Third line text: "Third line at ten point five seconds"
- Third line time: 10.5 (decimal values supported)

---

### 11. Add Fourth Lyric Line

**MCP Tool**:
```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

**Expected**: Fourth lyric line editor appears

---

### 12. Fill Fourth Line with Larger Time

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Fill text and time:

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 4", type: "textbox", ref: "[text field ref]", value: "Fourth line at twenty seconds" },
    { name: "time seconds 4", type: "textbox", ref: "[time field ref]", value: "20" }
  ]
})
```

**Expected**: 
- Fourth line text: "Fourth line at twenty seconds"
- Fourth line time: 20

---

### 13. Verify All Times Are Set

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Line 1: time = 0
- Line 2: time = 5
- Line 3: time = 10.5
- Line 4: time = 20
- Times are in ascending order

---

### 14. Capture Editor with Timing

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/editor-with-timing.png" })
```

**Expected**: Screenshot saved showing editor with timed lyrics

---

### 15. Edit Existing Time Value

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Clear and update the second line's time:

```
mcp_playwright_browser_evaluate({ function: "() => { const inputs = document.querySelectorAll('input[type=\"number\"], input[placeholder*=\"time\"]'); if (inputs[1]) inputs[1].value = ''; }" })
```

Then type new time:

```
mcp_playwright_browser_type({ element: "time input 2", ref: "[use ref from snapshot]", text: "7.5" })
```

**Expected**: Second line time is now 7.5

---

### 16. Verify Time Edit

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- Line 2 time shows 7.5
- Time was successfully updated

---

### 17. Test Negative Time Value (Invalid)

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Try to enter negative time:

```
mcp_playwright_browser_evaluate({ function: "() => { const inputs = document.querySelectorAll('input[type=\"number\"], input[placeholder*=\"time\"]'); if (inputs[0]) inputs[0].value = ''; }" })
```

```
mcp_playwright_browser_type({ element: "time input 1", ref: "[use ref from snapshot]", text: "-5" })
```

**Expected**: 
- Negative time may be rejected by input validation
- Or validation error appears when trying to save
- System should prevent negative times

---

### 18. Restore Valid Time

**MCP Tool**:
```
mcp_playwright_browser_evaluate({ function: "() => { const inputs = document.querySelectorAll('input[type=\"number\"], input[placeholder*=\"time\"]'); if (inputs[0]) inputs[0].value = ''; }" })
```

```
mcp_playwright_browser_type({ element: "time input 1", ref: "[use ref from snapshot]", text: "0" })
```

**Expected**: First line time is restored to 0

---

### 19. Test Very Large Time Value

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Add a new line with large time:

```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 5", type: "textbox", ref: "[text field ref]", value: "Line at large time" },
    { name: "time seconds 5", type: "textbox", ref: "[time field ref]", value: "999.99" }
  ]
})
```

**Expected**: 
- Large time value (999.99) is accepted
- No errors occur

---

### 20. Test Zero Time Value

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Add another line with zero time:

```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

```
mcp_playwright_browser_fill_form({ 
  fields: [
    { name: "lyric text 6", type: "textbox", ref: "[text field ref]", value: "Another line at zero" },
    { name: "time seconds 6", type: "textbox", ref: "[time field ref]", value: "0" }
  ]
})
```

**Expected**: 
- Zero time is accepted (multiple lines can have same time)
- No errors occur

---

### 21. Test Empty Time Value

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Add a line and leave time empty:

```
mcp_playwright_browser_click({ element: "button Add Line", ref: "[use ref from snapshot]" })
```

```
mcp_playwright_browser_type({ element: "lyric text input 7", ref: "[use ref from snapshot]", text: "Line with no time set" })
```

**Expected**: 
- Line is created with default time (likely 0 or previous line's time)
- System handles empty time gracefully

---

### 22. Wait for Auto-Save

**MCP Tool**:
```
mcp_playwright_browser_wait_for({ time: 1 })
```

**Expected**: Auto-save triggers and persists all timing data

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

**Expected**: "Timing Test Song" appears in the song list

---

### 25. Reopen Song to Verify Timing Persistence

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Click on the song:

```
mcp_playwright_browser_click({ element: "song item Timing Test Song", ref: "[use ref from snapshot]" })
```

**Expected**: Navigate back to song editor

---

### 26. Verify All Timing Values Persisted

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

**Expected**: 
- All lyric lines are present with correct times
- Line 1: time = 0
- Line 2: time = 7.5 (edited value)
- Line 3: time = 10.5
- Line 4: time = 20
- Line 5: time = 999.99
- Line 6: time = 0
- Line 7: time = (default value)
- All timing data persisted through save/load cycle

---

### 27. Test Time Ordering Validation

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Try to set a later line's time to be earlier than a previous line:

```
mcp_playwright_browser_evaluate({ function: "() => { const inputs = document.querySelectorAll('input[type=\"number\"], input[placeholder*=\"time\"]'); if (inputs[3]) inputs[3].value = ''; }" })
```

```
mcp_playwright_browser_type({ element: "time input 4", ref: "[use ref from snapshot]", text: "3" })
```

**Expected**: 
- Time value is set to 3 (less than line 2's 7.5)
- Validation may warn about non-sequential times
- Or system may allow it (times don't have to be strictly increasing)

---

### 28. Verify Time Format Handling

**MCP Tool**:
```
mcp_playwright_browser_snapshot()
```

Try entering time with multiple decimal places:

```
mcp_playwright_browser_evaluate({ function: "() => { const inputs = document.querySelectorAll('input[type=\"number\"], input[placeholder*=\"time\"]'); if (inputs[2]) inputs[2].value = ''; }" })
```

```
mcp_playwright_browser_type({ element: "time input 3", ref: "[use ref from snapshot]", text: "12.345678" })
```

**Expected**: 
- Time value is accepted (may be rounded)
- No errors occur

---

### 29. Check Console for Errors

**MCP Tool**:
```
mcp_playwright_browser_console_messages()
```

**Expected**: No error messages in console

---

### 30. Final Screenshot

**MCP Tool**:
```
mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/editor-timing-final.png" })
```

**Expected**: Screenshot saved showing final timing state

---

## Expected Results

1. ✅ User can manually set time values for lyric lines
2. ✅ Time values accept integers (0, 5, 20)
3. ✅ Time values accept decimals (10.5, 7.5, 12.345678)
4. ✅ Default time for first line is 0
5. ✅ Default time for subsequent lines is previous line's time
6. ✅ User can edit existing time values
7. ✅ Negative times are rejected or validated
8. ✅ Large time values (999.99) are accepted
9. ✅ Multiple lines can have the same time value
10. ✅ Empty time values are handled with defaults
11. ✅ All timing data is auto-saved
12. ✅ Timing data persists through save/load cycle
13. ✅ No console errors during timing operations

## Actual Results

*(Fill in after execution)*

**Status**: [ ] Pass / [ ] Fail

**Observations**:
- 
- 

**Issues Found**:
- 

## Screenshots

- `editor-with-timing.png` - Editor with timed lyric lines
- `editor-timing-final.png` - Final state after all timing tests
- Additional screenshots as needed

## Notes

This test validates:

- **Requirement 2.5**: "WHEN użytkownik ręcznie wprowadza wartość czasu dla linijki THEN System SHALL zwalidować i zapisać wartość timeSeconds dla tego LyricLine"

This test focuses on timing functionality and complements TC-003 (metadata) and TC-004 (lyrics). Together, these three tests provide comprehensive coverage of the song editor.

### Timing Validation Rules

Based on the validation code in `src/utils/validation.ts`:
- Times cannot be negative
- Times should ideally be in ascending order (but may not be strictly enforced)
- Decimal values are supported
- Empty times get default values

## Related Test Cases

- TC-002: Song Creation - Basic (creates songs with initial timing)
- TC-003: Song Editor - Metadata (tests metadata editing)
- TC-004: Song Editor - Lyrics (tests lyric line management)

