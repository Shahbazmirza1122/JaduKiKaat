// Thin wrapper around the free AlQuran Cloud API (https://alquran.cloud/api) —
// no API key required. Used to power the "Read Quran" page: surah list,
// Arabic text + English translation, and per-reciter audio.

const BASE_URL = "https://api.alquran.cloud/v1";

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  arabicText: string;
  translationText: string;
  audioUrl?: string;
  juz: number;
  page: number;
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
}

// A curated shortlist of well-known, famous reciters (full list from the API
// includes dozens of lesser-known ones — these are the ones most listeners
// recognize by name).
export const FAMOUS_RECITERS: Reciter[] = [
  { identifier: "ar.alafasy", name: "مشاري العفاسي", englishName: "Mishary Rashid Alafasy" },
  { identifier: "ar.husary", name: "محمود خليل الحصري", englishName: "Mahmoud Khalil Al-Husary" },
  { identifier: "ar.abdulsamad", name: "عبدالباسط عبدالصمد", englishName: "Abdul Basit Abdul Samad" },
  { identifier: "ar.abdurrahmaansudais", name: "عبدالرحمن السديس", englishName: "Abdur-Rahman As-Sudais" },
  { identifier: "ar.shaatree", name: "أبو بكر الشاطري", englishName: "Abu Bakr Al-Shatri" },
  { identifier: "ar.ahmedajamy", name: "أحمد بن علي العجمي", englishName: "Ahmed Al-Ajamy" },
];

const cache = new Map<string, any>();

async function getJson<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quran API request failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status || "Quran API error");
  cache.set(url, json.data);
  return json.data;
}

export async function fetchSurahList(): Promise<SurahMeta[]> {
  return getJson<SurahMeta[]>(`${BASE_URL}/surah`);
}

/**
 * Fetches a surah's Arabic text + English translation, merged ayah-by-ayah.
 * Optionally also merges per-ayah audio URLs for the given reciter.
 */
export async function fetchSurahDetail(
  surahNumber: number,
  reciterIdentifier: string = "ar.alafasy"
): Promise<SurahDetail> {
  const [combined, audioData] = await Promise.all([
    getJson<any[]>(`${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`),
    getJson<any>(`${BASE_URL}/surah/${surahNumber}/${reciterIdentifier}`),
  ]);

  const [arabicEdition, translationEdition] = combined;
  const audioByNumber = new Map<number, string>(
    (audioData.ayahs || []).map((a: any) => [a.numberInSurah, a.audio])
  );

  const ayahs: Ayah[] = arabicEdition.ayahs.map((a: any, idx: number) => ({
    number: a.number,
    numberInSurah: a.numberInSurah,
    arabicText: a.text,
    translationText: translationEdition.ayahs[idx]?.text ?? "",
    audioUrl: audioByNumber.get(a.numberInSurah),
    juz: a.juz,
    page: a.page,
  }));

  return {
    number: arabicEdition.number,
    name: arabicEdition.name,
    englishName: arabicEdition.englishName,
    englishNameTranslation: arabicEdition.englishNameTranslation,
    numberOfAyahs: arabicEdition.numberOfAyahs,
    revelationType: arabicEdition.revelationType,
    ayahs,
  };
}
