// Thin wrapper around the free Aladhan Prayer Times API (https://aladhan.com/prayer-times-api)
// — no API key required.

const BASE_URL = "https://api.aladhan.com/v1";

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerTimesResult {
  timings: PrayerTimings;
  readableDate: string;
  hijriDate: string;
}

export async function fetchPrayerTimesByCity(city: string, country: string): Promise<PrayerTimesResult> {
  const url = `${BASE_URL}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(
    country
  )}&method=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prayer times request failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status || "Prayer times API error");

  return {
    timings: json.data.timings,
    readableDate: json.data.date.readable,
    hijriDate: `${json.data.date.hijri.day} ${json.data.date.hijri.month.en} ${json.data.date.hijri.year} AH`,
  };
}
