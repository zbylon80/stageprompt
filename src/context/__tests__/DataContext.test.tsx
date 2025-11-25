// context/__tests__/DataContext.test.tsx

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { DataProvider, useData } from '../DataContext';

// Mock the hooks
jest.mock('../../hooks/useSongs', () => ({
  useSongs: jest.fn(() => ({
    songs: [],
    loading: false,
    error: null,
    saveSong: jest.fn(),
    deleteSong: jest.fn(),
    reload: jest.fn(),
  })),
}));

jest.mock('../../hooks/useSetlists', () => ({
  useSetlists: jest.fn(() => ({
    setlists: [],
    loading: false,
    error: null,
    saveSetlist: jest.fn(),
    deleteSetlist: jest.fn(),
    reload: jest.fn(),
  })),
}));

describe('DataContext', () => {
  it('should provide data context value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataProvider>{children}</DataProvider>
    );

    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.songs).toBeDefined();
    expect(result.current.setlists).toBeDefined();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useData());
    }).toThrow('useData must be used within a DataProvider');

    consoleSpy.mockRestore();
  });

  it('should provide songs data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataProvider>{children}</DataProvider>
    );

    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.songs.songs).toEqual([]);
    expect(result.current.songs.loading).toBe(false);
    expect(result.current.songs.error).toBe(null);
  });

  it('should provide setlists data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataProvider>{children}</DataProvider>
    );

    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.setlists.setlists).toEqual([]);
    expect(result.current.setlists.loading).toBe(false);
    expect(result.current.setlists.error).toBe(null);
  });
});
