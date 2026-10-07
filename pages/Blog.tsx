
import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, CircleX, Book, ChevronLeft, ChevronRight, Globe, Bookmark, MessageSquare, Eye, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';
import { usePageSections } from '../hooks/usePageSections';
import DynamicSection from '../components/DynamicSection';

// --- Dummy Data for Demonstration ---
import { BlogSectionsRenderer } from '../components/BlogSectionsRenderer';

const dummyLatestPost: BlogPost = {
  id: 'd1',
  title: "Finding Stillness: The Power of a Silent Heart in a Noisy World",
  excerpt: "In an age of constant distraction, the ancient practice of cultivating inner silence offers a profound sanctuary. Discover how to quiet the mind, connect with your soul, and find unshakable peace amidst the chaos of modern life.",
  content: "Full content here...",
  author: "Imam Al-Ghazali",
  date: "July 28, 2024",
  imageUrl: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=80&w=1920&auto=format&fit=crop",
  category: "Mindfulness",
  isLatest: true
};

const dummyOtherPosts: BlogPost[] = [
  {
    id: 'd2',
    title: "The Alchemy of Dua: Turning Desires into Divine Connection",
    excerpt: "Dua is not merely a list of requests; it is the soul's conversation with its Creator. Learn how to transform your supplications into a powerful tool for spiritual growth and manifestation.",
    content: "...",
    author: "Rumi",
    date: "July 22, 2024",
    imageUrl: "https://images.unsplash.com/photo-1593225232335-3738b6f35334?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality"
  },
  {
    id: 'd3',
    title: "Decoding Dreams: A Spiritual Guide to Your Inner World",
    excerpt: "Our dreams are a sacred bridge to the subconscious and the unseen. This guide provides an introduction to interpreting dream symbols from a spiritual perspective.",
    content: "...",
    author: "Ibn Sirin",
    date: "July 15, 2024",
    imageUrl: "https://images.unsplash.com/photo-1532325329166-d9b9333a469a?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  },
  {
    id: 'd4',
    title: "The Evil Eye: Understanding and Protection in the Modern Age",
    excerpt: "Explore the ancient concept of the 'evil eye' (Nazar) and discover practical spiritual remedies and daily practices to protect your energy and blessings from envy.",
    content: "...",
    author: "Jaadu ki kaat",
    date: "July 08, 2024",
    imageUrl: "https://images.unsplash.com/photo-1559819225-3b2a578358ab?q=80&w=800&auto=format&fit=crop",
    category: "Protection"
  },
   {
    id: 'd5',
    title: "Gratitude as a Gateway to Abundance",
    excerpt: "Shifting your focus from what's lacking to what you have is the first step towards attracting more blessings. Learn the spiritual mechanics of gratitude (Shukr).",
    content: "...",
    author: "Yasmin Mogahed",
    date: "July 01, 2024",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality"
  },
  {
    id: 'd6',
    title: "Warding Off Whispers: A Guide to Overcoming Waswasa",
    excerpt: "Intrusive thoughts (waswasa) can disturb our peace and worship. Discover Quranic and Prophetic methods to find refuge and regain mental clarity and focus.",
    content: "...",
    author: "Imam An-Nawawi",
    date: "June 24, 2024",
    imageUrl: "https://images.unsplash.com/photo-1542382257-80ded14b0a88?q=80&w=800&auto=format&fit=crop",
    category: "Protection"
  },
   {
    id: 'd7',
    title: "The Healing Power of Forgiveness",
    excerpt: "Holding onto resentment is a heavy spiritual burden. Explore the transformative power of forgiveness for others and for oneself as a path to inner freedom.",
    content: "...",
    author: "Rumi",
    date: "June 17, 2024",
    imageUrl: "https://images.unsplash.com/photo-1519415943484-2fa18734d0ac?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  },
  {
    id: 'd8',
    title: "The Gentle Art of Sabr: Finding Strength in Patience",
    excerpt: "Sabr (patience) is more than just waiting; it is a state of active endurance and trust in the divine plan. Learn how to cultivate this beautiful virtue to navigate life's trials with grace.",
    content: "...",
    author: "Ibn Qayyim Al-Jawziyya",
    date: "June 10, 2024",
    imageUrl: "https://images.unsplash.com/photo-1543373014-cfe4f4bc1cdf?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  }
];

const Blog: React.FC = () => {
  const { sections: pageSections } = usePageSections('/blog');
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [gridPosts, setGridPosts] = useState<BlogPost[]>([]);
  const [allPagePosts, setAllPagePosts] = useState<BlogPost[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLang, setCurrentLang] = useState<'en' | 'ur'>('en');
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);

  const categoryFilter = searchParams.get('category');
  const searchFilter = searchParams.get('search');

  const toggleBookmark = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedBookmarks(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleLanguageToggle = () => {
    const newLang = currentLang === 'en' ? 'ur' : 'en';
    
    // Google Translate uses .goog-te-combo to change language programmatically
    const gtSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (gtSelect) {
      gtSelect.value = newLang;
      gtSelect.dispatchEvent(new Event('change'));
      setCurrentLang(newLang);
    } else {
      setTimeout(() => {
        const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (retrySelect) {
            retrySelect.value = newLang;
            retrySelect.dispatchEvent(new Event('change'));
            setCurrentLang(newLang);
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (!categoryFilter && !searchFilter) {
        window.scrollTo(0, 0);
    }

    const fetchPosts = async () => {
        setLoading(true);
        
        let query = supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .neq('category', '_page_section_')
            .neq('category', '_form_lead_')
            .neq('category', '_banner_')
            .neq('category', '_blog_section_')
            .order('created_at', { ascending: false });

        try {
            const [postsRes, sectionsRes] = await Promise.all([
              query,
              supabase.from('posts').select('*').eq('category', '_blog_section_').order('created_at', { ascending: true })
            ]);
            
            let rawPosts: BlogPost[];
            if (postsRes.error || !postsRes.data || postsRes.data.length === 0) {
                rawPosts = [dummyLatestPost, ...dummyOtherPosts];
            } else {
                const allParsed = (postsRes.data || []).map((p: any) => ({
                    ...p,
                    imageUrl: p.image_url || p.imageUrl,
                    relatedIds: p.related_ids || p.relatedIds,
                    isLatest: p.is_latest || p.isLatest
                }));
                
                const validPagePosts = allParsed.filter(p => p.status !== 'draft');
                setAllPagePosts(validPagePosts);
                
                rawPosts = allParsed.filter((p: any) => {
                  let displaySection = 'all';
                  try {
                      if (p.relatedIds) {
                         const idData = Array.isArray(p.relatedIds) ? p.relatedIds[0] : p.relatedIds;
                         if (idData && typeof idData === 'string') {
                             const config = JSON.parse(idData);
                             displaySection = config.displaySection || 'all';
                         }
                      }
                  } catch(e) {}
                  
                  return !(displaySection && displaySection !== 'all');
                });

                if (rawPosts.length === 0) {
                  rawPosts = [dummyLatestPost, ...dummyOtherPosts];
                }
            }

            setAllPosts(rawPosts);

            if (sectionsRes.data) {
                 const allSections = sectionsRes.data.map(s => {
                     let config: any = {};
                     try { config = JSON.parse(s.content) } catch(e) {}
                     return { id: s.id, title: s.title, subtitle: s.excerpt, config };
                 });
                 setSections(allSections.filter(s => {
                     const pages = s.config.displayPages || (s.config.displayPage ? [s.config.displayPage] : ['all']);
                     return pages.includes('blog') || pages.includes('all');
                 }));
            }

            // Apply filters
            let filtered = [...rawPosts];
            if (categoryFilter) {
              filtered = filtered.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
            }

            if (searchFilter) {
                const lowerQ = searchFilter.toLowerCase();
                filtered = filtered.filter(p => 
                    p.title.toLowerCase().includes(lowerQ) || 
                    (p.content && p.content.toLowerCase().includes(lowerQ)) ||
                    p.excerpt.toLowerCase().includes(lowerQ)
                );
            }

            // Top 3 featured cards
            if (!categoryFilter && !searchFilter) {
              const top3 = filtered.slice(0, 3);
              // Ensure we always have 3 cards if possible
              if (top3.length < 3) {
                const fallbackSources = [dummyLatestPost, ...dummyOtherPosts];
                for (const fb of fallbackSources) {
                  if (top3.length < 3 && !top3.some(item => item.id === fb.id)) {
                    top3.push(fb);
                  }
                }
              }
              setFeaturedPosts(top3);
              setGridPosts(filtered.slice(3));
            } else {
              setFeaturedPosts(filtered.slice(0, 3));
              setGridPosts(filtered.slice(3));
            }
        } catch (err) {
            console.warn("Blog posts fetch failed. Using fallback dummy data");
            const rawPosts = [dummyLatestPost, ...dummyOtherPosts];
            setAllPosts(rawPosts);
            
            let filtered = [...rawPosts];
            if (categoryFilter) {
              filtered = filtered.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
            }
            if (searchFilter) {
                const lowerQ = searchFilter.toLowerCase();
                filtered = filtered.filter(p => 
                    p.title.toLowerCase().includes(lowerQ) || 
                    p.excerpt.toLowerCase().includes(lowerQ)
                );
            }
            setFeaturedPosts(filtered.slice(0, 3));
            setGridPosts(filtered.slice(3));
        }
        
        setLoading(false);
    };

    fetchPosts();
  }, [categoryFilter, searchFilter]);

  const clearFilters = () => {
      setSearchParams({});
  };

  const handleCategoryClick = (catName: string) => {
    if (catName === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: catName });
    }
  };

  // Compute unique categories with counts from allPosts
  const categoryCounts: { [key: string]: number } = {};
  allPosts.forEach(p => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  const categoriesList = [
    { id: 'all', name: 'All', count: allPosts.length },
    ...Object.keys(categoryCounts).map(cat => ({
      id: cat,
      name: cat,
      count: categoryCounts[cat]
    }))
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-[130px] md:pt-[150px] pb-24 relative overflow-hidden">
      
      {/* Background Ambient Warm & Sanctuary Glows */}
      <div className="absolute top-20 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-spirit-300/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-1/4 translate-x-1/2 w-[550px] h-[550px] bg-amber-400/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Section (Centered Title & Subtitle Matching Reference Layout) */}
        <div className="text-center mb-10 pt-2 sm:pt-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-spirit-900 text-xs sm:text-sm font-medium mb-4 shadow-sm border border-spirit-200/80">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Sacred Insights & Prophetic Healing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-spirit-900 tracking-tight">
            Your Gateway to Spiritual Wisdom
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3 font-light leading-relaxed">
            Illuminating Stories, Authentic Duas & Prophetic Guidance from Across the Ummah
          </p>

          {/* Translation Toggle Button */}
          <div className="mt-4 flex justify-center">
            <button 
                onClick={handleLanguageToggle}
                className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-xs border border-spirit-200 hover:bg-spirit-50 transition-colors text-xs font-semibold text-spirit-800"
            >
                <Globe className="w-3.5 h-3.5 text-spirit-600" />
                <span>{currentLang === 'en' ? 'Translate to Urdu' : 'Switch to English'}</span>
            </button>
          </div>
        </div>

        {/* Active Filter Pill */}
        {(categoryFilter || searchFilter) && (
            <div className="mb-8 flex justify-center">
                <div className="bg-white px-6 py-2.5 rounded-full shadow-sm border border-spirit-200 flex items-center gap-3 animate-fade-in">
                    <span className="text-gray-500 text-xs font-medium">Active filter:</span>
                    {categoryFilter && (
                      <span className="bg-spirit-100 text-spirit-900 px-3 py-1 rounded-full text-xs font-bold">
                        Category: {categoryFilter}
                      </span>
                    )}
                    {searchFilter && (
                      <span className="bg-spirit-100 text-spirit-900 px-3 py-1 rounded-full text-xs font-bold">
                        Search: "{searchFilter}"
                      </span>
                    )}
                    <button onClick={clearFilters} className="text-gray-400 hover:text-red-500 ml-1 transition-colors" title="Clear filter">
                        <CircleX size={18} />
                    </button>
                </div>
            </div>
        )}

        {loading ? (
             <div className="py-12 animate-pulse space-y-8">
                {/* 3 Featured Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-[480px] bg-slate-200 rounded-[28px] relative overflow-hidden p-4 flex flex-col justify-end">
                      <div className="bg-white/80 rounded-2xl p-5 space-y-3">
                        <div className="h-4 w-24 bg-slate-300 rounded-full"></div>
                        <div className="h-6 w-full bg-slate-300 rounded"></div>
                        <div className="h-3 w-3/4 bg-slate-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
        ) : (
            <>
              {/* --- 3 Featured Cards Grid (Matching the Reference Image Layout) --- */}
              {featuredPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
                  {featuredPosts.map((post, idx) => {
                    const commentsCount = 14 + (idx * 9);
                    const viewsCount = `${(1.2 + (idx * 0.6)).toFixed(1)}k`;
                    const readTime = `${4 + (idx % 3)} mins read`;

                    return (
                      <div 
                        key={post.id || idx}
                        className="relative rounded-[28px] overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-500 h-[470px] sm:h-[490px] flex flex-col justify-end bg-spirit-900"
                      >
                        {/* Background Image */}
                        <img 
                          src={post.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e"} 
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* Gradient Shadow Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-spirit-950/80 via-spirit-900/25 to-transparent pointer-events-none" />

                        {/* Floating Frosted Glass Overlapping Card (Exact Style of Reference) */}
                        <div className="relative z-10 m-3 sm:m-4 bg-white/92 backdrop-blur-md rounded-2xl sm:rounded-[22px] p-5 sm:p-6 border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:bg-white/98">
                          
                          {/* Top Meta Line: Category pill + Date + Read Time + Bookmark */}
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-spirit-50 text-spirit-800 border border-spirit-200">
                                {post.category || 'Wisdom'}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 text-xs font-light">{post.date || 'July 2024'}</span>
                              <span className="text-slate-300 hidden sm:inline">•</span>
                              <span className="text-slate-500 text-xs font-light hidden sm:inline">{readTime}</span>
                            </div>

                            <button 
                              onClick={(e) => toggleBookmark(e, post.id)}
                              className="p-1 text-slate-400 hover:text-spirit-700 transition-colors"
                              title="Bookmark story"
                            >
                              <Bookmark 
                                className={`w-4 h-4 transition-transform hover:scale-110 ${
                                  savedBookmarks.includes(post.id) ? 'fill-spirit-700 text-spirit-700' : ''
                                }`} 
                              />
                            </button>
                          </div>

                          {/* Title */}
                          <Link to={`/blog/${post.id}`} className="block">
                            <h3 className="font-serif font-bold text-spirit-900 text-lg sm:text-xl line-clamp-2 leading-snug group-hover:text-spirit-700 transition-colors">
                              {post.title}
                            </h3>
                          </Link>

                          {/* Excerpt */}
                          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 font-light leading-relaxed mt-2 mb-4">
                            {post.excerpt}
                          </p>

                          {/* Bottom Row: Comments, Views, and Circular Arrow Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1.5" title={`${commentsCount} comments`}>
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                <span>{commentsCount}</span>
                              </span>
                              <span className="flex items-center gap-1.5" title={`${viewsCount} views`}>
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>{viewsCount}</span>
                              </span>
                            </div>

                            <Link 
                              to={`/blog/${post.id}`}
                              className="w-9 h-9 rounded-full bg-spirit-900 text-white flex items-center justify-center shadow-md group-hover:bg-accent-600 group-hover:scale-105 transition-all"
                              title="Read article"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- Horizontal Category Pills Bar (Matching Reference Image) --- */}
              <div className="mb-12">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-spirit-100 shadow-sm">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                    {categoriesList.map((cat) => {
                      const isActive = (!categoryFilter && cat.id === 'all') || (categoryFilter?.toLowerCase() === cat.id.toLowerCase());
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-spirit-900 text-white shadow-sm border border-spirit-900 font-bold'
                              : 'bg-white text-slate-700 hover:bg-spirit-50 hover:text-spirit-900 border border-slate-200/80 shadow-2xs'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* --- Main Feed / Additional Articles Grid --- */}
              <div>
                {sections.length > 0 && !categoryFilter && !searchFilter ? (
                  <BlogSectionsRenderer sections={sections} allPosts={allPagePosts} />
                ) : (
                  <>
                    {gridPosts.length === 0 && featuredPosts.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-3xl shadow-sm mb-12 border border-spirit-100">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold font-serif text-spirit-900 mb-2">No articles found</h3>
                        <p className="text-slate-500 italic mb-6 text-sm">Try choosing another category or clearing your search.</p>
                        <button 
                          onClick={clearFilters} 
                          className="bg-spirit-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-spirit-800 transition-colors"
                        >
                          View All Articles
                        </button>
                      </div>
                    )}

                    {gridPosts.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-serif font-bold text-spirit-900">
                            {categoryFilter ? `${categoryFilter} Articles` : 'More Sacred Insights'}
                          </h2>
                          <span className="text-xs text-slate-500 font-medium">
                            Showing {gridPosts.length} {gridPosts.length === 1 ? 'article' : 'articles'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {gridPosts.map((post) => (
                            <Link
                              to={`/blog/${post.id}`}
                              key={post.id}
                              className="bg-white rounded-3xl border border-spirit-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-[460px] group"
                            >
                              <div className="h-56 relative overflow-hidden">
                                <img
                                  src={post.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e"}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-spirit-800 shadow-sm border border-spirit-100">
                                  {post.category || "Wisdom"}
                                </span>
                              </div>
                              <div className="p-6 flex flex-col flex-grow">
                                <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                                  <span>{post.author || 'Spiritual Counselor'}</span>
                                  <span>•</span>
                                  <span>{post.date || 'Recent'}</span>
                                </div>
                                <h3 className="font-serif font-bold text-lg text-spirit-900 mb-3 line-clamp-2 leading-tight group-hover:text-spirit-700 transition-colors">
                                  {post.title}
                                </h3>
                                <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 mb-4 flex-grow font-light leading-relaxed">
                                  {post.excerpt}
                                </p>
                                <div className="w-full bg-spirit-50 text-spirit-900 font-bold py-2.5 rounded-xl group-hover:bg-spirit-900 group-hover:text-white transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm mt-auto">
                                  <Book size={15} /> 
                                  <span>Read Article</span>
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
        )}
      </div>

      {/* Dynamic Sections from Elementor Builder */}
      {pageSections.map((sec) => (
        <DynamicSection key={sec.id} section={sec} />
      ))}
    </div>
  );
};

export default Blog;

