export interface PuzzleCard {
  id: number;
  text: string;
  correctIndex: number;
  image: string;
}

export interface PuzzleLevel {
  levelNumber: number;
  cards: PuzzleCard[];
  levelDescription: string;
}

export const puzzleLevels: PuzzleLevel[] = [
  {
    levelNumber: 1,
    levelDescription: "Arrange these 3 events in the correct sequence.",
    cards: [
      {
        id: 1,
        text: "Mary overhears a rumor about a shady party.",
        correctIndex: 0,
        image: "/assets/timeline/1.png",
      },
      {
        id: 2,
        text: "Mary decides to talk to her friend about going.",
        correctIndex: 1,
        image: "/assets/timeline/2.png",
      },
      {
        id: 3,
        text: "Mary and her friend realize it's dangerous.",
        correctIndex: 2,
        image: "/assets/timeline/3.png",
      },
    ],
  },
  {
    levelNumber: 2,
    levelDescription: "Arrange these 5 events to continue the story.",
    cards: [
      {
        id: 1,
        text: "An unknown person messages Mary online.",
        correctIndex: 0,
        image: "/assets/timeline/4.png",
      },
      {
        id: 2,
        text: "He offers Mary a 'modeling contract.'",
        correctIndex: 1,
        image: "/assets/timeline/5.png",
      },
      {
        id: 3,
        text: "She shares personal info without caution.",
        correctIndex: 2,
        image: "/assets/timeline/6.png",
      },
      {
        id: 4,
        text: "Mother notices the suspicious chat and warns Mary.",
        correctIndex: 3,
        image: "/assets/timeline/7.png",
      },
      {
        id: 5,
        text: "Mary blocks the user and informs the police.",
        correctIndex: 4,
        image: "/assets/timeline/8.png",
      },
    ],
  },
  {
    levelNumber: 3,
    levelDescription: "Arrange these 7 events to finish the puzzle.",
    cards: [
      {
        id: 1,
        text: "Sophia sees a flier for a 'fantastic job abroad.'",
        correctIndex: 0,
        image: "/assets/timeline/9.png",
      },
      {
        id: 2,
        text: "She calls the hotline to verify the job.",
        correctIndex: 1,
        image: "/assets/timeline/10.png",
      },
      {
        id: 3,
        text: "They discover the company is fake.",
        correctIndex: 2,
        image: "/assets/timeline/11.png",
      },
      {
        id: 4,
        text: "Sophia warns Mary not to be tricked.",
        correctIndex: 3,
        image: "/assets/timeline/12.png",
      },
      {
        id: 5,
        text: "They spread awareness to friends at school.",
        correctIndex: 4,
        image: "/assets/timeline/13.png",
      },
      {
        id: 6,
        text: "Mother thanks them for being vigilant.",
        correctIndex: 5,
        image: "/assets/timeline/14.png",
      },
      {
        id: 7,
        text: "Sophia tears down the fake job flier.",
        correctIndex: 6,
        image: "/assets/timeline/15.png",
      },
    ],
  },
];