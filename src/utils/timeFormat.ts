/**
 * Time Format Utilities
 * 
 * Provides functions for parsing and formatting time values in MM:SS format and seconds.
 * Supports bidirectional conversion with precision preservation.
 */

export interface TimeParseResult {
  success: boolean;
  seconds?: number;
  error?: string;
}

/**
 * Parsuje czas z formatu MM:SS lub sekund na sekundy.
 * 
 * Akceptowane formaty:
 * - "74" -> 74 sekundy
 * - "1:14" -> 74 sekundy
 * - "1:5" -> 65 sekund
 * - "75:30" -> 4530 sekund (75 minut)
 * - "1:75" -> 135 sekund (1 minuta + 75 sekund)
 * - "1:30.5" -> 90.5 sekund
 * 
 * @param input - String wprowadzony przez użytkownika
 * @returns Obiekt z wynikiem parsowania
 */
export function parseTimeInput(input: string): TimeParseResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { success: false, error: 'Time cannot be empty' };
  }
  
  // Check for MM:SS format
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    
    // Only accept MM:SS format (not HH:MM:SS)
    if (parts.length !== 2) {
      return { 
        success: false, 
        error: 'Invalid format. Use MM:SS or seconds (e.g., "1:14" or "74")' 
      };
    }
    
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds)) {
      return { 
        success: false, 
        error: 'Invalid format. Use MM:SS or seconds (e.g., "1:14" or "74")' 
      };
    }
    
    if (minutes < 0 || seconds < 0) {
      return { 
        success: false, 
        error: 'Time cannot be negative' 
      };
    }
    
    const totalSeconds = minutes * 60 + seconds;
    return { success: true, seconds: totalSeconds };
  }
  
  // Parse as seconds
  const seconds = parseFloat(trimmed);
  
  if (isNaN(seconds)) {
    return { 
      success: false, 
      error: 'Invalid format. Use MM:SS or seconds (e.g., "1:14" or "74")' 
    };
  }
  
  if (seconds < 0) {
    return { 
      success: false, 
      error: 'Time cannot be negative' 
    };
  }
  
  return { success: true, seconds };
}

/**
 * Formatuje sekundy do wyświetlenia.
 * 
 * - Jeśli >= 60 sekund: format MM:SS (np. "1:14")
 * - Jeśli < 60 sekund: format sekund (np. "45")
 * - Zaokrągla do najbliższej sekundy dla czytelności
 * 
 * @param seconds - Liczba sekund
 * @returns Sformatowany string
 */
export function formatTimeDisplay(seconds: number | undefined): string {
  if (seconds === undefined) {
    return '';
  }
  
  // Round to nearest second for display
  const rounded = Math.round(seconds);
  
  if (rounded < 60) {
    return rounded.toString();
  }
  
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  
  // Pad seconds with leading zero if needed
  const secsStr = secs < 10 ? `0${secs}` : secs.toString();
  
  return `${minutes}:${secsStr}`;
}

/**
 * Konwertuje sekundy na format MM:SS bez zaokrąglania.
 * Używane do edycji, gdzie chcemy zachować precyzję.
 * 
 * @param seconds - Liczba sekund
 * @returns String w formacie MM:SS lub sekundy
 */
export function formatTimeForEdit(seconds: number | undefined): string {
  if (seconds === undefined) {
    return '';
  }
  
  if (seconds < 60) {
    return seconds.toString();
  }
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  // Keep decimal precision for editing
  const secsStr = secs < 10 ? `0${secs}` : secs.toString();
  
  return `${minutes}:${secsStr}`;
}
