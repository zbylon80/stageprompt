import { LyricLine } from '../types/models';

export interface ScrollCalculationParams {
  currentTime: number;
  lines: LyricLine[];
  lineHeight: number;
  anchorY: number;
}

/**
 * Calculates the scroll position (scrollY) for the teleprompter based on current time.
 * 
 * Algorithm:
 * - Before first line: Position first line at anchor point
 * - After last line: Position last line at anchor point
 * - Between lines: Linear interpolation between the two surrounding lines
 * 
 * @param params - Scroll calculation parameters
 * @returns The calculated scrollY position in pixels
 */
export function calculateScrollY(params: ScrollCalculationParams): number {
  const { currentTime, lines, lineHeight, anchorY } = params;
  
  // Handle empty lines
  if (!lines.length) {
    return 0;
  }
  
  // Helper function to calculate Y position for a line index
  const yLine = (index: number): number => index * lineHeight;
  
  // Before first line - position first line at anchor
  if (currentTime <= lines[0].timeSeconds) {
    return yLine(0) - anchorY;
  }
  
  // After last line - position last line at anchor
  const lastIndex = lines.length - 1;
  if (currentTime >= lines[lastIndex].timeSeconds) {
    return yLine(lastIndex) - anchorY;
  }
  
  // Between lines - find surrounding lines and interpolate
  let i = 0;
  while (i < lines.length - 1 && currentTime > lines[i + 1].timeSeconds) {
    i++;
  }
  
  // Linear interpolation between line i and line i+1
  const t0 = lines[i].timeSeconds;
  const t1 = lines[i + 1].timeSeconds;
  const y0 = yLine(i);
  const y1 = yLine(i + 1);
  
  // Calculate fraction of time between the two lines
  const fraction = (currentTime - t0) / (t1 - t0);
  
  // Interpolate Y position
  const y = y0 + (y1 - y0) * fraction;
  
  return y - anchorY;
}
