import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './routeTypes';

import SplashScreen from '../screens/launch/SplashScreen';
import IntroScreen from '../screens/launch/IntroScreen';
import MainTabNavigator from './MainTabNavigator';

import WordModeScreen from '../screens/word/WordModeScreen';
import WordResultScreen from '../screens/word/WordResultScreen';
import FruitResultScreen from '../screens/fruit/FruitResultScreen';
import MemoryResultScreen from '../screens/memory/MemoryResultScreen';
import SettingsScreen from '../screens/info/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

        <Stack.Screen name="WordMode" component={WordModeScreen} />
        <Stack.Screen name="WordResult" component={WordResultScreen} />
        <Stack.Screen name="FruitResult" component={FruitResultScreen} />
        <Stack.Screen name="MemoryResult" component={MemoryResultScreen} />

        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}