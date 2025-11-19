import { useCallback } from 'react';
import i18n from '../localization/i18n';

export const useLocalization = () => {
  const t = useCallback((key: string, options?: any) => {
    return i18n.t(key, options);
  }, []);

  const changeLanguage = useCallback((locale: string) => {
    i18n.locale = locale;
  }, []);

  const getCurrentLanguage = useCallback(() => {
    return i18n.locale;
  }, []);

  const isSpanish = useCallback(() => {
    return i18n.locale === 'es';
  }, []);

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isSpanish,
    locale: i18n.locale,
  };
};

export default useLocalization;