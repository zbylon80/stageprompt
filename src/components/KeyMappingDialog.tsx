// components/KeyMappingDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { KeyMapping, PrompterAction } from '../types/models';

interface KeyMappingDialogProps {
  visible: boolean;
  keyMapping: KeyMapping;
  onSave: (mapping: KeyMapping) => void;
  onCancel: () => void;
}

type ActionInfo = {
  key: keyof KeyMapping;
  label: string;
  description: string;
};

const ACTIONS: ActionInfo[] = [
  {
    key: 'nextSong',
    label: 'Next Song',
    description: 'Move to the next song in the setlist',
  },
  {
    key: 'prevSong',
    label: 'Previous Song',
    description: 'Move to the previous song in the setlist',
  },
  {
    key: 'pause',
    label: 'Play/Pause',
    description: 'Toggle playback in the prompter',
  },
];

export function KeyMappingDialog({
  visible,
  keyMapping,
  onSave,
  onCancel,
}: KeyMappingDialogProps) {
  const [localMapping, setLocalMapping] = useState<KeyMapping>(keyMapping);
  const [learningAction, setLearningAction] = useState<keyof KeyMapping | null>(null);

  // Update local mapping when prop changes
  useEffect(() => {
    if (visible) {
      setLocalMapping(keyMapping);
      setLearningAction(null);
    }
  }, [visible, keyMapping]);

  // Listen for key events when in learning mode
  useEffect(() => {
    if (!learningAction || Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Capture the keyCode
      const keyCode = event.keyCode || event.which;

      // Update the mapping
      setLocalMapping((prev) => ({
        ...prev,
        [learningAction]: keyCode,
      }));

      // Exit learning mode
      setLearningAction(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [learningAction]);

  const handleStartLearning = (action: keyof KeyMapping) => {
    setLearningAction(action);
  };

  const handleClearMapping = (action: keyof KeyMapping) => {
    setLocalMapping((prev) => ({
      ...prev,
      [action]: undefined,
    }));
  };

  const handleClearAll = () => {
    setLocalMapping({});
  };

  const handleSave = () => {
    onSave(localMapping);
  };

  const getKeyName = (keyCode: number | undefined): string => {
    if (keyCode === undefined) return 'Not mapped';

    // Common key names
    const keyNames: Record<number, string> = {
      8: 'Backspace',
      9: 'Tab',
      13: 'Enter',
      16: 'Shift',
      17: 'Ctrl',
      18: 'Alt',
      27: 'Escape',
      32: 'Space',
      37: 'Left Arrow',
      38: 'Up Arrow',
      39: 'Right Arrow',
      40: 'Down Arrow',
      46: 'Delete',
    };

    if (keyNames[keyCode]) {
      return keyNames[keyCode];
    }

    // Letter keys (A-Z)
    if (keyCode >= 65 && keyCode <= 90) {
      return String.fromCharCode(keyCode);
    }

    // Number keys (0-9)
    if (keyCode >= 48 && keyCode <= 57) {
      return String.fromCharCode(keyCode);
    }

    // F keys
    if (keyCode >= 112 && keyCode <= 123) {
      return `F${keyCode - 111}`;
    }

    return `Key ${keyCode}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <Text style={styles.title}>Key Mapping</Text>
              <Text style={styles.subtitle}>
                Map keys from your Bluetooth controller to actions
              </Text>

              {Platform.OS !== 'web' && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ Key mapping is currently only supported on web/desktop.
                    On mobile, use a Bluetooth controller that acts as a keyboard.
                  </Text>
                </View>
              )}

              <ScrollView style={styles.actionsList} showsVerticalScrollIndicator={true}>
                {ACTIONS.map((action) => (
                  <View key={action.key} style={styles.actionItem}>
                    <View style={styles.actionInfo}>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                      <Text style={styles.actionDescription}>{action.description}</Text>
                      <Text style={styles.currentMapping}>
                        Current: {getKeyName(localMapping[action.key])}
                      </Text>
                    </View>

                    <View style={styles.actionButtons}>
                      {learningAction === action.key ? (
                        <View style={styles.learningIndicator}>
                          <Text style={styles.learningText}>Press a key...</Text>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={[styles.button, styles.mapButton]}
                            onPress={() => handleStartLearning(action.key)}
                            disabled={Platform.OS !== 'web'}
                          >
                            <Text style={styles.buttonText}>
                              {localMapping[action.key] !== undefined ? 'Remap' : 'Map'}
                            </Text>
                          </TouchableOpacity>

                          {localMapping[action.key] !== undefined && (
                            <TouchableOpacity
                              style={[styles.button, styles.clearButton]}
                              onPress={() => handleClearMapping(action.key)}
                            >
                              <Text style={styles.buttonText}>Clear</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.button, styles.clearAllButton]}
                  onPress={handleClearAll}
                >
                  <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>

                <View style={styles.dialogButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: '#3a2a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningText: {
    fontSize: 14,
    color: '#ffcc80',
    lineHeight: 20,
  },
  actionsList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  actionItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionInfo: {
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  currentMapping: {
    fontSize: 14,
    color: '#4a9eff',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButton: {
    backgroundColor: '#4a9eff',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  learningIndicator: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  learningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    paddingTop: 16,
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
    marginBottom: 12,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#3a3a3a',
    minWidth: 100,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cccccc',
  },
  saveButton: {
    backgroundColor: '#4a9eff',
    minWidth: 100,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
