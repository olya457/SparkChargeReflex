import React, { useEffect, useRef, useState } from 'react';
import {
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
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../app/routeTypes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeHub'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

const WORD_PROGRESS_KEY = 'word_mode_progress_v1';
const DEFAULT_ENERGY = 345;

export default function HomeHubScreen({ navigation }: Props) {
  const [energy, setEnergy] = useState(DEFAULT_ENERGY);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const leftCardAnim = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const orbFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(leftCardAnim, {
        toValue: 1,
        duration: 500,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(orbAnim, {
        toValue: 1,
        duration: 650,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 520,
        delay: 260,
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
  }, [buttonAnim, headerAnim, leftCardAnim, orbAnim, orbFloatAnim]);

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

  const handleOpenInfo = () => {
    navigation.navigate('Settings');
  };

  const handleStart = () => {
    navigation.navigate('WordMode');
  };

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
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85} onPress={handleOpenInfo}>
            <Text style={styles.iconText}>?</Text>
          </TouchableOpacity>

          <View style={styles.titlePill}>
            <Text style={styles.titlePillText}>Word Spark</Text>
          </View>

          <View style={styles.energyPill}>
            <Image
              source={require('../../assets/images/icon_energy.png')}
              style={styles.energyIcon}
              resizeMode="contain"
            />
            <Text style={styles.energyText}>{energy}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.leftMiniWrap,
            {
              opacity: leftCardAnim,
              transform: [
                {
                  translateX: leftCardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.leftMiniOrbBox}>
            <Image
              source={require('../../assets/images/icon_energy_box.png')}
              style={styles.leftMiniOrb}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leftMiniLabel}>
            <Text style={styles.leftMiniLabelText}>Energy Box</Text>
          </View>
        </Animated.View>

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
          <TouchableOpacity style={styles.startButton} activeOpacity={0.9} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Word Spark</Text>
          </TouchableOpacity>
        </Animated.View>
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
    justifyContent: 'space-between',
  },
  iconButton: {
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
    lineHeight: isVerySmall ? 20 : 21,
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
  energyPill: {
    minWidth: isVerySmall ? 70 : 76,
    height: isVerySmall ? 34 : 38,
    backgroundColor: '#5B7BFF',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyIcon: {
    width: isVerySmall ? 15 : 16,
    height: isVerySmall ? 15 : 16,
    marginRight: 4,
  },
  energyText: {
    color: '#FFD21E',
    fontSize: isVerySmall ? 13 : 14,
    fontWeight: '800',
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
    minWidth: isVerySmall ? 44 : 48,
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
  bottomActionWrap: {
    alignItems: 'center',
    paddingBottom: isVerySmall ? 138 : isSmall ? 188 : 196,
  },
  startButton: {
    minWidth: isVerySmall ? 132 : 144,
    height: isVerySmall ? 36 : 40,
    borderRadius: 20,
    backgroundColor: '#FFC91A',
    borderWidth: 2,
    borderColor: '#FF8F1C',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  startButtonText: {
    color: '#5A2300',
    fontSize: isVerySmall ? 12 : 13,
    fontWeight: '800',
    fontStyle: 'italic',
  },
});