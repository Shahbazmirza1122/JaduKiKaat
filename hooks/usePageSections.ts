import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageSection } from '../types';

export function usePageSections(pageTarget: string) {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadSections = async () => {
      let combinedSections: PageSection[] = [];

      // 1. First check local storage cache for immediate offline or newly saved sections
      try {
        const localData = localStorage.getItem('lumina_page_sections');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            combinedSections = parsed;
          }
        }
      } catch (err) {
        console.warn('Failed reading localStorage page sections:', err);
      }

      // 2. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("category", "_page_section_")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: PageSection[] = data.map((post: any) => {
            let config: any = {};
            try {
              config = JSON.parse(post.content);
            } catch(e) {}
            
            return {
              id: post.id,
              title: post.title,
              pageTarget: post.excerpt,
              created_at: post.created_at,
              status: post.status || 'published',
              isPage: config.isPage || false,
              slug: config.slug,
              config
            } as PageSection;
          });

          // Merge Supabase with localStorage (prefer latest or unique IDs)
          const map = new Map<string, PageSection>();
          combinedSections.forEach(s => map.set(s.id, s));
          mapped.forEach(s => map.set(s.id, s));
          combinedSections = Array.from(map.values());

          // Keep localStorage up to date
          try {
            localStorage.setItem('lumina_page_sections', JSON.stringify(combinedSections));
          } catch (e) {}
        }
      } catch (e) {
        console.warn("Failed to fetch page sections from supabase:", e);
      }

      if (mounted) {
        // Filter by page target
        const normTarget = pageTarget.trim().toLowerCase();
        const filtered = combinedSections.filter((sec) => {
          if (!sec || sec.status === 'draft') return false;
          const target = (sec.pageTarget || '').trim().toLowerCase();
          
          if (target === 'all') return true;
          if (target === normTarget) return true;
          if (normTarget.startsWith('/') && target === normTarget.substring(1)) return true;
          if (!normTarget.startsWith('/') && target === `/${normTarget}`) return true;
          return false;
        });

        setSections(filtered);
        setLoading(false);
      }
    };
    
    loadSections();

    // Listen for live updates when an admin publishes in Elementor builder
    const handleUpdate = () => {
      loadSections();
    };

    window.addEventListener('lumina_page_sections_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      mounted = false;
      window.removeEventListener('lumina_page_sections_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [pageTarget]);

  return { sections, loading };
}
