import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import viCommon from "@/locales/vi/common.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "vi"],
    interpolation: { escapeValue: false },
    resources: {
      en: { common: enCommon },
      vi: { common: viCommon },
    },
    defaultNS: "common",
    ns: ["common"],
    detection: {
      // order and from where user language should be detected
      order: ["querystring", "localStorage", "navigator"],
      // keys or params to lookup language from
      lookupQuerystring: "lng",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
  });

export default i18n;


