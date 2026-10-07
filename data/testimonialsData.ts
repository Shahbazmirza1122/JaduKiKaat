export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  imageUrl: string;
  service: string;
  quote: string;
  rating: number;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export const defaultTestimonials: TestimonialItem[] = [
  {
    id: 'client-1',
    name: 'Tariq Al-Mansoor',
    role: 'Community Director',
    location: 'Birmingham, UK',
    imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
    service: 'Istikhara & Guidance',
    quote: 'The Istikhara guidance brought tremendous calm and resolution to a difficult crossroad in our family business. Truly blessed by the sincerity.',
    rating: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-2',
    name: 'Fatima Zahra',
    role: 'Educator & Mother',
    location: 'Toronto, Canada',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=80',
    service: 'Spiritual Shifa & Peace',
    quote: 'After months of severe anxiety and restlessness at home, the customized Quranic verses and prayers restored tranquility into our living room.',
    rating: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-3',
    name: 'Dr. Zubair Farooqi',
    role: 'Consultant Physician',
    location: 'Dubai, UAE',
    imageUrl: 'https://images.unsplash.com/photo-1582233479366-6d38bc390a08?auto=format&fit=crop&w=400&q=80',
    service: 'Family Harmony',
    quote: 'The compassionate counsel and authentic dua amals helped bridge deep misunderstandings. A purely halal, dignified sanctuary for the soul.',
    rating: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-4',
    name: 'Maryam Al-Sabah',
    role: 'Software Engineer',
    location: 'Dallas, USA',
    imageUrl: 'https://images.unsplash.com/photo-1584999734482-0361aecad844?auto=format&fit=crop&w=400&q=80',
    service: 'Nazar Protection',
    quote: 'Everything was handled with utmost discretion and sacred care. I felt immediate spiritual relief and clarity within just a few days.',
    rating: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-5',
    name: 'Imran Qureshi',
    role: 'Business Owner',
    location: 'Manchester, UK',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    service: 'Job & Financial Success',
    quote: 'Within weeks of the prescribed wazaif, doors that had been closed for years finally opened. My business recovered beyond expectations.',
    rating: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-6',
    name: 'Ayesha Noor',
    role: 'Homemaker',
    location: 'Karachi, Pakistan',
    imageUrl: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=400&q=80',
    service: 'Jadu Ki Kaat',
    quote: 'We had tried everywhere for years. The sacred ruqyah finally broke what was holding our household back. May Allah reward this sincerity.',
    rating: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'sacred_testimonials';

// LocalStorage helpers for reliable persistence (mirrors data/servicesData.ts).
// The Supabase project this app points to is intentionally offline/mocked, so
// testimonials must be able to live entirely in local storage or they never persist.
export const getStoredTestimonials = (): TestimonialItem[] => {
  if (typeof window === 'undefined') return defaultTestimonials;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTestimonials));
      return defaultTestimonials;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading testimonials from localStorage', e);
    return defaultTestimonials;
  }
};

export const saveStoredTestimonials = (testimonials: TestimonialItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
  } catch (e) {
    console.warn('Failed saving testimonials to localStorage', e);
  }
};
