# Test Case TC-006: Setlist Creation

**Feature:** StagePrompt - Setlist Management  
**Validates:** Requirements 3.1, 4.1  
**Status:** Not Executed  
**Date Created:** 2024-01-XX

## Objective
Verify that users can create new setlists and add songs to them.

## Preconditions
- Application is running on http://localhost:19847
- At least 3 songs exist in the system

## Test Steps

### Using MCP Playwright Tools:

1. **Navigate to application**
   ```
   mcp_playwright_browser_navigate({ url: "http://localhost:19847" })
   ```

2. **Verify song list is displayed**
   ```
   mcp_playwright_browser_snapshot()
   ```
   - Verify songs are visible

3. **Navigate to setlist creation** (implementation dependent - may need navigation button)
   ```
   mcp_playwright_browser_click({ element: "Setlists button", ref: "..." })
   mcp_playwright_browser_click({ element: "New Setlist button", ref: "..." })
   ```

4. **Create new setlist**
   ```
   mcp_playwright_browser_type({ element: "Setlist name input", ref: "...", text: "Test Setlist" })
   mcp_playwright_browser_click({ element: "Create button", ref: "..." })
   ```

5. **Verify empty setlist state**
   ```
   mcp_playwright_browser_snapshot()
   mcp_playwright_browser_take_screenshot({ filename: "setlist-empty.png" })
   ```
   - Verify "No songs in this setlist" message is displayed
   - Verify "Add Song" button is visible

6. **Add first song to setlist**
   ```
   mcp_playwright_browser_click({ element: "Add Song button", ref: "..." })
   mcp_playwright_browser_snapshot()
   ```
   - Verify modal with song list appears

7. **Select song from list**
   ```
   mcp_playwright_browser_click({ element: "First song in modal", ref: "..." })
   ```

8. **Verify song added**
   ```
   mcp_playwright_browser_snapshot()
   mcp_playwright_browser_take_screenshot({ filename: "setlist-with-one-song.png" })
   ```
   - Verify song appears in setlist
   - Verify song title and artist are displayed

9. **Add second song**
   ```
   mcp_playwright_browser_click({ element: "Add Song button", ref: "..." })
   mcp_playwright_browser_click({ element: "Second song in modal", ref: "..." })
   ```

10. **Verify multiple songs**
    ```
    mcp_playwright_browser_snapshot()
    mcp_playwright_browser_take_screenshot({ filename: "setlist-with-songs.png" })
    ```
    - Verify both songs are displayed
    - Verify songs are in order of addition

## Expected Results
- New setlist is created with specified name
- Empty state is displayed when no songs are added
- Songs can be added to setlist via modal
- Added songs appear in the setlist with correct information
- Songs maintain order of addition

## Actual Results
_To be filled during test execution_

## Notes
- Setlist name should be validated (non-empty)
- Modal should close after song selection
- Already added songs should be disabled in modal
