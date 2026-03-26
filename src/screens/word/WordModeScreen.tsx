import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/routeTypes';
import { allWordTasks } from '../../data/wordLevels';

type Props = NativeStackScreenProps<RootStackParamList, 'WordMode'>;

type PoolLetter = {
  id: string;
  letter: string;
  used: boolean;
};

type SelectedLetter = {
  poolId: string;
  letter: string;
};

type SavedWordProgress = {
  currentTaskIndex: number;
  energy: number;
};

type WordStatsPayload = {
  bestScore: number;
  completedLevels: number;
  totalCorrect: number;
  wins: number;
  currentLevel: number;
  highestUnlockedLevel: number;
  lastPlayedLevel: number;
};

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

const START_ENERGY = 345;
const PAID_HINT_COST = 45;
const LEVEL_TIME = 60;
const WORD_PROGRESS_KEY = 'word_mode_progress_v1';
const WORD_STATS_KEY = 'word_mode_stats_v1';
const EXTRA_LETTERS = ['T', 'R', 'M', 'P', 'L', 'S', 'D', 'K', 'B', 'Y', 'N', 'C', 'H'];

function shuffleArray<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildLetterPool(answer: string) {
  const answerLetters = answer.split('');
  const extraCount = Math.max(3, Math.min(5, answerLetters.length - 1));

  const extras: string[] = [];
  let extraIndex = 0;

  while (extras.length < extraCount) {
    const nextLetter = EXTRA_LETTERS[extraIndex % EXTRA_LETTERS.length];
    extraIndex += 1;
    extras.push(nextLetter);
  }

  const combined = [...answerLetters, ...extras];

  return shuffleArray(combined).map((letter, index) => ({
    id: `${letter}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    letter,
    used: false,
  }));
}

function getDefaultWordStats(): WordStatsPayload {
  return {
    bestScore: 0,
    completedLevels: 0,
    totalCorrect: 0,
    wins: 0,
    currentLevel: 1,
    highestUnlockedLevel: 1,
    lastPlayedLevel: 1,
  };
}

export default function WordModeScreen({ navigation }: Props) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [energy, setEnergy] = useState(START_ENERGY);
  const [seconds, setSeconds] = useState(LEVEL_TIME);
  const [revealedPaidHints, setRevealedPaidHints] = useState(0);
  const [showBuyHintModal, setShowBuyHintModal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const task = useMemo(() => allWordTasks[currentTaskIndex] ?? allWordTasks[0], [currentTaskIndex]);

  const [letterPool, setLetterPool] = useState<PoolLetter[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<SelectedLetter[]>([]);
  const [wrongAttempt, setWrongAttempt] = useState(false);

  const screenAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const saveProgress = async (nextTaskIndex: number, nextEnergy: number) => {
    try {
      const safeIndex =
        nextTaskIndex < 0
          ? 0
          : nextTaskIndex > allWordTasks.length - 1
          ? allWordTasks.length - 1
          : nextTaskIndex;

      const payload: SavedWordProgress = {
        currentTaskIndex: safeIndex,
        energy: nextEnergy,
      };

      await AsyncStorage.setItem(WORD_PROGRESS_KEY, JSON.stringify(payload));
    } catch {}
  };

  const saveStats = async (params: {
    solved: boolean;
    nextTaskIndex: number;
    currentLevel: number;
  }) => {
    try {
      const raw = await AsyncStorage.getItem(WORD_STATS_KEY);
      const prev: WordStatsPayload = raw ? JSON.parse(raw) : getDefaultWordStats();

      const nextCurrentLevel =
        params.nextTaskIndex >= 0 && params.nextTaskIndex < allWordTasks.length
          ? (allWordTasks[params.nextTaskIndex]?.level ?? 1)
          : 1;

      const nextHighestUnlocked = params.solved
        ? Math.max(prev.highestUnlockedLevel || 1, nextCurrentLevel)
        : Math.max(prev.highestUnlockedLevel || 1, params.currentLevel);

      const nextCompletedLevels = params.solved
        ? Math.max(prev.completedLevels || 0, params.currentLevel)
        : prev.completedLevels || 0;

      const nextPayload: WordStatsPayload = {
        bestScore: Math.max(prev.bestScore || 0, params.currentLevel),
        completedLevels: nextCompletedLevels,
        totalCorrect: (prev.totalCorrect || 0) + (params.solved ? 1 : 0),
        wins: (prev.wins || 0) + (params.solved ? 1 : 0),
        currentLevel: nextCurrentLevel,
        highestUnlockedLevel: nextHighestUnlocked,
        lastPlayedLevel: params.currentLevel,
      };

      await AsyncStorage.setItem(WORD_STATS_KEY, JSON.stringify(nextPayload));
    } catch {}
  };

  const loadProgress = async () => {
    try {
      const raw = await AsyncStorage.getItem(WORD_PROGRESS_KEY);

      if (!raw) {
        setCurrentTaskIndex(0);
        setEnergy(START_ENERGY);
        setIsLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<SavedWordProgress>;

      const safeIndex =
        typeof parsed.currentTaskIndex === 'number' &&
        parsed.currentTaskIndex >= 0 &&
        parsed.currentTaskIndex < allWordTasks.length
          ? parsed.currentTaskIndex
          : 0;

      const safeEnergy =
        typeof parsed.energy === 'number' && parsed.energy >= 0
          ? parsed.energy
          : START_ENERGY;

      setCurrentTaskIndex(safeIndex);
      setEnergy(safeEnergy);
      setIsLoaded(true);
    } catch {
      setCurrentTaskIndex(0);
      setEnergy(START_ENERGY);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    void loadProgress();
  }, []);

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim, screenAnim]);

  useEffect(() => {
    if (!isLoaded) return;

    setSeconds(LEVEL_TIME);
    setRevealedPaidHints(0);
    setShowBuyHintModal(false);
    setCompleted(false);
    setSelectedLetters([]);
    setWrongAttempt(false);
    setLetterPool(buildLetterPool(task.answer));
  }, [isLoaded, task.answer, task.id]);

  useEffect(() => {
    if (!isLoaded || completed) return;

    if (seconds <= 0) {
      void saveProgress(currentTaskIndex, energy);
      void saveStats({
        solved: false,
        nextTaskIndex: currentTaskIndex,
        currentLevel: task.level,
      });

      navigation.navigate('WordResult', {
        status: 'lose',
        title: "Time's Up",
        reward: 0,
        answer: task.answer,
        level: task.level,
        isLastTask: false,
      });
      return;
    }

    const timer = setTimeout(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, completed, isLoaded, currentTaskIndex, energy, navigation, task.answer, task.level]);

  const visibleHints = [
    task.hints.free[0],
    task.hints.free[1],
    revealedPaidHints >= 1 ? task.hints.paid[0] : null,
    revealedPaidHints >= 2 ? task.hints.paid[1] : null,
  ];

  const selectedWord = selectedLetters.map(item => item.letter).join('');
  const slots = Array.from({ length: task.answer.length }, (_, index) => selectedLetters[index]?.letter ?? '');

  const handlePickLetter = (item: PoolLetter) => {
    if (item.used || wrongAttempt) return;
    if (selectedLetters.length >= task.answer.length) return;

    setSelectedLetters(prev => [...prev, { poolId: item.id, letter: item.letter }]);
    setLetterPool(prev =>
      prev.map(poolItem => (poolItem.id === item.id ? { ...item, used: true } : poolItem)),
    );
  };

  const handleRemoveLast = () => {
    if (selectedLetters.length === 0 || wrongAttempt) return;

    const lastPicked = selectedLetters[selectedLetters.length - 1];

    setSelectedLetters(prev => prev.slice(0, -1));
    setLetterPool(prev =>
      prev.map(poolItem =>
        poolItem.id === lastPicked.poolId ? { ...poolItem, used: false } : poolItem,
      ),
    );
  };

  const resetCurrentAttempt = () => {
    setSelectedLetters([]);
    setLetterPool(prev => prev.map(item => ({ ...item, used: false })));
  };

  const runWrongAnimation = () => {
    setWrongAttempt(true);
    shakeAnim.setValue(0);

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        resetCurrentAttempt();
        setWrongAttempt(false);
      }, 250);
    });
  };

  const handleCheckWord = async () => {
    if (selectedLetters.length !== task.answer.length) {
      Alert.alert('Not enough letters', 'Fill all slots before checking the word.');
      return;
    }

    if (selectedWord !== task.answer) {
      runWrongAnimation();
      return;
    }

    const reward = 70;
    const nextEnergy = energy + reward;
    const isLastTask = currentTaskIndex >= allWordTasks.length - 1;
    const nextTaskIndex = isLastTask ? 0 : currentTaskIndex + 1;
    const nextTask = allWordTasks[nextTaskIndex] ?? allWordTasks[0];

    setCompleted(true);
    await saveProgress(nextTaskIndex, nextEnergy);
    await saveStats({
      solved: true,
      nextTaskIndex,
      currentLevel: task.level,
    });

    setEnergy(nextEnergy);

    navigation.navigate('WordResult', {
      status: 'win',
      title: isLastTask ? 'All Levels Complete' : 'Level Complete',
      reward,
      answer: task.answer,
      level: task.level,
      isLastTask,
      nextLevel: nextTask.level,
    });
  };

  const openPaidHint = () => {
    if (revealedPaidHints < 2) {
      setShowBuyHintModal(true);
    }
  };

  const handleBuyHint = async () => {
    if (energy < PAID_HINT_COST) {
      setShowBuyHintModal(false);
      Alert.alert('Not enough energy', 'You need more energy to unlock this hint.');
      return;
    }

    const nextEnergy = energy - PAID_HINT_COST;
    setEnergy(nextEnergy);
    setRevealedPaidHints(prev => Math.min(prev + 1, 2));
    setShowBuyHintModal(false);
    await saveProgress(currentTaskIndex, nextEnergy);
  };

  const handleBack = async () => {
    await saveProgress(currentTaskIndex, energy);
    navigation.replace('MainTabs', { screen: 'HomeHub' });
  };

  if (!isLoaded) {
    return (
      <ImageBackground
        source={require('../../assets/images/word_mode_bg.png')}
        resizeMode="cover"
        style={styles.background}
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
      source={require('../../assets/images/word_mode_bg.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: screenAnim,
            transform: [
              {
                translateY: screenAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={handleBack}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <View style={styles.titleBox}>
              <Text style={styles.titleText}>Word Spark</Text>
            </View>

            <View style={styles.energyBox}>
              <Text style={styles.energyIcon}>⚡</Text>
              <Text style={styles.energyValue}>{energy}</Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.timerWrap,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.06],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.timerText}>{seconds}</Text>
          </Animated.View>

          <Text style={styles.levelText}>LEVEL {task.level}</Text>

          <Animated.View
            style={[
              styles.wordRow,
              {
                transform: [
                  {
                    translateX: shakeAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-8, 0, 8],
                    }),
                  },
                ],
              },
            ]}
          >
            {slots.map((letter, index) => (
              <View key={`${task.id}-slot-${index}`} style={[styles.letterBox, wrongAttempt && styles.letterBoxWrong]}>
                <Text style={styles.letterText}>{letter || ''}</Text>
              </View>
            ))}
          </Animated.View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.smallControlButton} activeOpacity={0.9} onPress={handleRemoveLast}>
              <Text style={styles.smallControlText}>Erase</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallControlButton} activeOpacity={0.9} onPress={resetCurrentAttempt}>
              <Text style={styles.smallControlText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hintsWrap}>
            {visibleHints.map((hint, index) => {
              const locked = hint === null;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={locked ? 0.85 : 1}
                  onPress={locked ? openPaidHint : undefined}
                  style={[styles.hintCard, locked && styles.hintCardLocked]}
                >
                  <Text style={[styles.hintText, locked && styles.hintTextLocked]}>
                    {locked ? '🔒 Paid hint' : hint}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.poolWrap}>
            {letterPool.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.poolLetterBox, item.used && styles.poolLetterBoxUsed]}
                activeOpacity={0.9}
                onPress={() => handlePickLetter(item)}
                disabled={item.used || wrongAttempt}
              >
                <Text style={[styles.poolLetterText, item.used && styles.poolLetterTextUsed]}>
                  {item.letter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={openPaidHint}>
              <Text style={styles.secondaryButtonText}>Unlock Hint</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainButton} activeOpacity={0.9} onPress={handleCheckWord}>
              <Text style={styles.mainButtonText}>Check Word</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      <Modal visible={showBuyHintModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} activeOpacity={0.8} onPress={() => setShowBuyHintModal(false)}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Unlock Hint?</Text>

            <View style={styles.modalEnergyRow}>
              <Text style={styles.modalEnergyIcon}>⚡</Text>
              <Text style={styles.modalEnergyValue}>{PAID_HINT_COST}</Text>
            </View>

            <TouchableOpacity style={styles.modalButton} activeOpacity={0.9} onPress={handleBuyHint}>
              <Text style={styles.modalButtonText}>BUY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const letterSlotSize = isVerySmall ? 34 : isSmall ? 36 : 40;
const answerFontSize = isVerySmall ? 21 : isSmall ? 23 : 25;
const poolSize = isVerySmall ? 42 : isSmall ? 46 : 50;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
    paddingTop: isVerySmall ? 48 : 54,
    paddingHorizontal: isVerySmall ? 12 : 18,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 29,
    height: 29,
    borderRadius: 4,
    backgroundColor: '#5D7CFF',
    borderWidth: 1,
    borderColor: '#89A5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#FFD520',
    fontSize: 16,
    fontWeight: '800',
  },
  titleBox: {
    minWidth: isVerySmall ? 108 : 118,
    height: 32,
    backgroundColor: '#D8B41C',
    borderWidth: 1,
    borderColor: '#F5E27A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  titleText: {
    color: '#2B1D00',
    fontSize: 14,
    fontWeight: '800',
  },
  energyBox: {
    minWidth: 66,
    height: 32,
    backgroundColor: '#5D7CFF',
    borderWidth: 1,
    borderColor: '#89A5FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  energyIcon: {
    color: '#FFD520',
    fontSize: 14,
    marginRight: 3,
  },
  energyValue: {
    color: '#FFD520',
    fontSize: 13,
    fontWeight: '800',
  },
  timerWrap: {
    alignSelf: 'center',
    marginTop: isVerySmall ? 14 : 18,
    width: isVerySmall ? 48 : 54,
    height: isVerySmall ? 30 : 34,
    borderRadius: 18,
    backgroundColor: '#4B62FF',
    borderWidth: 1,
    borderColor: '#86A2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#FFD520',
    fontSize: 18,
    fontWeight: '800',
  },
  levelText: {
    marginTop: isVerySmall ? 10 : 12,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: isVerySmall ? 11 : 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  wordRow: {
    marginTop: isVerySmall ? 22 : 28,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  letterBox: {
    width: letterSlotSize,
    height: isVerySmall ? 50 : 54,
    marginHorizontal: 3,
    marginVertical: 3,
    backgroundColor: '#79E8FF',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBoxWrong: {
    backgroundColor: '#FF9AA8',
  },
  letterText: {
    color: '#1A2557',
    fontSize: answerFontSize,
    fontWeight: '800',
  },
  controlsRow: {
    marginTop: isVerySmall ? 12 : 14,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  smallControlButton: {
    minWidth: 84,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3E54E8',
    borderWidth: 1,
    borderColor: '#90A5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    paddingHorizontal: 12,
  },
  smallControlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  hintsWrap: {
    marginTop: isVerySmall ? 18 : 22,
    paddingHorizontal: isVerySmall ? 2 : 10,
  },
  hintCard: {
    minHeight: isVerySmall ? 34 : 36,
    borderRadius: 18,
    backgroundColor: '#91F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  hintCardLocked: {
    backgroundColor: '#2A1CA2',
    borderWidth: 1,
    borderColor: '#4836CC',
  },
  hintText: {
    color: '#14205A',
    fontSize: isVerySmall ? 10 : 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  hintTextLocked: {
    color: '#FFFFFF',
    fontSize: isVerySmall ? 10 : 12,
    fontWeight: '700',
  },
  poolWrap: {
    marginTop: isVerySmall ? 10 : 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: isVerySmall ? 4 : 10,
  },
  poolLetterBox: {
    width: poolSize,
    height: poolSize,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#FFD520',
    borderWidth: 2,
    borderColor: '#FF9A1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolLetterBoxUsed: {
    backgroundColor: '#8C94C4',
    borderColor: '#AEB4D6',
    opacity: 0.45,
  },
  poolLetterText: {
    color: '#4E2100',
    fontSize: isVerySmall ? 18 : 20,
    fontWeight: '800',
  },
  poolLetterTextUsed: {
    color: '#F3F5FF',
  },
  bottomButtons: {
    marginTop: 12,
    alignItems: 'center',
    paddingBottom: 40,
  },
  secondaryButton: {
    minWidth: 170,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4D66FF',
    borderWidth: 1,
    borderColor: '#90A5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mainButton: {
    minWidth: 190,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC91B',
    borderWidth: 2,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#5B2500',
    fontSize: 14,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 6, 65, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: isVerySmall ? 220 : 235,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 14,
    borderWidth: 1.2,
    borderColor: '#7FA8FF',
    backgroundColor: 'rgba(57, 110, 255, 0.95)',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    right: 8,
    top: 4,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalTitle: {
    color: '#FFD520',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalEnergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEnergyIcon: {
    color: '#FFD520',
    fontSize: 20,
    marginRight: 4,
  },
  modalEnergyValue: {
    color: '#FFD520',
    fontSize: 20,
    fontWeight: '800',
  },
  modalButton: {
    marginTop: 12,
    minWidth: 82,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD520',
    borderWidth: 1,
    borderColor: '#FF9A1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#5A2300',
    fontSize: 13,
    fontWeight: '800',
  },
});