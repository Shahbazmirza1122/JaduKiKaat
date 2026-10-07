// Wrapper around the free, public-domain fawazahmed0/hadith-api (jsDelivr CDN).
// Only ever fetches ONE chapter/section at a time — the full-book files are
// several MB each, so per-section fetching keeps the app fast.

export interface HadithEntry {
  number: number;
  arabicNumber: number | string;
  text: string;
  reference: string;
}

export interface HadithSectionResult {
  title: string;
  hadiths: HadithEntry[];
}

const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

const cache = new Map<string, HadithSectionResult>();

export async function fetchHadithSection(
  edition: string,
  sectionNumber: number
): Promise<HadithSectionResult | null> {
  const cacheKey = `${edition}/${sectionNumber}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`${BASE_URL}/${edition}/sections/${sectionNumber}.json`);
    if (!res.ok) return null;
    const data = await res.json();

    const sectionTitles: Record<string, string> = data?.metadata?.section || {};
    const title = sectionTitles[String(sectionNumber)] || `Chapter ${sectionNumber}`;

    const hadiths: HadithEntry[] = Array.isArray(data?.hadiths)
      ? data.hadiths.map((h: any) => ({
          number: h.hadithnumber,
          arabicNumber: h.arabicnumber,
          text: (h.text || '').trim(),
          reference: h.reference ? `Book ${h.reference.book}, Hadith ${h.reference.hadith}` : '',
        }))
      : [];

    const result: HadithSectionResult = { title, hadiths };
    cache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}
