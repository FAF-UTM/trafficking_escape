import type { TFunction } from 'i18next';
import {
  CASES,
  TACTICS,
  type TacticId,
  type TacticInfo,
  type WordCase,
} from './wordCases';

interface OptionContent {
  word: string;
  feedback: string;
}

interface CaseContent {
  context: string;
  sentence: string;
  options: OptionContent[];
}

interface TacticContent {
  name: string;
  description: string;
}

const isCaseContent = (value: unknown): value is CaseContent =>
  typeof value === 'object' &&
  value !== null &&
  'options' in value &&
  Array.isArray((value as CaseContent).options);

export const localizeWordChoiceTactics = (
  t: TFunction
): Record<TacticId, TacticInfo> => {
  const out = {} as Record<TacticId, TacticInfo>;
  for (const id of Object.keys(TACTICS) as TacticId[]) {
    const content = t(`wordChoice.tactics.${id}`, {
      returnObjects: true,
    }) as TacticContent | string;
    out[id] = {
      emoji: TACTICS[id].emoji,
      name:
        typeof content === 'object' && content?.name
          ? content.name
          : TACTICS[id].name,
      description:
        typeof content === 'object' && content?.description
          ? content.description
          : TACTICS[id].description,
    };
  }
  return out;
};

export const localizeWordChoiceCases = (t: TFunction): WordCase[] =>
  CASES.map((c) => {
    const content = t(`wordChoice.cases.${c.id}`, { returnObjects: true });
    if (!isCaseContent(content)) return c;
    return {
      ...c,
      context: content.context,
      sentence: content.sentence,
      options: c.options.map((o, i) => ({
        ...o,
        word: content.options[i]?.word ?? o.word,
        feedback: content.options[i]?.feedback ?? o.feedback,
      })),
    };
  });
