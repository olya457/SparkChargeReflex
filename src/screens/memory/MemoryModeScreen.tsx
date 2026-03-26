import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../app/routeTypes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'MemoryMode'>,
  NativeStackScreenProps<RootStackParamList>
>;

type SpawnKind = 'cherry' | 'watermelon' | 'plum' | 'lemon' | 'grapes' | 'lightning';

type SpawnItem = {
  id: string;
  kind: SpawnKind;
  x: number;
  y: number;
  size: number;
};

type LevelConfig = {
  level: number;
  duration: number;
  spawnInterval: number;
  itemLifetime: number;
  targetScore: number;
  lightningChance: number;
};

type MemoryModeStats = {
  bestScore: number;
  currentLevel: number;
  highestUnlockedLevel: number;
  completedLevels: number;
  wins: number;
  totalCorrect: number;
  lastPlayedLevel: number;
};

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

const TOP_AREA = isVerySmall ? 140 : 150;
const BOTTOM_SAFE_AREA = isVerySmall ? 130 : 145;

const GAME_TOP = TOP_AREA;
const GAME_BOTTOM = height - BOTTOM_SAFE_AREA;
const GAME_HEIGHT = Math.max(280, GAME_BOTTOM - GAME_TOP);

const FRUIT_KINDS: SpawnKind[] = ['cherry', 'watermelon', 'plum', 'lemon', 'grapes'];
const EXTRA_SPAWN_PADDING_X = 20;

const MEMORY_STATS_KEY = 'memory_mode_stats_v2';

const LEVELS: LevelConfig[] = [
  { level: 1, duration: 60, spawnInterval: 700, itemLifetime: 1000, targetScore: 20, lightningChance: 0.18 },
  { level: 2, duration: 58, spawnInterval: 660, itemLifetime: 940, targetScore: 30, lightningChance: 0.17 },
  { level: 3, duration: 56, spawnInterval: 620, itemLifetime: 900, targetScore: 40, lightningChance: 0.16 },
  { level: 4, duration: 54, spawnInterval: 580, itemLifetime: 860, targetScore: 50, lightningChance: 0.15 },
  { level: 5, duration: 52, spawnInterval: 540, itemLifetime: 820, targetScore: 60, lightningChance: 0.14 },
  { level: 6, duration: 50, spawnInterval: 500, itemLifetime: 780, targetScore: 70, lightningChance: 0.13 },
  { level: 7, duration: 48, spawnInterval: 470, itemLifetime: 740, targetScore: 80, lightningChance: 0.12 },
  { level: 8, duration: 46, spawnInterval: 440, itemLifetime: 700, targetScore: 90, lightningChance: 0.11 },
  { level: 9, duration: 44, spawnInterval: 410, itemLifetime: 660, targetScore: 100, lightningChance: 0.1 },
  { level: 10, duration: 42, spawnInterval: 380, itemLifetime: 620, targetScore: 110, lightningChance: 0.09 },
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getDefaultStats(): MemoryModeStats {
  return {
    bestScore: 0,
    currentLevel: 1,
    highestUnlockedLevel: 1,
    completedLevels: 0,
    wins: 0,
    totalCorrect: 0,
    lastPlayedLevel: 1,
  };
}

function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(item => item.level === level) ?? LEVELS[0];
}

function randomItemKind(lightningChance: number): SpawnKind {
  const roll = Math.random();
  if (roll < lightningChance) {
    return 'lightning';
  }

  return FRUIT_KINDS[Math.floor(Math.random() * FRUIT_KINDS.length)];
}

function getAsset(kind: SpawnKind) {
  switch (kind) {
    case 'cherry':
      return require('../../assets/images/quick_cherry.png');
    case 'watermelon':
      return require('../../assets/images/quick_watermelon.png');
    case 'plum':
      return require('../../assets/images/quick_plum.png');
    case 'lemon':
      return require('../../assets/images/quick_lemon.png');
    case 'grapes':
      return require('../../assets/images/quick_grapes.png');
    case 'lightning':
      return require('../../assets/images/quick_lightning.png');
  }
}

