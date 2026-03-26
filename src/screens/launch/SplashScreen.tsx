import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/routeTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: Props) {
  const [stage, setStage] = useState<'web' | 'logo'>('web');

  useEffect(() => {
    const firstTimer = setTimeout(() => {
      setStage('logo');
    }, 3000);

    const secondTimer = setTimeout(() => {
      navigation.replace('Intro');
    }, 5000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(secondTimer);
    };
  }, [navigation]);

  const loaderHtml = useMemo(
    () => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: transparent;
            }

            body {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .preloader {
              position: relative;
              width: 220px;
              height: 220px;
              display: flex;
              align-items: center;
              justify-content: center;
              filter: drop-shadow(0 0 2px #fff);
            }

            .crack {
              position: absolute;
              width: 22%;
              aspect-ratio: 1;
              background-color: #fef3fc;
              clip-path: polygon(
                50% 0%,
                61% 35%,
                98% 35%,
                68% 57%,
                79% 91%,
                50% 70%,
                21% 91%,
                32% 57%,
                2% 35%,
                39% 35%
              );
              animation: rotate 6s linear infinite;
            }

            .crack2 {
              width: 28%;
              animation-delay: 1s;
            }

            .crack3 {
              width: 34%;
              animation-delay: 1.5s;
            }

            .crack4 {
              width: 40%;
              animation-delay: 2s;
            }

            .crack5 {
              width: 46%;
              animation-delay: 2.5s;
            }

            @keyframes rotate {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          </style>
        </head>
        <body>
          <div class="preloader">
            <div class="crack"></div>
            <div class="crack crack2"></div>
            <div class="crack crack3"></div>
            <div class="crack crack4"></div>
            <div class="crack crack5"></div>
          </div>
        </body>
      </html>
    `,
    [],
  );

  return (
    <ImageBackground
      source={require('../../assets/images/splash_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {stage === 'web' ? (
          <View style={styles.webWrap}>
            <WebView
              originWhitelist={['*']}
              source={{ html: loaderHtml }}
              style={styles.webview}
              scrollEnabled={false}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              automaticallyAdjustContentInsets={false}
            />
          </View>
        ) : (
          <Image
            source={require('../../assets/images/splash_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webWrap: {
    width: 240,
    height: 240,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 180,
    height: 180,
  },
});