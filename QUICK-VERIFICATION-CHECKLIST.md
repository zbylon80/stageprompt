# Quick Verification Checklist - StagePrompt

Use this checklist to quickly verify all major functionality works as expected.

## ✅ Automated Tests (COMPLETED)
- [x] All 309 tests passing
- [x] All 31 correctness properties verified
- [x] All requirements covered

## 🖥️ Web Testing (Computer Environment)

### Song Management
- [ ] Open app in browser (`npm run web`)
- [ ] Create a new song
- [ ] Add title and artist
- [ ] Add multiple lyric lines
- [ ] Set timing for each line (try both MM:SS and seconds format)
- [ ] Set song duration
- [ ] Save and verify song appears in list
- [ ] Edit existing song
- [ ] Delete song

### Setlist Management
- [ ] Create a new setlist
- [ ] Add songs to setlist by dragging from song panel
- [ ] Reorder songs in setlist
- [ ] Remove song from setlist (verify song still exists)
- [ ] Delete setlist (verify songs still exist)

### Song Sections (Optional Feature)
- [ ] Add section markers to lyrics (Verse, Chorus, etc.)
- [ ] Verify sections display in editor
- [ ] Verify sections display in prompter

### Prompter
- [ ] Open prompter for a song
- [ ] Verify fullscreen display
- [ ] Test play/pause
- [ ] Test next/previous song navigation
- [ ] Verify smooth scrolling
- [ ] Test keyboard controls (if mapped)

### Settings
- [ ] Adjust font size
- [ ] Change text color
- [ ] Change background color
- [ ] Adjust anchor position
- [ ] Adjust margins
- [ ] Verify changes apply to prompter

### Export/Import
- [ ] Export all data to JSON file
- [ ] Verify file downloads
- [ ] Clear browser data (localStorage)
- [ ] Import the JSON file
- [ ] Verify all songs and setlists restored

## 📱 Mobile Testing (Performance Environment)

### Basic Functionality
- [ ] Install on Android device (Expo Go or APK)
- [ ] Verify all songs and setlists load
- [ ] Test creating/editing songs
- [ ] Test creating/editing setlists
- [ ] Test prompter display

### Prompter Performance
- [ ] Open prompter in fullscreen
- [ ] Verify smooth scrolling (60 FPS)
- [ ] Test with long songs (>5 minutes)
- [ ] Test with many lines (>50 lines)
- [ ] Verify no lag or stuttering

### Cross-Platform Workflow
- [ ] Create songs on computer
- [ ] Export to JSON
- [ ] Transfer file to mobile (email/cloud/USB)
- [ ] Import on mobile
- [ ] Verify all data intact
- [ ] Use in prompter mode

## 🎮 Bluetooth Controller Testing (Android Only)

### Setup
- [ ] Pair Bluetooth controller/footswitch with Android device
- [ ] Open Settings in app
- [ ] Enter key mapping mode
- [ ] Map keys for: Next Song, Previous Song, Pause

### Testing
- [ ] Open prompter with setlist
- [ ] Test "Next Song" button
- [ ] Test "Previous Song" button
- [ ] Test "Pause" button
- [ ] Verify debouncing (rapid presses don't cause issues)
- [ ] Test at last song (should not crash)
- [ ] Test at first song going previous (should not crash)

## 🔍 Edge Cases

### Empty States
- [ ] App with no songs (should show empty message)
- [ ] App with no setlists (should show empty message)
- [ ] Setlist with no songs (should show empty message)

### Data Validation
- [ ] Try to create song with empty title (should prevent)
- [ ] Try to set negative timing (should prevent)
- [ ] Try to import invalid JSON (should show error)
- [ ] Try to import corrupted data (should show error)

### Error Handling
- [ ] Disconnect Bluetooth during prompter (should continue with touch)
- [ ] Fill storage to capacity (should show error)
- [ ] Network interruption during export (should handle gracefully)

## 🎯 Performance Checks

### Memory
- [ ] Run prompter for 30+ minutes
- [ ] Check for memory leaks (app should not slow down)
- [ ] Switch between songs rapidly (should not crash)

### Battery
- [ ] Run prompter for 1 hour on mobile
- [ ] Monitor battery drain (should be reasonable)
- [ ] Verify screen stays on during prompter

### Responsiveness
- [ ] All buttons respond immediately
- [ ] No lag when typing
- [ ] Smooth animations throughout
- [ ] Fast app startup (<3 seconds)

## 📋 User Experience

### Usability
- [ ] UI is intuitive and easy to navigate
- [ ] All text is readable
- [ ] Touch targets are large enough (mobile)
- [ ] Keyboard shortcuts work (web)
- [ ] Drag and drop is smooth

### Visual
- [ ] Dark theme is consistent
- [ ] Colors have good contrast
- [ ] Fonts are appropriate sizes
- [ ] Spacing is comfortable
- [ ] No visual glitches

### Feedback
- [ ] Success messages appear when saving
- [ ] Error messages are clear and helpful
- [ ] Confirmation dialogs for destructive actions
- [ ] Loading states are shown when needed

## 🚀 Production Readiness

### Documentation
- [ ] README.md is complete
- [ ] User guide is available
- [ ] Setup instructions are clear
- [ ] Troubleshooting guide exists

### Deployment
- [ ] Web version can be deployed
- [ ] Android APK can be built
- [ ] App version is set correctly
- [ ] Update mechanism is in place (if applicable)

## ✅ Sign-Off

**Tested By:** ___________________  
**Date:** ___________________  
**Environment:** Web / Android / iOS  
**Device:** ___________________  
**Notes:** ___________________

---

## Quick Test Commands

```bash
# Run all automated tests
npm test

# Start web version
npm run web

# Start Android version
npm run android

# Build production APK
npm run build:android

# Check for TypeScript errors
npx tsc --noEmit
```

## Known Limitations

1. **Bluetooth support is Android-only** - iOS requires additional configuration
2. **Web version has no Bluetooth** - Use keyboard as controller instead
3. **Large libraries (>1000 songs)** - May benefit from SQLite migration in future
4. **Offline only** - No cloud sync in current version (future enhancement)

## Support

For issues or questions:
1. Check `FINAL-TESTING-VERIFICATION.md` for detailed test results
2. Review E2E test cases in `e2e/test-cases/`
3. Check console logs for error messages
4. Verify all requirements in `requirements.md` are met
