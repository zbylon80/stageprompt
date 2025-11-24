import { LyricLine } from '../types/models';

/**
 * Interpolates times for lines between anchor points.
 * Anchor points are lines with explicitly set times.
 * Lines between anchors get evenly distributed times.
 * 
 * Example:
 * Line 1: 8s (anchor)
 * Line 2: ? → calculated as 11s
 * Line 3: ? → calculated as 14s  
 * Line 4: ? → calculated as 17s
 * Line 5: ? → calculated as 20s
 * Line 6: ? → calculated as 23s
 * Line 7: 25s (anchor)
 * 
 * @param lines - Array of lyric lines
 * @param anchorIndices - Indices of lines that are anchor points (have explicit times)
 * @returns Array of lines with interpolated times
 */
export function interpolateAnchorTimes(
  lines: LyricLine[],
  anchorIndices: number[]
): LyricLine[] {
  if (lines.length === 0 || anchorIndices.length === 0) {
    return lines;
  }

  const result = [...lines];
  
  // Sort anchor indices
  const sortedAnchors = [...anchorIndices].sort((a, b) => a - b);
  
  // Interpolate between each pair of anchors
  for (let i = 0; i < sortedAnchors.length - 1; i++) {
    const startIdx = sortedAnchors[i];
    const endIdx = sortedAnchors[i + 1];
    
    const startTime = lines[startIdx].timeSeconds;
    const endTime = lines[endIdx].timeSeconds;
    
    // Skip if either time is undefined (shouldn't happen with findAnchorPoints, but be safe)
    if (startTime === undefined || endTime === undefined) continue;
    
    // Interpolate lines between these anchors
    const count = endIdx - startIdx + 1;
    for (let j = startIdx; j <= endIdx; j++) {
      const fraction = (j - startIdx) / (count - 1);
      const interpolatedTime = startTime + (endTime - startTime) * fraction;
      result[j] = {
        ...result[j],
        timeSeconds: interpolatedTime,
      };
    }
  }
  
  // Handle lines before first anchor
  if (sortedAnchors[0] > 0) {
    const firstAnchorTime = lines[sortedAnchors[0]].timeSeconds;
    if (firstAnchorTime !== undefined) {
      const timePerLine = firstAnchorTime / (sortedAnchors[0] + 1);
      for (let i = 0; i < sortedAnchors[0]; i++) {
        result[i] = {
          ...result[i],
          timeSeconds: timePerLine * (i + 1),
        };
      }
    }
  }
  
  // Don't modify lines after last anchor - leave them at 0
  // Users can set more anchors if needed
  
  return result;
}

/**
 * Finds all anchor points in the lines.
 * Anchor points are lines where the user has explicitly set a time that differs
 * from the automatic sequential timing (where line N would have time N+1).
 * 
 * This allows users to set a few key timestamps, and the rest will be interpolated.
 * 
 * @param lines - Array of lyric lines
 * @returns Array of indices that are anchor points (lines with non-sequential times)
 */
export function findAnchorPoints(lines: LyricLine[]): number[] {
  const anchors: number[] = [];
  
  // Find lines that have an explicitly set time (not undefined)
  for (let i = 0; i < lines.length; i++) {
    const time = lines[i].timeSeconds;
    
    // If time is set (not undefined) and greater than 0, it's an anchor
    if (time !== undefined && time > 0) {
      anchors.push(i);
    }
  }
  
  return anchors;
}
