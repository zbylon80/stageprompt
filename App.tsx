import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SongListScreen } from './src/screens/SongListScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

// Placeholder screens - to be implemented
function SongEditorScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Edytor Utworu - W budowie</Text>
    </View>
  );
}

function SetlistEditorScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Edytor Setlisty - W budowie</Text>
    </View>
  );
}

function PrompterScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Teleprompter - W budowie</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Ustawienia - W budowie</Text>
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
          name="SongList"
          component={SongListScreen}
          options={{ title: 'Moje Utwory' }}
        />
        <Stack.Screen
          name="SongEditor"
          component={SongEditorScreen}
          options={{ title: 'Edycja Utworu' }}
        />
        <Stack.Screen
          name="SetlistEditor"
          component={SetlistEditorScreen}
          options={{ title: 'Edycja Setlisty' }}
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
          options={{ title: 'Ustawienia' }}
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