export default function MemoryModeScreen({ navigation }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [amount, setAmount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [items, setItems] = useState<SpawnItem[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);

  const playingRef = useRef(false);
  const pausedRef = useRef(false);
  const currentLevelRef = useRef(1);
  const finishingRef = useRef(false);

  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const headerAnim = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const orbFloatAnim = useRef(new Animated.Value(0)).current;

  const levelConfig = useMemo(() => getLevelConfig(currentLevel), [currentLevel]);

  const loadProgress = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(MEMORY_STATS_KEY);
      const parsed: MemoryModeStats = raw ? JSON.parse(raw) : getDefaultStats();

      const safeLevel = Math.min(10, Math.max(1, parsed.currentLevel || 1));
      const safeUnlocked = Math.min(10, Math.max(1, parsed.highestUnlockedLevel || safeLevel));

      setCurrentLevel(safeLevel);
      setHighestUnlockedLevel(safeUnlocked);
      currentLevelRef.current = safeLevel;
    } catch {
      const fallback = getDefaultStats();
      setCurrentLevel(fallback.currentLevel);
      setHighestUnlockedLevel(fallback.highestUnlockedLevel);
      currentLevelRef.current = fallback.currentLevel;
    }
  }, []);

  const saveProgress = useCallback(
    async (updater: (prev: MemoryModeStats) => MemoryModeStats) => {
      try {
        const raw = await AsyncStorage.getItem(MEMORY_STATS_KEY);
        const prev: MemoryModeStats = raw ? JSON.parse(raw) : getDefaultStats();
        const next = updater(prev);

        await AsyncStorage.setItem(MEMORY_STATS_KEY, JSON.stringify(next));

        setCurrentLevel(next.currentLevel);
        setHighestUnlockedLevel(next.highestUnlockedLevel);
        currentLevelRef.current = next.currentLevel;
      } catch {}
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      setIsPlaying(false);
      setIsPaused(false);
      setAmount(0);
      setSecondsLeft(0);
      setItems([]);
      playingRef.current = false;
      pausedRef.current = false;
      finishingRef.current = false;
      void loadProgress();
    }, [loadProgress]),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(orbAnim, {
        toValue: 1,
        duration: 650,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 520,
        delay: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbFloatAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbFloatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [buttonAnim, headerAnim, orbAnim, orbFloatAnim]);

  const clearExpiryTimers = useCallback(() => {
    Object.values(expiryTimersRef.current).forEach(timer => clearTimeout(timer));
    expiryTimersRef.current = {};
  }, []);

  const clearGameLoops = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }

    if (secondIntervalRef.current) {
      clearInterval(secondIntervalRef.current);
      secondIntervalRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearGameLoops();
    clearExpiryTimers();
  }, [clearExpiryTimers, clearGameLoops]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));

    const timer = expiryTimersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete expiryTimersRef.current[id];
    }
  }, []);

  const spawnItem = useCallback(() => {
    if (!playingRef.current || pausedRef.current) {
      return;
    }

    const activeLevel = getLevelConfig(currentLevelRef.current);
    const kind = randomItemKind(activeLevel.lightningChance);

    const size =
      kind === 'lightning'
        ? isVerySmall
          ? 40
          : 48
        : randomBetween(isVerySmall ? 50 : 56, isVerySmall ? 70 : 84);

    const maxX = width - size - EXTRA_SPAWN_PADDING_X;
    const maxY = GAME_TOP + GAME_HEIGHT - size;

    const newItem: SpawnItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      x: randomBetween(EXTRA_SPAWN_PADDING_X, Math.max(EXTRA_SPAWN_PADDING_X, maxX)),
      y: randomBetween(GAME_TOP, Math.max(GAME_TOP, maxY)),
      size,
    };

    setItems(prev => [...prev, newItem]);

    const timer = setTimeout(() => {
      setItems(current => current.filter(item => item.id !== newItem.id));
      delete expiryTimersRef.current[newItem.id];
    }, activeLevel.itemLifetime);

    expiryTimersRef.current[newItem.id] = timer;
  }, []);

  const startLoops = useCallback(() => {
    clearGameLoops();

    const activeLevel = getLevelConfig(currentLevelRef.current);

    secondIntervalRef.current = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    spawnIntervalRef.current = setInterval(() => {
      spawnItem();
    }, activeLevel.spawnInterval);
  }, [clearGameLoops, spawnItem]);

  const startGameplay = useCallback(() => {
    const activeLevel = getLevelConfig(currentLevel);

    clearAllTimers();
    setItems([]);
    setAmount(0);
    setSecondsLeft(activeLevel.duration);

    playingRef.current = true;
    pausedRef.current = false;
    finishingRef.current = false;
    currentLevelRef.current = currentLevel;

    setIsPlaying(true);
    setIsPaused(false);

    void saveProgress(prev => ({
      ...prev,
      currentLevel,
      highestUnlockedLevel: Math.max(prev.highestUnlockedLevel || 1, currentLevel),
      lastPlayedLevel: currentLevel,
    }));

    startLoops();
    spawnItem();
  }, [clearAllTimers, currentLevel, saveProgress, spawnItem, startLoops]);

  const exitToStartScreen = useCallback(() => {
    clearAllTimers();
    setItems([]);
    setAmount(0);
    setSecondsLeft(0);
    setIsPlaying(false);
    setIsPaused(false);
    playingRef.current = false;
    pausedRef.current = false;
    finishingRef.current = false;
  }, [clearAllTimers]);

  const handleExit = useCallback(() => {
    Alert.alert('Exit game', 'Do you want to leave this level?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: exitToStartScreen,
      },
    ]);
  }, [exitToStartScreen]);

  const finishLevel = useCallback(
    async (finalScore: number) => {
      if (finishingRef.current) {
        return;
      }

      finishingRef.current = true;
      playingRef.current = false;
      pausedRef.current = false;

      clearAllTimers();
      setItems([]);

      const activeLevel = getLevelConfig(currentLevelRef.current);
      const passed = finalScore >= activeLevel.targetScore;
      const nextLevel = Math.min(10, activeLevel.level + 1);
      const hasNextLevel = activeLevel.level < 10;

      await saveProgress(prev => {
        const previousCompleted = prev.completedLevels || 0;
        const previousUnlocked = prev.highestUnlockedLevel || 1;
        const wasAlreadyCompleted = activeLevel.level <= previousCompleted;

        const nextCompleted = passed
          ? Math.max(previousCompleted, activeLevel.level)
          : previousCompleted;

        const nextUnlocked = passed && hasNextLevel
          ? Math.max(previousUnlocked, nextLevel)
          : previousUnlocked;

        const nextCurrentLevel = passed
          ? hasNextLevel
            ? nextLevel
            : 10
          : activeLevel.level;

        return {
          bestScore: Math.max(prev.bestScore || 0, finalScore),
          currentLevel: nextCurrentLevel,
          highestUnlockedLevel: nextUnlocked,
          completedLevels: nextCompleted,
          wins: passed && !wasAlreadyCompleted ? (prev.wins || 0) + 1 : prev.wins || 0,
          totalCorrect: (prev.totalCorrect || 0) + finalScore,
          lastPlayedLevel: activeLevel.level,
        };
      });

      navigation.navigate('MemoryResult', {
        score: finalScore,
        level: activeLevel.level,
        targetScore: activeLevel.targetScore,
        passed,
        nextLevel: hasNextLevel ? nextLevel : 10,
        hasNextLevel,
      });
    },
    [clearAllTimers, navigation, saveProgress],
  );

  useEffect(() => {
    if (!isPlaying || isPaused) {
      return;
    }

    if (secondsLeft <= 0) {
      void finishLevel(amount);
    }
  }, [amount, finishLevel, isPaused, isPlaying, secondsLeft]);

  const handleTapItem = useCallback(
    (item: SpawnItem) => {
      if (!playingRef.current || pausedRef.current) {
        return;
      }

      if (item.kind === 'lightning') {
        setSecondsLeft(prev => prev + 5);
      } else {
        setAmount(prev => prev + 1);
      }

      removeItem(item.id);
    },
    [removeItem],
  );

  const handlePauseToggle = () => {
    if (!playingRef.current) {
      return;
    }

    if (pausedRef.current) {
      pausedRef.current = false;
      setIsPaused(false);
      startLoops();
      return;
    }

    pausedRef.current = true;
    setIsPaused(true);
    clearGameLoops();
  };

  const handleInfo = () => {
    navigation.navigate('Settings');
  };

  const progressText = `Level ${currentLevel}/10`;
  const targetText = `Catch ${levelConfig.targetScore} fruits`;

  return (
    <ImageBackground
      source={require('../../assets/images/splash_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        {!isPlaying ? (
          <>
            <Animated.View
              style={[
                styles.topRow,
                {
                  opacity: headerAnim,
                  transform: [
                    {
                      translateY: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
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
                <Text style={styles.titlePillText}>Quick Spark</Text>
              </View>
            </Animated.View>

            <View style={styles.leftMiniWrap}>
              <View style={styles.leftMiniOrbBox}>
                <Image
                  source={require('../../assets/images/icon_energy_box.png')}
                  style={styles.leftMiniOrb}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.leftMiniLabel}>
                <Text style={styles.leftMiniLabelText}>Energy Bar</Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.centerWrap,
                {
                  opacity: orbAnim,
                  transform: [
                    {
                      translateY: orbAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    {
                      translateY: orbFloatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                    {
                      scale: orbAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../assets/images/word_orb.png')}
                style={styles.orbImage}
                resizeMode="contain"
              />

              <View style={styles.levelCard}>
                <Text style={styles.levelCardTitle}>{progressText}</Text>
                <Text style={styles.levelCardSub}>{targetText}</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.bottomActionWrap,
                {
                  opacity: buttonAnim,
                  transform: [
                    {
                      translateY: buttonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity style={styles.startButton} activeOpacity={0.9} onPress={startGameplay}>
                <Text style={styles.startButtonText}>Start Level {currentLevel}</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          <>
            <View style={styles.gameHeader}>
              <TouchableOpacity style={styles.smallHeaderButton} activeOpacity={0.88} onPress={handlePauseToggle}>
                <Text style={styles.smallHeaderButtonText}>{isPaused ? '▶' : '❚❚'}</Text>
              </TouchableOpacity>

              <View style={styles.amountPill}>
                <Text style={styles.amountText}>Level {currentLevel} • {amount}/{levelConfig.targetScore}</Text>
              </View>

              <View style={styles.timerPill}>
                <Text style={styles.timerPillText}>{secondsLeft}</Text>
              </View>
            </View>

            <View style={styles.targetTopRow}>
              <View style={styles.topInfoChip}>
                <Text style={styles.topInfoChipText}>Need {levelConfig.targetScore}</Text>
              </View>
            </View>

            <View style={styles.playArea}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  style={[
                    styles.floatingItem,
                    {
                      left: item.x,
                      top: item.y,
                      width: item.size,
                      height: item.size,
                    },
                  ]}
                  onPress={() => handleTapItem(item)}
                >
                  <Image source={getAsset(item.kind)} style={styles.floatingImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}

              {isPaused && (
                <View style={styles.pauseOverlay}>
                  <View style={styles.pauseCard}>
                    <Text style={styles.pauseTitle}>Paused</Text>

                    <TouchableOpacity style={styles.pauseResumeButton} onPress={handlePauseToggle}>
                      <Text style={styles.pauseResumeText}>Resume</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.pauseExitButton} onPress={handleExit}>
                      <Text style={styles.pauseExitText}>Exit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const topInset = isVerySmall ? 46 : 54;
const orbSize = isVerySmall ? width * 0.56 : isSmall ? width * 0.58 : width * 0.62;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: isVerySmall ? 14 : 18,
  },
  topRow: {
    marginTop: topInset + 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    position: 'absolute',
    left: 0,
    width: isVerySmall ? 30 : 32,
    height: isVerySmall ? 30 : 32,
    borderRadius: 4,
    backgroundColor: '#5B7BFF',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFD21E',
    fontSize: isVerySmall ? 18 : 19,
    fontWeight: '800',
  },
  titlePill: {
    minWidth: isVerySmall ? 122 : 136,
    height: isVerySmall ? 34 : 38,
    paddingHorizontal: 20,
    backgroundColor: '#D7B316',
    borderWidth: 1,
    borderColor: '#F8E46C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePillText: {
    color: '#2C1800',
    fontSize: isVerySmall ? 15 : 17,
    fontWeight: '900',
  },
  leftMiniWrap: {
    position: 'absolute',
    top: isVerySmall ? 138 : 148,
    left: isVerySmall ? 14 : 18,
    alignItems: 'center',
  },
  leftMiniOrbBox: {
    width: isVerySmall ? 46 : 50,
    height: isVerySmall ? 30 : 32,
    borderRadius: 16,
    backgroundColor: '#5B7BFF',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftMiniOrb: {
    width: isVerySmall ? 27 : 29,
    height: isVerySmall ? 27 : 29,
  },
  leftMiniLabel: {
    marginTop: 4,
    minWidth: isVerySmall ? 48 : 54,
    height: 16,
    backgroundColor: '#D7B316',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  leftMiniLabelText: {
    color: '#2C1800',
    fontSize: 7,
    fontWeight: '800',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isVerySmall ? 22 : 30,
  },
  orbImage: {
    width: orbSize,
    height: orbSize,
  },
  levelCard: {
    marginTop: 18,
    minWidth: isVerySmall ? 210 : 240,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(44, 63, 214, 0.86)',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
  },
  levelCardTitle: {
    color: '#FFD520',
    fontSize: isVerySmall ? 18 : 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  levelCardSub: {
    color: '#FFFFFF',
    fontSize: isVerySmall ? 12 : 13,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomActionWrap: {
    alignItems: 'center',
    paddingBottom: isVerySmall ? 138 : isSmall ? 188 : 196,
  },
  startButton: {
    minWidth: isVerySmall ? 156 : 172,
    height: isVerySmall ? 38 : 42,
    borderRadius: 21,
    backgroundColor: '#FFC91A',
    borderWidth: 2,
    borderColor: '#FF8F1C',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 12 : 13,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  gameHeader: {
    marginTop: topInset + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallHeaderButton: {
    width: isVerySmall ? 36 : 40,
    height: isVerySmall ? 36 : 40,
    borderRadius: 18,
    backgroundColor: '#4F67FF',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallHeaderButtonText: {
    color: '#FFD520',
    fontSize: isVerySmall ? 15 : 17,
    fontWeight: '900',
  },
  amountPill: {
    flex: 1,
    marginHorizontal: 10,
    height: isVerySmall ? 38 : 42,
    borderRadius: 20,
    backgroundColor: '#3248D9',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  amountText: {
    color: '#FFD520',
    fontSize: isVerySmall ? 13 : 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  timerPill: {
    minWidth: isVerySmall ? 54 : 58,
    height: isVerySmall ? 38 : 42,
    borderRadius: 20,
    backgroundColor: '#3248D9',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPillText: {
    color: '#FFD520',
    fontSize: isVerySmall ? 18 : 20,
    fontWeight: '900',
  },
  targetTopRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  topInfoChip: {
    minWidth: 92,
    paddingHorizontal: 14,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(51, 74, 217, 0.9)',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topInfoChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  floatingItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingImage: {
    width: '100%',
    height: '100%',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 7, 79, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseCard: {
    width: isVerySmall ? 190 : 220,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(53, 78, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#9DB4FF',
    alignItems: 'center',
    borderRadius: 16,
  },
  pauseTitle: {
    color: '#FFD520',
    fontSize: isVerySmall ? 20 : 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  pauseResumeButton: {
    minWidth: 120,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#FFC91A',
    borderWidth: 1,
    borderColor: '#FF8F1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pauseResumeText: {
    color: '#5A2300',
    fontSize: 13,
    fontWeight: '800',
  },
  pauseExitButton: {
    marginTop: 10,
    minWidth: 120,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#F25B5B',
    borderWidth: 1,
    borderColor: '#FF9F9F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pauseExitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});