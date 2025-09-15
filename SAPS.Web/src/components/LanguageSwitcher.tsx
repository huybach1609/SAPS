import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: "en" | "vi") => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className={`px-2 py-1 rounded ${i18n.resolvedLanguage === "en" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        onClick={() => changeLanguage("en")}
      >
        {t("language.english")}
      </button>
      <button
        className={`px-2 py-1 rounded ${i18n.resolvedLanguage === "vi" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        onClick={() => changeLanguage("vi")}
      >
        {t("language.vietnamese")}
      </button>
    </div>
  );
}


