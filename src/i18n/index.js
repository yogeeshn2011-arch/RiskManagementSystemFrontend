import { createI18n } from 'vue-i18n';
import englishLabels from './label_en_IN.json';
import japaneseLabels from './label_ja_JP.json';
import englishMessages from './messages_en_IN.json';
import japaneseMessages from './messages_ja_JP.json';

/*
* This file is used to configure internationalization (i18n) for the application.
* It imports label and message files for different locales and merges them.
*
* The merged properties are then used to create an i18n instance.
* The default locale is set to 'ja_JP' (Japanese-Japan) and the fallback locale is also set to 'ja_JP'.
*
* @author Yogeesh Narasegowda
* @version 1.0
*/

// Merge labels and messages per locale
const englishProperties = { ...englishLabels, ...englishMessages };
const japaneseProperties = { ...japaneseLabels, ...japaneseMessages };
const choosenLocale = localStorage.getItem('user-locale') || 'ja_JP';

const i18n = createI18n({
  legacy: false,
  globalInjection: true, // Needed for global use
  locale: choosenLocale, // default locale
  flatJson: true,
  fallbackLocale: 'ja_JP', // fallback locale
  messages: {
    en_IN: englishProperties,
    ja_JP: japaneseProperties,
  }
});

export default i18n;
