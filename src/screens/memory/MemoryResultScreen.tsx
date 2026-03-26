import React, { useEffect, useMemo, useRef } from 'react';
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

type MemoryResultParams = {
  score?: number;
  level?: number;
  targetScore?: number;
  passed?: boolean;
  nextLevel?: number;
  hasNextLevel?: boolean;
};

type Props = NativeStackScreenProps<RootStackParamList, 'MemoryResult'>;

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

export default function MemoryResultScreen({ navigation, route }: Props) {
  const params = (route.params ?? {}) as MemoryResultParams;

  const score = params.score ?? 0;
  const level = params.level ?? 1;
  const targetScore = params.targetScore ?? 10;
  const passed = params.passed ?? false;
  const nextLevel = params.nextLevel ?? Math.min(10, level + 1);
  const hasNextLevel = params.hasNextLevel ?? level < 10;

  const reward = useMemo(() => {
    if (score >= 30) return 60;
    if (score >= 20) return 40;
    if (score >= 12) return 20;
    if (score >= 6) return 10;
    return 0;
  }, [score]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
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

  const mainButtonText = useMemo(() => {
    if (passed && hasNextLevel) {
      return 'NEXT LEVEL';
    }

    if (passed && !hasNextLevel) {
      return 'PLAY AGAIN';
    }

    return 'TRY AGAIN';
  }, [hasNextLevel, passed]);

  const statusTitle = passed ? 'LEVEL COMPLETED' : 'LEVEL FAILED';
  const statusSubtitle = passed
    ? hasNextLevel
      ? `Level ${level} cleared. Level ${nextLevel} unlocked.`
      : 'You cleared the final level.'
    : `You need ${targetScore} fruits to clear level ${level}.`;

  const handleContinue = () => {
    navigation.replace('MainTabs', { screen: 'MemoryMode' });
  };

  const handleHome = () => {
    navigation.replace('MainTabs', { screen: 'HomeHub' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: passed
          ? `I cleared level ${level} in Quick Spark with ${score} fruits.`
          : `I scored ${score} fruits in Quick Spark on level ${level}.`,
      });
    } catch {}
  };

  return (
    <ImageBackground
      source={require('../../assets/images/splash_background.png')}
      resizeMode="cover"
      style={styles.background}
      blurRadius={10}
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
                    outputRange: [0, -6],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.topSection}>
            <Text style={styles.title}>{statusTitle}</Text>

            <Text style={styles.levelText}>Level {level}</Text>
            <Text style={styles.amountText}>Score: {score} / {targetScore}</Text>
            <Text style={styles.subtitle}>{statusSubtitle}</Text>

            {reward > 0 ? (
              <View style={styles.rewardRow}>
                <Text style={styles.rewardBolt}>⚡</Text>
                <Text style={styles.rewardText}>+{reward}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.sideButton}
                activeOpacity={0.9}
                onPress={handleShare}
              >
                <Text style={styles.sideButtonText}>↗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                activeOpacity={0.9}
                onPress={handleContinue}
              >
                <Text style={styles.mainButtonText}>{mainButtonText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sideButton}
                activeOpacity={0.9}
                onPress={handleHome}
              >
                <Text style={styles.sideButtonText}>⌂</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const cardWidth = Math.min(width - 56, isVerySmall ? 292 : isSmall ? 320 : 350);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(26, 11, 95, 0.16)',
  },

  card: {
    width: cardWidth,
    borderWidth: 1.4,
    borderColor: '#9FBEFF',
    backgroundColor: 'rgba(61, 65, 220, 0.9)',
    overflow: 'hidden',
    borderRadius: 18,
  },

  topSection: {
    paddingTop: isVerySmall ? 22 : 26,
    paddingBottom: isVerySmall ? 26 : 30,
    paddingHorizontal: isVerySmall ? 18 : 22,
    alignItems: 'center',
    backgroundColor: 'rgba(96, 107, 255, 0.88)',
  },

  bottomSection: {
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(41, 20, 154, 0.95)',
  },

  title: {
    color: '#FFD520',
    fontSize: isVerySmall ? 17 : 19,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  levelText: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: isVerySmall ? 18 : 20,
    fontWeight: '900',
    textAlign: 'center',
  },

  amountText: {
    marginTop: 14,
    color: '#FFFFFF',
    fontSize: isVerySmall ? 15 : 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 12,
    color: '#E8ECFF',
    fontSize: isVerySmall ? 12 : 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: isVerySmall ? 18 : 20,
  },

  rewardRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rewardBolt: {
    color: '#FFD520',
    fontSize: isVerySmall ? 32 : 36,
    fontWeight: '900',
    marginRight: 8,
    lineHeight: isVerySmall ? 34 : 38,
  },

  rewardText: {
    color: '#FFD520',
    fontSize: isVerySmall ? 24 : 28,
    fontWeight: '900',
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
    marginHorizontal: 16,
    height: isVerySmall ? 54 : 58,
    borderRadius: 12,
    backgroundColor: '#FFC91B',
    borderWidth: 1.2,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  mainButtonText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 14 : 15,
    fontWeight: '900',
    fontStyle: 'italic',
  },
});