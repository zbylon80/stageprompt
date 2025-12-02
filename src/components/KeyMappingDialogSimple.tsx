// components/KeyMappingDialogSimple.tsx
// Simplified version for Expo Go - allows manual key code entry

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { KeyMapping } from '../types/models';

interface KeyMappingDialogSimpleProps {
  visible: boolean;
  keyMapping: KeyMapping;
  onSave: (mapping: KeyMapping) => void;
  onCancel: () => void;
}

type ActionInfo = {
  key: keyof KeyMapping;
  label: string;
  description: string;
  commonCodes: { code: number; name: string }[];
};

const ACTIONS: ActionInfo[] = [
  {
    key: 'nextSong',
    label: 'Next Song',
    description: 'Move to the next song in the setlist',
    commonCodes: [
      { code: 22, name: 'Right Arrow' },
      { code: 87, name: 'Media Next' },
      { code: 66, name: 'Enter' },
    ],
  },
  {
    key: 'prevSong',
    label: 'Previous Song',
    description: 'Move to the previous song in the setlist',
    commonCodes: [
      { code: 21, name: 'Left Arrow' },
      { code: 88, name: 'Media Previous' },
      { code: 67, name: 'Backspace' },
    ],
  },
  {
    key: 'pause',
    label: 'Play/Pause',
    description: 'Toggle playback in the prompter',
    commonCodes: [
      { code: 62, name: 'Space' },
      { code: 85, name: 'Media Play/Pause' },
      { code: 19, name: 'Up Arrow' },
    ],
  },
];

