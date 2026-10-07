import React, { useEffect, useState } from "react";
import {
  Droplets,
  Clock,
  Search,
  Loader2,
  Volume2,
  Pause,
  CheckCircle2,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Sparkles,
} from "lucide-react";
import { fetchPrayerTimesByCity, PrayerTimesResult } from "../services/prayerTimesApi";
import { useSpeech } from "../hooks/useSpeech";

const wuduSteps = [
  "Begin with the intention (niyyah) to purify yourself for prayer, and say \"Bismillah\" (in the name of Allah).",
  "Wash both hands up to the wrists three times, making sure water passes between the fingers.",
  "Rinse the mouth three times, then sniff water into the nose and blow it out three times.",
  "Wash the entire face three times, from the hairline to the chin and ear to ear.",
  "Wash the right arm, then the left arm, up to and including the elbows, three times each.",
  "Wipe the entire head once with wet hands, then wipe the inside and back of both ears.",
  "Wash the right foot, then the left foot, up to and including the ankles, three times each, making sure water reaches between the toes.",
];

const dailyPrayers = [
  { name: "Fajr", icon: Moon, rakahs: "2 Sunnah + 2 Fard", window: "From dawn until just before sunrise" },
  { name: "Dhuhr", icon: Sun, rakahs: "4 Sunnah + 4 Fard + 2 Sunnah", window: "After the sun passes its zenith until Asr" },
  { name: "Asr", icon: CloudSun, rakahs: "4 Fard", window: "From mid-afternoon until just before sunset" },
  { name: "Maghrib", icon: Sunset, rakahs: "3 Fard + 2 Sunnah", window: "Immediately after sunset until the twilight fades" },
  { name: "Isha", icon: Moon, rakahs: "4 Fard + 2 Sunnah + Witr", window: "From the fading of twilight until dawn" },
];

const rakahSteps = [
  {
    title: "1. Takbeeratul Ihram (Opening Takbir)",
    body:
      "Face the Qiblah, raise both hands to shoulder or ear level, and say \"Allahu Akbar\" to formally enter the prayer. From this point, worldly speech and actions are set aside.",
  },
  {
    title: "2. Qiyam (Standing) & Recitation",
    body:
      "Fold your hands over your chest or abdomen and recite Surah Al-Fatiha, followed by another short Surah or set of verses in the first two rak'ahs.",
  },
  {
    title: "3. Ruku (Bowing)",
    body:
      "Say \"Allahu Akbar\" and bow so your back is straight and your hands rest on your knees, reciting \"Subhana Rabbiyal Adheem\" (Glory be to my Lord, the Most Great) at least three times.",
  },
  {
    title: "4. Rising from Ruku",
    body:
      "Stand up straight while saying \"Sami Allahu Liman Hamidah\" (Allah hears whoever praises Him), then \"Rabbana Lakal Hamd\" (Our Lord, all praise is for You).",
  },
  {
    title: "5. Sujood (Prostration)",
    body:
      "Say \"Allahu Akbar\" and lower yourself so your forehead, nose, palms, knees, and toes touch the ground, reciting \"Subhana Rabbiyal A'la\" (Glory be to my Lord, the Most High) at least three times.",
  },
  {
    title: "6. Sitting Between the Two Prostrations",
    body:
      "Rise briefly to a sitting position saying \"Allahu Akbar\", then perform a second prostration identical to the first.",
  },
  {
    title: "7. Tashahhud & Salam",
    body:
      "After the final rak'ah, sit and recite At-Tashahhud, followed by Durood upon the Prophet ﷺ, then conclude the prayer by turning the head right then left, saying \"As-salamu alaykum wa rahmatullah\" each time.",
  },
];

const commonMistakes = [
  "Rushing through Ruku and Sujood without settling calmly (tuma'ninah) in each position.",
  "Not facing the Qiblah accurately, especially when praying somewhere unfamiliar.",
  "Mumbling the recitation so quietly that even the person praying cannot hear themselves.",
  "Missing the fixed prayer times without a valid reason, rather than praying as early in the window as possible.",
  "Forgetting to pause briefly between the obligatory (Fard) and optional (Sunnah) units.",
];

