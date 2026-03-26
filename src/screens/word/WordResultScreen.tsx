import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/routeTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'WordResult'>;

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

export default function WordResultScreen({ navigation, route }: Props) {
  const params = route.params ?? {
    status: 'win' as const,
    title: 'Level Complete',
    reward: 70,
    answer: 'ORANGE',
    level: 1,
    isLastTask: false,
    nextLevel: 2,
  };

  const isWin = params.status === 'win';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim, scaleAnim, floatAnim]);

  const handleMainAction = () => {
    navigation.replace('WordMode');
  };

  const handleHome = () => {
    navigation.replace('MainTabs', { screen: 'HomeHub' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: isWin
          ? `I completed Level ${params.level} in Word Spark and solved the word ${params.answer}.`
          : `I reached Level ${params.level} in Word Spark. The correct word was ${params.answer}.`,
      });
    } catch {}
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
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.topSection, isWin ? styles.topSectionWin : styles.topSectionLose]}>
            <Text style={styles.title}>{params.title}</Text>

            <Text style={styles.levelText}>LEVEL {params.level}</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {isWin ? 'SUCCESS' : 'TRY AGAIN'}
              </Text>
            </View>

            {isWin ? (
              <>
                <Text style={styles.subtitle}>
                  {params.isLastTask
                    ? 'You completed all available levels. Press continue to start again from the beginning.'
                    : `Next level: ${params.nextLevel ?? params.level + 1}`}
                </Text>

                <View style={styles.rewardBox}>
                  <Text style={styles.rewardLabel}>Energy earned</Text>
                  <View style={styles.rewardCapsule}>
                    <Text style={styles.rewardValue}>⚡ {params.reward}</Text>
                  </View>
                </View>

                <Text style={styles.answerText}>Solved word: {params.answer}</Text>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Time ended or the answer was not completed.
                </Text>
                <Text style={styles.answerText}>Correct word: {params.answer}</Text>
              </>
            )}
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.sideButton} activeOpacity={0.9} onPress={handleShare}>
                <Text style={styles.sideButtonText}>↗</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mainButton} activeOpacity={0.9} onPress={handleMainAction}>
                <Text style={styles.mainButtonText}>
                  {isWin ? (params.isLastTask ? 'PLAY AGAIN' : 'CONTINUE') : 'TRY AGAIN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideButton} activeOpacity={0.9} onPress={handleHome}>
                <Text style={styles.sideButtonText}>⌂</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const cardWidth = Math.min(width - 48, isVerySmall ? 300 : isSmall ? 328 : 360);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 80, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: cardWidth,
    borderWidth: 1.4,
    borderColor: '#A8C7FF',
    overflow: 'hidden',
    backgroundColor: 'rgba(38, 20, 132, 0.88)',
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: isVerySmall ? 18 : 22,
    paddingTop: isVerySmall ? 22 : 26,
    paddingBottom: isVerySmall ? 28 : 32,
  },
  topSectionWin: {
    backgroundColor: 'rgba(69, 111, 255, 0.92)',
  },
  topSectionLose: {
    backgroundColor: 'rgba(214, 35, 111, 0.92)',
  },
  bottomSection: {
    backgroundColor: 'rgba(42, 23, 143, 0.96)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  title: {
    color: '#FFD520',
    fontSize: isVerySmall ? 18 : 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  levelText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: isVerySmall ? 11 : 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  statusBadge: {
    marginTop: 16,
    minWidth: isVerySmall ? 130 : 146,
    height: isVerySmall ? 44 : 46,
    borderRadius: 23,
    backgroundColor: '#FFD520',
    borderWidth: 1.2,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  statusBadgeText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 16 : 17,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 22,
    color: '#FFFFFF',
    fontSize: isVerySmall ? 12 : 13,
    lineHeight: isVerySmall ? 18 : 20,
    textAlign: 'center',
  },
  rewardBox: {
    marginTop: 18,
    alignItems: 'center',
  },
  rewardLabel: {
    color: '#FFFFFF',
    fontSize: isVerySmall ? 12 : 13,
    marginBottom: 8,
  },
  rewardCapsule: {
    minWidth: isVerySmall ? 120 : 138,
    height: isVerySmall ? 46 : 48,
    borderRadius: 24,
    backgroundColor: '#FFD520',
    borderWidth: 1.2,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  rewardValue: {
    color: '#5A2300',
    fontSize: isVerySmall ? 18 : 19,
    fontWeight: '900',
  },
  answerText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: isVerySmall ? 13 : 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: isVerySmall ? 18 : 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButton: {
    width: isVerySmall ? 48 : 52,
    height: isVerySmall ? 48 : 52,
    borderRadius: 10,
    backgroundColor: '#FFC91B',
    borderWidth: 1.2,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 22 : 24,
    fontWeight: '800',
  },
  mainButton: {
    flex: 1,
    marginHorizontal: 14,
    height: isVerySmall ? 54 : 58,
    borderRadius: 12,
    backgroundColor: '#FFC91B',
    borderWidth: 1.2,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  mainButtonText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 15 : 16,
    fontWeight: '900',
  },
});