export function KeyMappingDialogSimple({
  visible,
  keyMapping,
  onSave,
  onCancel,
}: KeyMappingDialogSimpleProps) {
  const [localMapping, setLocalMapping] = useState<KeyMapping>(keyMapping);
  const [editingAction, setEditingAction] = useState<keyof KeyMapping | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [learningAction, setLearningAction] = useState<keyof KeyMapping | null>(null);

  // Update local mapping when prop changes
  useEffect(() => {
    if (visible) {
      setLocalMapping(keyMapping);
      setEditingAction(null);
      setInputValue('');
      setLearningAction(null);
    }
  }, [visible, keyMapping]);

  // Listen for key events when in learning mode (Android)
  useEffect(() => {
    if (!learningAction || Platform.OS !== 'android') return;

    console.log('🎮 Learning mode active for:', learningAction);

    try {
      const KeyEvent = require('react-native-keyevent');

      const handleKeyDown = (keyEvent: any) => {
        const keyCode = keyEvent.keyCode;
        console.log('🎮 Key captured:', keyCode, 'Event:', JSON.stringify(keyEvent));

        // Update the mapping
        setLocalMapping((prev) => ({
          ...prev,
          [learningAction]: keyCode,
        }));

        // Exit learning mode
        setLearningAction(null);
      };

      KeyEvent.onKeyDownListener(handleKeyDown);

      return () => {
        KeyEvent.removeKeyDownListener();
      };
    } catch (error) {
      console.warn('react-native-keyevent not available:', error);
      // Show user-friendly message
      setLearningAction(null);
      alert('Automatic key detection requires a development build.\n\nPlease use "Manual" or select from common codes instead.');
    }
  }, [learningAction]);

  const handleStartEditing = (action: keyof KeyMapping) => {
    setEditingAction(action);
    setInputValue(localMapping[action]?.toString() || '');
  };

  const handleSaveKeyCode = () => {
    if (!editingAction) return;

    const keyCode = parseInt(inputValue, 10);
    if (isNaN(keyCode) || keyCode < 0 || keyCode > 255) {
      alert('Please enter a valid key code (0-255)');
      return;
    }

    setLocalMapping((prev) => ({
      ...prev,
      [editingAction]: keyCode,
    }));

    setEditingAction(null);
    setInputValue('');
  };

  const handleSelectCommonCode = (action: keyof KeyMapping, code: number) => {
    setLocalMapping((prev) => ({
      ...prev,
      [action]: code,
    }));
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
      19: 'Up Arrow',
      20: 'Down Arrow',
      21: 'Left Arrow',
      22: 'Right Arrow',
      62: 'Space',
      66: 'Enter',
      67: 'Delete',
      85: 'Media Play/Pause',
      87: 'Media Next',
      88: 'Media Previous',
    };

    if (keyNames[keyCode]) {
      return `${keyNames[keyCode]} (${keyCode})`;
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
                Map Bluetooth controller buttons to actions
              </Text>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📱 <Text style={styles.infoBold}>How to map your controller:</Text>{'\n'}
                  {'\n'}
                  <Text style={styles.infoBold}>Option 1 - Automatic (Recommended):</Text>{'\n'}
                  1. Click "Map" button below{'\n'}
                  2. Press a button on your controller{'\n'}
                  3. The key code will be captured automatically{'\n'}
                  {'\n'}
                  <Text style={styles.infoBold}>Option 2 - Manual:</Text>{'\n'}
                  • Select from common codes{'\n'}
                  • Or click "Manual" to enter a code directly
                </Text>
              </View>

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

                    {/* Manual input and Map button - MOVED TO TOP */}
                    <View style={styles.actionButtons}>
                      {learningAction === action.key ? (
                        <View style={styles.learningIndicator}>
                          <Text style={styles.learningText}>Press a button on your controller...</Text>
                        </View>
                      ) : editingAction === action.key ? (
                        <View style={styles.editingContainer}>
                          <TextInput
                            style={styles.keyCodeInput}
                            value={inputValue}
                            onChangeText={setInputValue}
                            placeholder="Enter key code (0-255)"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
                            autoFocus
                          />
                          <TouchableOpacity
                            style={[styles.button, styles.saveInputButton]}
                            onPress={handleSaveKeyCode}
                          >
                            <Text style={styles.buttonText}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.button, styles.cancelInputButton]}
                            onPress={() => setEditingAction(null)}
                          >
                            <Text style={styles.buttonText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={[styles.button, styles.mapButton]}
                            onPress={() => setLearningAction(action.key)}
                          >
                            <Text style={styles.buttonText}>
                              {localMapping[action.key] !== undefined ? 'Remap' : 'Map'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.button, styles.manualButton]}
                            onPress={() => handleStartEditing(action.key)}
                          >
                            <Text style={styles.buttonText}>Manual</Text>
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

                    {/* Common codes - MOVED TO BOTTOM */}
                    <Text style={styles.commonCodesTitle}>Or select common code:</Text>
                    <View style={styles.commonCodesContainer}>
                      {action.commonCodes.map((item) => (
                        <TouchableOpacity
                          key={item.code}
                          style={[
                            styles.commonCodeButton,
                            localMapping[action.key] === item.code && styles.commonCodeButtonActive,
                          ]}
                          onPress={() => handleSelectCommonCode(action.key, item.code)}
                        >
                          <Text style={styles.commonCodeText}>
                            {item.name}
                          </Text>
                          <Text style={styles.commonCodeNumber}>({item.code})</Text>
                        </TouchableOpacity>
                      ))}
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
    maxHeight: '90%',
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
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#1a2a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4a9eff',
  },
  infoText: {
    fontSize: 13,
    color: '#a0c4ff',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#ffffff',
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
  commonCodesTitle: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
    marginTop: 4,
  },
  commonCodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  commonCodeButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  commonCodeButtonActive: {
    backgroundColor: '#4a9eff',
    borderColor: '#4a9eff',
  },
  commonCodeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  commonCodeNumber: {
    fontSize: 10,
    color: '#cccccc',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editingContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  keyCodeInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#4a9eff',
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
  manualButton: {
    backgroundColor: '#9b59b6',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    flex: 1,
  },
  saveInputButton: {
    backgroundColor: '#4caf50',
    minWidth: 50,
  },
  cancelInputButton: {
    backgroundColor: '#ff4444',
    minWidth: 50,
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
