# Requirements Document

## Introduction

The teleprompter scrolling functionality is currently completely broken - the prompter does not scroll at all during playback. This is a critical issue as automatic scrolling is the core functionality of a teleprompter application. This spec addresses the complete fix or potential rewrite of the scrolling mechanism while preserving all other existing features (section navigation, pause/resume, keyboard controls, timing interpolation, etc.).

## Glossary

- **Prompter**: The teleprompter screen that displays lyrics and scrolls automatically during song playback
- **ScrollView**: React Native component used to display scrollable content
- **Scroll Position**: The current vertical offset of the scrolled content in pixels
- **Timing Data**: Time markers associated with lyric lines that determine when each line should be visible
- **Interpolation**: The calculation of intermediate scroll positions between known timing anchors
- **Section Navigation**: Feature allowing users to jump to specific song sections (verse, chorus, etc.)
- **Playback State**: Current state of the prompter (playing, paused, stopped)

## Requirements

### Requirement 1

**User Story:** As a performer, I want the prompter to automatically scroll during playback, so that I can read the lyrics without manual intervention.

#### Acceptance Criteria

1. WHEN the user starts playback THEN the Prompter SHALL begin scrolling automatically based on timing data
2. WHEN playback is active THEN the Prompter SHALL continuously update scroll position to match the current time
3. WHEN the song reaches the end THEN the Prompter SHALL stop scrolling at the final position
4. WHEN timing data is available for a line THEN the Prompter SHALL scroll to show that line at the appropriate time
5. WHEN no timing data is available THEN the Prompter SHALL use default scrolling behavior based on song duration

### Requirement 2

**User Story:** As a performer, I want smooth and predictable scrolling, so that I can easily follow the lyrics without distraction.

#### Acceptance Criteria

1. WHEN scrolling between two timing anchors THEN the Prompter SHALL interpolate smoothly without jumps or stutters
2. WHEN the scroll position updates THEN the Prompter SHALL use the platform-appropriate scrolling method (animated on mobile, smooth on web)
3. WHEN multiple scroll updates occur rapidly THEN the Prompter SHALL handle them without performance degradation
4. WHEN the user manually scrolls during playback THEN the Prompter SHALL resume automatic scrolling after a brief delay

### Requirement 3

**User Story:** As a performer, I want pause and resume to work correctly with scrolling, so that I can control playback as needed.

#### Acceptance Criteria

1. WHEN the user pauses playback THEN the Prompter SHALL stop scrolling immediately and maintain the current position
2. WHEN the user resumes playback THEN the Prompter SHALL continue scrolling from the current time position
3. WHEN playback is paused THEN the Prompter SHALL allow manual scrolling without interference
4. WHEN the user seeks to a different time position THEN the Prompter SHALL scroll to the appropriate position for that time

### Requirement 4

**User Story:** As a performer, I want section navigation to work with scrolling, so that I can jump to different parts of the song.

#### Acceptance Criteria

1. WHEN the user navigates to a section THEN the Prompter SHALL scroll to the first line of that section
2. WHEN section navigation occurs during playback THEN the Prompter SHALL update the time position and continue scrolling from the new location
3. WHEN a section has timing data THEN the Prompter SHALL use that data to position the scroll correctly
4. WHEN a section lacks timing data THEN the Prompter SHALL estimate the scroll position based on line position

### Requirement 5

**User Story:** As a developer, I want the scrolling implementation to be maintainable and testable, so that future changes are easier to implement.

#### Acceptance Criteria

1. WHEN implementing scroll logic THEN the system SHALL separate concerns between timing calculation and scroll execution
2. WHEN scroll position is calculated THEN the system SHALL use pure functions that can be tested independently
3. WHEN scroll updates occur THEN the system SHALL log relevant debugging information in development mode
4. WHEN the implementation uses React Native APIs THEN the system SHALL handle platform differences (web vs mobile) appropriately
5. WHEN scroll behavior is modified THEN the system SHALL maintain backward compatibility with existing timing data

### Requirement 6

**User Story:** As a performer, I want all existing prompter features to continue working, so that the fix doesn't break other functionality.

#### Acceptance Criteria

1. WHEN scrolling is fixed THEN the system SHALL preserve keyboard control functionality (play, pause, section navigation)
2. WHEN scrolling is fixed THEN the system SHALL preserve the timing interpolation algorithm
3. WHEN scrolling is fixed THEN the system SHALL preserve section markers and visual indicators
4. WHEN scrolling is fixed THEN the system SHALL preserve the settings for scroll speed and behavior
5. WHEN scrolling is fixed THEN the system SHALL preserve the ability to display songs with or without timing data
