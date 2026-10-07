import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageSection } from '../types';
import { ElementorBuilder } from './elementor/ElementorBuilder';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Layout, 
  FileText, 
  Search, 
  Sparkles, 
  Globe, 
  Eye, 
  CheckCircle, 
  Clock, 
  Layers,
  ArrowRight,
  Loader2,
  Sliders,
  FolderOpen
} from 'lucide-react';

interface PageSectionBuilderProps {
  defaultTab?: 'all' | 'home' | 'subpages' | 'custom_pages';
}

export const PageSectionBuilder: React.FC<PageSectionBuilderProps> = ({ defaultTab = 'all' }) => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'home' | 'subpages' | 'custom_pages'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Builder Modal State
  const [isElementorOpen, setIsElementorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setIsLoading(true);
    let items: PageSection[] = [];

    // 1. Read from localStorage cache
    try {
      const local = localStorage.getItem('lumina_page_sections');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) items = parsed;
      }
    } catch (e) {
      console.warn('LocalStorage parse error', e);
    }

    // 2. Read from Supabase
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', '_page_section_')
        .order('created_at', { ascending: false });

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
            isPage: config.isPage || (post.excerpt && post.excerpt.startsWith('/p/')) || false,
            slug: config.slug,
            status: post.status || 'published',
            created_at: post.created_at,
            config
          } as PageSection;
        });

        // Merge with preference to Supabase
        const map = new Map<string, PageSection>();
        items.forEach(s => map.set(s.id, s));
        mapped.forEach(s => map.set(s.id, s));
        items = Array.from(map.values());

        // Update local cache
        localStorage.setItem('lumina_page_sections', JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Error fetching sections from supabase', e);
    }

    setSections(items);
    setIsLoading(false);
  };

  const handleCreateNewSection = () => {
    setEditingSection(null);
    setIsElementorOpen(true);
  };

  const handleCreateNewCustomPage = () => {
    setEditingSection({
      id: '',
      title: 'New page demo',
      pageTarget: '/p/new-page-demo',
      isPage: true,
      slug: 'new-page-demo',
      status: 'published',
      config: {
        isElementor: true,
        elements: []
      }
    });
    setIsElementorOpen(true);
  };

  const handleEdit = (section: PageSection) => {
    setEditingSection(section);
    setIsElementorOpen(true);
  };

  const handleDuplicate = async (section: PageSection) => {
    const clone: PageSection = {
      ...section,
      id: 'sec_' + Math.random().toString(36).substr(2, 9),
      title: `${section.title} (Copy)`,
      created_at: new Date().toISOString()
    };

    // Save to Supabase
    try {
      await supabase.from('posts').insert([{
        title: clone.title,
        category: '_page_section_',
        excerpt: clone.pageTarget,
        content: JSON.stringify(clone.config),
        status: clone.status || 'published'
      }]);
    } catch (e) {
      console.warn(e);
    }

    // Save to localStorage
    const updated = [clone, ...sections];
    setSections(updated);
    localStorage.setItem('lumina_page_sections', JSON.stringify(updated));
    window.dispatchEvent(new Event('lumina_page_sections_updated'));
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await supabase.from('posts').delete().eq('id', deleteConfirmId);
    } catch (e) {
      console.warn(e);
    }

    const updated = sections.filter(s => s.id !== deleteConfirmId);
    setSections(updated);
    localStorage.setItem('lumina_page_sections', JSON.stringify(updated));
    window.dispatchEvent(new Event('lumina_page_sections_updated'));
    setDeleteConfirmId(null);
  };

  const handleSaveFromElementor = async (updatedData: Partial<PageSection>) => {
    const isNew = !editingSection || !editingSection.id;
    const targetId = isNew ? 'sec_' + Math.random().toString(36).substr(2, 9) : editingSection.id;

    const fullSection: PageSection = {
      id: targetId,
      title: updatedData.title || 'Untitled Section',
      pageTarget: updatedData.pageTarget || '/',
      isPage: updatedData.isPage || false,
      slug: updatedData.slug || '',
      status: updatedData.status || 'published',
      created_at: editingSection?.created_at || new Date().toISOString(),
      config: {
        ...(editingSection?.config || {}),
        ...(updatedData.config || {}),
        isElementor: true,
        isPage: updatedData.isPage || false,
        slug: updatedData.slug || ''
      }
    };

    const payload = {
      title: fullSection.title,
      category: '_page_section_',
      excerpt: fullSection.pageTarget,
      content: JSON.stringify(fullSection.config),
      status: fullSection.status
    };

    // 1. Supabase write
    try {
      if (isNew) {
        await supabase.from('posts').insert([payload]);
      } else {
        await supabase.from('posts').update(payload).eq('id', targetId);
      }
    } catch (e) {
      console.warn('Supabase save error:', e);
    }

    // 2. Sync localStorage
    let nextSections: PageSection[];
    if (isNew) {
      nextSections = [fullSection, ...sections];
    } else {
      nextSections = sections.map(s => s.id === targetId ? fullSection : s);
    }

    setSections(nextSections);
    localStorage.setItem('lumina_page_sections', JSON.stringify(nextSections));
    window.dispatchEvent(new Event('lumina_page_sections_updated'));

    // Keep editingSection in sync
    setEditingSection(fullSection);
  };

  // Filter sections
  const filteredSections = sections.filter(sec => {
    const matchesSearch = 
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.pageTarget.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'home') return sec.pageTarget === '/' && !sec.isPage;
    if (activeTab === 'subpages') return sec.pageTarget !== '/' && !sec.isPage && !sec.pageTarget.startsWith('/p/');
    if (activeTab === 'custom_pages') return sec.isPage || sec.pageTarget.startsWith('/p/');
    return true;
  });

  // Calculate metrics
  const totalCount = sections.length;
  const customPagesCount = sections.filter(s => s.isPage || s.pageTarget.startsWith('/p/')).length;
  const publishedCount = sections.filter(s => s.status !== 'draft').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-12">
      {/* Top Banner & Elementor Launchers */}
      <div className="bg-gradient-to-r from-slate-900 via-spirit-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-400 text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Elementor Visual Page Builder
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2 leading-tight">
              Page & Section Development
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Drag-and-drop live components, customize multi-column layouts, style typography & Islamic calligraphy, and publish sections across your site or build standalone custom pages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreateNewCustomPage}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              New Standalone Page
            </button>

            <button
              type="button"
              onClick={handleCreateNewSection}
              className="px-6 py-3 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg hover:shadow-accent-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Open Elementor Builder
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
            <span className="text-xs text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Total Sections</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white">{totalCount}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
            <span className="text-xs text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Custom Pages</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-sky-400">{customPagesCount}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
            <span className="text-xs text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Live & Published</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">{publishedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Tabs, Search & Sections Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'all' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Content ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'home' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Homepage (/)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subpages')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'subpages' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subpages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom_pages')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'custom_pages' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Pages ({customPagesCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or target..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-accent-500 transition bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Content Table / List */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-accent-600 mb-3" />
            <p className="text-sm font-semibold">Loading page sections...</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="p-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-800 mb-1">No page sections found</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {searchQuery ? 'No sections match your search criteria.' : 'You haven\'t created any page sections yet. Use the Elementor builder to start designing.'}
            </p>
            <button
              type="button"
              onClick={handleCreateNewSection}
              className="px-5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Section
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Title & Type</th>
                  <th className="py-4 px-6">Page Target</th>
                  <th className="py-4 px-6">Components</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSections.map(sec => {
                  const isElementor = sec.config?.isElementor || (sec.config?.elements && sec.config.elements.length > 0);
                  const blockCount = sec.config?.elements?.length || 1;
                  const liveLink = sec.isPage 
                    ? `#/p/${sec.slug || sec.pageTarget.replace(/^\/p\//, '')}`
                    : `#${sec.pageTarget}`;

                  return (
                    <tr key={sec.id} className="hover:bg-slate-50/60 transition group">
                      {/* Title & Type */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                            sec.isPage ? 'bg-sky-100 text-sky-700' : 'bg-accent-100 text-accent-700'
                          }`}>
                            {sec.isPage ? <Globe className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-accent-600 transition flex items-center gap-2">
                              <span>{sec.title}</span>
                              {sec.isPage && (
                                <span className="text-[10px] uppercase font-bold bg-sky-50 text-sky-600 border border-sky-200 px-2 py-0.5 rounded-full">
                                  Custom Page
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 block mt-0.5">
                              {isElementor ? 'Elementor Visual Layout' : 'Rich Text Section'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Page Target */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                          {sec.pageTarget}
                        </span>
                      </td>

                      {/* Components Info */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {blockCount} {blockCount === 1 ? 'Block' : 'Blocks'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {sec.status === 'draft' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Published
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(sec)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-accent-600 hover:text-white text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                            title="Open Elementor Builder"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <a
                            href={liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs transition"
                            title="View on site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(sec)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs transition"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(sec.id)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">Delete Section?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to permanently delete this page section? It will no longer display on the website.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Elementor Visual Builder Modal */}
      {isElementorOpen && (
        <ElementorBuilder
          initialSection={editingSection}
          onSave={handleSaveFromElementor}
          onClose={() => {
            setIsElementorOpen(false);
            setEditingSection(null);
            fetchSections();
          }}
        />
      )}
    </div>
  );
};

export default PageSectionBuilder;
