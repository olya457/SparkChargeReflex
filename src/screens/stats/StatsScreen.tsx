import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../app/routeTypes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Stats'>,
  NativeStackScreenProps<RootStackParamList>
>;

type StatsPayload = {
  bestScore?: number;
  bestPairs?: number;
  completedLevels?: number;
  wins?: number;
  totalCorrect?: number;
  currentLevel?: number;
  highestUnlockedLevel?: number;
  lastPlayedLevel?: number;
};

type ChartItem = {
  id: string;
  label: string;
  value: number;
  percent: number;
};

type AppSettings = {
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
};

const { height: SCREEN_H } = Dimensions.get('window');

const isExtraSmall = SCREEN_H < 640;
const isVerySmall = SCREEN_H < 700;

const s = (normal: number, small: number, extraSmall?: number): number => {
  if (isExtraSmall) return extraSmall ?? small;
  if (isVerySmall) return small;
  return normal;
};

const WORD_STATS_KEY = 'word_mode_stats_v1';
const MEMORY_STATS_KEY = 'memory_mode_stats_v2';
const FRUIT_STATS_KEY = 'fruit_mode_stats_v1';
const SETTINGS_KEY = 'app_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  vibrationEnabled: true,
  notificationsEnabled: true,
};

export default function StatsScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const [wordValue, setWordValue] = useState(0);
  const [memoryValue, setMemoryValue] = useState(0);
  const [fruitValue, setFruitValue] = useState(0);

  const [wordCurrentLevel, setWordCurrentLevel] = useState(1);
  const [wordUnlockedLevel, setWordUnlockedLevel] = useState(1);
  const [wordCompletedLevels, setWordCompletedLevels] = useState(0);
  const [wordBestScore, setWordBestScore] = useState(0);

  const [memoryCurrentLevel, setMemoryCurrentLevel] = useState(1);
  const [memoryUnlockedLevel, setMemoryUnlockedLevel] = useState(1);
  const [memoryCompletedLevels, setMemoryCompletedLevels] = useState(0);
  const [memoryBestScore, setMemoryBestScore] = useState(0);

  const [fruitCompletedLevels, setFruitCompletedLevels] = useState(0);
  const [fruitBestPairs, setFruitBestPairs] = useState(0);

  const [vibrationEnabled, setVibrationEnabled] = useState(DEFAULT_SETTINGS.vibrationEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    DEFAULT_SETTINGS.notificationsEnabled,
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const loadSettings = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);

      if (!raw) {
        setVibrationEnabled(DEFAULT_SETTINGS.vibrationEnabled);
        setNotificationsEnabled(DEFAULT_SETTINGS.notificationsEnabled);
        return;
      }

      const parsed: AppSettings = JSON.parse(raw);
      setVibrationEnabled(parsed.vibrationEnabled ?? DEFAULT_SETTINGS.vibrationEnabled);
      setNotificationsEnabled(parsed.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled);
    } catch {
      setVibrationEnabled(DEFAULT_SETTINGS.vibrationEnabled);
      setNotificationsEnabled(DEFAULT_SETTINGS.notificationsEnabled);
    }
  }, []);

  const saveSettings = useCallback(async (next: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      Alert.alert('Save error', 'Unable to save settings right now.');
    }
  }, []);

  const toggleVibration = useCallback(
    (value: boolean) => {
      setVibrationEnabled(value);

      if (value) {
        Vibration.vibrate(40);
      }

      void saveSettings({
        vibrationEnabled: value,
        notificationsEnabled,
      });
    },
    [notificationsEnabled, saveSettings],
  );

  const toggleNotifications = useCallback(
    (value: boolean) => {
      setNotificationsEnabled(value);

      if (vibrationEnabled) {
        Vibration.vibrate(40);
      }

      void saveSettings({
        vibrationEnabled,
        notificationsEnabled: value,
      });
    },
    [saveSettings, vibrationEnabled],
  );

  const loadStats = useCallback(async () => {
    try {
      const [wordRaw, memoryRaw, fruitRaw] = await Promise.all([
        AsyncStorage.getItem(WORD_STATS_KEY),
        AsyncStorage.getItem(MEMORY_STATS_KEY),
        AsyncStorage.getItem(FRUIT_STATS_KEY),
      ]);

      const wordParsed: StatsPayload = wordRaw ? JSON.parse(wordRaw) : {};
      const memoryParsed: StatsPayload = memoryRaw ? JSON.parse(memoryRaw) : {};
      const fruitParsed: StatsPayload = fruitRaw ? JSON.parse(fruitRaw) : {};

      const nextWordValue =
        typeof wordParsed.totalCorrect === 'number'
          ? wordParsed.totalCorrect
          : typeof wordParsed.bestScore === 'number'
            ? wordParsed.bestScore
            : 0;

      const nextMemoryValue =
        typeof memoryParsed.totalCorrect === 'number'
          ? memoryParsed.totalCorrect
          : typeof memoryParsed.bestScore === 'number'
            ? memoryParsed.bestScore
            : 0;

      const nextFruitValue =
        typeof fruitParsed.bestPairs === 'number'
          ? fruitParsed.bestPairs
          : typeof fruitParsed.completedLevels === 'number'
            ? fruitParsed.completedLevels
            : 0;

      setWordValue(nextWordValue);
      setMemoryValue(nextMemoryValue);
      setFruitValue(nextFruitValue);

      setWordCurrentLevel(wordParsed.currentLevel || 1);
      setWordUnlockedLevel(wordParsed.highestUnlockedLevel || 1);
      setWordCompletedLevels(wordParsed.completedLevels || 0);
      setWordBestScore(wordParsed.bestScore || 0);

      setMemoryCurrentLevel(memoryParsed.currentLevel || 1);
      setMemoryUnlockedLevel(memoryParsed.highestUnlockedLevel || 1);
      setMemoryCompletedLevels(memoryParsed.completedLevels || 0);
      setMemoryBestScore(memoryParsed.bestScore || 0);

      setFruitCompletedLevels(fruitParsed.completedLevels || 0);
      setFruitBestPairs(fruitParsed.bestPairs || 0);
    } catch {
      setWordValue(0);
      setMemoryValue(0);
      setFruitValue(0);

      setWordCurrentLevel(1);
      setWordUnlockedLevel(1);
      setWordCompletedLevels(0);
      setWordBestScore(0);

      setMemoryCurrentLevel(1);
      setMemoryUnlockedLevel(1);
      setMemoryCompletedLevels(0);
      setMemoryBestScore(0);

      setFruitCompletedLevels(0);
      setFruitBestPairs(0);
    }
  }, []);

  const handleInfo = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
      void loadSettings();
    }, [loadSettings, loadStats]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadSettings()]);
    setRefreshing(false);
  }, [loadSettings, loadStats]);

  const total = useMemo(() => {
    const sum = wordValue + memoryValue + fruitValue;
    return sum > 0 ? sum : 1;
  }, [fruitValue, memoryValue, wordValue]);

  const chartData = useMemo<ChartItem[]>(() => {
    const raw = [
      { id: 'word', label: 'Word', value: wordValue },
      { id: 'quick', label: 'Quick', value: memoryValue },
      { id: 'pattern', label: 'Pattern', value: fruitValue },
    ];

    return raw.map(item => ({
      ...item,
      percent: Math.round((item.value / total) * 100),
    }));
  }, [fruitValue, memoryValue, total, wordValue]);

  useEffect(() => {
    barsAnim.forEach(anim => anim.setValue(0));

    Animated.stagger(
      90,
      barsAnim.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [barsAnim, chartData]);

  const chartHeight = s(138, 120, 100);

  return (
    <ImageBackground
      source={require('../../assets/images/splash_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.headerRow,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85} onPress={handleInfo}>
            <Text style={styles.iconText}>?</Text>
          </TouchableOpacity>

          <View style={styles.titlePill}>
            <Text style={styles.titlePillText}>Stats Center</Text>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD520" />
          }
        >
          <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
            <View style={styles.topNumbersRow}>
              {chartData.map(item => (
                <View key={item.id} style={styles.topNumberCell}>
                  <Text style={styles.topNumberTitle}>{item.label}</Text>
                  <Text style={styles.topNumberValue}>{item.value}</Text>
                  <Text style={styles.topNumberPercent}>{item.percent}%</Text>
                </View>
              ))}
            </View>

            <View style={[styles.chartWrap, { height: chartHeight }]}>
              <View style={styles.chartBaseline} />

              {chartData.map((item, index) => {
                const targetHeight = Math.max(8, ((chartHeight - 26) * item.percent) / 100);
                const animatedHeight = barsAnim[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, targetHeight],
                });

                const barStyle =
                  index === 0
                    ? styles.barWord
                    : index === 1
                      ? styles.barMemory
                      : styles.barFruit;

                return (
                  <View key={item.id} style={styles.barItem}>
                    <Animated.View style={[styles.barFill, barStyle, { height: animatedHeight }]} />
                    <Text style={styles.barLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          <View style={styles.compactSection}>
            <Text style={styles.sectionTitle}>Word Spark</Text>
            <View style={styles.miniGrid}>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Current</Text>
                <Text style={styles.miniValue}>{wordCurrentLevel}</Text>
              </View>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Unlocked</Text>
                <Text style={styles.miniValue}>{wordUnlockedLevel}</Text>
              </View>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Completed</Text>
                <Text style={styles.miniValue}>{wordCompletedLevels}</Text>
              </View>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Best</Text>
                <Text style={styles.miniValue}>{wordBestScore}</Text>
              </View>
            </View>
          </View>

          <View style={styles.compactSection}>
            <Text style={styles.sectionTitle}>Quick Spark</Text>
            <View style={styles.miniGrid}>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Current</Text>
                <Text style={styles.miniValue}>{memoryCurrentLevel}</Text>
              </View>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Unlocked</Text>
                <Text style={styles.miniValue}>{memoryUnlockedLevel}/10</Text>
              </View>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Completed</Text>
                <Text style={styles.miniValue}>{memoryCompletedLevels}/10</Text>
              </View>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Best</Text>
                <Text style={styles.miniValue}>{memoryBestScore}</Text>
              </View>
            </View>
          </View>

          <View style={styles.compactSection}>
            <Text style={styles.sectionTitle}>Pattern Spark</Text>
            <View style={styles.miniGrid}>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Completed</Text>
                <Text style={styles.miniValue}>{fruitCompletedLevels}</Text>
              </View>
              <View style={styles.miniCell}>
                <Text style={styles.miniLabel}>Best pairs</Text>
                <Text style={styles.miniValue}>{fruitBestPairs}</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <View style={styles.settingIcon}>
                  <Text style={styles.settingIconText}>V</Text>
                </View>
                <View>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Text style={styles.settingHint}>{vibrationEnabled ? 'On' : 'Off'}</Text>
                </View>
              </View>

              <Switch
                value={vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#4CC9F0' }}
                thumbColor={vibrationEnabled ? '#FFD520' : '#999'}
                ios_backgroundColor="rgba(255,255,255,0.15)"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <View style={[styles.settingIcon, styles.settingIconNotif]}>
                  <Text style={styles.settingIconText}>N</Text>
                </View>
                <View>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Text style={styles.settingHint}>{notificationsEnabled ? 'On' : 'Off'}</Text>
                </View>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#4CC9F0' }}
                thumbColor={notificationsEnabled ? '#FFD520' : '#999'}
                ios_backgroundColor="rgba(255,255,255,0.15)"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const topInset = s(54, 46, 38);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: s(16, 12, 8),
  },
  headerRow: {
    marginTop: topInset + s(12, 10, 6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    position: 'absolute',
    left: 0,
    width: s(30, 28, 26),
    height: s(30, 28, 26),
    borderRadius: 6,
    backgroundColor: '#5B7BFF',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFD21E',
    fontSize: s(18, 16, 14),
    fontWeight: '800',
  },
  titlePill: {
    minWidth: s(144, 128, 110),
    height: s(36, 34, 30),
    paddingHorizontal: s(18, 14, 10),
    backgroundColor: '#D7B316',
    borderWidth: 1,
    borderColor: '#F8E46C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePillText: {
    color: '#2C1800',
    fontSize: s(15, 14, 12),
    fontWeight: '900',
  },
  scrollContent: {
    paddingTop: s(14, 10, 6),
    paddingBottom: s(126, 108, 90),
  },
  chartCard: {
    backgroundColor: 'rgba(77, 96, 255, 0.22)',
    borderWidth: 1,
    borderColor: '#8AA3FF',
    borderRadius: s(22, 18, 14),
    paddingHorizontal: s(14, 10, 8),
    paddingVertical: s(14, 12, 8),
  },
  topNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: s(8, 6, 4),
  },
  topNumberCell: {
    flex: 1,
    alignItems: 'center',
  },
  topNumberTitle: {
    color: '#FFFFFF',
    fontSize: s(12, 11, 10),
    fontWeight: '700',
  },
  topNumberValue: {
    marginTop: s(4, 3, 2),
    color: '#FFD520',
    fontSize: s(22, 20, 17),
    fontWeight: '900',
  },
  topNumberPercent: {
    marginTop: 2,
    color: '#D5DEFF',
    fontSize: s(11, 10, 9),
    fontWeight: '700',
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    position: 'relative',
    paddingBottom: 2,
  },
  chartBaseline: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: s(20, 18, 16),
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: s(40, 34, 28),
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  barWord: {
    backgroundColor: '#4CC9F0',
  },
  barMemory: {
    backgroundColor: '#FFD520',
  },
  barFruit: {
    backgroundColor: '#C77DFF',
  },
  barLabel: {
    marginTop: s(6, 4, 3),
    color: '#FFFFFF',
    fontSize: s(11, 10, 9),
    fontWeight: '700',
    textAlign: 'center',
  },
  compactSection: {
    marginTop: s(12, 10, 8),
    backgroundColor: 'rgba(77, 96, 255, 0.20)',
    borderWidth: 1,
    borderColor: '#8AA3FF',
    borderRadius: s(20, 18, 14),
    paddingHorizontal: s(14, 10, 8),
    paddingVertical: s(14, 12, 8),
  },
  sectionTitle: {
    color: '#FFD520',
    fontSize: s(17, 15, 13),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: s(10, 8, 6),
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  miniCell: {
    width: '48.5%',
    backgroundColor: 'rgba(47, 59, 180, 0.50)',
    borderWidth: 1,
    borderColor: '#8AA3FF',
    borderRadius: s(16, 14, 12),
    paddingVertical: s(12, 10, 7),
    paddingHorizontal: s(8, 6, 4),
    marginBottom: s(10, 8, 6),
    alignItems: 'center',
  },
  miniLabel: {
    color: '#FFFFFF',
    fontSize: s(11, 10, 9),
    fontWeight: '700',
    textAlign: 'center',
  },
  miniValue: {
    marginTop: s(6, 4, 3),
    color: '#FFD520',
    fontSize: s(20, 18, 15),
    fontWeight: '900',
    textAlign: 'center',
  },
  settingsSection: {
    marginTop: s(18, 14, 10),
    backgroundColor: 'rgba(77, 96, 255, 0.20)',
    borderWidth: 1,
    borderColor: '#8AA3FF',
    borderRadius: s(20, 18, 14),
    paddingHorizontal: s(14, 10, 8),
    paddingVertical: s(14, 12, 8),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(47, 59, 180, 0.50)',
    borderWidth: 1,
    borderColor: '#8AA3FF',
    borderRadius: s(16, 14, 12),
    paddingVertical: s(12, 10, 8),
    paddingHorizontal: s(14, 12, 10),
    marginBottom: s(8, 6, 5),
  },
  settingLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: s(32, 28, 24),
    height: s(32, 28, 24),
    borderRadius: s(10, 8, 7),
    backgroundColor: '#C77DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12, 10, 8),
  },
  settingIconNotif: {
    backgroundColor: '#4CC9F0',
  },
  settingIconText: {
    color: '#FFFFFF',
    fontSize: s(14, 12, 11),
    fontWeight: '900',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: s(15, 14, 12),
    fontWeight: '800',
  },
  settingHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: s(11, 10, 9),
    fontWeight: '600',
    marginTop: 1,
  },
});