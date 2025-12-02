# Quick Test Guide - StagePrompt Cross-Platform

## Quick Start

### Run All Cross-Platform Tests
```bash
npm test -- --testPathPattern="CrossPlatform|crossplatform" --run
```

### Run Specific Test Suites
```bash
# Cross-platform editing tests
npm test -- CrossPlatform.editing.property.test --run

# Key event service cross-platform tests
npm test -- keyEventService.crossplatform.property.test --run

# Export/import cross-platform tests
npm test -- exportImportService.crossplatform.property.test --run
```

### Run All Tests
```bash
npm test -- --run
```

## Manual Testing

### Start Web Application
```bash
npm run web
```
Then open http://localhost:8081 in your browser.

### Start Mobile Application (Expo Go)
```bash
npm start
```
Then scan the QR code with Expo Go app on your mobile device.

## Test Workflow

### 1. Automated Tests (5 minutes)
```bash
npm test -- --testPathPattern="CrossPlatform|crossplatform" --run
```
✅ Verify all tests pass (309 tests should pass)

### 2. Manual Web Testing (15 minutes)
1. Open `CROSS-PLATFORM-WORKFLOW-TEST.md`
2. Follow "Scenario 1: Full Workflow - Web to Mobile" steps 1-6
3. Create songs, setlists, configure settings
4. Export data to JSON file

### 3. Manual Mobile Testing (15 minutes)
1. Transfer JSON file to mobile device
2. Follow "Scenario 1: Full Workflow - Web to Mobile" steps 8-12
3. Import data and verify
4. Test prompter functionality

### 4. Additional Scenarios (30 minutes)
- Test keyboard events on web (Scenario 4)
- Test mouse interactions (Scenario 3)
- Test graceful degradation (Scenario 2)
- Test browser compatibility (Scenario 7)

## Expected Results

### Automated Tests
- ✅ 37 test suites pass
- ✅ 309 tests pass
- ✅ Each property test runs 100 iterations
- ⚠️ React `act(...)` warnings are normal (non-blocking)

### Manual Tests
- ✅ Data exports to valid JSON
- ✅ Data imports without errors
- ✅ All songs and setlists preserved
- ✅ Settings preserved
- ✅ Prompter scrolls smoothly (60 FPS on mobile)
- ✅ Keyboard shortcuts work on web
- ✅ Touch controls work on mobile

## Troubleshooting

### Tests Fail
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear cache: `npm test -- --clearCache`
3. Run tests again

### Web App Won't Start
1. Check port 8081 is available
2. Kill existing processes: `npx kill-port 8081`
3. Try again: `npm run web`

### Mobile App Won't Connect
1. Ensure phone and computer on same network
2. Check firewall settings
3. Try restarting Metro bundler: `npm start -- --reset-cache`

### Import Fails on Mobile
1. Verify JSON file is valid (open in text editor)
2. Check file has correct structure (version, songs, setlists)
3. Try exporting again from web

## Quick Checklist

### Before Release
- [ ] All automated tests pass
- [ ] Manual web testing complete
- [ ] Manual mobile testing complete
- [ ] Export/import tested
- [ ] Performance acceptable
- [ ] No critical bugs found

### Documentation
- [ ] `CROSS-PLATFORM-WORKFLOW-TEST.md` - Detailed test guide
- [ ] `TASK-32-CROSS-PLATFORM-TESTING-SUMMARY.md` - Task summary
- [ ] `QUICK-TEST-GUIDE.md` - This quick reference

## Support

For detailed testing instructions, see:
- **Comprehensive Guide:** `CROSS-PLATFORM-WORKFLOW-TEST.md`
- **Task Summary:** `TASK-32-CROSS-PLATFORM-TESTING-SUMMARY.md`
- **Design Document:** `.kiro/specs/teleprompter-app/design.md`
- **Requirements:** `.kiro/specs/teleprompter-app/requirements.md`
