import type { TFunction } from 'i18next';
import { CASES, type Contact, type TrustCase } from './trustCases';

interface ContactContent {
  name: string;
  handle?: string;
  role: string;
  clues: string[];
  feedback: string;
}

interface CaseContent {
  title: string;
  concept: string;
  conceptExplain: string;
  situation: string;
  question: string;
  lesson: string;
  contacts: Record<string, ContactContent>;
}

const isCaseContent = (value: unknown): value is CaseContent =>
  typeof value === 'object' &&
  value !== null &&
  'title' in value &&
  'contacts' in value;

const localizeContact = (
  contact: Contact,
  content: ContactContent | undefined
): Contact => {
  if (!content) return contact;
  return {
    ...contact,
    name: content.name,
    handle: content.handle ?? contact.handle,
    role: content.role,
    clues: content.clues ?? contact.clues,
    feedback: content.feedback,
  };
};

export const localizeTrustCases = (t: TFunction): TrustCase[] =>
  CASES.map((c) => {
    const content = t(`whoToTrust.cases.${c.id}`, { returnObjects: true });
    if (!isCaseContent(content)) return c;
    return {
      ...c,
      title: content.title,
      concept: content.concept,
      conceptExplain: content.conceptExplain,
      situation: content.situation,
      question: content.question,
      lesson: content.lesson,
      contacts: c.contacts.map((contact) =>
        localizeContact(contact, content.contacts[contact.id])
      ),
    };
  });
