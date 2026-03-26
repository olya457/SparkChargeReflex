import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../app/routeTypes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Facts'>,
  NativeStackScreenProps<RootStackParamList>
>;

type StoryItem = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const isExtraSmall = SCREEN_H < 640;
const isVerySmall = SCREEN_H < 700;
const isSmall = SCREEN_H < 760;

const s = (normal: number, small: number, extraSmall?: number): number => {
  if (isExtraSmall) return extraSmall ?? small;
  if (isVerySmall) return small;
  return normal;
};

const stories: StoryItem[] = [
  {
    id: '1',
    title: 'The Spark Behind Quick Choices',
    subtitle: 'How fast decisions shape game rhythm',
    content:
      'Quick choices feel simple on the surface, but they rely on a complex chain of attention, rhythm, and confidence working together in real time. In reflex-based play, the brain quickly filters what matters, ignores distractions, and chooses one action from many possibilities. That short moment of focus creates the feeling of speed and sharpness.\n\n' +
      'The more often a player repeats this cycle, the easier it becomes to recognize useful patterns and react with less hesitation. Over time, the delay between seeing a prompt and tapping the right answer shrinks noticeably. This is not luck — it is the brain building stronger pathways for fast decision-making.\n\n' +
      'Neuroscience research shows that reaction time improves with consistent practice. Each session trains the brain to process visual information faster, filter out irrelevant details, and commit to a choice with greater confidence. Even a few minutes of daily reflex training can lead to measurable gains in processing speed.\n\n' +
      'Interestingly, quick decision-making in games often transfers to everyday life. People who regularly practice fast-choice tasks tend to respond more efficiently in situations that require split-second judgment, such as driving, sports, or multitasking at work.',
  },
  {
    id: '2',
    title: 'Why Patterns Feel Satisfying',
    subtitle: 'The mind enjoys structure more than it seems',
    content:
      'Pattern-based challenges are deeply engaging because the brain naturally searches for structure in everything it encounters. When shapes, symbols, or objects repeat with meaning, the mind begins grouping them into stable connections. This gives a powerful sense of progress and control that keeps the player motivated.\n\n' +
      'Even simple combinations can feel rewarding, because each correct match confirms a hidden order that was not obvious at first glance. The moment of recognition — when the pattern clicks into place — triggers a small release of dopamine in the brain, reinforcing the desire to continue.\n\n' +
      'This effect is deeply rooted in human evolution. Our ancestors survived by recognizing patterns in nature: seasonal changes, animal behavior, weather signals. The same neural circuits that helped early humans find food and avoid danger now light up when we solve a puzzle or complete a matching sequence.\n\n' +
      'Pattern recognition also strengthens with practice. The more patterns a player encounters and solves, the faster their brain becomes at spotting new ones. This creates a positive feedback loop where the challenge remains enjoyable because the player is constantly growing more skilled at it.\n\n' +
      'Research in cognitive psychology suggests that regular pattern practice can improve problem-solving abilities, spatial reasoning, and even mathematical thinking. The benefits extend far beyond the game itself.',
  },
  {
    id: '3',
    title: 'Memory Works in Small Signals',
    subtitle: 'Tiny visual cues can guide recall',
    content:
      'Memory is often supported by surprisingly small details: color, location, spacing, and repetition. When something appears again in the same visual context, the brain can connect it faster than if the context changes. This principle is fundamental to how memory games work and why they are effective training tools.\n\n' +
      'Tile games and matching tasks are useful for focus practice because they engage multiple memory systems simultaneously. They do not only test memory — they also strengthen observation and the ability to hold several visual details in mind at once, a skill known as working memory.\n\n' +
      'Working memory is one of the most important cognitive abilities for daily life. It determines how well you can follow conversations, solve problems, and manage multiple tasks. Studies show that targeted practice — like the kind found in memory matching games — can expand working memory capacity over time.\n\n' +
      'The brain uses a technique called chunking to manage memory load. Instead of remembering individual items, it groups related pieces of information together. As players become more experienced, they naturally start chunking — remembering positions in clusters rather than one by one.\n\n' +
      'Another key factor is spatial memory. The brain remembers where things are located on a grid more easily than abstract facts. This is why memory games that use spatial layouts are particularly effective at building recall skills that transfer to real-world navigation and organization.',
  },
  {
    id: '4',
    title: 'The Role of Pressure in Play',
    subtitle: 'A timer changes how people think',
    content:
      'The presence of a timer changes behavior immediately and profoundly. Without a limit, the player tends to explore carefully, weighing every option before committing. With a timer, choices become sharper, attention narrows, and the brain shifts into a more focused processing mode.\n\n' +
      'This does not always make performance worse — in fact, the opposite is often true. In many cases, a moderate time limit improves concentration, reduces overthinking, and makes the whole experience feel more dynamic and engaging. The pressure creates a sense of urgency that keeps the mind alert.\n\n' +
      'Psychologists call this the Yerkes-Dodson law: performance increases with arousal up to a certain point, then declines if stress becomes too high. Well-designed game timers sit in the sweet spot — enough pressure to sharpen focus, but not so much that it causes anxiety or frustration.\n\n' +
      'Time pressure also teaches players to trust their instincts. When there is no time to second-guess, the brain relies on pattern recognition and trained responses rather than slow analytical thinking. This builds a kind of cognitive confidence that is valuable in many real-life situations.\n\n' +
      'Over repeated sessions, players develop a better internal sense of timing. They learn to pace themselves, allocate attention efficiently, and make decisions without unnecessary hesitation. This improved time awareness is one of the most practical benefits of timed gameplay.',
  },
  {
    id: '5',
    title: 'Why Short Sessions Still Matter',
    subtitle: 'Small rounds can still train consistency',
    content:
      'A short game session may look minor, but repeated brief practice can create remarkably strong habits. Quick rounds are easier to return to, easier to remember, and easier to repeat without fatigue. This makes them ideal for building long-term cognitive habits.\n\n' +
      'Over time, this kind of repetition helps the player build steadier focus and better reaction timing. Progress does not always come from long, exhausting sessions — often it comes from consistency and regularity. Five minutes every day can be more effective than one hour once a week.\n\n' +
      'This principle is well-established in learning science. It is called the spacing effect: information and skills are retained better when practice is spread out over time rather than concentrated in a single session. Short, frequent game rounds naturally take advantage of this effect.\n\n' +
      'Brief sessions also fit more easily into daily routines. A quick round during a commute, a lunch break, or before bed requires minimal commitment but still delivers meaningful cognitive exercise. This low barrier to entry makes it much more likely that practice will actually happen consistently.\n\n' +
      'Additionally, short sessions help prevent mental fatigue. When the brain is fresh, it processes information more efficiently and forms stronger memories. By keeping sessions brief, players train their brains at peak performance rather than pushing through diminishing returns.\n\n' +
      'Research on habit formation shows that the most durable habits are built through small, repeated actions rather than occasional intense efforts. Each short session reinforces the neural pathways that support attention, speed, and accuracy.',
  },
  {
    id: '6',
    title: 'Symbols, Words, and Speed',
    subtitle: 'Recognition is faster than full analysis',
    content:
      'In fast puzzle environments, players rarely stop to fully analyze every element. Instead, they recognize familiar forms and react to them almost instantly. This process — called automatic recognition — is one of the brain\'s most powerful shortcuts for saving time and energy.\n\n' +
      'Symbols, simple words, and repeated visual structures help reduce mental load. That makes the experience smoother and lets the player spend more energy on the challenge itself rather than on decoding the interface. When visual elements are familiar, they become nearly invisible, allowing pure focus on gameplay.\n\n' +
      'The brain processes visual symbols approximately 60,000 times faster than text. This is why well-designed game elements use shapes, colors, and icons that can be identified at a glance. The less time spent recognizing what something is, the more time is available for deciding what to do with it.\n\n' +
      'This principle is known as cognitive fluency — the ease with which information is processed. High fluency leads to faster decisions, greater confidence, and a more enjoyable experience. Low fluency creates frustration and slows everything down.\n\n' +
      'As players become more experienced, their recognition speed continues to improve. Elements that once required conscious attention become instantly identifiable. This frees up mental resources for higher-level strategy and faster overall performance.',
  },
  {
    id: '7',
    title: 'Why Repetition Builds Confidence',
    subtitle: 'Practice makes uncertain actions easier',
    content:
      'Repeated exposure to the same kind of challenge reduces hesitation in a measurable way. The player begins to trust their own timing and visual judgment. Confidence grows not because the game becomes easier, but because familiar actions require less conscious effort.\n\n' +
      'This creates smoother movement, quicker decisions, and better control under pressure. What once felt uncertain and stressful becomes natural and almost automatic. The transformation happens gradually, but the results are unmistakable.\n\n' +
      'In psychology, this process is called automaticity — the ability to perform a task without occupying the mind with the low-level details. It is the same mechanism that allows experienced drivers to navigate traffic without consciously thinking about every turn of the steering wheel.\n\n' +
      'Building automaticity through repetition also reduces performance anxiety. When a player has completed the same type of challenge many times successfully, they approach new instances with a calm confidence rather than nervous uncertainty. This emotional shift is just as important as the skill improvement itself.\n\n' +
      'The confidence gained through game practice can extend to other areas of life. People who regularly experience the cycle of challenge, practice, and mastery tend to approach new tasks with greater self-assurance. They understand from direct experience that difficulty is temporary and improvement is always possible.\n\n' +
      'Studies in sport psychology confirm that mental rehearsal and repeated practice create nearly identical neural patterns. The brain treats each successful game round as evidence that future success is achievable.',
  },
  {
    id: '8',
    title: 'Visual Order Helps the Brain',
    subtitle: 'Clean structure supports faster focus',
    content:
      'A clear visual layout reduces cognitive noise significantly. When buttons, targets, and objects stay consistent in their positions and appearance, the brain can focus entirely on the challenge instead of spending resources interpreting the interface.\n\n' +
      'This is why simple and stable layouts often feel more comfortable during play. Visual order supports attention and helps the user react without unnecessary delay. Every millisecond saved on understanding the layout is a millisecond gained for making the right choice.\n\n' +
      'The human visual system processes information in a hierarchical way. It first identifies the overall layout, then groups elements by similarity and proximity, and finally focuses on individual details. A well-organized interface works with this natural hierarchy instead of against it.\n\n' +
      'Color consistency plays a crucial role in visual order. When specific colors always represent the same type of information — for example, yellow for correct answers and red for mistakes — the brain can process feedback instantly without reading any text.\n\n' +
      'Spacing and alignment also contribute to cognitive ease. Evenly spaced elements are easier to scan than irregular arrangements. Aligned grids allow the eye to move in predictable paths, reducing the mental effort of visual search.\n\n' +
      'Research in user experience design shows that visual clarity can improve task performance by up to 20%. In fast-paced games, this advantage can mean the difference between a correct tap and a missed opportunity.',
  },
  {
    id: '9',
    title: 'Mistakes Are Useful Signals',
    subtitle: 'Errors often reveal the next improvement',
    content:
      'Wrong taps and missed choices can feel frustrating in the moment, but they are often the fastest source of meaningful feedback. Each mistake shows where attention slipped, where timing was off, or where memory was incomplete. In challenge-based play, improvement frequently begins not with success, but with understanding what failed.\n\n' +
      'The brain actually learns more from errors than from easy successes. When something goes wrong, the brain pays extra attention to the circumstances and adjusts its internal model for future attempts. This is called error-driven learning, and it is one of the most powerful mechanisms for skill development.\n\n' +
      'Neuroscience research has identified a specific brain signal called the error-related negativity (ERN) that fires within 100 milliseconds of making a mistake. This signal triggers heightened attention and memory encoding, ensuring that the error is remembered and avoided in the future.\n\n' +
      'The key is having the right relationship with mistakes. Players who view errors as information rather than failure tend to improve faster and enjoy the process more. This mindset — sometimes called a growth mindset — turns every mistake into a stepping stone rather than a setback.\n\n' +
      'Good game design supports this by making mistakes visible but not punishing. A brief visual cue or a lost point provides clear feedback without creating discouragement. This balance helps players learn from errors while maintaining the motivation to try again.\n\n' +
      'Over time, the patterns of mistakes become just as informative as the patterns of success. Players who pay attention to their errors develop a deeper understanding of their own cognitive strengths and weaknesses.',
  },
  {
    id: '10',
    title: 'The Brain Likes Small Rewards',
    subtitle: 'Progress feels stronger when it is visible',
    content:
      'Visible rewards such as points, energy bars, or level progression help the brain connect effort with outcome in a tangible way. Even a small gain creates a sense of forward movement that keeps motivation alive. This connection between action and reward is fundamental to how the brain learns.\n\n' +
      'This does not only make play enjoyable — it also supports consistency. When progress is visible, the player is more likely to return and stay engaged over time. The feeling of accumulating achievement is a powerful motivator that operates below conscious awareness.\n\n' +
      'The neuroscience behind this involves dopamine, a chemical messenger that plays a central role in motivation and reward processing. Dopamine is released not just when a reward is received, but in anticipation of a reward. This means that the prospect of earning points or completing a level keeps the brain engaged even before the reward arrives.\n\n' +
      'Small, frequent rewards are more motivating than large, rare ones. This is because the brain responds more strongly to the frequency of positive signals than to their individual size. A steady stream of small achievements creates a continuous sense of progress that a single big reward cannot match.\n\n' +
      'Visual progress indicators — such as progress bars, score counters, and level maps — serve as external memory aids. They remind the player of how far they have come, which reinforces the motivation to continue. Without these visual cues, the sense of progress would be much weaker.\n\n' +
      'This principle applies beyond games as well. People who track their progress in any activity — exercise, learning, work projects — tend to be more persistent and achieve better results than those who do not. The brain simply functions better when progress is visible and measurable.',
  },
  {
    id: '11',
    title: 'Attention Has a Rhythm',
    subtitle: 'Focus rises and falls during active play',
    content:
      'Attention is not a constant resource — it moves in natural waves, especially during repeated tasks. Research shows that the human brain cycles through periods of high and low focus roughly every 20 to 30 seconds during sustained concentration.\n\n' +
      'Good challenge design works with this rhythm by mixing tension and relief. Fast moments, brief pauses, and visible feedback help the player recover and focus again. This rhythm keeps the experience active and engaging without feeling chaotic or overwhelming.\n\n' +
      'The concept of flow — a state of complete immersion in an activity — depends on this rhythmic balance. When challenge and skill are well-matched, and when the pace allows natural fluctuations in attention, the player can enter a flow state where performance feels effortless.\n\n' +
      'Games that maintain a single intensity level throughout tend to cause faster mental fatigue. The brain needs micro-moments of recovery to sustain peak performance. Brief transitions between rounds, score displays, and level-up animations serve this purpose beautifully.\n\n' +
      'Understanding attention rhythms can also help players optimize their own performance. Playing during naturally alert periods — such as mid-morning or early evening — typically produces better results than playing when mental energy is low.\n\n' +
      'The rhythm of attention also explains why variety in challenge type is important. Switching between different task types — matching, speed tapping, pattern recognition — refreshes the specific attention networks involved and prevents any single system from becoming fatigued.',
  },
  {
    id: '12',
    title: 'Matching Tasks Strengthen Recall',
    subtitle: 'Pairing information improves retention',
    content:
      'When players match two related items, they do far more than simply compare images. They build an active link between visual memory and decision-making. This process strengthens short-term recall and encourages more careful observation of details that might otherwise be overlooked.\n\n' +
      'The same process appears throughout learning and education: pairing related signals consistently improves memory performance. Flashcards, vocabulary exercises, and association games all rely on the same matching principle that makes tile-based games effective cognitive training.\n\n' +
      'Matching engages a type of memory called associative memory — the ability to link two separate pieces of information together. This is one of the most important memory skills for daily life, from remembering names and faces to connecting ideas across different contexts.\n\n' +
      'Each successful match reinforces the neural connection between the paired items. With repetition, these connections become faster and more reliable. This is why experienced players can spot matches almost instantly while beginners need to search carefully.\n\n' +
      'The spatial component of matching games adds another layer of cognitive training. Remembering not just what items look like, but where they are located on a grid, exercises spatial working memory — the same system used for navigation, driving, and understanding maps.\n\n' +
      'Research has shown that regular matching practice can improve memory performance in older adults, potentially helping to maintain cognitive function as the brain ages. The combination of visual processing, spatial memory, and decision-making creates a comprehensive cognitive workout.',
  },
  {
    id: '13',
    title: 'Speed and Accuracy Compete',
    subtitle: 'Fast choices are not always the best choices',
    content:
      'In time-based challenges, the player constantly balances two competing demands: speed and accuracy. Moving too fast creates errors that cost points and momentum. Moving too carefully wastes precious time and reduces overall scores. The most effective rhythm usually sits between these extremes.\n\n' +
      'Finding that balance is one of the main reasons these games stay interesting over repeated sessions. The optimal speed-accuracy tradeoff shifts as the player improves — what was once a difficult pace becomes comfortable, opening room for even faster performance.\n\n' +
      'Cognitive scientists call this the speed-accuracy tradeoff (SAT), and it is one of the most fundamental principles in human performance. Every action we take involves an unconscious calculation of how much time to invest in making a correct choice.\n\n' +
      'Skilled players develop an intuitive sense for this tradeoff. They know when to be careful — such as when facing an unfamiliar pattern — and when to trust their automatic responses and move quickly. This adaptive strategy is a hallmark of expertise in any domain.\n\n' +
      'Practice shifts the entire tradeoff curve. As skills improve, players can be both faster and more accurate simultaneously. What looked like an impossible combination for a beginner becomes routine for an experienced player. This visible improvement is deeply satisfying.\n\n' +
      'The speed-accuracy balance also teaches a valuable life lesson: perfectionism often works against efficiency. Learning to accept occasional small errors in exchange for much greater speed is a practical skill that applies to work, decision-making, and creative endeavors.',
  },
  {
    id: '14',
    title: 'Color Guides Recognition',
    subtitle: 'Visual contrast changes reaction speed',
    content:
      'Color has a profound influence on what is noticed first and how quickly the brain processes visual information. Bright contrast helps objects stand out from their background and dramatically reduces the time needed for recognition. In puzzle and reflex play, good color separation makes tasks clearer and more satisfying.\n\n' +
      'Color can also reduce visual fatigue by helping the eye organize the scene more efficiently. When different elements are distinguished by color, the visual system can group and separate them without effort, leaving more cognitive resources available for the actual challenge.\n\n' +
      'The human eye can distinguish approximately 10 million different colors, but in fast-paced contexts, only high-contrast combinations are effective. The brain processes color differences before shape differences, which means that color is the fastest visual channel for conveying information.\n\n' +
      'Different colors also carry emotional and cognitive associations. Warm colors like red and orange create a sense of urgency and energy, while cool colors like blue and green feel calmer and more stable. Game designers use these associations intentionally to guide player behavior.\n\n' +
      'Color consistency over time builds automatic associations. When correct answers are always highlighted in green and errors in red, the player develops instant recognition that operates faster than conscious thought. This is the same principle used in traffic lights and warning signs.\n\n' +
      'For players with color vision differences, well-designed games use shape and pattern in addition to color. This ensures that the visual guidance system works for everyone, regardless of how they perceive specific colors.',
  },
  {
    id: '15',
    title: 'Challenge Feels Better With Variety',
    subtitle: 'Small changes keep the mind active',
    content:
      'If every round feels identical, attention begins to drop rapidly. The brain is wired to notice change and novelty — when everything stays the same, the neural systems responsible for alertness begin to disengage. This is why variety is essential for maintaining engagement over time.\n\n' +
      'Small variations in position, timing, sequence, or difficulty refresh the player\'s focus and help prevent routine from becoming dull. Variety keeps the experience active while preserving the core rules the player already understands. The ideal balance is enough novelty to stay interesting but enough familiarity to feel comfortable.\n\n' +
      'This principle is called habituation — the brain\'s natural tendency to stop paying attention to stimuli that remain constant. It is an efficient mechanism for filtering out background noise, but in a game context, it can lead to boredom and disengagement if not addressed.\n\n' +
      'Effective variety operates at multiple levels. Surface-level changes — new colors, positions, or arrangements — keep things visually fresh. Structural changes — different matching rules, time limits, or scoring systems — challenge the player to adapt their strategy.\n\n' +
      'Progressive difficulty is another form of variety. As the player improves, the challenge grows to match their skill level. This creates a continuous sense of appropriate challenge that prevents both boredom (too easy) and frustration (too hard).\n\n' +
      'The concept of desirable difficulty from learning science applies here. Challenges that are slightly beyond current ability produce the most learning and the most satisfaction when completed. Variety helps ensure that each session includes moments of desirable difficulty.',
  },
  {
    id: '16',
    title: 'A Good Interface Reduces Friction',
    subtitle: 'The best controls feel invisible',
    content:
      'The strongest interface is often the one the player barely notices. When controls respond clearly and visual feedback is immediate, the challenge feels direct and natural. This lowers friction between the player\'s intention and the game\'s response, creating a seamless experience.\n\n' +
      'A smooth interface supports flow, which is why clarity matters as much as challenge in game design. Even the most engaging puzzle becomes frustrating if the controls are unresponsive, if buttons are too small, or if feedback is delayed.\n\n' +
      'Research in human-computer interaction shows that response delays of more than 100 milliseconds break the feeling of direct manipulation. When a tap produces an instant visual response, the player feels in control. When there is a noticeable delay, that feeling of control diminishes.\n\n' +
      'Touch target size is critically important on mobile devices. Buttons and interactive elements need to be large enough to tap accurately during fast gameplay. Targets that are too small cause missed taps that feel like the game\'s fault rather than the player\'s mistake.\n\n' +
      'Visual feedback serves as confirmation that the player\'s action was received and processed. A brief color change, a subtle animation, or a sound effect all communicate that the tap was registered. Without this feedback, players feel uncertain and their confidence drops.\n\n' +
      'The best game interfaces evolve with the player. Early levels use larger targets, slower timers, and more forgiving tap zones. As skill increases, the interface can become more demanding without feeling unfair, because the player has already internalized the basic interaction patterns.',
  },
];

