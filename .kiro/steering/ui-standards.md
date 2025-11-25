---
inclusion: always
---

# UI Standards for StagePrompt

This document defines the standard UI components and patterns to be used throughout the StagePrompt application.

## Standard Components

### ConfirmDialog - Standard Confirmation Dialog

**Location:** `src/components/ConfirmDialog.tsx`

**When to use:** ANY time you need to show a confirmation dialog or alert to the user.

**Why:** This component provides a consistent, cross-platform experience that works identically on web and mobile. It replaces the native `Alert.alert()` which has inconsistent behavior across platforms.

**Usage Example:**

```typescript
import { ConfirmDialog } from '../components/ConfirmDialog';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowDialog(true)}>
        <Text>Delete Item</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={showDialog}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}  // Use for destructive actions (red button)
        onConfirm={async () => {
          setShowDialog(false);
          // Perform the action
          await deleteItem();
        }}
        onCancel={() => setShowDialog(false)}
      />
    </>
  );
}
```

**Props:**
- `visible: boolean` - Controls dialog visibility
- `title: string` - Dialog title
- `message: string` - Dialog message/description
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `destructive?: boolean` - If true, confirm button is red (for delete/destructive actions)
- `onConfirm: () => void` - Called when user confirms
- `onCancel: () => void` - Called when user cancels or dismisses

**DO NOT USE:**
- ❌ `Alert.alert()` - Inconsistent across platforms
- ❌ `window.confirm()` - Web-only, not styled
- ❌ `window.alert()` - Web-only, not styled
- ❌ Custom inline confirmation logic

**ALWAYS USE:**
- ✅ `ConfirmDialog` component for ALL confirmations

### Toast - Standard Feedback Messages

**Location:** `src/components/Toast.tsx`

**When to use:** To show brief feedback messages to the user (success, error, info).

**Usage Example:**

```typescript
import { Toast } from '../components/Toast';

function MyComponent() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <>
      <TouchableOpacity onPress={() => showToast('Item saved!', 'success')}>
        <Text>Save</Text>
      </TouchableOpacity>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}
```

## Color Palette

**Background Colors:**
- Primary Background: `#1a1a1a`
- Secondary Background: `#2a2a2a`
- Tertiary Background: `#3a3a3a`

**Text Colors:**
- Primary Text: `#ffffff`
- Secondary Text: `#cccccc`
- Tertiary Text: `#999999`
- Disabled Text: `#666666`

**Action Colors:**
- Primary Action: `#4a9eff` (blue)
- Success: `#4caf50` (green)
- Error/Destructive: `#ff4444` (red)
- Warning: `#ff9800` (orange)
- Info: `#2196f3` (light blue)

**Accent Colors:**
- Purple: `#9b59b6`
- Teal: `#4a9eff`

## Typography

**Font Sizes:**
- Title: `28px` (bold)
- Section Title: `20px` (semi-bold)
- Subsection Title: `18px` (semi-bold)
- Body: `16px`
- Small: `14px`
- Tiny: `12px`

**Font Weights:**
- Bold: `'bold'` or `'700'`
- Semi-bold: `'600'`
- Normal: `'400'`
- Light: `'300'`

## Spacing

**Padding/Margin:**
- XS: `4px`
- S: `8px`
- M: `12px`
- L: `16px`
- XL: `20px`
- XXL: `24px`
- XXXL: `32px`

## Border Radius

- Small: `4px`
- Medium: `8px`
- Large: `12px`
- XLarge: `16px`

## Shadows (Elevation)

```typescript
// Light shadow
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 2,

// Medium shadow
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.2,
shadowRadius: 6,
elevation: 4,

// Heavy shadow
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8,
```

## Best Practices

1. **Always use ConfirmDialog for confirmations** - Never use Alert.alert or window.confirm
2. **Use Toast for feedback** - Brief success/error messages
3. **Consistent spacing** - Use the defined spacing scale
4. **Consistent colors** - Use the defined color palette
5. **Accessibility** - Ensure touch targets are at least 44x44 pixels
6. **Cross-platform** - Test on both web and mobile
7. **Dark theme** - All UI should work with dark backgrounds

## Examples in Codebase

**Good examples to reference:**
- `src/screens/SetlistEditorScreen.tsx` - Uses ConfirmDialog for delete confirmation
- `src/screens/SettingsScreen.tsx` - Uses ConfirmDialog for reset confirmation
- `src/components/ConfirmDialog.tsx` - Standard dialog implementation
- `src/components/Toast.tsx` - Standard toast implementation
