# Cross-Platform Workflow Testing Guide

## Overview

This document provides a comprehensive testing plan for verifying the cross-platform workflow of StagePrompt. The workflow involves editing on web/desktop and using the application on mobile devices.

**Test Date:** _____________  
**Tester:** _____________  
**App Version:** _____________

## Test Environment Setup

### Web/Desktop Environment
- [ ] Browser: Chrome/Firefox/Safari (specify: _____________)
- [ ] URL: http://localhost:8081
- [ ] Command to start: `npm run web`
- [ ] Clear browser localStorage before testing

### Mobile Environment (Android)
- [ ] Device: _____________ (model and OS version)
- [ ] Expo Go installed
- [ ] Command to start: `npm start` then scan QR code
- [ ] Clear app data before testing

## Test Scenarios

### Scenario 1: Full Workflow - Web to Mobile

**Objective:** Verify complete workflow from editing on web to performing on mobile

#### Step 1: Create Content on Web

1. **Start web application**
   ```bash
   npm run web
   ```
   - [ ] Application loads successfully
   - [ ] No console errors
   - [ ] Empty state displayed

2. **Create a song**
   - [ ] Click "Nowy Utwór" button
   - [ ] Enter title: "Test Song 1"
   - [ ] Enter artist: "Test Artist"
   - [ ] Add duration: "3:30" (210 seconds)
   - [ ] Click "Dodaj Linijkę" button
   - [ ] Enter first line text: "First line of lyrics"
   - [ ] Enter time: "0:10" (10 seconds)
   - [ ] Click "Dodaj Linijkę" button again
   - [ ] Enter second line text: "Second line of lyrics"
   - [ ] Enter time: "0:20" (20 seconds)
   - [ ] Add 3-5 more lines with increasing times
   - [ ] Navigate back to song list
   - [ ] Verify song appears in list with correct title and artist

3. **Create a second song**
   - [ ] Repeat above steps with different content
   - [ ] Title: "Test Song 2"
   - [ ] Artist: "Another Artist"
   - [ ] Add 5-7 lines with timings

4. **Create a setlist**
   - [ ] Navigate to setlist list (main screen)
   - [ ] Click "Nowa Setlista" button
   - [ ] Enter name: "Test Setlist"
   - [ ] Drag "Test Song 1" from right panel to setlist
   - [ ] Drag "Test Song 2" from right panel to setlist
   - [ ] Verify both songs appear in setlist
   - [ ] Try reordering songs by dragging
   - [ ] Navigate back to setlist list

5. **Configure settings**
   - [ ] Navigate to Settings screen
   - [ ] Change font size to 48
   - [ ] Change anchor Y to 50%
   - [ ] Change text color to #00FF00 (green)
   - [ ] Change background color to #000000 (black)
   - [ ] Navigate back

6. **Export data**
   - [ ] Navigate to Settings screen
   - [ ] Click "Eksportuj Dane" button
   - [ ] Verify file downloads: `stageprompt-backup-[timestamp].json`
   - [ ] Open file in text editor
   - [ ] Verify JSON structure:
     - [ ] Has `version` field
     - [ ] Has `exportDate` field
     - [ ] Has `songs` array with 2 songs
     - [ ] Has `setlists` array with 1 setlist
     - [ ] All song data is present (title, artist, lines, timings)
     - [ ] All setlist data is present (name, songIds)

#### Step 2: Transfer to Mobile

7. **Transfer file**
   - [ ] Method used: _____________ (email/cloud/USB)
   - [ ] File successfully transferred to mobile device
   - [ ] File accessible on mobile device

#### Step 3: Import and Use on Mobile

8. **Start mobile application**
   ```bash
   npm start
   # Scan QR code with Expo Go
   ```
   - [ ] Application loads successfully
   - [ ] No errors in Metro bundler
   - [ ] Empty state displayed

9. **Import data**
   - [ ] Navigate to Settings screen
   - [ ] Click "Importuj Dane" button
   - [ ] Select the transferred JSON file
   - [ ] Verify success message appears
   - [ ] Navigate back to main screen

10. **Verify imported data**
    - [ ] Setlist "Test Setlist" appears in list
    - [ ] Click on setlist
    - [ ] Both songs appear in correct order
    - [ ] Navigate to song panel
    - [ ] Both songs appear with correct titles and artists
    - [ ] Click on "Test Song 1"
    - [ ] All lines appear with correct text
    - [ ] All times are correct
    - [ ] Duration is correct (3:30)
    - [ ] Navigate back and check "Test Song 2"

