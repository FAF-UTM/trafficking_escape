export interface PuzzleCard {
  id: number;
  textKey: string;
  correctIndex: number;
  image: string;
}

export interface PuzzleLevel {
  levelNumber: number;
  cards: PuzzleCard[];
  descriptionKey: string;
}

export const puzzleLevels: PuzzleLevel[] = [
  {
    levelNumber: 1,
    descriptionKey: 'timelinePuzzle.level1.description',
    cards: [
      { id: 1, textKey: 'timelinePuzzle.level1.step1', correctIndex: 0, image: '/assets/timeline/1.png' },
      { id: 2, textKey: 'timelinePuzzle.level1.step2', correctIndex: 1, image: '/assets/timeline/2.png' },
      { id: 3, textKey: 'timelinePuzzle.level1.step3', correctIndex: 2, image: '/assets/timeline/3.png' },
    ],
  },
  {
    levelNumber: 2,
    descriptionKey: 'timelinePuzzle.level2.description',
    cards: [
      { id: 1, textKey: 'timelinePuzzle.level2.step1', correctIndex: 0, image: '/assets/timeline/4.png' },
      { id: 2, textKey: 'timelinePuzzle.level2.step2', correctIndex: 1, image: '/assets/timeline/5.png' },
      { id: 3, textKey: 'timelinePuzzle.level2.step3', correctIndex: 2, image: '/assets/timeline/6.png' },
      { id: 4, textKey: 'timelinePuzzle.level2.step4', correctIndex: 3, image: '/assets/timeline/7.png' },
      { id: 5, textKey: 'timelinePuzzle.level2.step5', correctIndex: 4, image: '/assets/timeline/8.png' },
    ],
  },
  {
    levelNumber: 3,
    descriptionKey: 'timelinePuzzle.level3.description',
    cards: [
      { id: 1, textKey: 'timelinePuzzle.level3.step1', correctIndex: 0, image: '/assets/timeline/9.png' },
      { id: 2, textKey: 'timelinePuzzle.level3.step2', correctIndex: 1, image: '/assets/timeline/10.png' },
      { id: 3, textKey: 'timelinePuzzle.level3.step3', correctIndex: 2, image: '/assets/timeline/11.png' },
      { id: 4, textKey: 'timelinePuzzle.level3.step4', correctIndex: 3, image: '/assets/timeline/12.png' },
      { id: 5, textKey: 'timelinePuzzle.level3.step5', correctIndex: 4, image: '/assets/timeline/13.png' },
      { id: 6, textKey: 'timelinePuzzle.level3.step6', correctIndex: 5, image: '/assets/timeline/14.png' },
      { id: 7, textKey: 'timelinePuzzle.level3.step7', correctIndex: 6, image: '/assets/timeline/15.png' }
    ],
  },
];
