# StagePrompt

Cross-platform teleprompter application built with React Native + TypeScript, designed for professional performers who need reliable, synchronized text scrolling during live performances.

## 🎯 Overview

StagePrompt is designed for a dual-environment workflow:

1. **Computer (Web/Desktop)** - Comfortable editing environment with large screen, keyboard, and mouse for creating songs, setting timings, and organizing setlists
2. **Tablet/Phone (Android/iOS)** - Performance environment with smooth, time-synchronized scrolling and Bluetooth controller support

**Typical Workflow:**
1. Create and edit songs on your computer
2. Manually set timings for lyrics lines
3. Organize setlists
4. Export data to JSON file
5. Transfer file to your tablet (email, cloud, USB)
6. Import data on mobile device
7. Use tablet as teleprompter during performance

## ✨ Features

### Song Management
- ✅ Create and edit songs with metadata (title, artist, duration)
- ✅ Lyrics editor with line-by-line timing control
- ✅ **Section-based organization** - Verse, Chorus, Bridge, Intro, Outro, Instrumental, Custom
- ✅ **Time format support** - MM:SS or seconds (e.g., "1:14" or "74")
- ✅ **Duration field** - Set song duration with automatic stop
- ✅ Auto-save on every change
- ✅ Search and filter songs
- ✅ Delete songs with automatic setlist cleanup

### Setlist Management
- ✅ Create and organize setlists
- ✅ Drag-and-drop song reordering
  - Web: Drag by handle ☰
  - Mobile: Long-press and drag
- ✅ Split-view layout with song panel
- ✅ Add songs to setlists from song panel
- ✅ Delete setlists without affecting songs
- ✅ Auto-save after every change

### Teleprompter
- ✅ **Fullscreen display** with large, readable text
- ✅ **Smooth scrolling** with linear interpolation algorithm
- ✅ **Time-synchronized** - text scrolls based on line timings
- ✅ **Playback controls** - Play, pause, next/previous song
- ✅ **Section markers** - Visual indicators for song sections
- ✅ **Customizable appearance** - Font size, colors, margins, anchor position
- ✅ **Touch controls** - Tap zones for quick navigation
- ✅ **Keyboard shortcuts** - Control with keyboard on web/desktop

### Bluetooth Controller Support
- ✅ **External controller support** - Use Bluetooth footswitch or remote
- ✅ **Custom key mapping** - Map any key to actions (next, prev, pause)
- ✅ **Debouncing** - Prevents accidental multiple triggers
- ✅ **Graceful degradation** - Works without controller using touch controls
- ✅ **Cross-platform** - Keyboard events on web/desktop simulate controller

### Data Management
- ✅ **Local storage** - All data stored locally with AsyncStorage
- ✅ **Export/Import** - Full data backup and transfer between devices
- ✅ **Cross-platform compatibility** - Data works identically on all platforms
- ✅ **Validation** - Import validation prevents data corruption
- ✅ **Merge or replace** - Choose how to handle imported data

### Cross-Platform
- ✅ **Web** - Full editing experience in browser
- ✅ **Desktop** - Expo desktop app (Windows, macOS, Linux)
- ✅ **Mobile** - Android and iOS support
- ✅ **Responsive design** - Adapts to screen size
- ✅ **Platform detection** - Automatic feature adaptation

## 📋 Requirements