11. **Verify settings**
    - [ ] Navigate to Settings
    - [ ] Font size is 48
    - [ ] Anchor Y is 50%
    - [ ] Text color is green (#00FF00)
    - [ ] Background color is black (#000000)

12. **Test prompter on mobile**
    - [ ] Navigate to setlist
    - [ ] Click "Start Prompter" or similar
    - [ ] Prompter displays in fullscreen
    - [ ] Text is green on black background
    - [ ] Font size is large (48)
    - [ ] Click play button
    - [ ] Text scrolls smoothly
    - [ ] Scrolling follows timing
    - [ ] Click pause button
    - [ ] Scrolling stops
    - [ ] Click next song button
    - [ ] Second song loads
    - [ ] Click previous song button
    - [ ] First song loads again

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________________________

---

### Scenario 2: Graceful Degradation - Bluetooth on Web

**Objective:** Verify application works without Bluetooth support on web

1. **Start web application**
   - [ ] Application loads successfully

2. **Navigate to Settings**
   - [ ] Click on Settings
   - [ ] Look for key mapping section
   - [ ] Verify appropriate message if Bluetooth not available
   - [ ] Or verify keyboard events work as alternative

3. **Test keyboard events in prompter**
   - [ ] Create a simple song with 2-3 lines
   - [ ] Enter prompter mode
   - [ ] Press Space key (should pause/play)
   - [ ] Press Arrow Right key (should go to next song if in setlist)
   - [ ] Press Arrow Left key (should go to previous song)
   - [ ] Verify keyboard controls work as expected

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________________________

---

### Scenario 3: Mouse Events as Touch on Web

**Objective:** Verify mouse interactions work like touch on web

1. **Test clicking buttons**
   - [ ] Click "Nowy Utwór" button with mouse
   - [ ] Click "Dodaj Linijkę" button with mouse
   - [ ] Click navigation buttons with mouse
   - [ ] All clicks register correctly

2. **Test scrolling**
   - [ ] Create song with 20+ lines
   - [ ] Scroll with mouse wheel
   - [ ] Scrolling works smoothly
   - [ ] Scroll with trackpad gestures
   - [ ] Gestures work correctly

3. **Test drag and drop**
   - [ ] Create setlist
   - [ ] Drag song from panel with mouse
   - [ ] Drop into setlist
   - [ ] Drag works correctly
   - [ ] Drag to reorder songs in setlist
   - [ ] Reordering works correctly

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________________________

---

### Scenario 4: Keyboard Events on Web

**Objective:** Verify keyboard shortcuts work on web

1. **Test in song editor**
   - [ ] Focus on title field
   - [ ] Type with keyboard
   - [ ] Tab to next field
   - [ ] Tab navigation works
   - [ ] Enter in text field adds new line (if implemented)
   - [ ] Keyboard shortcuts work as expected

2. **Test in prompter**
   - [ ] Enter prompter mode
   - [ ] Press Space (pause/play)
   - [ ] Press Arrow keys (navigation)
   - [ ] Press Escape (exit prompter)
   - [ ] All keyboard shortcuts work

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________________________

---

### Scenario 5: Data Transfer Between Platforms

**Objective:** Verify data integrity during transfer

1. **Create complex data on web**
   - [ ] Create 5 songs with varying complexity:
     - Song with no lines
     - Song with 1 line
     - Song with 50+ lines
     - Song with special characters in text: "Test™ © ® € ñ 中文"
     - Song with very long title (100 characters)
   - [ ] Create 3 setlists with different configurations:
     - Empty setlist
     - Setlist with 1 song
     - Setlist with all 5 songs

2. **Export and verify JSON**
   - [ ] Export data
   - [ ] Open JSON in text editor
   - [ ] Verify special characters are properly encoded
   - [ ] Verify all songs are present
   - [ ] Verify all setlists are present
   - [ ] Verify structure is valid JSON

3. **Import on mobile**
   - [ ] Transfer file to mobile
   - [ ] Import data
   - [ ] Verify all 5 songs imported correctly
   - [ ] Verify all 3 setlists imported correctly
   - [ ] Verify special characters display correctly
   - [ ] Verify long title displays correctly
   - [ ] Verify empty setlist is handled correctly

4. **Round-trip test**
   - [ ] Export data from mobile
   - [ ] Transfer back to web
   - [ ] Clear web storage
   - [ ] Import on web
   - [ ] Verify all data matches original

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________________________

---

### Scenario 6: Expo Go on Android

**Objective:** Verify application works correctly in Expo Go

1. **Installation and startup**
   - [ ] Expo Go installed from Play Store
   - [ ] Run `npm start` on development machine
   - [ ] QR code displayed
   - [ ] Scan QR code with Expo Go
   - [ ] Application loads successfully
   - [ ] No errors in Metro bundler console

2. **Basic functionality**
   - [ ] Create a song
   - [ ] Add lines with timings
   - [ ] Create a setlist
   - [ ] Add songs to setlist
   - [ ] All CRUD operations work

3. **Prompter functionality**
   - [ ] Enter prompter mode
   - [ ] Fullscreen works correctly
   - [ ] Text displays correctly
   - [ ] Scrolling is smooth (60 FPS)
   - [ ] Touch controls work
   - [ ] Play/pause works
   - [ ] Next/previous song works

4. **Storage persistence**
   - [ ] Create some data
   - [ ] Close Expo Go app
   - [ ] Reopen Expo Go app
   - [ ] Scan QR code again
   - [ ] Data persists correctly

5. **Performance**
   - [ ] Create song with 100+ lines
   - [ ] Scrolling is still smooth
   - [ ] No lag in UI
   - [ ] No crashes

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________________________

---

### Scenario 7: Browser Compatibility (Web Mode)

**Objective:** Verify application works in different browsers

#### Chrome
- [ ] Application loads
- [ ] All features work
- [ ] No console errors
- [ ] Export/import works
- [ ] LocalStorage persists

#### Firefox
- [ ] Application loads
- [ ] All features work
- [ ] No console errors
- [ ] Export/import works
- [ ] LocalStorage persists

#### Safari (if available)
- [ ] Application loads
- [ ] All features work
- [ ] No console errors
- [ ] Export/import works
- [ ] LocalStorage persists

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________________________

---

## Performance Benchmarks

### Web Performance
- [ ] Initial load time: _______ seconds
- [ ] Song list with 50 songs loads in: _______ seconds
- [ ] Prompter scrolling is smooth: ✅ YES / ❌ NO
- [ ] No lag when editing: ✅ YES / ❌ NO

### Mobile Performance
- [ ] Initial load time: _______ seconds
- [ ] Song list with 50 songs loads in: _______ seconds
- [ ] Prompter scrolling is smooth (60 FPS): ✅ YES / ❌ NO
- [ ] No lag when editing: ✅ YES / ❌ NO

---

## Edge Cases and Error Handling

### Invalid Import Data
1. **Test with corrupted JSON**
   - [ ] Create invalid JSON file (missing brackets, etc.)
   - [ ] Try to import
   - [ ] Error message displayed
   - [ ] Existing data not affected

2. **Test with wrong structure**
   - [ ] Create JSON with wrong field names
   - [ ] Try to import
   - [ ] Validation fails
   - [ ] Error message displayed
   - [ ] Existing data not affected

3. **Test with partial data**
   - [ ] Create JSON with only songs (no setlists)
   - [ ] Import works
   - [ ] Songs imported correctly
   - [ ] Create JSON with only setlists (no songs)
   - [ ] Import works
   - [ ] Setlists imported correctly

### Storage Limits
1. **Test with large dataset**
   - [ ] Create 100+ songs
   - [ ] Create 20+ setlists
   - [ ] Export data
   - [ ] File size: _______ KB
   - [ ] Import on mobile
   - [ ] Import succeeds
   - [ ] Performance acceptable

### Network Issues (Mobile)
1. **Test offline functionality**
   - [ ] Turn off WiFi and mobile data
   - [ ] Open Expo Go app (already loaded)
   - [ ] All features work offline
   - [ ] Data persists
   - [ ] No network errors

---

## Automated Test Results

### Property-Based Tests
- [ ] Run: `npm test -- CrossPlatform.editing.property.test`
- [ ] All tests pass
- [ ] Number of tests: _______
- [ ] Number of property runs: 100 per test
- [ ] Any failures: _______

### Cross-Platform Service Tests
- [ ] Run: `npm test -- crossplatform.property.test`
- [ ] All tests pass
- [ ] keyEventService cross-platform: ✅ PASS / ❌ FAIL
- [ ] exportImportService cross-platform: ✅ PASS / ❌ FAIL

---

## Issues Found

| # | Scenario | Issue Description | Severity | Status |
|---|----------|-------------------|----------|--------|
| 1 |          |                   | High/Med/Low | Open/Fixed |
| 2 |          |                   | High/Med/Low | Open/Fixed |
| 3 |          |                   | High/Med/Low | Open/Fixed |

---

## Summary

### Overall Result
- [ ] ✅ ALL TESTS PASSED
- [ ] ⚠️ SOME TESTS FAILED (see issues above)
- [ ] ❌ CRITICAL FAILURES

### Recommendations
_____________________________________________
_____________________________________________
_____________________________________________

### Sign-off
**Tester:** _____________  
**Date:** _____________  
**Signature:** _____________
