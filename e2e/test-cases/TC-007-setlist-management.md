# Test Case TC-007: Setlist Management

**Feature:** StagePrompt - Setlist Management  
**Validates:** Requirements 3.4, 3.5, 4.4, 4.5  
**Status:** Not Executed  
**Date Created:** 2024-01-XX

## Objective
Verify that users can manage setlists by removing songs and deleting setlists without affecting the original songs.

## Preconditions
- Application is running on http://localhost:19847
- At least 5 songs exist in the system
- A setlist named "Test Setlist" exists with at least 3 songs

## Test Steps

### Using MCP Playwright Tools:

1. **Navigate to application**
   ```
   mcp_playwright_browser_navigate({ url: "http://localhost:19847" })
   ```

2. **Open existing setlist**
   ```
   mcp_playwright_browser_click({ element: "Setlists button", ref: "..." })
   mcp_playwright_browser_click({ element: "Test Setlist", ref: "..." })
   ```

3. **Verify setlist contents**
   ```
   mcp_playwright_browser_snapshot()
   ```
   - Verify all songs are displayed
   - Note the song IDs/titles for later verification

4. **Remove a song from setlist**
   ```
   mcp_playwright_browser_click({ element: "Remove button for first song", ref: "..." })
   ```

5. **Verify song removed from setlist**
   ```
   mcp_playwright_browser_snapshot()
   ```
   - Verify song is no longer in setlist
   - Verify remaining songs are still present

6. **Navigate back to song list**
   ```
   mcp_playwright_browser_navigate_back()
   mcp_playwright_browser_navigate_back()
   ```

7. **Verify removed song still exists**
   ```
   mcp_playwright_browser_snapshot()
   ```
   - Verify the removed song is still in the main song list
   - Verify song data is intact

8. **Navigate back to setlist**
   ```
   mcp_playwright_browser_click({ element: "Setlists button", ref: "..." })
   mcp_playwright_browser_click({ element: "Test Setlist", ref: "..." })
   ```

9. **Delete the entire setlist**
   ```
   mcp_playwright_browser_click({ element: "Delete Setlist button", ref: "..." })
   mcp_playwright_browser_click({ element: "Confirm delete button", ref: "..." })
   ```

10. **Verify setlist deleted**
    ```
    mcp_playwright_browser_snapshot()
    ```
    - Verify setlist is no longer in the list

11. **Navigate to song list**
    ```
    mcp_playwright_browser_navigate_back()
    ```

12. **Verify all songs still exist**
    ```
    mcp_playwright_browser_snapshot()
    mcp_playwright_browser_take_screenshot({ filename: "songs-after-setlist-delete.png" })
    ```
    - Verify all songs that were in the deleted setlist still exist
    - Verify song data is intact

## Expected Results
- Songs can be removed from setlist
- Removing a song from setlist does not delete the song from main list
- Setlist can be deleted
- Deleting a setlist does not delete any songs
- All song data remains intact after setlist operations

## Actual Results
_To be filled during test execution_

## Notes
- Deletion should require confirmation
- Song removal should be immediate
- Setlist deletion should navigate back to setlist list
