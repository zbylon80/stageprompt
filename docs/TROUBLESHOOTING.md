# Troubleshooting Guide

This guide helps you solve common issues with StagePrompt.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Running the App](#running-the-app)
- [Data Issues](#data-issues)
- [Teleprompter Issues](#teleprompter-issues)
- [Bluetooth Controller Issues](#bluetooth-controller-issues)
- [Performance Issues](#performance-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [Getting Help](#getting-help)

---

## Installation Issues

### npm install fails

**Symptoms:**
- Error messages during `npm install`
- Missing dependencies
- Version conflicts

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be v18 or newer. If not, update Node.js.

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Use correct npm version:**
   ```bash
   npm install -g npm@latest
   ```

4. **Check for permission issues:**
   ```bash
   # On macOS/Linux, avoid using sudo
   # Fix permissions instead:
   sudo chown -R $USER ~/.npm
   ```

5. **Try yarn instead:**
   ```bash
   npm install -g yarn
   yarn install
   ```

### Expo CLI not found

**Symptoms:**
- `expo: command not found`
- Cannot run `npm start`

**Solutions:**

1. **Install Expo CLI globally:**
   ```bash
   npm install -g expo-cli
   ```

2. **Or use npx:**
   ```bash
   npx expo start
   ```

3. **Check PATH:**
   ```bash
   echo $PATH
   # Should include npm global bin directory
   ```

---

## Running the App

### npm start fails

**Symptoms:**
- Metro bundler won't start
- Port already in use
- Connection errors

**Solutions:**

1. **Clear cache and restart:**
   ```bash
   npm start -- --clear
   # or
   expo start -c
   ```

2. **Kill process on port 8081:**
   ```bash
   # On macOS/Linux:
   lsof -ti:8081 | xargs kill -9
   
   # On Windows:
   netstat -ano | findstr :8081
   taskkill /PID [PID] /F
   ```

3. **Use different port:**
   ```bash
   npm start -- --port 8082
   ```

4. **Check firewall:**
   - Allow Node.js through firewall
   - Allow port 8081 (or your chosen port)

### Web app won't load

**Symptoms:**
- Blank page in browser
- "Cannot connect" error
- Infinite loading

**Solutions:**

1. **Check console for errors:**
   - Open browser DevTools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (macOS)
   - Or clear cache in browser settings

3. **Try different browser:**
   - Chrome, Firefox, Safari, Edge
   - Disable browser extensions

4. **Check Metro bundler:**
   - Should show "Metro waiting on exp://..."
   - Look for bundling errors in terminal

### Android app won't build

**Symptoms:**
- Build fails with errors
- App crashes on launch
- "Unable to load script" error

**Solutions:**

1. **Check Android Studio setup:**
   - Android SDK installed
   - Android SDK Platform-Tools installed
   - ANDROID_HOME environment variable set

2. **Clean and rebuild:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

3. **Check device/emulator:**
   - USB debugging enabled (physical device)
   - Emulator running (virtual device)
   - Device authorized for debugging

4. **Check Metro bundler:**
   - Must be running in separate terminal
   - Try `npm start -- --reset-cache`

### iOS app won't build

**Symptoms:**
- Build fails with errors
- CocoaPods issues
- Signing errors

**Solutions:**

1. **Install CocoaPods:**
   ```bash
   sudo gem install cocoapods
   ```

2. **Install pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Clean build:**
   ```bash
   cd ios
   xcodebuild clean
   cd ..
   npm run ios
   ```

4. **Check Xcode:**
   - Xcode installed and up to date
   - Command Line Tools installed
   - Signing certificate configured

---

## Data Issues

### Songs not saving

**Symptoms:**
- Changes disappear after closing app
- "Save failed" error
- Data not persisting

**Solutions:**

1. **Check storage permissions:**
   - Android: Grant storage permission in app settings
   - iOS: Should work automatically

2. **Check available storage:**
   - Ensure device has free space
   - Clear cache if needed

3. **Check for errors:**
   - Look for error messages in app
   - Check console logs (web) or device logs (mobile)

4. **Try manual save:**
   - Export data to JSON
   - Reimport to verify storage works

### Import fails

**Symptoms:**
- "Invalid file format" error
- Import button doesn't work
- Data not appearing after import

**Solutions:**

1. **Verify file format:**
   - File must be `.json` extension
   - Open in text editor to verify it's valid JSON
   - Check for corruption during transfer

2. **Check file structure:**
   ```json
   {
     "version": "1.0",
     "exportDate": 1234567890,
     "songs": [...],
     "setlists": [...]
   }
   ```

3. **Try smaller file:**
   - If file is very large (>10MB), try smaller subset
   - Split into multiple imports

4. **Check validation errors:**
   - Look for specific error messages
   - Fix data issues in JSON file
   - Re-export from source if needed

### Export fails

**Symptoms:**
- Export button doesn't work
- File not downloading
- Empty or corrupted file

**Solutions:**

1. **Check browser settings:**
   - Allow downloads from localhost
   - Check download folder location
   - Disable download blocking

2. **Try different method:**
   - Right-click → Save As
   - Copy JSON from console
   - Use different browser

3. **Check data size:**
   - Very large libraries may take time
   - Wait for download to complete
   - Check available disk space

### Data disappeared

**Symptoms:**
- All songs/setlists gone
- App shows empty state
- Data lost after update

**Solutions:**

1. **Check if data is actually gone:**
   - Restart app
   - Check Settings → Import to see if backup exists
   - Look for export files in Downloads folder

2. **Restore from backup:**
   - Find most recent export file
   - Import using Merge mode
   - Verify data restored

3. **Check storage:**
   - Storage may have been cleared
   - Check device storage settings
   - Reinstall app may clear data

4. **Prevention:**
   - Export regularly
   - Keep backups in multiple locations
   - Use cloud storage for automatic backup

---

## Teleprompter Issues

### Scrolling not smooth

**Symptoms:**
- Jerky or stuttering scroll
- Scroll jumps instead of smooth
- Lag or delay

**Solutions:**

1. **Check timings:**
   - Ensure all lines have times set
   - Times must be in ascending order
   - No duplicate times

2. **Reduce font size:**
   - Settings → Font Size → Lower value
   - Reduces rendering load

3. **Close other apps:**
   - Free up device memory
   - Disable background apps

4. **Check device performance:**
   - Older devices may struggle
   - Try on newer device
   - Reduce line height in settings

### Scrolling too fast/slow

**Symptoms:**
- Text scrolls faster than song
- Text scrolls slower than song
- Timing is off

**Solutions:**

1. **Check timings:**
   - Verify line times are correct
   - Times should match actual song timing
   - Test with actual music playing

2. **Adjust anchor position:**
   - Settings → Anchor Position
   - Higher value = text appears earlier
   - Lower value = text appears later

3. **Check duration:**
   - If duration is set, scrolling stops at duration
   - Verify duration matches song length
   - Remove duration if not needed

### Text not visible

**Symptoms:**
- Black screen in teleprompter
- Text same color as background
- Text too small to read

**Solutions:**

1. **Check colors:**
   - Settings → Text Color (should contrast with background)
   - Settings → Background Color
   - Try white text on black background

2. **Check font size:**
   - Settings → Font Size
   - Increase for better visibility
   - Test from performance distance

3. **Check brightness:**
   - Increase device brightness
   - Adjust for stage lighting
   - Disable auto-brightness

### Controls not working

**Symptoms:**
- Play/pause doesn't work
- Can't navigate between songs
- Touch controls unresponsive

**Solutions:**

1. **Check touch zones:**
   - Tap left third for previous
   - Tap center for pause/play
   - Tap right third for next

2. **Try button controls:**
   - Use on-screen buttons instead
   - Check if buttons are visible

3. **Restart app:**
   - Close and reopen app
   - May fix temporary glitch

---

## Bluetooth Controller Issues

### Controller not detected

**Symptoms:**
- Controller paired but not working
- No response to button presses
- App doesn't see controller

**Solutions:**

1. **Check pairing:**
   - Go to device Bluetooth settings
   - Verify controller is paired and connected
   - Try unpairing and re-pairing

2. **Check controller mode:**
   - Controller must be in keyboard mode
   - Some controllers have multiple modes
   - Check controller manual

3. **Check platform:**
   - Bluetooth controllers work best on Android
   - iOS has limited support
   - Web/desktop uses keyboard events

4. **Restart Bluetooth:**
   - Turn Bluetooth off and on
   - Restart device
   - Restart controller

### Buttons not mapped

**Symptoms:**
- Pressing buttons does nothing
- Wrong action happens
- Inconsistent behavior

**Solutions:**

1. **Map keys:**
   - Settings → Key Mapping
   - Click "Map" next to each action
   - Press button on controller
   - Save mapping

2. **Test mapping:**
   - Open teleprompter
   - Try each button
   - Verify correct action happens

3. **Clear and remap:**
   - Settings → Key Mapping
   - Clear all mappings
   - Remap from scratch

### Multiple button presses

**Symptoms:**
- Single press triggers multiple actions
- Skips songs unintentionally
- Rapid-fire actions

**Solutions:**

1. **Debouncing is built-in:**
   - App has 300ms debounce
   - Should prevent multiple triggers
   - If still happening, controller may be faulty

2. **Check controller:**
   - Try different controller
   - Check for stuck buttons
   - Update controller firmware if available

3. **Adjust timing:**
   - Press buttons deliberately
   - Wait for action to complete
   - Don't rapid-fire buttons

---

## Performance Issues

### App is slow

**Symptoms:**
- Laggy UI
- Slow response to taps
- Delayed scrolling

**Solutions:**

1. **Close other apps:**
   - Free up RAM
   - Disable background apps
   - Restart device

2. **Reduce data size:**
   - Delete unused songs
   - Remove old setlists
   - Export and start fresh

3. **Clear cache:**
   - Settings → Clear Cache (if available)
   - Or reinstall app

4. **Update app:**
   - Check for updates
   - Update to latest version

### High battery drain

**Symptoms:**
- Battery drains quickly
- Device gets hot
- Short performance time

**Solutions:**

1. **Reduce brightness:**
   - Lower screen brightness
   - Use adaptive brightness

2. **Close other apps:**
   - Background apps drain battery
   - Disable unnecessary services

3. **Use power saving mode:**
   - Enable device power saving
   - May reduce performance slightly

4. **Check for updates:**
   - App updates may improve efficiency
   - Update device OS

### App crashes

**Symptoms:**
- App closes unexpectedly
- "App has stopped" error
- Freezes and must force quit

**Solutions:**

1. **Update app:**
   - Check for latest version
   - Update may fix crash

2. **Clear data:**
   - Export data first
   - Clear app data in device settings
   - Reimport data

3. **Reinstall app:**
   - Uninstall app
   - Restart device
   - Reinstall app
   - Import data

4. **Check device:**
   - Update device OS
   - Check for device issues
   - Try on different device

---

## Platform-Specific Issues

### Web (Browser)

**Issue: Keyboard shortcuts don't work**
- Check if browser has focus
- Disable browser extensions
- Try different browser

**Issue: Can't import files**
- Check browser file picker permissions
- Try drag-and-drop instead
- Use different browser

**Issue: Export downloads as .txt**
- Right-click → Save As
- Change extension to .json
- Check browser download settings

### Android

**Issue: Back button exits app**
- Expected behavior in some screens
- Use in-app navigation instead
- Or use Android navigation gestures

**Issue: Keyboard covers input**
- Should auto-scroll to input
- Try closing and reopening keyboard
- Check `softwareKeyboardLayoutMode` in app.json

**Issue: Bluetooth controller not working**
- Check controller is in keyboard mode
- Try different controller
- Check Android version (5.0+ required)

### iOS

**Issue: Bluetooth controller limited**
- iOS has limited Bluetooth keyboard support
- Some controllers may not work
- Try MFi-certified controllers

**Issue: Can't import files**
- Use Files app to access JSON
- Or use AirDrop from Mac
- Or email file to yourself

**Issue: Scrolling feels different**
- iOS has different scroll physics
- Adjust anchor position if needed
- Test timings on actual device

---

## Getting Help

### Before Asking for Help

1. **Check this guide** - Solution may be here
2. **Search existing issues** - Someone may have had same problem
3. **Try basic troubleshooting** - Restart app, clear cache, etc.
4. **Gather information** - Error messages, device info, steps to reproduce

### Information to Provide

When reporting an issue, include:

- **Device**: Make, model, OS version
- **App version**: Check in Settings → About
- **Platform**: Web, Android, iOS
- **Steps to reproduce**: Exact steps that cause issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Error messages**: Exact text of any errors
- **Screenshots**: If applicable

### Where to Get Help

1. **Documentation**:
   - [Main README](../README.md)
   - [API Documentation](./API.md)
   - [Workflow Guide](./WORKFLOW.md)
   - [Controller Guide](./CONTROLLERS.md)

2. **GitHub Issues**:
   - Search existing issues
   - Create new issue with template
   - Provide all requested information

3. **Community**:
   - Discussion forums
   - User groups
   - Social media

---

## Common Error Messages

### "Storage quota exceeded"

**Cause**: Device storage is full

**Solution**:
- Free up device storage
- Delete unused apps/files
- Export data and clear app data

### "Invalid JSON format"

**Cause**: Import file is corrupted or wrong format

**Solution**:
- Verify file is valid JSON
- Re-export from source
- Check file wasn't modified

### "Network request failed"

**Cause**: No internet connection (if using cloud features)

**Solution**:
- Check internet connection
- Try again when online
- Use offline features

### "Permission denied"

**Cause**: App doesn't have required permissions

**Solution**:
- Grant storage permission in device settings
- Grant file access permission
- Reinstall app if needed

---

## Prevention Tips

### Avoid Data Loss

1. **Export regularly** - Weekly or before major changes
2. **Multiple backups** - Store in different locations
3. **Test imports** - Verify backups work
4. **Cloud storage** - Automatic backup
5. **Version control** - Track changes over time

### Avoid Performance Issues

1. **Keep app updated** - Install updates promptly
2. **Manage library size** - Delete unused content
3. **Close other apps** - Free up resources
4. **Restart regularly** - Clear memory leaks
5. **Monitor storage** - Keep free space available

### Avoid Controller Issues

1. **Test before show** - Verify controller works
2. **Fresh batteries** - Replace before performance
3. **Backup plan** - Know touch controls
4. **Keep paired** - Don't unpair between uses
5. **Document mapping** - Write down button assignments

---

## Still Having Issues?

If you've tried everything and still have problems:

1. **Create minimal reproduction** - Simplest steps that show issue
2. **Test on different device** - Isolate device-specific issues
3. **Check for known issues** - May be fixed in next release
4. **Report bug** - Help improve the app for everyone

---

For more information:
- [Main README](../README.md)
- [API Documentation](./API.md)
- [Testing Guide](./TESTING.md)
- [Workflow Guide](./WORKFLOW.md)
