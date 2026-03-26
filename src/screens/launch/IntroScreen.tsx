import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/routeTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Intro'>;

type IntroSlide = {
  id: string;
  image: any;
  title: string;
  description: string;
  buttonLabel: string;
};

const { width, height } = Dimensions.get('window');
const isSmall = height < 760;
const isVerySmall = height < 700;

export default function IntroScreen({ navigation }: Props) {
  const flatListRef = useRef<FlatList<IntroSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(26)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.92)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const slides = useMemo<IntroSlide[]>(
    () => [
      {
        id: '1',
        image: require('../../assets/images/intro_word.png'),
        title: 'Train Your Word Reflex',
        description:
          'Fill the grid, reveal hidden letters, and solve words before time runs out.',
        buttonLabel: 'CONTINUE',
      },
      {
        id: '2',
        image: require('../../assets/images/intro_energy.png'),
        title: 'Feel the Spark',
        description:
          'Tap fast, build your streak, and collect energy charges as you play.',
        buttonLabel: 'NEXT',
      },
      {
        id: '3',
        image: require('../../assets/images/intro_rewards.png'),
        title: 'Unlock Your Rewards',
        description:
          'Exchange energy for wallpapers and recharge with short motivational quotes.',
        buttonLabel: 'GET STARTED',
      },
    ],
    [],
  );

  useEffect(() => {
    runEntranceAnimation();
  }, [activeIndex]);

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    translateAnim.setValue(26);
    imageScaleAnim.setValue(0.92);
    buttonAnim.setValue(0);

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
      Animated.timing(imageScaleAnim, {
        toValue: 1,
        duration: 460,
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
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
      return;
    }

navigation.replace('MainTabs', { screen: 'HomeHub' });
  };

  const handleClose = () => {
  navigation.replace('MainTabs', { screen: 'HomeHub' });
  };

  const renderItem = ({ item, index }: { item: IntroSlide; index: number }) => {
    const isCurrent = index === activeIndex;

    return (
      <View style={styles.page}>
        <Animated.View
          style={[
            styles.contentWrap,
            isCurrent && {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.imageWrap,
              isCurrent && {
                transform: [{ scale: imageScaleAnim }],
              },
            ]}
          >
            <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
          </Animated.View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>

          <Animated.View
            style={[
              styles.buttonWrap,
              isCurrent && {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.9}
              onPress={handleNext}
            >
              <Text style={styles.actionText}>{item.buttonLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/splash_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} activeOpacity={0.85} onPress={handleClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </ImageBackground>
  );
}

const CARD_WIDTH = isVerySmall ? width * 0.78 : isSmall ? width * 0.75 : width * 0.72;
const IMAGE_HEIGHT = isVerySmall ? height * 0.26 : isSmall ? height * 0.29 : height * 0.34;
const PAGE_TOP = isVerySmall ? 122 : isSmall ? 132 : 138;
const CONTENT_SHIFT_DOWN = 30;
const BUTTON_GAP = 30;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: isVerySmall ? 48 : 54,
    left: 22,
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#FFCC18',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  closeText: {
    color: '#632300',
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  listContent: {},
  page: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: PAGE_TOP + CONTENT_SHIFT_DOWN,
  },
  imageWrap: {
    width: '100%',
    height: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isVerySmall ? 16 : 18,
  },
  heroImage: {
    width: isVerySmall ? width * 0.58 : isSmall ? width * 0.6 : width * 0.62,
    height: IMAGE_HEIGHT,
  },
  infoCard: {
    width: CARD_WIDTH,
    minHeight: isVerySmall ? 96 : 102,
    paddingHorizontal: isVerySmall ? 16 : 18,
    paddingVertical: isVerySmall ? 14 : 16,
    borderWidth: 1.2,
    borderColor: '#7FA8FF',
    backgroundColor: 'rgba(43, 74, 215, 0.42)',
    shadowColor: '#7AA2FF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFCC18',
    fontSize: isVerySmall ? 15 : 16,
    fontWeight: '800',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: isVerySmall ? 8 : 10,
  },
  cardDescription: {
    color: '#F4F7FF',
    fontSize: isVerySmall ? 12 : 13,
    lineHeight: isVerySmall ? 17 : 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonWrap: {
    marginTop: BUTTON_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    minWidth: isVerySmall ? 126 : 132,
    height: isVerySmall ? 34 : 36,
    paddingHorizontal: isVerySmall ? 20 : 22,
    borderRadius: 6,
    backgroundColor: '#FFCC18',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  actionText: {
    color: '#5A2400',
    fontSize: isVerySmall ? 12 : 13,
    fontWeight: '800',
    fontStyle: 'italic',
  },
});