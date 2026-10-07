export interface BannerSlideConfig {
  imageTransition: string;
  overlayHeight: string;
  overlayWidth: string;
  overlayPosition: string;
  overlayColor: string;
  overlayOpacity: string;
  headingAnimation: string;
  textAnimation: string;
  headingSize: string;
  textSize: string;
  spacing: string;
  typewriterSpeed: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkText: string;
  linkTarget: string;
  config: BannerSlideConfig;
  createdAt?: string;
}

export const defaultBannerConfig: BannerSlideConfig = {
  imageTransition: 'zoom',
  overlayHeight: '100%',
  overlayWidth: '100%',
  overlayPosition: 'bottom',
  overlayColor: '#000000',
  overlayOpacity: '0.4',
  headingAnimation: 'fade-in-up',
  textAnimation: 'fade-in-up',
  headingSize: 'text-[2rem] sm:text-5xl md:text-8xl',
  textSize: 'text-base sm:text-xl md:text-2xl',
  spacing: 'mb-4 md:mb-6',
  typewriterSpeed: 'normal',
};

const STORAGE_KEY = 'sacred_banners';

// LocalStorage helpers for reliable persistence (mirrors data/servicesData.ts).
// The Supabase project this app points to is intentionally offline/mocked, so
// banners must be able to live entirely in local storage or they never persist.
export const getStoredBanners = (): BannerItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading banners from localStorage', e);
    return [];
  }
};

export const saveStoredBanners = (banners: BannerItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  } catch (e) {
    console.warn('Failed saving banners to localStorage', e);
  }
};
