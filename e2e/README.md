# End-to-End Testing Guide - StagePrompt

## Overview

This directory contains End-to-End (E2E) test cases for the StagePrompt application using MCP Playwright. These tests validate complete user workflows in a real browser environment.

## Test Structure

```
e2e/
├── README.md           # This file - testing instructions
├── test-cases/         # Test case documentation in markdown
└── screenshots/        # Screenshots captured during testing
```

## MCP Playwright Setup

### Prerequisites

1. **Install uv and uvx** (Python package manager):
   - Windows: `pip install uv` or download from https://docs.astral.sh/uv/getting-started/installation/
   - macOS: `brew install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`

2. **MCP Configuration**: The MCP Playwright server is configured in `.kiro/settings/mcp.json`
   - Browser: Chromium (set via `PLAYWRIGHT_BROWSER` environment variable)
   - Auto-approved tools for common Playwright operations

3. **Reconnect MCP Server** (if needed):
   - Open Kiro's MCP Server view in the feature panel
   - Click reconnect on the "playwright" server
   - Or restart Kiro IDE

### Browser Installation

If you get an error about the browser not being installed, use the MCP tool:
```
mcp_playwright_browser_install
```

This will download and install Chromium for Playwright.

## Running the Application for Testing

Before running E2E tests, start the application in web mode:

```bash
# Start the Expo development server
npm start

# Or specifically for web
npm run web
```

The application should be accessible at `http://localhost:8081` (or the port shown in the terminal).

## Test Execution Workflow

### Manual Testing with MCP Tools

E2E tests are executed manually through Kiro IDE using MCP Playwright tools. This approach provides:
- Interactive testing and debugging
- Real-time feedback
- Screenshot capture for documentation
- Console log inspection

### How to Execute a Test Case

1. **Open the test case markdown file** (e.g., `test-cases/TC-001-song-list-empty.md`)

2. **Read the test steps** - each step includes the MCP tool to use and parameters

3. **Execute each step in Kiro chat** by calling the MCP tools:
   ```
   Example: Navigate to the app
   mcp_playwright_browser_navigate({ url: "http://localhost:8081" })
   ```

4. **Verify results** using snapshots and screenshots:
   ```
   mcp_playwright_browser_snapshot()
   mcp_playwright_browser_take_screenshot({ filename: "e2e/screenshots/step-name.png" })
   ```

5. **Document results** - update the test case with PASS/FAIL status and any issues found

### Common MCP Playwright Tools

#### Navigation
- `mcp_playwright_browser_navigate({ url: "..." })` - Navigate to URL
- `mcp_playwright_browser_navigate_back()` - Go back to previous page

#### Inspection
- `mcp_playwright_browser_snapshot()` - Get accessibility snapshot of current page
- `mcp_playwright_browser_take_screenshot({ filename: "..." })` - Capture screenshot
- `mcp_playwright_browser_console_messages()` - Get console logs

#### Interaction
- `mcp_playwright_browser_click({ element: "description", ref: "..." })` - Click element
- `mcp_playwright_browser_type({ element: "description", ref: "...", text: "..." })` - Type text
- `mcp_playwright_browser_fill_form({ fields: [...] })` - Fill multiple form fields
- `mcp_playwright_browser_press_key({ key: "Enter" })` - Press keyboard key

#### Waiting
- `mcp_playwright_browser_wait_for({ text: "..." })` - Wait for text to appear
- `mcp_playwright_browser_wait_for({ time: 2 })` - Wait for specified seconds

#### Evaluation
- `mcp_playwright_browser_evaluate({ function: "() => { ... }" })` - Execute JavaScript

## Test Cases

### Current Test Cases

| ID | Name | Status | Requirements |
|----|------|--------|--------------|
| TC-001 | Song List - Empty State | Not Run | 1.1, 1.5 |
| TC-002 | Song Creation - Basic | Not Run | 1.2, 1.3, 2.1, 2.2, 2.3 |

### Test Case Format

Each test case follows this structure:

```markdown
# TC-XXX: Test Case Name

**Requirements**: X.X, Y.Y
**Status**: Not Run / Pass / Fail
**Last Executed**: YYYY-MM-DD

## Objective
Brief description of what this test validates

## Preconditions
- Application running at http://localhost:8081
- Clean state (no existing data) OR specific data setup

## Test Steps
1. Step description
   - MCP Tool: `tool_name({ params })`
   - Expected: What should happen

2. Next step...

## Expected Results
- Overall expected outcome
- Key validations

## Actual Results
(Fill in after execution)

## Screenshots
- screenshot-name.png

## Notes
Any additional observations
```

## Best Practices

### Before Testing
1. **Clear browser data** if testing requires clean state
2. **Verify app is running** and accessible
3. **Check MCP server status** in Kiro

### During Testing
1. **Take screenshots** at key points for documentation
2. **Check console logs** for errors using `mcp_playwright_browser_console_messages()`
3. **Use snapshots** to verify UI state rather than just visual inspection
4. **Wait appropriately** for async operations to complete

### After Testing
1. **Document results** in the test case file
2. **Save screenshots** to `e2e/screenshots/` directory
3. **Report bugs** found during testing
4. **Update test status** (Pass/Fail) and date

## Troubleshooting

### Browser Not Found
```
Error: Browser not installed
Solution: Run mcp_playwright_browser_install
```

### Application Not Accessible
```
Error: Navigation timeout
Solution: Ensure npm start is running and app is at http://localhost:8081
```

### MCP Server Not Connected
```
Error: Tool not available
Solution: Reconnect MCP server in Kiro's MCP Server view
```

### Element Not Found
```
Error: Element not found
Solution: 
1. Run mcp_playwright_browser_snapshot() to see current page structure
2. Verify the element reference (ref) is correct
3. Wait for page to load completely
```

## Cross-Platform Testing

### Web Testing (Primary)
- Browser: Chromium via Playwright
- URL: http://localhost:8081
- Platform: Windows/macOS/Linux

### Mobile Testing (Future)
- For mobile-specific testing, consider:
  - Expo Go on physical device
  - Android Emulator / iOS Simulator
  - Manual testing for touch interactions and Bluetooth controllers

## Test Coverage

E2E tests complement unit and property-based tests:

- **Unit Tests**: Test individual functions and components
- **Property Tests**: Verify universal properties across many inputs
- **E2E Tests**: Validate complete user workflows in real browser

Together, these provide comprehensive coverage of the application.

## Contributing

When adding new test cases:

1. Create a new markdown file in `test-cases/` with format `TC-XXX-description.md`
2. Follow the test case template structure
3. Update the test case table in this README
4. Execute the test and document results
5. Commit screenshots to `screenshots/` directory

## References

- [MCP Playwright Documentation](https://github.com/executeautomation/mcp-playwright)
- [Playwright Documentation](https://playwright.dev/)
- [StagePrompt Requirements](.kiro/specs/teleprompter-app/requirements.md)
- [StagePrompt Design](.kiro/specs/teleprompter-app/design.md)
