import type { TFunction } from 'i18next';
import {
  CASES,
  TACTICS,
  type DangerCase,
  type TacticId,
  type TacticInfo,
} from './dangerCases';

interface SegmentContent {
  text: string;
  note?: string;
  clearNote?: string;
}

interface CaseContent {
  title: string;
  setup: string;
  segments: SegmentContent[];
}

interface TacticContent {
  name: string;
  description: string;
}

const isCaseContent = (value: unknown): value is CaseContent =>
  typeof value === 'object' &&
  value !== null &&
  'segments' in value &&
  Array.isArray((value as CaseContent).segments);

export const localizeDangerTactics = (
  t: TFunction
): Record<TacticId, TacticInfo> => {
  const out = {} as Record<TacticId, TacticInfo>;
  for (const id of Object.keys(TACTICS) as TacticId[]) {
    const content = t(`dangerWord.tactics.${id}`, {
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

export const localizeDangerCases = (t: TFunction): DangerCase[] =>
  CASES.map((c) => {
    const content = t(`dangerWord.cases.${c.id}`, { returnObjects: true });
    if (!isCaseContent(content)) return c;
    return {
      ...c,
      title: content.title,
      setup: content.setup,
      segments: c.segments.map((seg, i) => ({
        ...seg,
        text: content.segments[i]?.text ?? seg.text,
        note: content.segments[i]?.note ?? seg.note,
        clearNote: content.segments[i]?.clearNote ?? seg.clearNote,
      })),
    };
  });
