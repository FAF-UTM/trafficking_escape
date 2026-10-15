import type { TFunction } from 'i18next';
import {
  CASES,
  TACTICS,
  type ChoiceOption,
  type EmojiCase,
  type Tactic,
  type TacticId,
} from './emojiCases';

interface CaseContent {
  title: string;
  clues: string[];
  setup: string;
  thread: { text: string; note?: string }[];
  decode: {
    question: string;
    options: { text: string; feedback: string }[];
  };
  move: {
    options: { text: string; feedback: string }[];
  };
}

const isCaseContent = (value: unknown): value is CaseContent =>
  typeof value === 'object' &&
  value !== null &&
  'title' in value &&
  'thread' in value;

const stampOptions = (
  options: ChoiceOption[],
  localized?: { text: string; feedback: string }[]
): ChoiceOption[] =>
  options.map((o, i) => ({
    ...o,
    sourceIndex: i,
    text: localized?.[i]?.text ?? o.text,
    feedback: localized?.[i]?.feedback ?? o.feedback,
  }));

export const localizeTactics = (
  t: TFunction
): Record<TacticId, Tactic> => {
  const out = {} as Record<TacticId, Tactic>;
  for (const id of Object.keys(TACTICS) as TacticId[]) {
    out[id] = {
      emoji: TACTICS[id].emoji,
      name: t(`emojiDecoder.tactics.${id}.name`),
      description: t(`emojiDecoder.tactics.${id}.description`),
    };
  }
  return out;
};

export const localizeCases = (t: TFunction): EmojiCase[] =>
  CASES.map((c) => {
    const content = t(`emojiDecoder.cases.${c.id}`, {
      returnObjects: true,
    });
    if (!isCaseContent(content)) {
      return {
        ...c,
        decode: {
          ...c.decode,
          options: stampOptions(c.decode.options),
        },
        move: {
          options: stampOptions(c.move.options),
        },
      };
    }

    return {
      ...c,
      title: content.title,
      contact: {
        ...c.contact,
        clues: content.clues ?? c.contact.clues,
      },
      setup: content.setup,
      thread: c.thread.map((m, i) => ({
        ...m,
        text: content.thread[i]?.text ?? m.text,
        note: content.thread[i]?.note ?? m.note,
      })),
      decode: {
        ...c.decode,
        question: content.decode.question,
        options: stampOptions(c.decode.options, content.decode.options),
      },
      move: {
        options: stampOptions(c.move.options, content.move.options),
      },
    };
  });

/** Re-apply locale strings onto an active (possibly shuffled) case. */
export const relocalizeCase = (
  active: EmojiCase,
  fresh: EmojiCase
): EmojiCase => {
  const remap = (opts: ChoiceOption[], pool: ChoiceOption[]) =>
    opts.map((o) => {
      const idx = o.sourceIndex;
      const match =
        (idx !== undefined
          ? pool.find((p) => p.sourceIndex === idx)
          : undefined) ?? pool[idx ?? 0];
      if (!match) return o;
      return {
        ...o,
        text: match.text,
        feedback: match.feedback,
        sourceIndex: match.sourceIndex ?? o.sourceIndex,
      };
    });

  return {
    ...active,
    title: fresh.title,
    setup: fresh.setup,
    contact: {
      ...active.contact,
      clues: fresh.contact.clues,
    },
    thread: active.thread.map((m, i) => ({
      ...m,
      text: fresh.thread[i]?.text ?? m.text,
      note: fresh.thread[i]?.note ?? m.note,
    })),
    decode: {
      ...active.decode,
      question: fresh.decode.question,
      options: remap(active.decode.options, fresh.decode.options),
    },
    move: {
      options: remap(active.move.options, fresh.move.options),
    },
  };
};
