# Bluetooth Controller Guide

This guide explains how to use Bluetooth controllers with StagePrompt for hands-free operation during performances.

## Table of Contents

- [Overview](#overview)
- [Compatible Controllers](#compatible-controllers)
- [Setup Instructions](#setup-instructions)
- [Key Mapping](#key-mapping)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## Overview

### What is a Bluetooth Controller?

A Bluetooth controller is an external device that connects wirelessly to your phone or tablet and sends button press events. Common types include:

- **Footswitches** - Pedals you press with your foot
- **Presentation Remotes** - Handheld clickers
- **Game Controllers** - Gaming controllers in keyboard mode
- **Page Turners** - Devices designed for musicians

### Why Use a Controller?

**Benefits:**
- **Hands-free operation** - Keep hands on instrument
- **Eyes on audience** - Don't look at screen
- **Reliable control** - Physical buttons vs touch
- **Professional appearance** - No fumbling with device
- **Consistent operation** - Same feel every time

### How It Works

1. Controller connects via Bluetooth
2. Controller sends key codes (like a keyboard)
3. StagePrompt maps key codes to actions
4. Actions control teleprompter (next, prev, pause)

---

## Compatible Controllers

### Requirements

For a controller to work with StagePrompt, it must:

1. **Connect via Bluetooth** - Bluetooth 4.0 or newer
2. **Keyboard mode** - Sends key codes (not mouse/gamepad)
3. **Platform support** - Works with your device OS

### Tested Controllers

#### ✅ Fully Compatible

**AirTurn BT-200**
- Type: Footswitch (2 pedals)
- Modes: Keyboard mode
- Platforms: Android, iOS
- Price: ~$100
- Notes: Popular with musicians, very reliable

**AirTurn DIGIT III**
- Type: Handheld remote (4 buttons)
- Modes: Keyboard mode
- Platforms: Android, iOS
- Price: ~$50
- Notes: Compact, good for rehearsals

**PageFlip Firefly**
- Type: Footswitch (2 pedals)
- Modes: Keyboard mode
- Platforms: Android, iOS
- Price: ~$80
- Notes: Rechargeable, good battery life

**Generic Bluetooth Footswitch**
- Type: Footswitch (1-4 pedals)
- Modes: Keyboard mode
- Platforms: Android (best), iOS (limited)
- Price: ~$20-40
- Notes: Many brands, quality varies

#### ⚠️ Partially Compatible

**Presentation Remotes (Logitech R400, etc.)**
- Works on: Android, Web/Desktop
- Limitations: Limited buttons (usually 2-4)
- Notes: Good for basic control

**Bluetooth Keyboards**
- Works on: All platforms
- Limitations: Not hands-free
- Notes: Good for testing, not performance

#### ❌ Not Compatible

**Game Controllers (Gamepad Mode)**
- Reason: Sends gamepad events, not key codes
- Workaround: Some have keyboard mode

**Mouse-Only Devices**
- Reason: Sends mouse events, not key codes
- Workaround: None currently

**Proprietary Protocols**
- Reason: Custom protocols not supported
- Workaround: None

### Platform Compatibility

| Controller Type | Android | iOS | Web/Desktop |
|----------------|---------|-----|-------------|
| Bluetooth Footswitch (Keyboard) | ✅ Full | ⚠️ Limited | ✅ Full |
| Presentation Remote | ✅ Full | ⚠️ Limited | ✅ Full |
| Bluetooth Keyboard | ✅ Full | ✅ Full | ✅ Full |
| Game Controller (Keyboard Mode) | ✅ Full | ❌ No | ✅ Full |
| Game Controller (Gamepad Mode) | ❌ No | ❌ No | ❌ No |

**Notes:**
- **Android**: Best support, most controllers work
- **iOS**: Limited to MFi-certified or HID keyboard devices
- **Web/Desktop**: Works with any keyboard-mode controller

---

## Setup Instructions

### Step 1: Pair Controller

#### Android

1. **Enable Bluetooth:**
   - Settings → Bluetooth → On

2. **Put controller in pairing mode:**
   - Check controller manual for pairing button
   - Usually: Hold power button for 3-5 seconds
   - LED should blink indicating pairing mode

3. **Pair in Android settings:**
   - Settings → Bluetooth
   - Wait for controller to appear in "Available devices"
   - Tap controller name
   - Wait for "Connected" status

4. **Verify connection:**
   - Controller LED should be solid (not blinking)
   - Status shows "Connected"

#### iOS

1. **Enable Bluetooth:**
   - Settings → Bluetooth → On

2. **Put controller in pairing mode:**
   - Check controller manual
   - Hold power button for 3-5 seconds

3. **Pair in iOS settings:**
   - Settings → Bluetooth
   - Wait for controller to appear
   - Tap controller name
   - May need to enter PIN (usually 0000 or 1234)

4. **Verify connection:**
   - Status shows "Connected"

**iOS Limitations:**
- Only MFi-certified or HID keyboard devices work
- Some controllers may not be detected
- Try different controller if not working

#### Web/Desktop

1. **Enable Bluetooth on computer:**
   - Windows: Settings → Bluetooth & devices
   - macOS: System Preferences → Bluetooth
   - Linux: Bluetooth settings

2. **Pair controller:**
   - Put controller in pairing mode
   - Select controller in Bluetooth settings
   - Click "Pair" or "Connect"

3. **Verify connection:**
   - Controller should show as connected
   - Test by pressing buttons (should type characters)

### Step 2: Configure in StagePrompt

1. **Open StagePrompt**

2. **Go to Settings:**
   - Tap gear icon (⚙️)
   - Scroll to "Key Mapping" section

3. **Map buttons:**
   - See [Key Mapping](#key-mapping) section below

---

## Key Mapping

### Available Actions

StagePrompt supports these actions:

- **Next Song** - Go to next song in setlist
- **Previous Song** - Go to previous song in setlist
- **Pause/Play** - Toggle playback

### Mapping Process

1. **Open Key Mapping:**
   - Settings → Key Mapping

2. **Map each action:**
   - Tap "Map" button next to action
   - Dialog shows: "Press key on controller"
   - Press desired button on controller
   - Key code is captured and saved
   - Repeat for each action

3. **Test mapping:**
   - Open a song in teleprompter
   - Press each button
   - Verify correct action happens

### Recommended Mappings

#### 2-Button Controller (Footswitch)

**Option A: Navigation**
- Left pedal: Previous Song
- Right pedal: Next Song
- (Use touch for pause/play)

**Option B: Control**
- Left pedal: Pause/Play
- Right pedal: Next Song
- (Use touch for previous)

#### 3-Button Controller

- Left button: Previous Song
- Center button: Pause/Play
- Right button: Next Song

#### 4-Button Controller

- Button 1: Previous Song
- Button 2: Pause/Play
- Button 3: Next Song
- Button 4: (Unmapped or custom)

### Clearing Mappings

To remove a mapping:

1. Settings → Key Mapping
2. Tap "Clear" next to action
3. Mapping is removed
4. Button will no longer trigger action

### Resetting to Defaults

To reset all mappings:

1. Settings → Key Mapping
2. Tap "Reset to Defaults"
3. All mappings cleared
4. Remap as needed

---

## Testing

### Test Before Performance

Always test your controller before a show:

1. **Pair controller** - Verify connection
2. **Map keys** - Configure actions
3. **Test in teleprompter** - Try all buttons
4. **Test full setlist** - Navigate through songs
5. **Test from performance position** - Verify range

### Testing Checklist

- [ ] Controller pairs successfully
- [ ] All buttons mapped correctly
- [ ] Next song works
- [ ] Previous song works
- [ ] Pause/play works
- [ ] No accidental double-presses
- [ ] Works from performance distance
- [ ] Battery is charged
- [ ] Backup plan ready (touch controls)

### Common Test Issues

**Button does nothing:**
- Check controller is connected
- Verify button is mapped
- Try remapping button

**Wrong action happens:**
- Check mapping in Settings
- Clear and remap button
- Verify controller mode (keyboard not gamepad)

**Multiple actions per press:**
- Debouncing should prevent this
- If happening, controller may be faulty
- Try different controller

---

## Troubleshooting

### Controller Won't Pair

**Check:**
- Bluetooth is enabled on device
- Controller is in pairing mode (LED blinking)
- Controller is charged
- Controller is within range (< 10 meters)
- No other device is connected to controller

**Try:**
- Restart controller
- Restart device Bluetooth
- Forget and re-pair
- Try different controller

### Controller Paired But Not Working

**Check:**
- Controller shows "Connected" in Bluetooth settings
- Controller is in keyboard mode (not gamepad/mouse)
- Buttons are mapped in StagePrompt
- App has focus (on web/desktop)

**Try:**
- Disconnect and reconnect
- Remap buttons
- Restart app
- Test with different app (to verify controller works)

### Buttons Not Responding

**Check:**
- Controller battery level
- Controller is still connected
- Buttons are mapped correctly
- App is in teleprompter screen

**Try:**
- Press buttons firmly
- Check battery
- Remap buttons
- Restart controller

### Inconsistent Behavior

**Check:**
- Interference from other Bluetooth devices
- Low battery
- Distance from device
- Physical obstructions

**Try:**
- Move closer to device
- Charge controller
- Turn off other Bluetooth devices
- Test in different location

### Platform-Specific Issues

**Android:**
- Most controllers work well
- If not working, check controller is in keyboard mode
- Try different controller

**iOS:**
- Limited to MFi-certified or HID keyboard devices
- Many generic controllers won't work
- Try AirTurn or PageFlip brands

**Web/Desktop:**
- Works with any keyboard-mode controller
- Ensure browser window has focus
- Try different browser if issues

---

## Advanced Configuration

### Multiple Controllers

You can use multiple controllers simultaneously:

1. Pair all controllers
2. Map different buttons to different actions
3. All controllers work together

**Use cases:**
- Footswitch + handheld remote
- Multiple footswitches
- Backup controller

### Custom Key Codes

If you know the key code, you can manually configure:

1. Edit key mapping in Settings
2. Enter key code directly
3. Save and test

**Common key codes:**
- Arrow keys: 37 (left), 38 (up), 39 (right), 40 (down)
- Space: 32
- Enter: 13
- Page Up: 33
- Page Down: 34

### Controller Profiles

For different setups, you can:

1. Export settings (includes key mapping)
2. Import different profiles for different controllers
3. Switch between profiles as needed

**Example:**
- Profile A: Footswitch mapping
- Profile B: Handheld remote mapping
- Profile C: Keyboard mapping

### Debounce Timing

StagePrompt has built-in 300ms debounce to prevent accidental double-presses. This cannot be changed currently.

If you need faster response:
- Press buttons deliberately
- Wait for action to complete
- Don't rapid-fire buttons

---

## Buying Guide

### What to Look For

When buying a controller:

1. **Keyboard mode** - Must support keyboard mode
2. **Bluetooth 4.0+** - For reliable connection
3. **Battery life** - At least 8 hours
4. **Build quality** - Will be used on stage
5. **Button feel** - Tactile feedback
6. **Range** - At least 10 meters
7. **Reviews** - Check musician reviews

### Budget Options

**Under $30:**
- Generic Bluetooth footswitches
- Basic presentation remotes
- Quality varies, read reviews

**$30-$80:**
- PageFlip Firefly
- Better build quality
- Longer battery life
- More reliable

**$80-$150:**
- AirTurn BT-200
- AirTurn DIGIT III
- Professional quality
- Excellent reliability
- Best for serious performers

### Where to Buy

- **Amazon** - Wide selection, reviews
- **Music stores** - Specialized equipment
- **Manufacturer direct** - Latest models
- **Used market** - Save money, check condition

---

## Best Practices

### Performance Preparation

1. **Charge fully** - Night before show
2. **Test before show** - 30 minutes before
3. **Keep backup** - Touch controls as fallback
4. **Bring spare batteries** - If replaceable
5. **Document mapping** - Write down button assignments

### Maintenance

1. **Keep clean** - Wipe after use
2. **Store properly** - Protective case
3. **Charge regularly** - Don't let fully discharge
4. **Update firmware** - If available
5. **Test periodically** - Don't wait for show

### During Performance

1. **Place strategically** - Easy to reach
2. **Secure cables** - If wired backup
3. **Know touch controls** - In case controller fails
4. **Don't panic** - Touch controls always work
5. **Focus on performance** - Controller should be invisible

---

## FAQ

**Q: Do I need a controller?**
A: No, touch controls work fine. Controllers are optional for hands-free operation.

**Q: Will any Bluetooth device work?**
A: No, only devices that send keyboard events (key codes) work.

**Q: Can I use a wired controller?**
A: Not directly. Bluetooth only. But USB keyboards work on web/desktop.

**Q: How many buttons do I need?**
A: Minimum 2 (next/prev). 3 is ideal (next/prev/pause).

**Q: What's the range?**
A: Typically 10 meters (30 feet) line-of-sight. Less with obstacles.

**Q: How long does battery last?**
A: Varies by controller. Usually 8-50 hours. Check specs.

**Q: Can I use my phone as a controller?**
A: Not currently. May be added in future.

**Q: What if controller fails during show?**
A: Use touch controls. Always have backup plan.

---

## Recommended Controllers

### Best Overall: AirTurn BT-200
- **Price**: ~$100
- **Type**: Footswitch (2 pedals)
- **Battery**: Rechargeable, 200+ hours
- **Range**: 30+ feet
- **Pros**: Reliable, durable, long battery
- **Cons**: Expensive

### Best Budget: Generic Bluetooth Footswitch
- **Price**: ~$25
- **Type**: Footswitch (2 pedals)
- **Battery**: AAA batteries, 20+ hours
- **Range**: 30 feet
- **Pros**: Affordable, works well
- **Cons**: Quality varies, shorter battery

### Best Portable: AirTurn DIGIT III
- **Price**: ~$50
- **Type**: Handheld (4 buttons)
- **Battery**: Rechargeable, 100+ hours
- **Range**: 30 feet
- **Pros**: Compact, versatile
- **Cons**: Not hands-free

---

For more information:
- [Main README](../README.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Workflow Guide](./WORKFLOW.md)
- [API Documentation](./API.md)
