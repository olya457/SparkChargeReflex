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
  BottomTabScreenProps<MainTabParamList, 'FruitMode'>,
  NativeStackScreenProps<RootStackParamList>
>;

type FruitKind = 'cherry' | 'watermelon' | 'plum' | 'lemon' | 'grapes';

type Tile = {
  id: string;
  kind: FruitKind;
  isRevealed: boolean;
  isMatched: boolean;
};

type FruitLevelConfig = {
  level: number;
  rows: number;
  cols: number;
  pairs: number;
  timeLimit: number;
};

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

const FRUIT_PROGRESS_KEY = 'fruit_mode_progress_v1';
const FRUIT_STATS_KEY = 'fruit_mode_stats_v1';

const FRUIT_KINDS: FruitKind[] = ['cherry', 'watermelon', 'plum', 'lemon', 'grapes'];

const FRUIT_LEVELS: FruitLevelConfig[] = [
  { level: 1, rows: 3, cols: 4, pairs: 6, timeLimit: 30 },
  { level: 2, rows: 3, cols: 6, pairs: 9, timeLimit: 32 },
  { level: 3, rows: 4, cols: 4, pairs: 8, timeLimit: 28 },
  { level: 4, rows: 4, cols: 5, pairs: 10, timeLimit: 30 },
  { level: 5, rows: 4, cols: 6, pairs: 12, timeLimit: 34 },
  { level: 6, rows: 5, cols: 6, pairs: 15, timeLimit: 38 },
];

function shuffleArray<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPairKinds(pairCount: number): FruitKind[] {
  const result: FruitKind[] = [];
  let index = 0;

  while (result.length < pairCount) {
    result.push(FRUIT_KINDS[index % FRUIT_KINDS.length]);
    index += 1;
  }

  return shuffleArray(result);
}

