export type Locale = "vi" | "en";

const STORAGE_KEY = "croptalk-garden-locale";

export function getSavedLocale(): Locale {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "vi";
  } catch {
    return "vi";
  }
}

export function saveLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Locale still changes for this session when browser storage is unavailable.
  }
}

export function translateText(value: string, locale: Locale, dictionary: Record<string, string>): string {
  if (locale === "vi") return value;
  return Object.entries(dictionary)
    .sort(([left], [right]) => right.length - left.length)
    .reduce((text, [source, translated]) => text.split(source).join(translated), value);
}
