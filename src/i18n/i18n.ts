import {
  format as formatDate,
  formatDistance,
  formatRelative,
  isDate,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// import all locales we need

const locales: { [key: string]: any } = {
  en: enUS,
}; // used to look up the required locale

// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    backend: {
      loadPath: `${__webpack_public_path__}locales/{{lng}}/{{ns}}.json`,
    },
    fallbackLng: 'en',
    load: 'languageOnly',
    debug: true,
    // add any namespaces you're using here for loading purposes
    ns: ['cos-ui'],
    defaultNS: 'cos-ui',
    nsSeparator: ':',
    keySeparator: '.',
    interpolation: {
      defaultVariables: undefined,
      escapeValue: false, // not needed for react as it escapes by default
      format: (value, format, lng) => {
        if (isDate(value) && format) {
          const locale = lng ? locales[lng] : enUS;
          if (format === 'short') return formatDate(value, 'P', { locale });
          if (format === 'long') return formatDate(value, 'PPPP', { locale });
          if (format === 'relative')
            return formatRelative(value, new Date(), { locale });
          if (format === 'ago')
            return formatDistance(value, new Date(), {
              locale,
              addSuffix: true,
            });

          return formatDate(value, format, { locale });
        }
        return value;
      },
    },
  });

export default i18n;
