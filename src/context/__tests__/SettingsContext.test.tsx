// context/__tests__/SettingsContext.test.tsx

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { SettingsProvider, useSettingsContext } from '../SettingsContext';

// Mock the hooks
jest.mock('../../hooks/useSettings', () => ({
  useSettings: jest.fn(() => ({
    settings: null,
    loading: false,
    error: null,
    saveSettings: jest.fn(),
    reload: jest.fn(),
  })),
}));

jest.mock('../../hooks/useKeyMapping', () => ({
  useKeyMapping: jest.fn(() => ({
    keyMapping: null,
    loading: false,
    error: null,
    saveKeyMapping: jest.fn(),
    reload: jest.fn(),
  })),
}));

describe('SettingsContext', () => {
  it('should provide settings context value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.settings).toBeDefined();
    expect(result.current.keyMapping).toBeDefined();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSettingsContext());
    }).toThrow('useSettingsContext must be used within a SettingsProvider');

    consoleSpy.mockRestore();
  });

  it('should provide settings data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.settings).toBe(null);
    expect(result.current.settings.loading).toBe(false);
    expect(result.current.settings.error).toBe(null);
  });

  it('should provide key mapping data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.keyMapping.keyMapping).toBe(null);
    expect(result.current.keyMapping.loading).toBe(false);
    expect(result.current.keyMapping.error).toBe(null);
  });
});
