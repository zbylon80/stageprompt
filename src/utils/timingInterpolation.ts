import { LyricLine, SongSection } from '../types/models';

/**
 * Calculates interpolated times for lines within sections.
 * If a section has startTime and endTime, lines within that section
 * are evenly distributed between those times.
 * 
 * @param lines - Array of lyric lines
 * @returns Array of lyric lines with calculated timeSeconds
 */
export function calculateLineTimes(lines: LyricLine[]): LyricLine[] {
  const result: LyricLine[] = [];
  let currentSectionLines: LyricLine[] = [];
  let currentSection: SongSection | undefined;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is the start of a new section
    const isNewSection = line.section && (
      !currentSection ||
      line.section.type !== currentSection.type ||
      line.section.number !== currentSection.number ||
      line.section.label !== currentSection.label
    );
    
    // Process previous section if we're starting a new one
    if (isNewSection && currentSectionLines.length > 0) {
      result.push(...interpolateSectionTimes(currentSectionLines, currentSection));
      currentSectionLines = [];
    }
    
    // Update current section
    if (line.section) {
      currentSection = line.section;
    }
    
    currentSectionLines.push(line);
  }
  
  // Process last section
  if (currentSectionLines.length > 0) {
    result.push(...interpolateSectionTimes(currentSectionLines, currentSection));
  }
  
  return result;
}

/**
 * Interpolates times for lines within a single section.
 * 
 * @param lines - Lines within the section
 * @param section - Section information with optional startTime and endTime
 * @returns Lines with interpolated timeSeconds
 */
function interpolateSectionTimes(
  lines: LyricLine[],
  section: SongSection | undefined
): LyricLine[] {
  // If no section or no timing info, return as-is
  if (!section || section.startTime === undefined || section.endTime === undefined) {
    return lines;
  }
  
  const { startTime, endTime } = section;
  const count = lines.length;
  
  if (count === 0) return lines;
  
  // Single line - use startTime
  if (count === 1) {
    return [{
      ...lines[0],
      timeSeconds: startTime,
    }];
  }
  
  // Multiple lines - interpolate evenly across the section
  return lines.map((line, index) => {
    const fraction = index / (count - 1);
    const interpolatedTime = startTime + (endTime - startTime) * fraction;
    
    return {
      ...line,
      timeSeconds: interpolatedTime,
    };
  });
}

/**
 * Checks if a line is the first line of its section.
 * 
 * @param line - Current line
 * @param index - Index of the line in the song
 * @param allLines - All lines in the song
 * @returns True if this is the first line of a section
 */
export function isFirstLineOfSection(
  line: LyricLine,
  index: number,
  allLines: LyricLine[]
): boolean {
  if (!line.section) return false;
  if (index === 0) return true;
  
  const previousLine = allLines[index - 1];
  if (!previousLine || !previousLine.section) return true;
  
  // Check if section changed
  return (
    previousLine.section.type !== line.section.type ||
    previousLine.section.label !== line.section.label ||
    previousLine.section.number !== line.section.number
  );
}
