# Cross-Platform Workflow Guide

This guide explains how to use StagePrompt across multiple devices for the optimal editing and performance experience.

## Table of Contents

- [Overview](#overview)
- [Workflow Steps](#workflow-steps)
- [Platform Comparison](#platform-comparison)
- [Data Transfer Methods](#data-transfer-methods)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

StagePrompt is designed for a **two-device workflow**:

### 1. Computer (Web/Desktop) - Editing Environment

**Best for:**
- Creating and editing songs
- Setting precise timings
- Organizing setlists
- Bulk operations
- Data management

**Advantages:**
- Large screen for comfortable viewing
- Keyboard for fast text input
- Mouse for precise control
- Easy copy-paste of lyrics
- Drag-and-drop file import

### 2. Tablet/Phone (Android/iOS) - Performance Environment

**Best for:**
- Live performances
- Rehearsals
- On-the-go viewing
- Bluetooth controller use

**Advantages:**
- Portable and lightweight
- Fullscreen teleprompter view
- Touch controls
- Bluetooth controller support
- No cables or setup needed

---

## Workflow Steps

### Step 1: Create Content on Computer

#### 1.1 Start the Web App

```bash
cd stageprompt
npm run web
```

Opens at `http://localhost:8081`

#### 1.2 Create Songs

1. Click **"Songs"** button to open song panel
2. Click **"+ New Song"** button
3. Enter song details:
   - **Title**: Song name
   - **Artist**: Artist/band name
   - **Duration**: Total song length (optional)

#### 1.3 Add Lyrics

1. Click **"+ Add Line"** to add lines at the end
2. Or click **"+ Insert"** between lines to insert
3. Enter text for each line
4. Set timing for each line:
   - Format: `MM:SS` (e.g., "1:14") or seconds (e.g., "74")
   - Times must be in ascending order

**Tips:**
- Copy-paste lyrics from text file
- Use keyboard shortcuts (Ctrl+Enter to add line)
- Set key timings first, interpolate others later

#### 1.4 Add Section Markers (Optional)

1. Click **🏷️** icon next to a line
2. Select section type:
   - **Verse** - Numbered verses (Verse 1, Verse 2, etc.)
   - **Chorus** - Repeating chorus
   - **Bridge** - Bridge section
   - **Intro** - Song introduction
   - **Outro** - Song ending
   - **Instrumental** - Instrumental break
   - **Custom** - Custom label

Section markers help you navigate during performance.

#### 1.5 Create Setlists

1. Go back to main screen
2. Click **"+ New Setlist"**
3. Enter setlist name
4. Drag songs from right panel to setlist
5. Reorder by dragging songs up/down
6. Click **"Save"**

#### 1.6 Configure Settings

1. Click **"Settings"** (gear icon)
2. Adjust appearance:
   - **Font Size**: 24-72px (larger for stage use)
   - **Anchor Position**: Where text centers (default 40%)
   - **Colors**: Text and background colors
   - **Margins**: Horizontal padding
3. Settings are saved automatically

### Step 2: Export Data

#### 2.1 Export from Web

1. Go to **Settings** screen
2. Scroll to **Data Management** section
3. Click **"Export Data"** button
4. File downloads as `stageprompt-export-[date].json`

**What's included:**
- All songs with lyrics and timings
- All setlists with song order
- App settings (appearance, key mappings)
- Section markers and metadata

**File location:**
- **Windows**: `C:\Users\[username]\Downloads\`
- **macOS**: `/Users/[username]/Downloads/`
- **Linux**: `/home/[username]/Downloads/`

### Step 3: Transfer to Mobile Device

Choose one of these methods:

#### Method A: Email (Easiest)

1. Email the JSON file to yourself
2. Open email on mobile device
3. Download attachment
4. Note the download location

#### Method B: Cloud Storage (Recommended)

1. Upload JSON file to:
   - Google Drive
   - Dropbox
   - OneDrive
   - iCloud Drive
2. Open cloud app on mobile device
3. Download file to device
4. Note the download location

#### Method C: USB Cable (Fastest)

**Android:**
1. Connect device via USB
2. Enable **File Transfer** mode
3. Copy JSON file to `Downloads` folder

**iOS:**
1. Connect device via USB
2. Open **Finder** (macOS) or **iTunes** (Windows)
3. Select device → **Files** tab
4. Drag JSON file to **StagePrompt** folder

#### Method D: Local Network (Advanced)

1. Use file sharing app (e.g., Send Anywhere, Snapdrop)
2. Both devices on same WiFi network
3. Send file from computer to mobile
4. Save to device storage

### Step 4: Import on Mobile Device

#### 4.1 Open StagePrompt on Mobile

1. Launch StagePrompt app
2. Go to **Settings** screen
3. Scroll to **Data Management** section

#### 4.2 Import Data

1. Click **"Import Data"** button
2. Select import mode:
   - **Merge**: Add imported data to existing
   - **Replace**: Delete all and import
3. Choose JSON file from device storage
4. Wait for import to complete
5. See confirmation message

**Import modes explained:**

**Merge Mode:**
- Keeps existing songs and setlists
- Adds imported songs and setlists
- Duplicates are allowed (different IDs)
- Settings are updated to imported values
- **Use when**: Adding new content to existing library

**Replace Mode:**
- Deletes all existing data
- Imports only the new data
- Fresh start with imported content
- **Use when**: Starting fresh or syncing completely

#### 4.3 Verify Import

1. Go to main screen
2. Check that setlists appear
3. Open a setlist
4. Open a song
5. Verify lyrics and timings are correct

### Step 5: Perform with Mobile Device

#### 5.1 Open Setlist

1. From main screen, tap setlist
2. Tap first song to start

#### 5.2 Use Teleprompter

**Fullscreen mode:**
- Text displays in large, readable font
- Dark background for stage visibility
- Section markers show song structure

**Playback controls:**
- **Play/Pause**: Start/stop scrolling
- **Previous**: Go to previous song
- **Next**: Go to next song
- **Exit**: Return to setlist

**Touch controls:**
- **Tap left third**: Previous song
- **Tap center**: Pause/play
- **Tap right third**: Next song

#### 5.3 Use Bluetooth Controller (Optional)

If you have a Bluetooth footswitch or remote:

1. Pair controller with device (in device settings)
2. In StagePrompt, go to **Settings** → **Key Mapping**
3. Map buttons:
   - Click **"Map"** next to action
   - Press button on controller
   - Repeat for all actions
4. Test in teleprompter

**Recommended mapping:**
- **Left button**: Previous song
- **Right button**: Next song
- **Center button**: Pause/play

### Step 6: Sync Changes (Optional)

If you make changes on mobile device:

#### 6.1 Export from Mobile

1. Go to **Settings**
2. Click **"Export Data"**
3. Choose share method:
   - Email to yourself
   - Save to cloud storage
   - Share via app

#### 6.2 Import on Computer

1. Download JSON file on computer
2. Open StagePrompt web app
3. Go to **Settings** → **Import Data**
4. Choose **Merge** mode (to keep existing work)
5. Select JSON file
6. Verify changes

---

## Platform Comparison

### Feature Availability

| Feature | Web/Desktop | Mobile (Android/iOS) |
|---------|-------------|---------------------|
| Create/Edit Songs | ✅ Full | ✅ Full |
| Create/Edit Setlists | ✅ Full | ✅ Full |
| Teleprompter | ✅ Full | ✅ Full |
| Keyboard Shortcuts | ✅ Yes | ❌ No |
| Bluetooth Controller | ⚠️ Keyboard only | ✅ Full support |
| Drag-and-Drop Files | ✅ Yes | ❌ No |
| Export Data | ✅ Download | ✅ Share |
| Import Data | ✅ File picker | ✅ File picker |
| Touch Controls | ⚠️ Mouse clicks | ✅ Native touch |

### Performance Comparison

| Aspect | Web/Desktop | Mobile |
|--------|-------------|--------|
| Editing Speed | ⭐⭐⭐⭐⭐ Fast (keyboard) | ⭐⭐⭐ Moderate (touch) |
| Scrolling Smoothness | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| Screen Size | ⭐⭐⭐⭐⭐ Large | ⭐⭐⭐ Small-Medium |
| Portability | ⭐⭐ Desktop only | ⭐⭐⭐⭐⭐ Highly portable |
| Battery Life | ⭐⭐⭐ Plugged in | ⭐⭐⭐⭐ Hours of use |

### Recommended Use Cases

**Use Computer for:**
- Initial song creation
- Bulk editing (many songs at once)
- Precise timing adjustments
- Organizing large libraries
- Backup and data management

**Use Mobile for:**
- Live performances
- Rehearsals
- Quick reviews
- On-stage use
- Portable practice

---

## Data Transfer Methods

### Comparison

| Method | Speed | Ease | Reliability | Best For |
|--------|-------|------|-------------|----------|
| Email | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Small libraries |
| Cloud Storage | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Regular syncing |
| USB Cable | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Large libraries |
| Local Network | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | Tech-savvy users |

### File Size Considerations

**Typical file sizes:**
- 10 songs: ~50 KB
- 50 songs: ~250 KB
- 100 songs: ~500 KB
- 500 songs: ~2.5 MB

All methods handle these sizes easily.

---

## Best Practices

### Data Management

1. **Export regularly** - Create backups before major changes
2. **Use descriptive names** - Name exports with date and purpose
3. **Keep multiple backups** - Store in different locations
4. **Test imports** - Verify data after importing
5. **Use merge mode** - Safer than replace for updates

### Editing Workflow

1. **Batch create** - Create all songs at once on computer
2. **Set key timings** - Focus on important lines first
3. **Test on mobile** - Verify appearance on target device
4. **Iterate** - Make adjustments and re-export
5. **Final check** - Test complete setlist before performance

### Performance Preparation

1. **Charge device** - Ensure full battery before show
2. **Test controller** - Verify Bluetooth connection
3. **Adjust brightness** - Set appropriate for stage lighting
4. **Disable notifications** - Turn on Do Not Disturb mode
5. **Keep backup** - Have printed lyrics as fallback

### Sync Strategy

**Option A: One-way sync (Recommended)**
- Edit only on computer
- Export and import to mobile
- Mobile is read-only for performances
- Simple and predictable

**Option B: Two-way sync (Advanced)**
- Edit on both devices
- Export from both
- Merge imports carefully
- Watch for conflicts
- More flexible but complex

---

## Troubleshooting

### Export Issues

**Export button doesn't work:**
- Check browser console for errors
- Try different browser
- Ensure sufficient disk space
- Check browser download settings

**File not downloading:**
- Check browser's download folder
- Look for blocked downloads notification
- Try "Save As" if available
- Check antivirus software

### Import Issues

**"Invalid file format" error:**
- Verify file is JSON (not .txt or .zip)
- Open file in text editor to check format
- Ensure file wasn't corrupted during transfer
- Try exporting again from source

**Import succeeds but data missing:**
- Check import mode (merge vs replace)
- Verify file contains expected data
- Check for validation errors in console
- Try importing on different device

**Import very slow:**
- Large file size (>5MB) may take time
- Close other apps to free memory
- Try smaller batches
- Check device storage space

### Transfer Issues

**File won't open on mobile:**
- Ensure file extension is `.json`
- Try different file manager app
- Check file permissions
- Re-download from source

**USB transfer not working:**
- Enable USB debugging (Android)
- Trust computer (iOS)
- Try different USB cable
- Restart both devices

**Cloud sync not working:**
- Check internet connection
- Verify cloud app is logged in
- Check storage quota
- Try manual download

### Data Conflicts

**Duplicate songs after merge:**
- Each song has unique ID
- Duplicates are allowed
- Delete unwanted duplicates manually
- Or use replace mode for clean slate

**Settings not syncing:**
- Settings are device-specific by default
- Export includes settings
- Import overwrites local settings
- Adjust settings after import if needed

**Setlists missing songs:**
- Setlists reference song IDs
- If song ID doesn't exist, it's skipped
- Import songs before setlists
- Or use complete export/import

---

## Advanced Topics

### Automation Scripts

For power users, you can automate exports:

```bash
# Backup script (run on computer)
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="$HOME/stageprompt-backups"
mkdir -p "$BACKUP_DIR"

# Export from web app (manual step)
# Then move to backup folder
mv ~/Downloads/stageprompt-export-*.json "$BACKUP_DIR/backup-$DATE.json"

echo "Backup created: $BACKUP_DIR/backup-$DATE.json"
```

### Version Control

For teams or advanced users:

1. Store JSON exports in Git repository
2. Track changes over time
3. Collaborate on song libraries
4. Revert to previous versions

```bash
git init stageprompt-data
cd stageprompt-data
cp ~/Downloads/stageprompt-export-*.json data.json
git add data.json
git commit -m "Update setlist for [event name]"
git push
```

### Multiple Devices

Managing multiple performance devices:

1. **Master library** - Maintain on computer
2. **Export once** - Create single export file
3. **Import to all** - Use same file on all devices
4. **Update together** - Re-import when library changes
5. **Device-specific settings** - Adjust per device after import

---

## Quick Reference

### Computer Workflow

```
1. npm run web
2. Create/edit songs
3. Create/edit setlists
4. Settings → Export Data
5. Save JSON file
```

### Mobile Workflow

```
1. Transfer JSON file to device
2. Open StagePrompt
3. Settings → Import Data
4. Choose Merge or Replace
5. Select JSON file
6. Verify import
```

### Performance Checklist

- [ ] Device fully charged
- [ ] Bluetooth controller paired (if using)
- [ ] Brightness adjusted for stage
- [ ] Do Not Disturb enabled
- [ ] Setlist opened and ready
- [ ] Backup plan available

---

For more information:
- [Main README](../README.md)
- [Bluetooth Controllers](./CONTROLLERS.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [API Documentation](./API.md)
