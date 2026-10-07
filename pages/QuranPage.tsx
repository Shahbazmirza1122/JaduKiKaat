import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Loader2,
  ArrowLeft,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchSurahList,
  fetchSurahDetail,
  FAMOUS_RECITERS,
  SurahMeta,
  SurahDetail,
} from "../services/quranApi";

const QuranPage: React.FC = () => {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [surahError, setSurahError] = useState<string | null>(null);

  const [reciter, setReciter] = useState(FAMOUS_RECITERS[0].identifier);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Not every reciter has a single continuous recording for a whole Surah,
  // but every reciter has per-Ayah recordings — so "Play Full Surah" is
  // implemented as auto-advancing through each Ayah's own audio file in
  // order, which works reliably for every reciter.
  const sequentialRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSurahList()
      .then(setSurahs)
      .catch(() => setListError("Could not load the list of Surahs. Please check your connection and try again."))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (selectedSurah == null) return;
    window.scrollTo(0, 0);
    setLoadingSurah(true);
    setSurahError(null);
    setSurahDetail(null);
    stopAudio();
    fetchSurahDetail(selectedSurah, reciter)
      .then(setSurahDetail)
      .catch(() => setSurahError("Could not load this Surah right now. Please try again."))
      .finally(() => setLoadingSurah(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurah, reciter]);

  // Track buffering so the UI can show a spinner instead of looking "stuck" —
  // the full-surah recording can be tens of megabytes, so there's a real
  // gap between pressing play and actual sound starting.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onPause = () => setIsBuffering(false);
    const onError = () => {
      setIsBuffering(false);
      setIsPlayingFull(false);
      setPlayingIndex(null);
    };
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const filteredSurahs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number).includes(q)
    );
  }, [surahs, search]);

  const stopAudio = () => {
    sequentialRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlayingFull(false);
    setPlayingIndex(null);
    setIsBuffering(false);
  };

  const playUrl = (url: string, onEnd: () => void) => {
    if (!audioRef.current) return;
    setIsBuffering(true);
    audioRef.current.src = url;
    audioRef.current.play().catch(() => setIsBuffering(false));
    audioRef.current.onended = onEnd;
  };

  // Plays the Ayah at `index`. When `sequential` is true, finishing one Ayah
  // automatically advances to the next — this is what powers "Play Full
  // Surah", since not every reciter has a single continuous recording for
  // the whole chapter, but every reciter has per-Ayah recordings.
  const playFromIndex = (index: number, sequential: boolean) => {
    const ayahs = surahDetail?.ayahs;
    if (!ayahs) return;
    if (index >= ayahs.length) {
      stopAudio();
      return;
    }
    const ayah = ayahs[index];
    if (!ayah.audioUrl) {
      if (sequential) playFromIndex(index + 1, true);
      else stopAudio();
      return;
    }
    sequentialRef.current = sequential;
    setPlayingIndex(index);
    playUrl(ayah.audioUrl, () => {
      if (sequentialRef.current) {
        playFromIndex(index + 1, true);
      } else {
        setPlayingIndex(null);
        setIsPlayingFull(false);
      }
    });
  };

  const toggleFullSurah = () => {
    if (!surahDetail) return;
    if (isPlayingFull) {
      stopAudio();
      return;
    }
    setIsPlayingFull(true);
    playFromIndex(0, true);
  };

  const toggleAyah = (index: number, audioUrl?: string) => {
    if (!audioUrl) return;
    if (playingIndex === index) {
      stopAudio();
      return;
    }
    setIsPlayingFull(false);
    playFromIndex(index, false);
  };

  const goToSurah = (num: number) => {
    stopAudio();
    setSelectedSurah(num);
  };

  const currentIndex = surahs.findIndex((s) => s.number === selectedSurah);
  const prevSurah = currentIndex > 0 ? surahs[currentIndex - 1] : null;
  const nextSurah = currentIndex >= 0 && currentIndex < surahs.length - 1 ? surahs[currentIndex + 1] : null;

  return (
    <div className="bg-white min-h-screen pt-[70px] md:pt-[136px] pb-20 relative overflow-hidden">
      <audio ref={audioRef} className="hidden" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {selectedSurah == null ? (
          <>
            {/* Header */}
            <div className="text-center mb-10 animate-fade-in pt-6">
              <span className="text-accent-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
                The Noble Qur'an
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-spirit-900 mb-4">Read Qur'an</h1>
              <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Browse all 114 Surahs with Arabic text and English translation. Listen to any Surah or
                individual Ayah recited by famous Qaris.
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Surah by name or number..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-accent-500 outline-none text-sm"
              />
            </div>

            {loadingList ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
              </div>
            ) : listError ? (
              <p className="text-center text-red-600 py-12">{listError}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                {filteredSurahs.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => goToSurah(s.number)}
                    className="group flex items-center gap-4 bg-white border border-spirit-100 hover:border-accent-400 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-all"
                  >
                    <span className="w-11 h-11 shrink-0 rounded-xl bg-spirit-900 text-white font-serif font-bold flex items-center justify-center group-hover:bg-accent-600 transition-colors">
                      {s.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif font-bold text-spirit-900 group-hover:text-accent-700 transition-colors truncate">
                        {s.englishName}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">
                        {s.englishNameTranslation} &middot; {s.numberOfAyahs} Ayahs
                      </span>
                    </span>
                    <span className="font-serif text-lg text-spirit-800 shrink-0" dir="rtl">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Reading view */}
            <button
              onClick={() => {
                stopAudio();
                setSelectedSurah(null);
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-spirit-700 hover:text-accent-700 mb-6 mt-4"
            >
              <ArrowLeft className="w-4 h-4" /> All Surahs
            </button>

            {loadingSurah ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
              </div>
            ) : surahError ? (
              <p className="text-center text-red-600 py-12">{surahError}</p>
            ) : surahDetail ? (
              <>
                {/* Surah header + controls */}
                <div className="bg-spirit-900 rounded-3xl p-6 sm:p-8 text-center text-white mb-8 shadow-xl">
                  <p className="text-accent-300 text-xs font-bold uppercase tracking-widest mb-2">
                    Surah {surahDetail.number} &middot; {surahDetail.revelationType} &middot; {surahDetail.numberOfAyahs} Ayahs
                  </p>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-1">{surahDetail.englishName}</h1>
                  <p className="text-slate-300 mb-5">{surahDetail.englishNameTranslation}</p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <select
                      value={reciter}
                      onChange={(e) => setReciter(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      {FAMOUS_RECITERS.map((r) => (
                        <option key={r.identifier} value={r.identifier} className="text-slate-900">
                          {r.englishName}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={toggleFullSurah}
                      disabled={isPlayingFull && isBuffering}
                      className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-lg disabled:opacity-80"
                    >
                      {isPlayingFull && isBuffering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isPlayingFull ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isPlayingFull && isBuffering
                        ? "Loading Recitation..."
                        : isPlayingFull
                        ? "Pause Recitation"
                        : "Play Full Surah"}
                    </button>
                  </div>
                </div>

                {/* Ayahs */}
                <div className="space-y-4 mb-10">
                  {surahDetail.ayahs.map((ayah, index) => (
                    <div
                      key={ayah.number}
                      className={`rounded-2xl border p-5 transition-colors ${
                        playingIndex === index
                          ? "border-accent-400 bg-accent-50"
                          : "border-spirit-100 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="w-8 h-8 shrink-0 rounded-full bg-spirit-100 text-spirit-900 text-xs font-bold flex items-center justify-center">
                          {ayah.numberInSurah}
                        </span>
                        {ayah.audioUrl && (
                          <button
                            onClick={() => toggleAyah(index, ayah.audioUrl)}
                            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-accent-700 hover:text-accent-900 bg-accent-50 hover:bg-accent-100 px-3 py-1.5 rounded-full transition"
                          >
                            {playingIndex === index && isBuffering ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : playingIndex === index ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                            {playingIndex === index && isBuffering
                              ? "Loading..."
                              : playingIndex === index
                              ? "Pause"
                              : "Listen"}
                          </button>
                        )}
                      </div>
                      <p dir="rtl" className="font-serif text-2xl sm:text-3xl leading-[2.4] text-right text-spirit-950 mb-3">
                        {ayah.arabicText}
                      </p>
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{ayah.translationText}</p>
                    </div>
                  ))}
                </div>

                {/* Prev / Next */}
                <div className="flex items-center justify-between pb-10">
                  <button
                    disabled={!prevSurah}
                    onClick={() => prevSurah && goToSurah(prevSurah.number)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-spirit-700 hover:text-accent-700 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" /> {prevSurah?.englishName || "Previous"}
                  </button>
                  <button
                    disabled={!nextSurah}
                    onClick={() => nextSurah && goToSurah(nextSurah.number)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-spirit-700 hover:text-accent-700 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {nextSurah?.englishName || "Next"} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default QuranPage;
