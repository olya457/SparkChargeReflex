export type WordHintPack = {
  free: [string, string];
  paid: [string, string];
};

export type WordTask = {
  id: string;
  answer: string;
  level: number;
  hints: WordHintPack;
};

export type WordLevelGroup = {
  level: number;
  color: string;
  tasks: WordTask[];
};

export const wordLevels: WordLevelGroup[] = [
  {
    level: 1,
    color: 'green',
    tasks: [
      {
        id: 'lvl1_orange',
        level: 1,
        answer: 'ORANGE',
        hints: {
          free: [
            'A popular citrus fruit',
            'Often associated with vitamin C',
          ],
          paid: [
            'A round fruit with bright peel',
            'The fruit that shares its name with a color',
          ],
        },
      },
      {
        id: 'lvl1_silver',
        level: 1,
        answer: 'SILVER',
        hints: {
          free: [
            'A shiny precious material',
            'Often used in jewelry',
          ],
          paid: [
            'The metal ranked after gold',
            'A gray-white precious metal',
          ],
        },
      },
      {
        id: 'lvl1_button',
        level: 1,
        answer: 'BUTTON',
        hints: {
          free: [
            'A small object you press',
            'Found on clothes and devices',
          ],
          paid: [
            'You click it to activate something',
            'A round fastener on shirts',
          ],
        },
      },
    ],
  },
  {
    level: 2,
    color: 'green',
    tasks: [
      {
        id: 'lvl2_sparks',
        level: 2,
        answer: 'SPARKS',
        hints: {
          free: [
            'Tiny flashes of light',
            'Often seen with electricity',
          ],
          paid: [
            'Small bright electric flashes',
            'What flies when metal hits metal',
          ],
        },
      },
      {
        id: 'lvl2_letter',
        level: 2,
        answer: 'LETTER',
        hints: {
          free: [
            'A symbol in the alphabet',
            'Used to form words',
          ],
          paid: [
            'One unit of written language',
            'You type these to make words',
          ],
        },
      },
      {
        id: 'lvl2_puzzle',
        level: 2,
        answer: 'PUZZLE',
        hints: {
          free: [
            'A brain-teasing activity',
            'Something you solve',
          ],
          paid: [
            'A game of fitting pieces together',
            'A challenge for your mind',
          ],
        },
      },
    ],
  },
  {
    level: 3,
    color: 'yellow',
    tasks: [
      {
        id: 'lvl3_charge',
        level: 3,
        answer: 'CHARGE',
        hints: {
          free: [
            'Related to energy',
            'Can mean to power something',
          ],
          paid: [
            'What you do to refill a battery',
            'To add electrical power',
          ],
        },
      },
      {
        id: 'lvl3_bright',
        level: 3,
        answer: 'BRIGHT',
        hints: {
          free: [
            'Related to strong light',
            'Opposite of dim',
          ],
          paid: [
            'Very full of light',
            'Shining strongly',
          ],
        },
      },
      {
        id: 'lvl3_motion',
        level: 3,
        answer: 'MOTION',
        hints: {
          free: [
            'Related to movement',
            'Not standing still',
          ],
          paid: [
            'The act of moving',
            'Movement through space',
          ],
        },
      },
    ],
  },
  {
    level: 4,
    color: 'yellow',
    tasks: [
      {
        id: 'lvl4_energy',
        level: 4,
        answer: 'ENERGY',
        hints: {
          free: [
            'Something that gives power',
            'Related to activity and movement',
          ],
          paid: [
            'What fuels your body and devices',
            'Electrical or physical power',
          ],
        },
      },
      {
        id: 'lvl4_vector',
        level: 4,
        answer: 'VECTOR',
        hints: {
          free: [
            'A term used in math and physics',
            'Has both direction and size',
          ],
          paid: [
            'A quantity with magnitude and direction',
            'Used to show direction in physics',
          ],
        },
      },
      {
        id: 'lvl4_random',
        level: 4,
        answer: 'RANDOM',
        hints: {
          free: [
            'Without a clear pattern',
            'Not planned or predicted',
          ],
          paid: [
            'Happening by chance',
            'Completely unpredictable',
          ],
        },
      },
    ],
  },
  {
    level: 5,
    color: 'yellow',
    tasks: [
      {
        id: 'lvl5_fusion',
        level: 5,
        answer: 'FUSION',
        hints: {
          free: [
            'The act of joining together',
            'Used in science and cooking',
          ],
          paid: [
            'When two things combine into one',
            'A nuclear process in stars',
          ],
        },
      },
      {
        id: 'lvl5_stream',
        level: 5,
        answer: 'STREAM',
        hints: {
          free: [
            'A continuous flow',
            'Often related to water or data',
          ],
          paid: [
            'A small flowing river',
            'To watch content online in real time',
          ],
        },
      },
      {
        id: 'lvl5_target',
        level: 5,
        answer: 'TARGET',
        hints: {
          free: [
            'Something you aim at',
            'Used in games and sports',
          ],
          paid: [
            'The goal you try to hit',
            'A point you are trying to reach',
          ],
        },
      },
    ],
  },
  {
    level: 6,
    color: 'orange',
    tasks: [
      {
        id: 'lvl6_signal',
        level: 6,
        answer: 'SIGNAL',
        hints: {
          free: [
            'A sign that carries information',
            'Used in communication',
          ],
          paid: [
            'A transmitted message or wave',
            'What your phone searches for',
          ],
        },
      },
      {
        id: 'lvl6_crunch',
        level: 6,
        answer: 'CRUNCH',
        hints: {
          free: [
            'A sharp cracking sound',
            'Often related to food',
          ],
          paid: [
            'The sound of biting hard snacks',
            'What chips make when you bite them',
          ],
        },
      },
      {
        id: 'lvl6_visual',
        level: 6,
        answer: 'VISUAL',
        hints: {
          free: [
            'Related to seeing',
            'Connected with images',
          ],
          paid: [
            'Something you perceive with your eyes',
            'About sight or appearance',
          ],
        },
      },
    ],
  },
  {
    level: 7,
    color: 'red',
    tasks: [
      {
        id: 'lvl7_dynamic',
        level: 7,
        answer: 'DYNAMIC',
        hints: {
          free: [
            'Related to movement or change',
            'Often used in tech and physics',
          ],
          paid: [
            'Constantly active or changing',
            'Full of energy and motion',
          ],
        },
      },
      {
        id: 'lvl7_sphere',
        level: 7,
        answer: 'SPHERE',
        hints: {
          free: [
            'A perfectly round shape',
            'A 3D geometric object',
          ],
          paid: [
            'A ball-shaped object',
            'Like a globe or planet shape',
          ],
        },
      },
      {
        id: 'lvl7_impact',
        level: 7,
        answer: 'IMPACT',
        hints: {
          free: [
            'A strong effect or influence',
            'Can mean a forceful contact',
          ],
          paid: [
            'When two objects hit each other',
            'A powerful collision or effect',
          ],
        },
      },
    ],
  },
  {
    level: 8,
    color: 'red',
    tasks: [
      {
        id: 'lvl8_galaxy',
        level: 8,
        answer: 'GALAXY',
        hints: {
          free: [
            'A huge space system',
            'Contains many stars',
          ],
          paid: [
            'The Milky Way is one',
            'A massive star system in space',
          ],
        },
      },
      {
        id: 'lvl8_phrase',
        level: 8,
        answer: 'PHRASE',
        hints: {
          free: [
            'A short group of words',
            'Part of a sentence',
          ],
          paid: [
            'A small expression of words',
            'A brief combination of words',
          ],
        },
      },
      {
        id: 'lvl8_switch',
        level: 8,
        answer: 'SWITCH',
        hints: {
          free: [
            'Used to change something',
            'Found on many devices',
          ],
          paid: [
            'A button that turns power on or off',
            'You flip it to change state',
          ],
        },
      },
    ],
  },
  {
    level: 9,
    color: 'purple',
    tasks: [
      {
        id: 'lvl9_rhythm',
        level: 9,
        answer: 'RHYTHM',
        hints: {
          free: [
            'Related to music and beats',
            'A repeating pattern of sound',
          ],
          paid: [
            'The beat pattern in music',
            'The timing flow of sounds',
          ],
        },
      },
      {
        id: 'lvl9_symbol',
        level: 9,
        answer: 'SYMBOL',
        hints: {
          free: [
            'A sign that represents something',
            'Used in math and language',
          ],
          paid: [
            'A mark that stands for an idea',
            'Like @ or # in text',
          ],
        },
      },
      {
        id: 'lvl9_master',
        level: 9,
        answer: 'MASTER',
        hints: {
          free: [
            'Someone highly skilled',
            'A person in control',
          ],
          paid: [
            'An expert in a field',
            'Someone with complete skill',
          ],
        },
      },
    ],
  },
  {
    level: 10,
    color: 'purple',
    tasks: [
      {
        id: 'lvl10_zephyr',
        level: 10,
        answer: 'ZEPHYR',
        hints: {
          free: [
            'A gentle natural movement',
            'Related to air',
          ],
          paid: [
            'A soft, light breeze',
            'A mild west wind',
          ],
        },
      },
      {
        id: 'lvl10_vector',
        level: 10,
        answer: 'VECTOR',
        hints: {
          free: [
            'Used in math and physics',
            'Has direction and size',
          ],
          paid: [
            'A quantity with magnitude and direction',
            'Shows direction in physics',
          ],
        },
      },
      {
        id: 'lvl10_sparky',
        level: 10,
        answer: 'SPARKY',
        hints: {
          free: [
            'Related to sparks',
            'Suggests high energy',
          ],
          paid: [
            'Full of lively energy',
            'Bright and energetic in character',
          ],
        },
      },
    ],
  },
];

export const allWordTasks: WordTask[] = wordLevels.flatMap(level => level.tasks);