import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/routeTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

const WORD_PROGRESS_KEY = 'word_mode_progress_v1';
const DEFAULT_ENERGY = 345;

const howItWorksData = [
  {
    id: 'word',
    title: 'Word Spark — How It Works',
    lines: [
      '• Each level contains one hidden word.',
      '• You have 60 seconds to build the correct answer.',
      '• Tap letters from the pool to fill the answer slots.',
      '• Use Erase to remove the last letter or Clear to reset the attempt.',
      '• Two basic hints are available for free.',
      '• Extra hints can be unlocked with ⚡ energy.',
      '• If the answer is correct, the next level unlocks.',
      '• Your progress, energy, and level are saved automatically.',
    ],
  },
  {
    id: 'quick',
    title: 'Quick Spark — How It Works',
    lines: [
      '• Fruits appear quickly across the screen.',
      '• Tap fruits as fast as possible before time runs out.',
      '• Each caught fruit increases your score.',
      '• ⚡ lightning gives extra time.',
      '• Every level has its own target score.',
      '• Levels become harder with faster spawn speed and higher goals.',
      '• If you complete the level target, the next level unlocks.',
      '• Your progress and total results are saved in Stats.',
    ],
  },
  {
    id: 'pattern',
    title: 'Pattern Spark — How It Works',
    lines: [
      '• Open tiles and find matching pairs.',
      '• You must clear the whole grid before the timer ends.',
      '• Each level uses a different grid size and pair count.',
      '• Remember positions carefully to finish faster.',
      '• When all pairs are matched, the level is completed.',
      '• New levels continue from your saved progress.',
      '• Best pair results and completed levels are shown in Stats.',
    ],
  },
];

export default function SettingsScreen({ navigation }: Props) {
  const [energy, setEnergy] = useState(DEFAULT_ENERGY);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 520,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim, headerAnim, buttonAnim]);

  useEffect(() => {
    const loadEnergy = async () => {
      try {
        const raw = await AsyncStorage.getItem(WORD_PROGRESS_KEY);

        if (!raw) {
          setEnergy(DEFAULT_ENERGY);
          return;
        }

        const parsed = JSON.parse(raw) as { energy?: number };

        if (typeof parsed.energy === 'number' && parsed.energy >= 0) {
          setEnergy(parsed.energy);
        } else {
          setEnergy(DEFAULT_ENERGY);
        }
      } catch {
        setEnergy(DEFAULT_ENERGY);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      void loadEnergy();
    });

    void loadEnergy();

    return unsubscribe;
  }, [navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Spark Charge Reflex',
        message:
          'Spark Charge Reflex\n\nFast mini challenges with words, reactions, and pattern matching in a clean neon style.',
      });
    } catch {
      Alert.alert('Share unavailable', 'Unable to open the share window right now.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/word_mode_bg.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.backButton} activeOpacity={0.88} onPress={handleBack}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text style={styles.titleText}>How It Works</Text>
          </View>

          <View style={styles.energyBox}>
            <Text style={styles.energyIcon}>⚡</Text>
            <Text style={styles.energyValue}>{energy}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.contentWrap,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {howItWorksData.map(item => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.lines.map((line, index) => (
                  <Text key={`${item.id}-${index}`} style={styles.cardText}>
                    {line}
                  </Text>
                ))}
              </View>
            ))}

            <Animated.View
              style={[
                styles.shareWrap,
                {
                  opacity: buttonAnim,
                  transform: [
                    {
                      translateY: buttonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                    {
                      scale: buttonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.shareButton}
                activeOpacity={0.9}
                onPress={handleShareApp}
              >
                <Text style={styles.shareButtonText}>Share App</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const headerTop = isVerySmall ? 56 : 62;

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

  header: {
    marginTop: headerTop + 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: isVerySmall ? 46 : 50,
    height: isVerySmall ? 40 : 42,
    borderRadius: 4,
    backgroundColor: '#536DFF',
    borderWidth: 1,
    borderColor: '#96A8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#FFD520',
    fontSize: isVerySmall ? 21 : 23,
    fontWeight: '800',
    marginTop: -2,
  },

  titleBox: {
    flex: 1,
    marginHorizontal: 12,
    height: isVerySmall ? 42 : 44,
    backgroundColor: '#D1AE11',
    borderWidth: 1,
    borderColor: '#F6E16B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  titleText: {
    color: '#2D1C00',
    fontSize: isVerySmall ? 15 : 17,
    fontWeight: '900',
  },

  energyBox: {
    minWidth: isVerySmall ? 82 : 88,
    height: isVerySmall ? 40 : 42,
    backgroundColor: '#536DFF',
    borderWidth: 1,
    borderColor: '#96A8FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  energyIcon: {
    color: '#FFD520',
    fontSize: isVerySmall ? 20 : 22,
    marginRight: 5,
    fontWeight: '900',
  },

  energyValue: {
    color: '#FFD520',
    fontSize: isVerySmall ? 19 : 21,
    fontWeight: '800',
  },

  contentWrap: {
    flex: 1,
    marginTop: 10,
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 24,
    paddingHorizontal: isVerySmall ? 14 : 16,
    paddingVertical: isVerySmall ? 14 : 16,
    marginBottom: 18,
  },

  cardTitle: {
    color: '#111111',
    fontSize: isVerySmall ? 16 : 17,
    fontWeight: '700',
    marginBottom: 8,
  },

  cardText: {
    color: '#111111',
    fontSize: isVerySmall ? 13 : 14,
    lineHeight: isVerySmall ? 18 : 20,
    fontWeight: '400',
    marginBottom: 2,
  },

  shareWrap: {
    marginTop: 2,
    marginBottom: 10,
    alignItems: 'center',
  },

  shareButton: {
    width: isVerySmall ? '100%' : '100%',
    minHeight: isVerySmall ? 54 : 58,
    borderRadius: 18,
    backgroundColor: '#FFD520',
    borderWidth: 1.5,
    borderColor: '#FFF2A6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  shareButtonText: {
    color: '#2D1C00',
    fontSize: isVerySmall ? 17 : 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});