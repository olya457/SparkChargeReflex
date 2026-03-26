import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './routeTypes';

import HomeHubScreen from '../screens/hub/HomeHubScreen';
import MemoryModeScreen from '../screens/memory/MemoryModeScreen';
import FruitModeScreen from '../screens/fruit/FruitModeScreen';
import FactsScreen from '../screens/info/FactsScreen';
import StatsScreen from '../screens/stats/StatsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const { width, height } = Dimensions.get('window');

const isVerySmall = height < 700;
const isSmall = height < 760;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const iconMap: Record<keyof MainTabParamList, any> = {
    HomeHub: require('../assets/icons/home.png'),
    MemoryMode: require('../assets/icons/memory.png'),
    FruitMode: require('../assets/icons/fruit.png'),
    Facts: require('../assets/icons/facts.png'),
    Stats: require('../assets/icons/stats.png'),
  };

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const routeName = route.name as keyof MainTabParamList;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(routeName);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
              activeOpacity={0.9}
              onPress={onPress}
            >
              <Image
                source={iconMap[routeName]}
                style={styles.tabIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeHub"
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeHub" component={HomeHubScreen} />
      <Tab.Screen name="MemoryMode" component={MemoryModeScreen} />
      <Tab.Screen name="FruitMode" component={FruitModeScreen} />
      <Tab.Screen name="Facts" component={FactsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: isVerySmall ? 40 : isSmall ? 44 : 46,
    alignItems: 'center',
  },

  bar: {
    width: isVerySmall ? width - 20 : isSmall ? width - 24 : width - 28,
    height: isVerySmall ? 60 : isSmall ? 66 : 72,
    borderRadius: isVerySmall ? 24 : 28,
    backgroundColor: 'rgba(24, 20, 88, 0.96)',
    borderWidth: 1,
    borderColor: '#7D95FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isVerySmall ? 6 : 8,
    paddingVertical: isVerySmall ? 6 : 8,
  },

  tabButton: {
    flex: 1,
    height: isVerySmall ? 44 : isSmall ? 50 : 56,
    borderRadius: isVerySmall ? 18 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: isVerySmall ? 2 : 3,
    backgroundColor: 'transparent',
  },

  tabButtonActive: {
    backgroundColor: '#FFD11D',
  },

  tabIcon: {
    width: isVerySmall ? 21 : isSmall ? 23 : 25,
    height: isVerySmall ? 21 : isSmall ? 23 : 25,
    tintColor: '#000000',
  },
});