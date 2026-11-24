// Shared language options for client and server.
export const studyLanguages = [
  [
    "original",
    "Original language",
    "Keep the source language."
  ],
  [
    "en",
    "English",
    "Write in English."
  ],
  [
    "es",
    "Español",
    "Write in Spanish."
  ],
  [
    "fr",
    "Français",
    "Write in French."
  ],
  [
    "de",
    "Deutsch",
    "Write in German."
  ],
  [
    "pt",
    "Português",
    "Write in Portuguese."
  ],
  [
    "ar",
    "العربية",
    "Write in Arabic."
  ],
  [
    "zh",
    "中文",
    "Write in Simplified Chinese."
  ],
  [
    "hi",
    "हिन्दी",
    "Write in Hindi."
  ],
  [
    "id",
    "Bahasa Indonesia",
    "Write in Indonesian."
  ],
  [
    "ms",
    "Bahasa Melayu",
    "Write in Malay."
  ],
  [
    "ja",
    "日本語",
    "Write in Japanese."
  ],
  [
    "ko",
    "한국어",
    "Write in Korean."
  ],
  [
    "vi",
    "Tiếng Việt",
    "Write in Vietnamese."
  ],
  [
    "th",
    "ไทย",
    "Write in Thai."
  ],
  [
    "tr",
    "Türkçe",
    "Write in Turkish."
  ],
  [
    "bn",
    "বাংলা",
    "Write in Bengali."
  ],
  [
    "ru",
    "Русский",
    "Write in Russian."
  ]
] as const;
export type StudyLanguage = (typeof studyLanguages)[number][0];
export const studyLanguageCodes = studyLanguages.map(entry => entry[0]) as [StudyLanguage, ...StudyLanguage[]];