function buildTiles(config: FruitLevelConfig): Tile[] {
  const pairKinds = buildPairKinds(config.pairs);
  const flatKinds = [...pairKinds, ...pairKinds];

  return shuffleArray(flatKinds).map((kind, index) => ({
    id: `${kind}-${config.level}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    isRevealed: false,
    isMatched: false,
  }));
}

function getFruitAsset(kind: FruitKind) {
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
  }
}

type SavedFruitProgress = {
  currentLevelIndex: number;
};

type FruitStatsPayload = {
  bestPairs: number;
  completedLevels: number;
};

export default function FruitModeScreen({ navigation }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [openedIds, setOpenedIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);

  const comparingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const orbFloatAnim = useRef(new Animated.Value(0)).current;

  const levelConfig = useMemo(
    () => FRUIT_LEVELS[currentLevelIndex] ?? FRUIT_LEVELS[0],
    [currentLevelIndex],
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

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetToStartScreen = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setSecondsLeft(0);
    setTiles([]);
    setOpenedIds([]);
    setMatchedPairs(0);
    comparingRef.current = false;
  }, [clearTimer]);

  const saveProgress = useCallback(async (nextLevelIndex: number) => {
    try {
      const safeIndex =
        nextLevelIndex < 0
          ? 0
          : nextLevelIndex > FRUIT_LEVELS.length - 1
          ? FRUIT_LEVELS.length - 1
          : nextLevelIndex;

      const payload: SavedFruitProgress = {
        currentLevelIndex: safeIndex,
      };

      await AsyncStorage.setItem(FRUIT_PROGRESS_KEY, JSON.stringify(payload));
    } catch {}
  }, []);

  const saveStats = useCallback(async (score: number, completed: boolean) => {
    try {
      const raw = await AsyncStorage.getItem(FRUIT_STATS_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<FruitStatsPayload>) : {};

      const nextPayload: FruitStatsPayload = {
        bestPairs:
          typeof parsed.bestPairs === 'number'
            ? Math.max(parsed.bestPairs, score)
            : score,
        completedLevels:
          typeof parsed.completedLevels === 'number'
            ? Math.max(parsed.completedLevels, completed ? currentLevelIndex + 1 : 0)
            : completed
            ? currentLevelIndex + 1
            : 0,
      };

      await AsyncStorage.setItem(FRUIT_STATS_KEY, JSON.stringify(nextPayload));
    } catch {}
  }, [currentLevelIndex]);

  const loadProgress = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(FRUIT_PROGRESS_KEY);

      if (!raw) {
        setCurrentLevelIndex(0);
        setIsLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<SavedFruitProgress>;
      const safeIndex =
        typeof parsed.currentLevelIndex === 'number' &&
        parsed.currentLevelIndex >= 0 &&
        parsed.currentLevelIndex < FRUIT_LEVELS.length
          ? parsed.currentLevelIndex
          : 0;

      setCurrentLevelIndex(safeIndex);
      setIsLoaded(true);
    } catch {
      setCurrentLevelIndex(0);
      setIsLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetToStartScreen();
      void loadProgress();
    }, [loadProgress, resetToStartScreen]),
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const totalTiles = levelConfig.rows * levelConfig.cols;

  const matchedCount = useMemo(
    () => tiles.filter(item => item.isMatched).length,
    [tiles],
  );

  const startGame = useCallback(() => {
    clearTimer();
    setTiles(buildTiles(levelConfig));
    setOpenedIds([]);
    setMatchedPairs(0);
    setSecondsLeft(levelConfig.timeLimit);
    setIsPlaying(true);
    comparingRef.current = false;

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
  }, [clearTimer, levelConfig]);

  useEffect(() => {
    if (!isPlaying) return;

    if (secondsLeft <= 0) {
      clearTimer();
      void saveProgress(currentLevelIndex);
      void saveStats(matchedPairs, false);

      navigation.navigate('FruitResult', {
        score: matchedPairs,
        completed: false,
        level: levelConfig.level,
        nextLevel: levelConfig.level,
        isLastLevel: false,
      });
    }
  }, [
    clearTimer,
    currentLevelIndex,
    isPlaying,
    levelConfig.level,
    matchedPairs,
    navigation,
    saveProgress,
    saveStats,
    secondsLeft,
  ]);

  useEffect(() => {
    if (!isPlaying) return;

    if (matchedCount === totalTiles) {
      const isLastLevel = currentLevelIndex >= FRUIT_LEVELS.length - 1;
      const nextLevelIndex = isLastLevel ? 0 : currentLevelIndex + 1;
      const nextLevel = FRUIT_LEVELS[nextLevelIndex]?.level ?? 1;

      clearTimer();
      void saveProgress(nextLevelIndex);
      void saveStats(matchedPairs, true);

      navigation.navigate('FruitResult', {
        score: matchedPairs,
        completed: true,
        level: levelConfig.level,
        nextLevel,
        isLastLevel,
      });
    }
  }, [
    clearTimer,
    currentLevelIndex,
    isPlaying,
    levelConfig.level,
    matchedCount,
    matchedPairs,
    navigation,
    saveProgress,
    saveStats,
    totalTiles,
  ]);

  const handleBackPress = useCallback(() => {
    Alert.alert('Exit level', 'Return to the start screen?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Back',
        style: 'destructive',
        onPress: resetToStartScreen,
      },
    ]);
  }, [resetToStartScreen]);

  const handleInfo = () => {
    navigation.navigate('Settings');
  };

  const handleTilePress = (tile: Tile) => {
    if (!isPlaying) return;
    if (tile.isMatched || tile.isRevealed) return;
    if (comparingRef.current) return;
    if (openedIds.length >= 2) return;

    const nextOpened = [...openedIds, tile.id];

    setTiles(prev =>
      prev.map(item =>
        item.id === tile.id ? { ...item, isRevealed: true } : item,
      ),
    );
    setOpenedIds(nextOpened);

    if (nextOpened.length !== 2) return;

    comparingRef.current = true;

    const first = tiles.find(item => item.id === nextOpened[0]);
    const second = tiles.find(item => item.id === nextOpened[1]);

    if (!first || !second) {
      comparingRef.current = false;
      return;
    }

    if (first.kind === second.kind) {
      setTimeout(() => {
        setTiles(prev =>
          prev.map(item =>
            nextOpened.includes(item.id)
              ? { ...item, isMatched: true, isRevealed: true }
              : item,
          ),
        );
        setMatchedPairs(prev => prev + 1);
        setOpenedIds([]);
        comparingRef.current = false;
      }, 220);
      return;
    }

    setTimeout(() => {
      setTiles(prev =>
        prev.map(item =>
          nextOpened.includes(item.id)
            ? { ...item, isRevealed: false }
            : item,
        ),
      );
      setOpenedIds([]);
      comparingRef.current = false;
    }, 650);
  };

  const tileSize = useMemo(() => {
    const horizontalPadding = isVerySmall ? 28 : 36;
    const gridGap = isVerySmall ? 8 : 10;
    const usableWidth = width - horizontalPadding * 2;
    const totalGap = gridGap * (levelConfig.cols - 1);
    const raw = (usableWidth - totalGap) / levelConfig.cols;

    if (levelConfig.cols >= 6) return Math.max(40, Math.min(raw, isVerySmall ? 46 : 50));
    if (levelConfig.cols >= 5) return Math.max(44, Math.min(raw, isVerySmall ? 52 : 56));
    return Math.max(48, Math.min(raw, isVerySmall ? 60 : 64));
  }, [levelConfig.cols]);

  if (!isLoaded) {
    return (
      <ImageBackground
        source={require('../../assets/images/splash_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ImageBackground>
    );
  }

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
              <TouchableOpacity
                style={styles.infoButton}
                activeOpacity={0.85}
                onPress={handleInfo}
              >
                <Text style={styles.infoButtonText}>?</Text>
              </TouchableOpacity>

              <View style={styles.titlePill}>
                <Text style={styles.titlePillText}>Pattern Spark</Text>
              </View>
            </Animated.View>

            <Text style={styles.levelPreviewText}>LEVEL {levelConfig.level}</Text>
            <Text style={styles.levelMetaText}>
              {levelConfig.rows} x {levelConfig.cols} grid · {levelConfig.pairs} pairs
            </Text>

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
              <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.9}
                onPress={startGame}
              >
                <Text style={styles.startButtonText}>Start Pattern Spark</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          <>
            <View style={styles.gameHeader}>
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.88}
                onPress={handleBackPress}
              >
                <Text style={styles.backButtonText}>‹</Text>
              </TouchableOpacity>

              <View style={styles.titlePillGame}>
                <Text style={styles.titlePillText}>Pattern Spark</Text>
              </View>

              <View style={styles.timerPill}>
                <Text style={styles.timerPillText}>{secondsLeft}</Text>
              </View>
            </View>

            <Text style={styles.playLevelText}>LEVEL {levelConfig.level}</Text>

            <View style={styles.gridWrap}>
              <View
                style={[
                  styles.grid,
                  {
                    maxWidth:
                      levelConfig.cols >= 6
                        ? isVerySmall
                          ? 300
                          : 330
                        : levelConfig.cols >= 5
                        ? isVerySmall
                          ? 285
                          : 315
                        : isVerySmall
                        ? 260
                        : 290,
                  },
                ]}
              >
                {tiles.map(tile => {
                  const showFruit = tile.isMatched || tile.isRevealed;

                  return (
                    <TouchableOpacity
                      key={tile.id}
                      style={[
                        styles.tile,
                        {
                          width: tileSize,
                          height: tileSize,
                        },
                        tile.isMatched && styles.tileMatched,
                        tile.isRevealed && !tile.isMatched && styles.tileRevealed,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => handleTilePress(tile)}
                    >
                      {showFruit ? (
                        <Image
                          source={getFruitAsset(tile.kind)}
                          style={styles.tileImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.hiddenTileFill} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
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

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  topRow: {
    marginTop: topInset + 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoButton: {
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

  infoButtonText: {
    color: '#FFD21E',
    fontSize: isVerySmall ? 18 : 19,
    fontWeight: '800',
  },

  titlePill: {
    minWidth: isVerySmall ? 128 : 142,
    height: isVerySmall ? 34 : 38,
    paddingHorizontal: 20,
    backgroundColor: '#D7B316',
    borderWidth: 1,
    borderColor: '#F8E46C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titlePillGame: {
    minWidth: isVerySmall ? 124 : 138,
    height: isVerySmall ? 34 : 38,
    paddingHorizontal: 18,
    backgroundColor: '#D7B316',
    borderWidth: 1,
    borderColor: '#F8E46C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titlePillText: {
    color: '#2C1800',
    fontSize: isVerySmall ? 14 : 16,
    fontWeight: '900',
  },

  levelPreviewText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#FFD520',
    fontSize: isVerySmall ? 18 : 20,
    fontWeight: '900',
  },

  levelMetaText: {
    marginTop: 6,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: isVerySmall ? 11 : 12,
    fontWeight: '600',
  },

  playLevelText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: isVerySmall ? 11 : 12,
    fontWeight: '700',
    letterSpacing: 1,
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

  bottomActionWrap: {
    alignItems: 'center',
    paddingBottom: isVerySmall ? 138 : isSmall ? 188 : 196,
  },

  startButton: {
    minWidth: isVerySmall ? 150 : 162,
    height: isVerySmall ? 36 : 40,
    borderRadius: 20,
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

  backButton: {
    width: isVerySmall ? 36 : 40,
    height: isVerySmall ? 36 : 40,
    borderRadius: 18,
    backgroundColor: '#4F67FF',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: '#FFD520',
    fontSize: isVerySmall ? 20 : 24,
    fontWeight: '900',
    marginTop: -2,
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

  gridWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isVerySmall ? 14 : 18,
    paddingBottom: isVerySmall ? 80 : 100,
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: isVerySmall ? 8 : 10,
  },

  tile: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },

  tileRevealed: {
    backgroundColor: '#FFFFFF',
  },

  tileMatched: {
    backgroundColor: '#B45CFF',
    borderColor: '#CFA5FF',
  },

  hiddenTileFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  tileImage: {
    width: '70%',
    height: '70%',
  },
});