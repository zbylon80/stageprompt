# Test Case TC-008: Setlist Song Reordering

**Feature:** StagePrompt - Setlist Management  
**Validates:** Requirements 3.2, 3.3, 4.3  
**Status:** Not Executed  
**Date Created:** 2024-01-XX

## Objective
Verify that users can reorder songs in a setlist using drag and drop functionality.

## Preconditions
- Application is running on http://localhost:19847
- At least 5 songs exist in the system
- A setlist named "Reorder Test" exists with at least 4 songs

## Test Steps

### Using MCP Playwright Tools:

1. **Navigate to application**
   ```
   mcp_playwright_browser_navigate({ url: "http://localhost:19847" })
   ```

2. **Open setlist for reordering**
   ```
   mcp_playwright_browser_click({ element: "Setlists button", ref: "..." })
   mcp_playwright_browser_click({ element: "Reorder Test setlist", ref: "..." })
   ```

3. **Verify initial order**
   ```
   mcp_playwright_browser_snapshot()
   mcp_playwright_browser_take_screenshot({ filename: "setlist-before-reorder.png" })
   ```
   - Note the order of songs (Song 1, Song 2, Song 3, Song 4)

4. **Perform drag and drop** (Note: MCP Playwright may have limitations with drag & drop)
   ```
   # This may require manual testing or custom JavaScript evaluation
   mcp_playwright_browser_evaluate({
     function: `
       // Simulate drag and drop from position 0 to position 2
       const items = document.querySelectorAll('[data-testid="song-item"]');
       // Trigger drag events programmatically
     `
   })
   ```
   - Alternatively, test by long-pressing and dragging manually

5. **Verify reordered state**
   ```
   mcp_playwright_browser_snapshot()
   mcp_playwright_browser_take_screenshot({ filename: "setlist-after-reorder.png" })
   ```
   - Verify song order has changed
   - Verify all songs are still present

6. **Navigate away and back**
   ```
   mcp_playwright_browser_navigate_back()
   mcp_playwright_browser_click({ element: "Reorder Test setlist", ref: "..." })
   ```

7. **Verify order persisted**
   ```
   mcp_playwright_browser_snapshot()
   ```
   - Verify the new order is maintained after navigation
   - Verify no songs were lost or duplicated

8. **Test multiple reorders**
   - Perform 2-3 more reordering operations
   - Verify each reorder updates the songIds array correctly

9. **Verify song count unchanged**
   ```
   mcp_playwright_browser_evaluate({
     function: "() => document.querySelectorAll('[data-testid=\"song-item\"]').length"
   })
   ```
   - Verify the count matches the original count

## Expected Results
- Songs can be reordered using drag and drop
- Reordering updates the songIds array to reflect new order
- All songs remain in the setlist (no loss or duplication)
- New order persists after navigation
- Reordering does not affect the original songs in the main list

## Actual Results
_To be filled during test execution_

## Notes
- Drag and drop may require long-press on mobile
- Visual feedback should be provided during drag
- Order changes should be saved automatically
- Testing drag & drop with MCP Playwright may require manual verification or custom JavaScript

## Alternative Testing Approach
If MCP Playwright drag & drop is not feasible:
1. Test the underlying reorder logic through unit/property tests (already done)
2. Manually test drag & drop functionality in the browser
3. Document the manual test results here
