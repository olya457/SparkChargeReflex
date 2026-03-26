import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  HomeHub: undefined;
  MemoryMode: undefined;
  FruitMode: undefined;
  Facts: undefined;
  Stats: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Intro: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  WordMode: undefined;

  WordResult:
    | {
        status: 'win' | 'lose';
        title: string;
        reward: number;
        answer: string;
        level: number;
        isLastTask?: boolean;
        nextLevel?: number;
      }
    | undefined;

  FruitResult:
    | {
        score?: number;
        completed?: boolean;
        level?: number;
        nextLevel?: number;
        isLastLevel?: boolean;
      }
    | undefined;

  MemoryResult:
    | {
        score: number;
        level: number;
        targetScore: number;
        passed: boolean;
        nextLevel: number;
        hasNextLevel: boolean;
      }
    | undefined;

  Settings: undefined;
};