export default function FactsScreen({ navigation }: Props) {
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.96)).current;
  const modalTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const openStory = useCallback(
    (item: StoryItem) => {
      setSelectedStory(item);
      setModalVisible(true);

      modalOpacity.setValue(0);
      modalScale.setValue(0.96);
      modalTranslateY.setValue(10);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(modalScale, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(modalTranslateY, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [modalOpacity, modalScale, modalTranslateY],
  );

  const closeStory = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.98,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: 8,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedStory(null);
    });
  }, [modalOpacity, modalScale, modalTranslateY]);

  const renderItem = useCallback(
    ({ item, index }: { item: StoryItem; index: number }) => (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12 + index * 2, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => openStory(item)}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleBox}>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <View style={styles.readButton}>
              <Text style={styles.readButtonText}>OPEN</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      </Animated.View>
    ),
    [fadeAnim, openStory],
  );

  const keyExtractor = useCallback((item: StoryItem) => item.id, []);

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require('../../assets/images/splash_background.png')}
        resizeMode="cover"
        style={styles.bg}
      />

      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.iconText}>?</Text>
          </TouchableOpacity>

          <View style={styles.titlePill}>
            <Text style={styles.titlePillText}>Story Notes</Text>
          </View>
        </View>

        <FlatList
          data={stories}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          onRequestClose={closeStory}
          statusBarTranslucent
        >
          <Animated.View
            style={[
              styles.modalFull,
              {
                opacity: modalOpacity,
              },
            ]}
          >
            <ImageBackground
              source={require('../../assets/images/splash_background.png')}
              resizeMode="cover"
              style={styles.modalBg}
            >
              <View style={styles.modalInner}>
                <Animated.View
                  style={[
                    styles.modalContent,
                    {
                      transform: [
                        { scale: modalScale },
                        { translateY: modalTranslateY },
                      ],
                    },
                  ]}
                >
                  <View style={styles.modalBadge}>
                    <Text style={styles.modalBadgeText}>Story</Text>
                  </View>

                  <Text style={styles.modalTitle}>{selectedStory?.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedStory?.subtitle}</Text>

                  <View style={styles.modalDivider} />

                  <ScrollView
                    style={styles.modalScroll}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.modalText}>{selectedStory?.content}</Text>
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.closeButton}
                    activeOpacity={0.9}
                    onPress={closeStory}
                  >
                    <Text style={styles.closeButtonText}>CLOSE</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </ImageBackground>
          </Animated.View>
        </Modal>
      </View>
    </View>
  );
}

