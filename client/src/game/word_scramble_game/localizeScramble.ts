import type { TFunction } from 'i18next';
import { CASES, type ScrambleCase } from './scrambleCases';

interface OptionContent {
  text: string;
  feedback: string;
}

interface CaseContent {
  answer: string;
  decoys: string;
  context: string;
  clue: string;
  fact: string;
  move: {
    question: string;
    options: OptionContent[];
  };
}

const isCaseContent = (value: unknown): value is CaseContent =>
  typeof value === 'object' &&
  value !== null &&
  'answer' in value &&
  'move' in value;

export const localizeScrambleCases = (t: TFunction): ScrambleCase[] =>
  CASES.map((c) => {
    const content = t(`wordScramble.cases.${c.id}`, { returnObjects: true });
    if (!isCaseContent(content)) return c;
    return {
      ...c,
      answer: content.answer,
      decoys: content.decoys ?? c.decoys,
      context: content.context,
      clue: content.clue,
      fact: content.fact,
      move: {
        question: content.move.question,
        options: c.move.options.map((o, i) => ({
          ...o,
          text: content.move.options[i]?.text ?? o.text,
          feedback: content.move.options[i]?.feedback ?? o.feedback,
        })),
      },
    };
  });
