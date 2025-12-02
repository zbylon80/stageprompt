/**
 * Drag and drop file handling for web
 * Enables users to drag JSON files directly into the app for import
 */

import { Platform } from 'react-native';

export interface DragDropOptions {
  onFileDrop: (fileContent: string, fileName: string) => void;
  onError?: (error: Error) => void;
  acceptedTypes?: string[]; // e.g., ['application/json', '.json']
  maxSizeBytes?: number;
}

/**
 * Setup drag and drop file handling on an element
 * @param element HTML element to attach drag and drop to
 * @param options Configuration options
 * @returns Cleanup function to remove listeners
 */
export function setupDragDrop(
  element: HTMLElement | null,
  options: DragDropOptions
): () => void {
  if (Platform.OS !== 'web' || !element) {
    return () => {}; // No-op on non-web platforms
  }
  
  const {
    onFileDrop,
    onError,
    acceptedTypes = ['application/json', '.json'],
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  } = options;
  
  // Prevent default drag behaviors
  const preventDefaults = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Highlight drop zone when dragging over
  const handleDragEnter = (e: DragEvent) => {
    preventDefaults(e);
    element.classList.add('drag-over');
  };
  
  const handleDragLeave = (e: DragEvent) => {
    preventDefaults(e);
    element.classList.remove('drag-over');
  };
  
  const handleDragOver = (e: DragEvent) => {
    preventDefaults(e);
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };
  
  // Handle file drop
  const handleDrop = async (e: DragEvent) => {
    preventDefaults(e);
    element.classList.remove('drag-over');
    
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Only handle first file
    
    try {
      // Validate file type
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.endsWith(type);
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        throw new Error(`Invalid file type. Expected: ${acceptedTypes.join(', ')}`);
      }
      
      // Validate file size
      if (file.size > maxSizeBytes) {
        throw new Error(`File too large. Maximum size: ${maxSizeBytes / 1024 / 1024}MB`);
      }
      
      // Read file content
      const content = await readFileAsText(file);
      onFileDrop(content, file.name);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('Drag and drop error:', error);
      }
    }
  };
  
  // Attach event listeners
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    element.addEventListener(eventName, preventDefaults, false);
  });
  
  element.addEventListener('dragenter', handleDragEnter as EventListener, false);
  element.addEventListener('dragleave', handleDragLeave as EventListener, false);
  element.addEventListener('dragover', handleDragOver as EventListener, false);
  element.addEventListener('drop', handleDrop as EventListener, false);
  
  // Return cleanup function
  return () => {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      element.removeEventListener(eventName, preventDefaults, false);
    });
    
    element.removeEventListener('dragenter', handleDragEnter as EventListener, false);
    element.removeEventListener('dragleave', handleDragLeave as EventListener, false);
    element.removeEventListener('dragover', handleDragOver as EventListener, false);
    element.removeEventListener('drop', handleDrop as EventListener, false);
    
    element.classList.remove('drag-over');
  };
}

/**
 * Read file as text
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Create a visual indicator for drag and drop zones
 * Returns CSS class names to add to your styles
 */
export const DRAG_DROP_STYLES = {
  dropZone: {
    border: '2px dashed #4a9eff',
    borderRadius: '8px',
    padding: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  dropZoneActive: {
    border: '2px solid #4a9eff',
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    transform: 'scale(1.02)',
  },
  dropZoneHover: {
    borderColor: '#6bb6ff',
    backgroundColor: 'rgba(74, 158, 255, 0.05)',
  },
};

/**
 * Hook-like function to setup drag and drop on component mount
 * Call this in useEffect
 */
export function useDragDropFile(
  elementRef: React.RefObject<any>,
  options: DragDropOptions
): void {
  if (Platform.OS !== 'web') return;
  
  const element = elementRef.current;
  if (!element) return;
  
  // Get the actual DOM element (handle React Native Web refs)
  const domElement = element._nativeTag 
    ? document.querySelector(`[data-tag="${element._nativeTag}"]`)
    : element;
  
  if (!domElement) return;
  
  return setupDragDrop(domElement as HTMLElement, options);
}
