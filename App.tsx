import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SongListScreen } from './src/screens/SongListScreen';
import { SongEditorScreen } from './src/screens/SongEditorScreen';
import { SetlistListScreen } from './src/screens/SetlistListScreen';
import { SetlistEditorScreen } from './src/screens/SetlistEditorScreen';
import { RootStackParamList } from './src/types/navigation';

// Import CSS for web scrollbar styling
if (Platform.OS === 'web') {
  require('./web-styles.css');
}

const Stack = createStackNavigator<RootStackParamList>();

// Placeholder screens - to be implemented

function PrompterScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Teleprompter - Under Construction</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Settings - Under Construction</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="SetlistList"
          component={SetlistListScreen}
          options={{ title: 'My Setlists' }}
        />
        <Stack.Screen
          name="SetlistEditor"
          component={SetlistEditorScreen}
          options={{ title: 'Edit Setlist' }}
        />
        <Stack.Screen
          name="SongList"
          component={SongListScreen}
          options={{ title: 'All Songs' }}
        />
        <Stack.Screen
          name="SongEditor"
          component={SongEditorScreen}
          options={{ title: 'Edit Song' }}
        />
        <Stack.Screen
          name="Prompter"
          component={PrompterScreen}
          options={{ 
            title: 'Teleprompter',
            headerShown: false // Full screen for prompter
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#ffffff',
  },
});