const topInset = s(54, 46, 38);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#13074f',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: s(18, 14, 10),
  },

  headerRow: {
    marginTop: topInset + s(20, 16, 10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    position: 'absolute',
    left: 0,
    width: s(32, 30, 26),
    height: s(32, 30, 26),
    borderRadius: 4,
    backgroundColor: '#5B7BFF',
    borderWidth: 1,
    borderColor: '#8FA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFD21E',
    fontSize: s(19, 18, 15),
    fontWeight: '800',
  },
  titlePill: {
    minWidth: s(138, 122, 105),
    height: s(38, 34, 30),
    paddingHorizontal: s(20, 16, 12),
    backgroundColor: '#D7B316',
    borderWidth: 1,
    borderColor: '#F8E46C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePillText: {
    color: '#2C1800',
    fontSize: s(16, 14, 12),
    fontWeight: '900',
  },
  listContent: {
    paddingTop: s(22, 18, 12),
    paddingBottom: s(160, 140, 110),
  },

  card: {
    backgroundColor: 'rgba(77, 96, 255, 0.24)',
    borderWidth: 1,
    borderColor: '#8AA3FF',
    borderRadius: s(18, 16, 14),
    paddingHorizontal: s(16, 14, 10),
    paddingVertical: s(16, 14, 10),
    marginBottom: s(14, 12, 8),
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleBox: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    color: '#FFD520',
    fontSize: s(17, 15, 13),
    fontWeight: '900',
  },
  readButton: {
    minWidth: s(74, 66, 56),
    height: s(32, 30, 26),
    borderRadius: 16,
    backgroundColor: '#FFC91A',
    borderWidth: 1,
    borderColor: '#FF8F1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(10, 8, 6),
  },
  readButtonText: {
    color: '#5A2300',
    fontSize: s(11, 10, 9),
    fontWeight: '900',
  },
  cardSubtitle: {
    marginTop: s(10, 8, 6),
    color: '#FFFFFF',
    fontSize: s(13, 12, 11),
    lineHeight: s(19, 17, 15),
    fontWeight: '500',
  },

  modalFull: {
    flex: 1,
  },
  modalBg: {
    flex: 1,
  },
  modalInner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: s(22, 16, 12),
    paddingTop: topInset + s(10, 8, 4),
    paddingBottom: s(40, 30, 20),
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(47, 59, 180, 0.55)',
    borderWidth: 1.3,
    borderColor: '#8AA3FF',
    borderRadius: s(24, 20, 16),
    paddingHorizontal: s(20, 16, 12),
    paddingTop: s(22, 18, 14),
    paddingBottom: s(20, 16, 12),
  },
  modalBadge: {
    alignSelf: 'center',
    paddingHorizontal: s(16, 12, 10),
    paddingVertical: s(5, 4, 3),
    backgroundColor: '#D7B316',
    borderRadius: 10,
    marginBottom: s(14, 10, 8),
  },
  modalBadgeText: {
    color: '#2C1800',
    fontSize: s(11, 10, 9),
    fontWeight: '900',
  },
  modalTitle: {
    color: '#FFD520',
    fontSize: s(20, 17, 15),
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: s(8, 6, 4),
    color: 'rgba(255,255,255,0.75)',
    fontSize: s(13, 12, 11),
    fontWeight: '600',
    textAlign: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: s(16, 12, 10),
    marginHorizontal: s(10, 6, 2),
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: s(10, 6, 4),
  },
  modalText: {
    color: '#FFFFFF',
    fontSize: s(15, 13, 12),
    lineHeight: s(23, 20, 17),
    fontWeight: '400',
    textAlign: 'left',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: s(18, 14, 10),
    minWidth: s(140, 120, 100),
    height: s(44, 38, 34),
    borderRadius: 20,
    backgroundColor: '#FFC91A',
    borderWidth: 1,
    borderColor: '#FF8F1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(18, 14, 10),
  },
  closeButtonText: {
    color: '#5A2300',
    fontSize: s(13, 12, 11),
    fontWeight: '900',
  },
});
