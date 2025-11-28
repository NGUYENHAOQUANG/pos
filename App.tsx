/**
 * App Entry Point
 * @format
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProviders} from './src/app/providers';
import { LogBox } from 'react-native';

// Tắt *mọi* cảnh báo
LogBox.ignoreAllLogs();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppProviders />
    </SafeAreaProvider>
  );
}

export default App;