### Development
- Node.js (v18 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### For Android Development
- Android Studio
- Android SDK
- Java Development Kit (JDK)

### For iOS Development (macOS only)
- Xcode
- CocoaPods

### For Testing
- Expo Go app (for physical device testing)
- Web browser (for web testing)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd stageprompt
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm start
```

This will open Expo Dev Tools in your browser.

## 🎮 Running the Application

### Web (Recommended for editing)

```bash
npm run web
```

Opens in browser at `http://localhost:8081`

**Best for:**
- Creating and editing songs
- Setting up setlists
- Configuring settings
- Exporting data

### Android

```bash
npm run android
```

**Requirements:**
- Android Studio installed
- Android emulator running OR
- Physical device connected via USB with USB debugging enabled

**Best for:**
- Performance testing
- Bluetooth controller testing
- Final user experience

### iOS

```bash
npm run ios
```

**Requirements:**
- macOS with Xcode installed
- iOS Simulator OR
- Physical device connected

### Expo Go (Quick Testing)

1. Install Expo Go app on your phone
2. Run `npm start`
3. Scan QR code with Expo Go app

**Note:** Some features (like Bluetooth) may not work in Expo Go. Use development build for full functionality.

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Types

**Unit Tests** - Test specific functions and components
```bash
npm test -- --testPathPattern="test.tsx?"
```

**Property-Based Tests** - Test universal properties across many inputs
```bash
npm test -- --testPathPattern="property.test"
```

**Integration Tests** - Test component interactions
```bash
npm test -- --testPathPattern="integration"
```

See [Testing Documentation](./docs/TESTING.md) for detailed testing guide.

## 📁 Project Structure

```
stageprompt/
├── src/
│   ├── types/              # TypeScript type definitions
│   │   ├── models.ts       # Data models (Song, Setlist, Settings)
│   │   └── navigation.ts   # Navigation types
│   ├── screens/            # Application screens
│   │   ├── SetlistListScreen.tsx      # Main screen - setlist list
│   │   ├── SongListScreen.tsx         # Song panel
│   │   ├── SongEditorScreen.tsx       # Song editor
│   │   ├── SetlistEditorScreen.tsx    # Setlist editor
│   │   ├── PrompterScreen.tsx         # Teleprompter view
│   │   └── SettingsScreen.tsx         # Settings and configuration
│   ├── components/         # Reusable components
│   │   ├── LyricLineEditor.tsx        # Line editor with timing
│   │   ├── SectionMarker.tsx          # Section badge display
│   │   ├── SectionPicker.tsx          # Section type selector
│   │   ├── PrompterControls.tsx       # Playback controls
│   │   ├── PrompterTouchControls.tsx  # Touch zones
│   │   ├── KeyMappingDialog.tsx       # Key mapping UI
│   │   ├── ConfirmDialog.tsx          # Standard confirmation dialog
│   │   ├── Toast.tsx                  # Feedback messages
│   │   └── ErrorBoundary.tsx          # Error handling
│   ├── services/           # Business logic
│   │   ├── storageService.ts          # AsyncStorage wrapper
│   │   ├── scrollAlgorithm.ts         # Scroll calculation
│   │   ├── keyEventService.ts         # Keyboard/controller events
│   │   └── exportImportService.ts     # Data export/import
│   ├── hooks/              # Custom React hooks
│   │   ├── useSongs.ts                # Song management
│   │   ├── useSetlists.ts             # Setlist management
│   │   ├── useSettings.ts             # Settings management
│   │   ├── useKeyMapping.ts           # Key mapping management
│   │   └── usePrompterTimer.ts        # Timer logic
│   ├── context/            # React Context providers
│   │   ├── DataContext.tsx            # Songs and setlists state
│   │   └── SettingsContext.tsx        # App settings state
│   └── utils/              # Utility functions
│       ├── validation.ts              # Data validation
│       ├── timeFormat.ts              # Time parsing/formatting
│       ├── sectionLabels.ts           # Section utilities
│       ├── idGenerator.ts             # ID generation
│       ├── platform.ts                # Platform detection
│       ├── keyboardShortcuts.ts       # Keyboard shortcuts
│       └── dragDropFile.ts            # File drag-and-drop
├── docs/                   # Documentation
│   ├── API.md             # Service API documentation
│   ├── TESTING.md         # Testing guide
│   ├── WORKFLOW.md        # Cross-platform workflow
│   ├── TROUBLESHOOTING.md # Common issues and solutions
│   └── CONTROLLERS.md     # Bluetooth controller guide
├── e2e/                    # End-to-end tests
│   ├── test-cases/        # Test case documentation
│   ├── screenshots/       # Test screenshots
│   └── README.md          # E2E testing guide
├── .kiro/                  # Kiro IDE configuration
│   └── specs/             # Feature specifications
└── App.tsx                 # Application entry point
```

## 🛠️ Technology Stack

### Core
- **React Native** - Cross-platform mobile framework
- **Expo** - Development tools and native APIs
- **TypeScript** - Static typing and better DX

### Navigation & State
- **React Navigation** - Screen navigation
- **React Context** - Global state management
- **Custom Hooks** - Encapsulated state logic

### UI & Animations
- **React Native Reanimated 2** - Smooth 60 FPS animations
- **React Native Gesture Handler** - Touch gestures
- **React Native Draggable FlatList** - Drag-and-drop lists
- **React Native Safe Area Context** - Safe area handling

### Storage & Data
- **AsyncStorage** - Local data persistence
- **JSON** - Data export/import format

### Testing
- **Jest** - Test runner
- **@testing-library/react-native** - Component testing
- **fast-check** - Property-based testing
- **MCP Playwright** - End-to-end testing

### Platform-Specific
- **react-native-keyevent** (Android) - Bluetooth controller support
- **expo-document-picker** - File import on mobile
- **expo-sharing** - File sharing on mobile

## 📖 Documentation

### User Guides
- [Cross-Platform Workflow](./docs/WORKFLOW.md) - How to work across devices
- [Bluetooth Controllers](./docs/CONTROLLERS.md) - Compatible controllers and setup
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

### Developer Guides
- [API Documentation](./docs/API.md) - Service and hook APIs
- [Testing Guide](./docs/TESTING.md) - How to run and write tests
- [E2E Testing](./e2e/README.md) - End-to-end test documentation

### Feature Documentation
- [Time Format](./TIMING-INTERPOLATION.md) - MM:SS format and duration
- [Song Sections](./SECTION-TIMING-FEATURE.md) - Section markers and timing

## 🔧 Configuration

### App Settings (in-app)
- **Font Size** - 24-72px (default: 48px)
- **Anchor Position** - 0-100% (default: 40%)
- **Text Color** - Hex color (default: #ffffff)
- **Background Color** - Hex color (default: #000000)
- **Margins** - Horizontal padding (default: 20px)
- **Line Height** - Spacing between lines (default: 60px)

### Key Mapping (in-app)
- **Next Song** - Navigate to next song in setlist
- **Previous Song** - Navigate to previous song
- **Pause/Play** - Toggle playback

### Export/Import (in-app)
- **Export** - Save all data to JSON file
- **Import** - Load data from JSON file
- **Merge** - Add imported data to existing
- **Replace** - Replace all data with imported

## 🎯 Cross-Platform Workflow

### 1. Editing on Computer (Web/Desktop)

**Advantages:**
- Large screen for comfortable editing
- Keyboard and mouse for fast input
- Easy copy-paste of lyrics
- Drag-and-drop file import

**Steps:**
1. Open `http://localhost:8081` in browser
2. Create songs and add lyrics
3. Set timings for each line
4. Organize songs into setlists
5. Configure appearance settings
6. Export data to JSON file

### 2. Transfer to Mobile Device

**Methods:**
- **Email** - Email JSON file to yourself
- **Cloud Storage** - Upload to Dropbox, Google Drive, etc.
- **USB** - Connect device and copy file
- **Local Network** - Use file sharing app

### 3. Performance on Tablet

**Advantages:**
- Portable and lightweight
- Touch controls for easy operation
- Bluetooth controller support
- Fullscreen teleprompter view

**Steps:**
1. Open StagePrompt on tablet
2. Go to Settings → Import Data
3. Select JSON file
4. Choose "Merge" or "Replace"
5. Open setlist and start prompter
6. Use touch controls or Bluetooth controller

### 4. Sync Changes (Optional)

If you make changes on tablet:
1. Export data from tablet
2. Transfer file back to computer
3. Import on computer (choose "Merge")

## 🎮 Bluetooth Controller Setup

### Compatible Controllers

**Tested:**
- Generic Bluetooth footswitches (keyboard mode)
- Bluetooth presentation remotes
- Bluetooth game controllers (keyboard mode)

**Requirements:**
- Must work in keyboard mode (sends key codes)
- Bluetooth 4.0 or newer
- Android 5.0+ or iOS 13+

### Setup Steps

1. **Pair Controller**
   - Enable Bluetooth on device
   - Put controller in pairing mode
   - Pair through device settings

2. **Configure in StagePrompt**
   - Open Settings → Key Mapping
   - Click "Map" next to action
   - Press button on controller
   - Repeat for all actions

3. **Test**
   - Open a song in prompter
   - Press controller buttons
   - Verify actions work correctly

See [Controller Guide](./docs/CONTROLLERS.md) for detailed instructions.

## 🐛 Troubleshooting

### Common Issues

**App won't start**
- Run `npm install` to ensure dependencies are installed
- Clear cache: `expo start -c`
- Check Node.js version: `node --version` (should be v18+)

**Tests failing**
- Clear Jest cache: `npm test -- --clearCache`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Import not working**
- Verify JSON file format
- Check file is valid JSON
- Ensure file contains required fields

**Bluetooth controller not working**
- Verify controller is paired in device settings
- Check controller is in keyboard mode
- Try remapping keys in Settings

**Scrolling not smooth**
- Ensure timings are set for all lines
- Check device performance
- Reduce font size or line height

See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for more solutions.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

ISC

## 🙏 Acknowledgments

Built with:
- React Native and Expo teams
- Open source community
- Property-based testing methodology
- Spec-driven development approach

---

**For detailed documentation, see the [docs](./docs/) directory.**
