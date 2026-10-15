import type { TFunction } from 'i18next';
import { ApiError, isNetworkError } from './api';

/**
 * Turns a failed request into a sentence the player can act on.
 * `invalidKey` is used for 400/401 responses, which mean "what you entered is wrong".
 */
export function describeError(
  error: unknown,
  t: TFunction,
  invalidKey: string
): string {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 401) return t(invalidKey);
    if (error.status === 429)
      return t('login.tooMany', { seconds: error.retryAfter ?? 60 });
    return t('login.generic');
  }
  if (isNetworkError(error)) return t('login.network');
  return t('login.generic');
}