const LearnToPrayPage: React.FC = () => {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [timings, setTimings] = useState<PrayerTimesResult | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);

  const { speak, pause, resume, stop, isSpeaking, isPaused, isSupported } = useSpeech();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFindTimes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !country.trim()) return;
    setLoadingTimes(true);
    setTimesError(null);
    setTimings(null);
    try {
      const result = await fetchPrayerTimesByCity(city.trim(), country.trim());
      setTimings(result);
    } catch {
      setTimesError("Could not find prayer times for that location. Please check the spelling and try again.");
    } finally {
      setLoadingTimes(false);
    }
  };

  const readAloudText = [
    "How to prepare for prayer with Wudu.",
    ...wuduSteps,
    "The step by step structure of a unit of prayer.",
    ...rakahSteps.map((s) => `${s.title}. ${s.body}`),
  ].join(" ");

  const handleListenToggle = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isSpeaking && isPaused) {
      resume();
    } else {
      speak(readAloudText);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in pt-6">
          <span className="text-accent-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
            Salah &middot; The Pillar of Faith
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-spirit-900 mb-4">Learn to Pray</h1>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A practical, step-by-step guide to performing Salah correctly &mdash; from purification through
            Wudu to completing a full unit of prayer &mdash; plus live prayer times for your city.
          </p>
          {isSupported && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={handleListenToggle}
                className="inline-flex items-center gap-2 bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg transition"
              >
                {isSpeaking && !isPaused ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking && !isPaused ? "Pause" : isSpeaking && isPaused ? "Resume" : "Listen to this Guide"}
              </button>
              {isSpeaking && (
                <button
                  onClick={stop}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 underline underline-offset-4"
                >
                  Stop
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live Prayer Times */}
        <div className="bg-spirit-900 rounded-3xl p-6 sm:p-8 text-white mb-14 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-accent-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold">Today's Prayer Times</h2>
          </div>
          <form onSubmit={handleFindTimes} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. London)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 placeholder:text-white/50 outline-none focus:ring-2 focus:ring-accent-500 text-sm"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country (e.g. UK)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 placeholder:text-white/50 outline-none focus:ring-2 focus:ring-accent-500 text-sm"
            />
            <button
              type="submit"
              disabled={loadingTimes}
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-60"
            >
              {loadingTimes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Find Times
            </button>
          </form>

          {timesError && (
            <p className="flex items-center gap-2 text-red-300 text-sm mb-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {timesError}
            </p>
          )}

          {timings && (
            <div className="animate-fade-in">
              <p className="text-accent-200 text-xs font-bold mb-4">
                {timings.readableDate} &middot; {timings.hijriDate}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {(
                  [
                    ["Fajr", timings.timings.Fajr],
                    ["Dhuhr", timings.timings.Dhuhr],
                    ["Asr", timings.timings.Asr],
                    ["Maghrib", timings.timings.Maghrib],
                    ["Isha", timings.timings.Isha],
                  ] as const
                ).map(([label, time]) => (
                  <div key={label} className="bg-white/10 border border-white/10 rounded-xl p-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-accent-200">{label}</p>
                    <p className="font-serif text-lg font-bold">{time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5 Daily Prayers overview */}
        <div className="mb-14">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-spirit-900 mb-6 text-center">
            The Five Daily Prayers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {dailyPrayers.map((p) => (
              <div
                key={p.name}
                className="bg-spirit-50 border border-spirit-100 rounded-2xl p-5 text-center hover:border-accent-300 hover:shadow-md transition-all"
              >
                <p.icon className="w-7 h-7 text-accent-600 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-spirit-900 mb-1">{p.name}</h3>
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{p.window}</p>
                <span className="text-[11px] font-bold text-accent-700 bg-accent-500/10 px-2 py-0.5 rounded-full">
                  {p.rakahs}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wudu */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Droplets className="w-6 h-6 text-accent-600" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-spirit-900">
              Step 1: Purification (Wudu)
            </h2>
          </div>
          <div className="space-y-3">
            {wuduSteps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start bg-white border border-spirit-100 rounded-2xl p-4">
                <span className="w-8 h-8 shrink-0 rounded-full bg-spirit-900 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rakah walkthrough */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Sparkles className="w-6 h-6 text-accent-600" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-spirit-900">
              Step 2: Performing a Unit of Prayer (Rak'ah)
            </h2>
          </div>
          <div className="space-y-4">
            {rakahSteps.map((s) => (
              <div key={s.title} className="bg-spirit-50 border border-spirit-100 rounded-2xl p-5">
                <h3 className="font-serif font-bold text-spirit-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common mistakes */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-spirit-900 mb-6 text-center">
            Common Mistakes to Avoid
          </h2>
          <div className="bg-white border border-spirit-100 rounded-2xl p-6 space-y-3">
            {commonMistakes.map((m, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-4 h-4 text-accent-600 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">{m}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnToPrayPage;
