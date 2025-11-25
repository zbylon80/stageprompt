import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { useKeyMapping } from '../hooks/useKeyMapping';
import { useSongs } from '../hooks/useSongs';
import { useSetlists } from '../hooks/useSetlists';
import { AppSettings } from '../types/models';
import Slider from '@react-native-community/slider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { KeyMappingDialog } from '../components/KeyMappingDialog';
import { exportImportService } from '../services/exportImportService';
import { storageService } from '../services/storageService';

export function SettingsScreen() {
  const { settings, loading, error, saveSettings } = useSettings();
  const { keyMapping, loading: keyMappingLoading, saveKeyMapping } = useKeyMapping();
  const { songs, reload: reloadSongs } = useSongs();
  const { setlists, reload: reloadSetlists } = useSetlists();
  
  // Local state for live editing
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isResettingRef = React.useRef(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showKeyMappingDialog, setShowKeyMappingDialog] = useState(false);
  const [showImportModeDialog, setShowImportModeDialog] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Initialize local settings when settings load
  useEffect(() => {
    if (settings && !isResettingRef.current) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Auto-save with debounce
  useEffect(() => {
    if (!localSettings || !settings || isResettingRef.current) return;
    
    // Don't save if settings haven't changed
    if (JSON.stringify(localSettings) === JSON.stringify(settings)) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveSettings(localSettings);
      } catch (err) {
        console.error('Failed to save settings:', err);
        showToast('Failed to save settings', 'error');
      } finally {
        setIsSaving(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [localSettings, settings, saveSettings]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      [key]: value,
    });
  };

  const parseColor = (color: string): string => {
    // Ensure color starts with # and is valid hex
    let cleaned = color.trim();
    if (!cleaned.startsWith('#')) {
      cleaned = '#' + cleaned;
    }
    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      return cleaned;
    }
    return localSettings?.textColor || '#ffffff';
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const jsonData = await exportImportService.exportAllData(songs, setlists);
      const filename = `stageprompt-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      await exportImportService.downloadExport(jsonData, filename);
      showToast('Data exported successfully', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportPick = async () => {
    try {
      setIsImporting(true);
      const fileContent = await exportImportService.pickImportFile();
      
      if (!fileContent) {
        setIsImporting(false);
        return; // User cancelled
      }

      // Validate the data
      if (!exportImportService.validateImportData(fileContent)) {
        showToast('Invalid import file format', 'error');
        setIsImporting(false);
        return;
      }

      // Store the data and show mode selection dialog
      setPendingImportData(fileContent);
      setShowImportModeDialog(true);
      setIsImporting(false);
    } catch (err) {
      console.error('Import pick error:', err);
      showToast('Failed to read import file', 'error');
      setIsImporting(false);
    }
  };

  const handleImportConfirm = async (mode: 'merge' | 'replace') => {
    if (!pendingImportData) return;

    try {
      setIsImporting(true);
      setShowImportModeDialog(false);

      const { songs: importedSongs, setlists: importedSetlists } = 
        await exportImportService.importData(pendingImportData, mode);

      if (mode === 'replace') {
        // Clear existing data first
        await storageService.clearAll();
      }

      // Save imported data
      for (const song of importedSongs) {
        await storageService.saveSong(song);
      }
      for (const setlist of importedSetlists) {
        await storageService.saveSetlist(setlist);
      }

      // Reload data
      await reloadSongs();
      await reloadSetlists();

      showToast(
        `Data imported successfully (${importedSongs.length} songs, ${importedSetlists.length} setlists)`,
        'success'
      );
      setPendingImportData(null);
    } catch (err) {
      console.error('Import error:', err);
      showToast('Failed to import data', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  if (loading || keyMappingLoading || !localSettings) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a9eff" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[
        styles.container,
        // @ts-ignore - web-only styles
        Platform.OS === 'web' && { height: '100vh', maxHeight: '100vh', overflowY: 'auto' }
      ]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      // @ts-ignore - web-only attribute
      dataSet={{ scrollable: 'true' }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Appearance Settings</Text>
        {isSaving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color="#4a9eff" />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}
      </View>

      {/* Font Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Size</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.valueText}>{localSettings.fontSize}px</Text>
          <Slider
            style={styles.slider}
            minimumValue={24}
            maximumValue={72}
            step={1}
            value={localSettings.fontSize}
            onValueChange={(value) => updateSetting('fontSize', value)}
            minimumTrackTintColor="#4a9eff"
            maximumTrackTintColor="#555555"
            thumbTintColor="#4a9eff"
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>24px</Text>
            <Text style={styles.rangeLabel}>72px</Text>
          </View>
        </View>
      </View>

      {/* Anchor Y Percent */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anchor Position</Text>
        <Text style={styles.description}>
          Determines where on screen the current line will be displayed (0% = top, 100% = bottom)
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.valueText}>{Math.round(localSettings.anchorYPercent * 100)}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={localSettings.anchorYPercent}
            onValueChange={(value) => updateSetting('anchorYPercent', value)}
            minimumTrackTintColor="#4a9eff"
            maximumTrackTintColor="#555555"
            thumbTintColor="#4a9eff"
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>0%</Text>
            <Text style={styles.rangeLabel}>100%</Text>
          </View>
        </View>
      </View>

      {/* Line Height */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Height</Text>
        <Text style={styles.description}>
          Spacing between text lines in the prompter
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.valueText}>{localSettings.lineHeight}px</Text>
          <Slider
            style={styles.slider}
            minimumValue={40}
            maximumValue={120}
            step={1}
            value={localSettings.lineHeight}
            onValueChange={(value) => updateSetting('lineHeight', value)}
            minimumTrackTintColor="#4a9eff"
            maximumTrackTintColor="#555555"
            thumbTintColor="#4a9eff"
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>40px</Text>
            <Text style={styles.rangeLabel}>120px</Text>
          </View>
        </View>
      </View>

      {/* Margin Horizontal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horizontal Margins</Text>
        <Text style={styles.description}>
          Distance from screen edges on both sides of text
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.valueText}>{localSettings.marginHorizontal}px</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={localSettings.marginHorizontal}
            onValueChange={(value) => updateSetting('marginHorizontal', value)}
            minimumTrackTintColor="#4a9eff"
            maximumTrackTintColor="#555555"
            thumbTintColor="#4a9eff"
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>0px</Text>
            <Text style={styles.rangeLabel}>100px</Text>
          </View>
        </View>
      </View>

      {/* Text Color */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text Color</Text>
        <View style={styles.colorInputContainer}>
          <View style={[styles.colorPreview, { backgroundColor: localSettings.textColor }]} />
          <TextInput
            style={styles.colorInput}
            value={localSettings.textColor}
            onChangeText={(text) => {
              const color = parseColor(text);
              updateSetting('textColor', color);
            }}
            placeholder="#ffffff"
            placeholderTextColor="#666666"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Background Color */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background Color</Text>
        <View style={styles.colorInputContainer}>
          <View style={[styles.colorPreview, { backgroundColor: localSettings.backgroundColor }]} />
          <TextInput
            style={styles.colorInput}
            value={localSettings.backgroundColor}
            onChangeText={(text) => {
              const color = parseColor(text);
              updateSetting('backgroundColor', color);
            }}
            placeholder="#000000"
            placeholderTextColor="#666666"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Live Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview</Text>
        <View
          style={[
            styles.preview,
            {
              backgroundColor: localSettings.backgroundColor,
              paddingHorizontal: localSettings.marginHorizontal,
            },
          ]}
        >
          <Text
            style={[
              styles.previewText,
              {
                color: localSettings.textColor,
                fontSize: localSettings.fontSize,
                lineHeight: localSettings.lineHeight,
              },
            ]}
          >
            Sample text
          </Text>
          <Text
            style={[
              styles.previewText,
              {
                color: localSettings.textColor,
                fontSize: localSettings.fontSize,
                lineHeight: localSettings.lineHeight,
              },
            ]}
          >
            in the prompter
          </Text>
          <Text
            style={[
              styles.previewText,
              {
                color: localSettings.textColor,
                fontSize: localSettings.fontSize,
                lineHeight: localSettings.lineHeight,
              },
            ]}
          >
            with current settings
          </Text>
        </View>
      </View>

      {/* Key Mapping Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bluetooth Controller</Text>
        <Text style={styles.description}>
          Map keys from your Bluetooth controller to control the prompter
        </Text>
        <TouchableOpacity
          style={styles.keyMappingButton}
          onPress={() => setShowKeyMappingDialog(true)}
        >
          <Text style={styles.keyMappingButtonText}>Configure Key Mapping</Text>
        </TouchableOpacity>
        {keyMapping && (
          <View style={styles.currentMappings}>
            <Text style={styles.currentMappingsTitle}>Current Mappings:</Text>
            {keyMapping.nextSong !== undefined && (
              <Text style={styles.mappingText}>• Next Song: Key {keyMapping.nextSong}</Text>
            )}
            {keyMapping.prevSong !== undefined && (
              <Text style={styles.mappingText}>• Previous Song: Key {keyMapping.prevSong}</Text>
            )}
            {keyMapping.pause !== undefined && (
              <Text style={styles.mappingText}>• Play/Pause: Key {keyMapping.pause}</Text>
            )}
            {!keyMapping.nextSong && !keyMapping.prevSong && !keyMapping.pause && (
              <Text style={styles.mappingText}>No keys mapped yet</Text>
            )}
          </View>
        )}
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.description}>
          Export your songs and setlists to backup or transfer to another device
        </Text>
        
        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.buttonDisabled]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.exportButtonText}>Export Data</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.importButton, isImporting && styles.buttonDisabled]}
          onPress={handleImportPick}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.importButtonText}>Import Data</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.dataInfo}>
          Current data: {songs.length} songs, {setlists.length} setlists
        </Text>
      </View>

      {/* Reset to Defaults */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => setShowResetDialog(true)}
      >
        <Text style={styles.resetButtonText}>Reset to Default Settings</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Settings are automatically saved
        </Text>
      </View>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        visible={showResetDialog}
        title="Reset to Defaults"
        message="Are you sure you want to reset all settings to their default values?"
        confirmText="Reset"
        cancelText="Cancel"
        destructive={true}
        onConfirm={async () => {
          setShowResetDialog(false);
          
          const defaultSettings: AppSettings = {
            fontSize: 48,
            anchorYPercent: 0.4,
            textColor: '#ffffff',
            backgroundColor: '#000000',
            marginHorizontal: 20,
            lineHeight: 60,
          };
          
          // Set flag to prevent auto-save interference
          isResettingRef.current = true;
          
          try {
            setIsSaving(true);
            // Update local state first for immediate UI feedback
            setLocalSettings(defaultSettings);
            // Save to storage
            await saveSettings(defaultSettings);
            showToast('Settings reset to defaults', 'success');
          } catch (err) {
            console.error('Failed to save default settings:', err);
            showToast('Failed to reset settings', 'error');
          } finally {
            setIsSaving(false);
            // Reset flag after a short delay to allow state to settle
            setTimeout(() => {
              isResettingRef.current = false;
            }, 100);
          }
        }}
        onCancel={() => setShowResetDialog(false)}
      />

      {/* Key Mapping Dialog */}
      {keyMapping && (
        <KeyMappingDialog
          visible={showKeyMappingDialog}
          keyMapping={keyMapping}
          onSave={async (mapping) => {
            setShowKeyMappingDialog(false);
            try {
              await saveKeyMapping(mapping);
              showToast('Key mapping saved successfully', 'success');
            } catch (err) {
              console.error('Failed to save key mapping:', err);
              showToast('Failed to save key mapping', 'error');
            }
          }}
          onCancel={() => setShowKeyMappingDialog(false)}
        />
      )}

      {/* Import Mode Dialog */}
      <ConfirmDialog
        visible={showImportModeDialog}
        title="Import Mode"
        message="Choose how to import the data:\n\n• Merge: Add imported data to existing data\n• Replace: Delete all existing data and import"
        confirmText="Merge"
        cancelText="Replace"
        destructive={false}
        onConfirm={() => handleImportConfirm('merge')}
        onCancel={() => handleImportConfirm('replace')}
      />

      {/* Toast for feedback */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingText: {
    color: '#4a9eff',
    fontSize: 14,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  valueText: {
    fontSize: 16,
    color: '#4a9eff',
    fontWeight: '600',
    marginBottom: 8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#666666',
  },
  colorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333333',
  },
  colorInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  preview: {
    marginTop: 12,
    padding: 20,
    borderRadius: 8,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  keyMappingButton: {
    backgroundColor: '#4a9eff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  keyMappingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentMappings: {
    marginTop: 16,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
  },
  currentMappingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  mappingText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  exportButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  importButton: {
    backgroundColor: '#4a9eff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  importButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dataInfo: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
    textAlign: 'center',
  },
});
