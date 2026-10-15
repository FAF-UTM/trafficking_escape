import type { TFunction } from 'i18next';
import { CARDS, type FlashCard } from './flashCards';

interface CardContent {
  concept: string;
  setup: string;
  statement: string;
  explanation: string;
  trapNote?: string;
}

const isCardContent = (value: unknown): value is CardContent =>
  typeof value === 'object' &&
  value !== null &&
  'statement' in value &&
  'explanation' in value;

export const localizeFlashCards = (t: TFunction): FlashCard[] =>
  CARDS.map((card) => {
    const content = t(`flashCards.cards.${card.id}`, { returnObjects: true });
    if (!isCardContent(content)) return card;
    return {
      ...card,
      concept: content.concept,
      setup: content.setup,
      statement: content.statement,
      explanation: content.explanation,
      trapNote: content.trapNote ?? card.trapNote,
    };
  });
