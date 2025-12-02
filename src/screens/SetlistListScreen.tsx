// screens/SetlistListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSetlists } from '../hooks/useSetlists';
import { useSongs } from '../hooks/useSongs';
import { RootStackParamList } from '../types/navigation';
import { Setlist } from '../types/models';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { getSampleData, isFirstRun } from '../utils/sampleData';
import { storageService } from '../services/storageService';
import { isWeb } from '../utils/platform';

type SetlistListScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface SetlistListScreenProps {
  navigation: SetlistListScreenNavigationProp;
}

export function SetlistListScreen({ navigation }: SetlistListScreenProps) {
  const { setlists, loading, error, reload } = useSetlists();
  const { songs, saveSong } = useSongs();
  const [showSampleDataDialog, setShowSampleDataDialog] = useState(false);
  const [loadingSampleData, setLoadingSampleData] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Check for first run and offer sample data
  useEffect(() => {
    const checkFirstRun = async () => {
      try {
        const firstRun = await isFirstRun(storageService.loadSongs.bind(storageService));
        if (firstRun) {
          setShowSampleDataDialog(true);
        }
      } catch (error) {
        console.error('Error checking first run:', error);
      }
    };

    checkFirstRun();
  }, []);

  // Reload setlists when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const handleSetlistPress = (setlist: Setlist) => {
    navigation.navigate('SetlistEditor', { setlistId: setlist.id });
  };

  const handleNewSetlist = () => {
    navigation.navigate('SetlistEditor', {});
  };

  const handleBrowseSongs = () => {
    navigation.navigate('SongList');
  };

  const handleLoadSampleData = async () => {
    setShowSampleDataDialog(false);
    setLoadingSampleData(true);

    try {
      const { songs: sampleSongs, setlist: sampleSetlist } = getSampleData();

      // Save all sample songs
      for (const song of sampleSongs) {
        await saveSong(song);
      }

      // Save sample setlist
      await storageService.saveSetlist(sampleSetlist);

      // Reload data
      await reload();

      setToastMessage('Sample data loaded successfully!');
      setToastType('success');
      setToastVisible(true);
    } catch (error) {
      console.error('Error loading sample data:', error);
      setToastMessage('Failed to load sample data');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoadingSampleData(false);
    }
  };

  const handleSkipSampleData = () => {
    setShowSampleDataDialog(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No setlists</Text>
      <Text style={styles.emptyText}>
        Tap the + button to create your first setlist
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Setlist }) => (
    <TouchableOpacity
      style={styles.setlistItem}
      onPress={() => handleSetlistPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.setlistInfo}>
        <Text style={styles.setlistName}>{item.name}</Text>
        <Text style={styles.setlistDetails}>
          {item.songIds.length} {item.songIds.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9b59b6" />
        <Text style={styles.loadingText}>Loading setlists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  // Render list content
  const renderList = () => {
    if (isWeb) {
      return (
        <ScrollView 
          style={styles.flatList} 
          contentContainerStyle={setlists.length === 0 ? styles.emptyListContent : styles.listContent}
          // @ts-ignore - web-only style
          dataSet={{ scrollable: 'true' }}
        >
          {setlists.length === 0 ? renderEmptyState() : setlists.map((item) => (
            <View key={item.id}>
              {renderItem({ item })}
            </View>
          ))}
        </ScrollView>
      );
    }
    
    return (
      <FlatList
        data={setlists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          setlists.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        // Performance optimizations
        removeClippedSubviews={!isWeb}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        // Approximate item height for better performance
        getItemLayout={(data, index) => ({
          length: 76, // Approximate height of setlist item
          offset: 76 * index,
          index,
        })}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderList()}
      {/* FIX: SafeAreaView prevents FAB buttons from colliding with Android navigation bar */}
      <SafeAreaView edges={['bottom']} style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewSetlist}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fabSongs}
          onPress={handleBrowseSongs}
          activeOpacity={0.8}
        >
          <Text style={styles.fabSongsText}>♪</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Sample data dialog */}
      <ConfirmDialog
        visible={showSampleDataDialog}
        title="Welcome to StagePrompt!"
        message="Would you like to load some sample songs to get started? This will help you understand how the app works."
        confirmText="Load Sample Data"
        cancelText="Start Empty"
        onConfirm={handleLoadSampleData}
        onCancel={handleSkipSampleData}
      />

      {/* Loading overlay for sample data */}
      {loadingSampleData && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#9b59b6" />
          <Text style={styles.loadingOverlayText}>Loading sample data...</Text>
        </View>
      )}

      {/* Toast for feedback */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    // @ts-ignore - web-only styles
    height: '100vh',
  },
  flatList: {
    flex: 1,
    // @ts-ignore - web-only styles
    maxHeight: 'calc(100vh - 80px)',
    // @ts-ignore - web-only styles
    overflowY: 'auto',
    // @ts-ignore - web-only styles
    overflowX: 'hidden',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#cccccc',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  setlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  setlistInfo: {
    flex: 1,
  },
  setlistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  setlistDetails: {
    fontSize: 14,
    color: '#999999',
  },
  chevron: {
    fontSize: 28,
    color: '#666666',
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 0,
    pointerEvents: 'box-none',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    paddingBottom: 10,
  },
  fabSongs: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a9eff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabSongsText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '400',
    lineHeight: 28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    marginBottom: 10,
  },
  fabText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 32,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
});
