// i18n.tsx
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEnglish from './lang/en.json';
import translationNetherland from './lang/nl.json';
import emojiDecoderContentEn from './lang/emojiDecoderContent.en.json';
import emojiDecoderContentNl from './lang/emojiDecoderContent.nl.json';
import whoToTrustContentEn from './lang/whoToTrustContent.en.json';
import whoToTrustContentNl from './lang/whoToTrustContent.nl.json';
import flashCardsContentEn from './lang/flashCardsContent.en.json';
import flashCardsContentNl from './lang/flashCardsContent.nl.json';
import dangerWordContentEn from './lang/dangerWordContent.en.json';
import dangerWordContentNl from './lang/dangerWordContent.nl.json';
import wordChoiceContentEn from './lang/wordChoiceContent.en.json';
import wordChoiceContentNl from './lang/wordChoiceContent.nl.json';
import wordScrambleContentEn from './lang/wordScrambleContent.en.json';
import wordScrambleContentNl from './lang/wordScrambleContent.nl.json';

type TranslationTree = Record<string, unknown>;

const withCaseContent = (
  base: TranslationTree,
  packs: { section: string; content: TranslationTree }[]
): TranslationTree => {
  let next = { ...base };
  for (const { section, content } of packs) {
    next = {
      ...next,
      [section]: {
        ...((next[section] as TranslationTree) ?? {}),
        ...content,
      },
    };
  }
  return next;
};

const enPacks = [
  { section: 'emojiDecoder', content: emojiDecoderContentEn as TranslationTree },
  { section: 'whoToTrust', content: whoToTrustContentEn as TranslationTree },
  { section: 'flashCards', content: flashCardsContentEn as TranslationTree },
  { section: 'dangerWord', content: dangerWordContentEn as TranslationTree },
  { section: 'wordChoice', content: wordChoiceContentEn as TranslationTree },
  { section: 'wordScramble', content: wordScrambleContentEn as TranslationTree },
];

const nlPacks = [
  { section: 'emojiDecoder', content: emojiDecoderContentNl as TranslationTree },
  { section: 'whoToTrust', content: whoToTrustContentNl as TranslationTree },
  { section: 'flashCards', content: flashCardsContentNl as TranslationTree },
  { section: 'dangerWord', content: dangerWordContentNl as TranslationTree },
  { section: 'wordChoice', content: wordChoiceContentNl as TranslationTree },
  { section: 'wordScramble', content: wordScrambleContentNl as TranslationTree },
];

const resources = {
  en: {
    translation: withCaseContent(
      translationEnglish as TranslationTree,
      enPacks
    ),
  },
  nl: {
    translation: withCaseContent(
      translationNetherland as TranslationTree,
      nlPacks
    ),
  },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'nl'],
    // Prefer "nl" over "nl-NL" so bundled resources match.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

i18next.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18next;
