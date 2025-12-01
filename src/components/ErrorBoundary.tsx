import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary component catches React errors in child components
 * and displays a fallback UI with the option to reset the app state.
 * 
 * This prevents the entire app from crashing when an error occurs
 * in a component tree.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console for debugging
    console.error('React error caught by ErrorBoundary:', error, errorInfo);
    
    // Store error details in state for display
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorScreenProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}

/**
 * ErrorScreen displays when an error is caught by ErrorBoundary.
 * Shows error details and provides a reset button.
 */
const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, errorInfo, onReset }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⚠️ Something went wrong</Text>
        
        <Text style={styles.message}>
          The application encountered an unexpected error. You can try to reset the app or restart it.
        </Text>

        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetButtonText}>Reset App</Text>
        </TouchableOpacity>

        {__DEV__ && error && (
          <ScrollView style={styles.errorDetails}>
            <Text style={styles.errorDetailsTitle}>Error Details (Development Only):</Text>
            
            <Text style={styles.errorName}>{error.name}</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            
            {error.stack && (
              <>
                <Text style={styles.stackTraceTitle}>Stack Trace:</Text>
                <Text style={styles.stackTrace}>{error.stack}</Text>
              </>
            )}
            
            {errorInfo && errorInfo.componentStack && (
              <>
                <Text style={styles.stackTraceTitle}>Component Stack:</Text>
                <Text style={styles.stackTrace}>{errorInfo.componentStack}</Text>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 600,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  resetButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorDetails: {
    width: '100%',
    maxHeight: 300,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9800',
    marginBottom: 12,
  },
  errorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
  stackTraceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a9eff',
    marginTop: 12,
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
