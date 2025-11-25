// services/exportImportService.ts

import { Platform } from 'react-native';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Song, Setlist } from '../types/models';
import { validateImportData, ExportData } from '../utils/validation';

export type ImportMode = 'merge' | 'replace';

export interface ExportImportService {
  exportAllData(songs: Song[], setlists: Setlist[]): Promise<string>;
  downloadExport(jsonData: string, filename: string): Promise<void>;
  shareExport(jsonData: string, filename: string): Promise<void>;
  pickImportFile(): Promise<string | null>;
  importData(jsonString: string, mode: ImportMode): Promise<{ songs: Song[]; setlists: Setlist[] }>;
  validateImportData(jsonString: string): boolean;
}

class ExportImportServiceImpl implements ExportImportService {
  /**
   * Export all songs and setlists to JSON string
   */
  async exportAllData(songs: Song[], setlists: Setlist[]): Promise<string> {
    const exportData: ExportData = {
      version: '1.0',
      exportDate: Date.now(),
      songs,
      setlists,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Download export file (web) or save to device (mobile)
   */
  async downloadExport(jsonData: string, filename: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web: trigger download
      this.downloadFileWeb(jsonData, filename);
    } else {
      // Mobile: save to file system and share
      await this.shareExport(jsonData, filename);
    }
  }

  /**
   * Share export file (mobile) or download (web fallback)
   */
  async shareExport(jsonData: string, filename: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web: fallback to download
      this.downloadFileWeb(jsonData, filename);
      return;
    }

    // Mobile: save to cache and share
    try {
      const file = new File(Paths.cache, filename);
      await file.write(jsonData);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export StagePrompt Data',
          UTI: 'public.json',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing export:', error);
      throw new Error('Nie udało się udostępnić pliku eksportu');
    }
  }

  /**
   * Pick import file from device
   */
  async pickImportFile(): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Web: use file input
      return this.pickFileWeb();
    }

    // Mobile: use DocumentPicker
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      // Read file content using the new File API
      const file = new File(result.assets[0].uri);
      const fileContent = await file.text();

      return fileContent;
    } catch (error) {
      console.error('Error picking import file:', error);
      throw new Error('Nie udało się wybrać pliku do importu');
    }
  }

  /**
   * Import data from JSON string
   */
  async importData(
    jsonString: string,
    mode: ImportMode
  ): Promise<{ songs: Song[]; setlists: Setlist[] }> {
    try {
      const data = JSON.parse(jsonString);

      if (!validateImportData(data)) {
        throw new Error('Dane importu są nieprawidłowe');
      }

      // Return the data - caller will handle merge/replace logic
      return {
        songs: data.songs,
        setlists: data.setlists,
      };
    } catch (error) {
      console.error('Error importing data:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Plik jest uszkodzony lub ma niepoprawny format');
      }
      throw error;
    }
  }

  /**
   * Validate import data structure
   */
  validateImportData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      return validateImportData(data);
    } catch {
      return false;
    }
  }

  /**
   * Download file on web platform
   */
  private downloadFileWeb(content: string, filename: string): void {
    if (typeof document === 'undefined') {
      throw new Error('Document API not available');
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Pick file on web platform
   */
  private pickFileWeb(): Promise<string | null> {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';

      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          resolve(content);
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsText(file);
      };

      input.oncancel = () => {
        resolve(null);
      };

      input.click();
    });
  }
}

// Export singleton instance
export const exportImportService = new ExportImportServiceImpl();
