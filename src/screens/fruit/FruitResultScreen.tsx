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

type Props = NativeStackScreenProps<RootStackParamList, 'FruitResult'>;

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

export default function FruitResultScreen({ navigation, route }: Props) {
  const score = route.params?.score ?? 0;
  const completed = route.params?.completed ?? false;
  const level = route.params?.level ?? 1;
  const nextLevel = route.params?.nextLevel ?? level + 1;
  const isLastLevel = route.params?.isLastLevel ?? false;

  const reward = completed ? 70 : 0;

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

  const mainButtonLabel = useMemo(() => {
    if (completed) {
      return isLastLevel ? 'PLAY AGAIN' : 'NEXT LEVEL';
    }
    return 'TRY AGAIN';
  }, [completed, isLastLevel]);

  const handleMainAction = () => {
    navigation.replace('MainTabs', { screen: 'FruitMode' });
  };

  const handleHome = () => {
    navigation.replace('MainTabs', { screen: 'HomeHub' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: completed
          ? `I completed Pattern Spark level ${level} and unlocked level ${nextLevel}.`
          : `I played Pattern Spark level ${level} and matched ${score} pairs.`,
      });
    } catch {}
  };

  const cardWidth = Math.min(width - 60, isVerySmall ? 250 : isSmall ? 280 : 300);

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
              width: cardWidth,
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
            <Text style={styles.title}>
              {completed ? 'Pattern Complete' : "Time's Up"}
            </Text>

            <Text style={styles.subtitle}>
              {completed
                ? isLastLevel
                  ? 'All levels completed.'
                  : `Next level: ${nextLevel}`
                : 'Some pairs are still hidden.'}
            </Text>

            <Text style={styles.levelText}>Level: {level}</Text>

            {completed ? (
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
                onPress={handleMainAction}
              >
                <Text style={styles.mainButtonText}>{mainButtonLabel}</Text>
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(26, 11, 95, 0.16)',
  },

  card: {
    borderWidth: 1.3,
    borderColor: '#9FBEFF',
    backgroundColor: 'rgba(61, 65, 220, 0.9)',
    overflow: 'hidden',
  },

  topSection: {
    paddingTop: isVerySmall ? 18 : 22,
    paddingBottom: isVerySmall ? 20 : 24,
    paddingHorizontal: isVerySmall ? 16 : 18,
    alignItems: 'center',
    backgroundColor: 'rgba(96, 107, 255, 0.88)',
  },

  bottomSection: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(41, 20, 154, 0.95)',
  },

  title: {
    color: '#FFD520',
    fontSize: isVerySmall ? 14 : 16,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: isVerySmall ? 10 : 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  levelText: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: isVerySmall ? 11 : 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  rewardRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rewardBolt: {
    color: '#FFD520',
    fontSize: isVerySmall ? 24 : 26,
    fontWeight: '900',
    marginRight: 5,
  },

  rewardText: {
    color: '#FFD520',
    fontSize: isVerySmall ? 18 : 20,
    fontWeight: '900',
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sideButton: {
    width: isVerySmall ? 32 : 34,
    height: isVerySmall ? 32 : 34,
    borderRadius: 6,
    backgroundColor: '#FFC91B',
    borderWidth: 1,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sideButtonText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 15 : 16,
    fontWeight: '800',
  },

  mainButton: {
    flex: 1,
    marginHorizontal: 8,
    height: isVerySmall ? 34 : 36,
    borderRadius: 6,
    backgroundColor: '#FFC91B',
    borderWidth: 1,
    borderColor: '#FF951A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  mainButtonText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 11 : 12,
    fontWeight: '900',
    fontStyle: 'italic',
  },
});