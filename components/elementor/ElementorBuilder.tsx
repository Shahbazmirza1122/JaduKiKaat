import React, { useState, useEffect } from 'react';
import { ElementorBlock, PageSection } from '../../types';
import { 
  WIDGET_CATALOG, 
  WidgetCatalogItem, 
  createBlockFromWidget, 
  ELEMENTOR_PRESET_TEMPLATES, 
  ElementorTemplatePreset,
  generateBlockId 
} from './elementorTemplates';
import { ElementorRenderer } from './ElementorRenderer';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Monitor,
  Search,
  Plus,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  Download,
  Upload,
  FileCode,
  Layout,
  Type,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  X,
  HelpCircle,
  FolderOpen,
  Globe,
  Sliders,
  Palette,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Folder,
  MapPin,
  Star,
  Pencil,
  LayoutGrid,
  Columns2,
  Columns3,
  Split,
  Heading,
  FileText,
  MousePointerClick,
  Video,
  Minus,
  MoveVertical,
  BookOpen,
  BarChart2,
  Quote,
  Maximize2,
  Megaphone,
  CheckSquare,
  Award,
  Grid,
  GalleryHorizontal,
  ListChecks,
  Hash,
  ListFilter,
  Share2,
  Activity,
  Headphones,
  Code,
  Code2,
  Anchor,
  PanelLeftClose,
  AlertCircle,
  MoveUp,
  MoveDown
} from 'lucide-react';

interface ElementorBuilderProps {
  initialSection?: PageSection | null;
  onSave: (section: Partial<PageSection>) => Promise<void>;
  onClose: () => void;
}

const WIDGET_ICON_MAP: Record<string, React.FC<any>> = {
  Columns2,
  Columns3,
  Split,
  Heading,
  FileText,
  MousePointerClick,
  Image: ImageIcon,
  ImageIcon,
  Video,
  Minus,
  MoveVertical,
  BookOpen,
  Sparkles,
  BarChart2,
  Quote,
  Maximize2,
  Megaphone,
  HelpCircle,
  CheckSquare,
  MapPin,
  Star,
  Layout,
  Award,
  Grid,
  GalleryHorizontal,
  ListChecks,
  Hash,
  Folder,
  Layers,
  ListFilter,
  Share2,
  Activity,
  Headphones,
  Code,
  Code2,
  Anchor,
  PanelLeftClose,
  AlertCircle
};

const CURATED_IMAGE_PRESETS = [
  {
    name: 'Quran Kareem',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Madina Munawwarah',
    url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Makkah Al-Mukarramah',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Sacred Lantern',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Islamic Architecture',
    url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Islamic Community',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  }
];

export const ElementorBuilder: React.FC<ElementorBuilderProps> = ({
  initialSection,
  onSave,
  onClose
}) => {
  // Page Meta
  const [title, setTitle] = useState(initialSection?.title || (initialSection?.isPage ? 'New page demo' : 'New Custom Section'));
  const [pageTarget, setPageTarget] = useState(initialSection?.pageTarget || '/');
  const [isPage, setIsPage] = useState<boolean>(initialSection?.isPage || false);
  const [slug, setSlug] = useState(initialSection?.slug || (initialSection?.pageTarget?.replace(/^\//, '') || 'new-page-demo'));
  const [status, setStatus] = useState<'published' | 'draft'>(initialSection?.status || 'published');

  // Blocks tree - empty by default for new pages to match Elementor's blank canvas drop zone!
  const [blocks, setBlocks] = useState<ElementorBlock[]>(() => {
    if (initialSection?.config?.elements && initialSection.config.elements.length > 0) {
      return initialSection.config.elements;
    }
    if (initialSection?.isPage && (!initialSection?.config?.elements || initialSection.config.elements.length === 0)) {
      return [];
    }
    // If legacy content exists, wrap in text block
    if (initialSection?.config?.content) {
      return [
        {
          id: generateBlockId(),
          type: 'text',
          title: 'Imported Content',
          data: { htmlContent: initialSection.config.content },
          styles: {
            paddingY: 'md',
            bgColor: initialSection.config.bgColor || '#ffffff',
            textColor: initialSection.config.textColor || '#000000',
            fontFamily: (initialSection.config.fontFamily as any) || 'serif'
          }
        }
      ];
    }
    if (initialSection) return [];
    return [];
  });

  // UI state
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [searchWidget, setSearchWidget] = useState('');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'widgets' | 'inspector' | 'structure'>('widgets');

  // Elementor authentic sidebar and drop zone states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSelectingStructure, setIsSelectingStructure] = useState(false);
  const [dragOverDropzone, setDragOverDropzone] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true,
    general: true,
    layout: true
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Find currently selected block
  const findBlockRecursive = (items: ElementorBlock[], id: string): ElementorBlock | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.columnsData) {
        for (const col of item.columnsData) {
          const found = findBlockRecursive(col, id);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const selectedBlock = selectedBlockId ? findBlockRecursive(blocks, selectedBlockId) : null;

  // Auto-switch to inspector when a block is clicked
  useEffect(() => {
    if (selectedBlockId) {
      setActiveSidebarTab('inspector');
    }
  }, [selectedBlockId]);

  // Block Tree Updates
  const updateBlockRecursive = (
    items: ElementorBlock[],
    id: string,
    updater: (b: ElementorBlock) => ElementorBlock
  ): ElementorBlock[] => {
    return items.map(item => {
      if (item.id === id) {
        return updater(item);
      }
      if (item.columnsData) {
        return {
          ...item,
          columnsData: item.columnsData.map(col => updateBlockRecursive(col, id, updater))
        };
      }
      return item;
    });
  };

  const handleUpdateSelectedBlock = (
    updater: (b: ElementorBlock) => ElementorBlock
  ) => {
    if (!selectedBlockId) return;
    setBlocks(prev => updateBlockRecursive(prev, selectedBlockId, updater));
  };

  const [imageAppliedFeedback, setImageAppliedFeedback] = useState('');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        handleUpdateSelectedBlock(b => ({
          ...b,
          data: { ...b.data, imageUrl: base64 }
        }));
        setImageAppliedFeedback('Image uploaded & applied to canvas!');
        setTimeout(() => setImageAppliedFeedback(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomImageUrl = (url: string) => {
    handleUpdateSelectedBlock(b => ({
      ...b,
      data: { ...b.data, imageUrl: url }
    }));
    setImageAppliedFeedback('Image applied to canvas!');
    setTimeout(() => setImageAppliedFeedback(''), 3000);
  };

  const [activeTargetColumn, setActiveTargetColumn] = useState<{ blockId: string; colIndex: number; colName: string } | null>(null);
  const [activeColManagerTab, setActiveColManagerTab] = useState<number>(0);

  const handleAddBlockToColumn = (columnBlockId: string, colIndex: number, widgetType: string) => {
    const widget = WIDGET_CATALOG.find(w => w.type === widgetType) || WIDGET_CATALOG[0];
    const newBlock = createBlockFromWidget(widget);

    setBlocks(prev => {
      const insertInCols = (items: ElementorBlock[]): ElementorBlock[] => {
        return items.map(item => {
          if (item.id === columnBlockId) {
            const currentCols = item.columnsData ? [...item.columnsData] : [];
            while (currentCols.length <= colIndex) {
              currentCols.push([]);
            }
            const targetCol = [...(currentCols[colIndex] || [])];
            targetCol.push(newBlock);
            currentCols[colIndex] = targetCol;
            return {
              ...item,
              columnsData: currentCols
            };
          }
          if (item.columnsData) {
            return {
              ...item,
              columnsData: item.columnsData.map(col => insertInCols(col))
            };
          }
          return item;
        });
      };
      return insertInCols(prev);
    });

    setSelectedBlockId(newBlock.id);
    setActiveSidebarTab('inspector');
    setActiveTargetColumn(null);
  };

  const handleAddWidget = (widget: WidgetCatalogItem, targetIndex?: number) => {
    if (activeTargetColumn) {
      handleAddBlockToColumn(activeTargetColumn.blockId, activeTargetColumn.colIndex, widget.type);
      return;
    }

    const newBlock = createBlockFromWidget(widget);
    setBlocks(prev => {
      if (typeof targetIndex === 'number') {
        const next = [...prev];
        next.splice(targetIndex, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
    setSelectedBlockId(newBlock.id);
    setActiveSidebarTab('inspector');
  };

  const handleAddStructure = (colsCount: number, layout: string) => {
    const colsData: ElementorBlock[][] = [];
    for (let i = 0; i < colsCount; i++) colsData.push([]);

    const newBlock: ElementorBlock = {
      id: generateBlockId(),
      type: 'columns',
      title: `${colsCount} Columns Container`,
      columnsCount: colsCount,
      columnLayout: layout,
      columnsData: colsData,
      data: {},
      styles: { paddingY: 'md', maxWidth: 'xl' }
    };

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    const moveRecursive = (items: ElementorBlock[]): ElementorBlock[] => {
      const idx = items.findIndex(b => b.id === id);
      if (idx !== -1) {
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < items.length) {
          const next = [...items];
          const [item] = next.splice(idx, 1);
          next.splice(targetIdx, 0, item);
          return next;
        }
        return items;
      }
      return items.map(b => {
        if (b.columnsData) {
          return {
            ...b,
            columnsData: b.columnsData.map(col => moveRecursive(col))
          };
        }
        return b;
      });
    };
    setBlocks(prev => moveRecursive(prev));
  };

  const handleDuplicateBlock = (id: string) => {
    const duplicateRecursive = (items: ElementorBlock[]): { updated: ElementorBlock[]; newId: string | null } => {
      const idx = items.findIndex(b => b.id === id);
      if (idx !== -1) {
        const target = items[idx];
        const clone: ElementorBlock = JSON.parse(JSON.stringify(target));
        clone.id = generateBlockId();
        if (clone.title) clone.title += ' (Copy)';
        const next = [...items];
        next.splice(idx + 1, 0, clone);
        return { updated: next, newId: clone.id };
      }
      let foundNewId: string | null = null;
      const nextItems = items.map(b => {
        if (b.columnsData) {
          const newCols = b.columnsData.map(col => {
            const res = duplicateRecursive(col);
            if (res.newId) foundNewId = res.newId;
            return res.updated;
          });
          return {
            ...b,
            columnsData: newCols
          };
        }
        return b;
      });
      return { updated: nextItems, newId: foundNewId };
    };

    setBlocks(prev => {
      const { updated, newId } = duplicateRecursive(prev);
      if (newId) setSelectedBlockId(newId);
      return updated;
    });
  };

  const handleDeleteBlock = (id: string) => {
    const filterRecursive = (items: ElementorBlock[]): ElementorBlock[] => {
      return items
        .filter(b => b.id !== id)
        .map(b => {
          if (b.columnsData) {
            return {
              ...b,
              columnsData: b.columnsData.map(col => filterRecursive(col))
            };
          }
          return b;
        });
    };

    setBlocks(prev => filterRecursive(prev));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleInsertTemplate = (preset: ElementorTemplatePreset) => {
    // Clone with fresh IDs
    const newBlocks: ElementorBlock[] = JSON.parse(JSON.stringify(preset.blocks)).map((b: ElementorBlock) => ({
      ...b,
      id: generateBlockId()
    }));
    setBlocks(prev => [...prev, ...newBlocks]);
    setShowTemplatesModal(false);
  };

  const handleSavePage = async () => {
    setIsSaving(true);
    try {
      const finalTarget = isPage ? `/p/${slug.replace(/^\//, '')}` : pageTarget;
      
      const payload: Partial<PageSection> = {
        title,
        pageTarget: finalTarget,
        isPage,
        slug: slug.replace(/^\//, ''),
        status,
        config: {
          sectionType: 'hero',
          isElementor: true,
          elements: blocks,
          bgColor: blocks[0]?.styles?.bgColor || '#ffffff',
          textColor: blocks[0]?.styles?.textColor || '#000000',
          fontFamily: 'serif',
          animation: 'none',
          padding: 'medium'
        }
      };

      await onSave(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn('Save failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and Drop from sidebar
  const handleDragStart = (e: React.DragEvent, widget: WidgetCatalogItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'NEW_WIDGET', widgetType: widget.type }));
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const parsed = JSON.parse(dataStr);
      if (parsed.type === 'NEW_WIDGET') {
        const item = WIDGET_CATALOG.find(w => w.type === parsed.widgetType);
        if (item) handleAddWidget(item);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Filtered widgets
  const filteredWidgets = WIDGET_CATALOG.filter(w => 
    w.label.toLowerCase().includes(searchWidget.toLowerCase()) ||
    w.description.toLowerCase().includes(searchWidget.toLowerCase()) ||
    w.category.toLowerCase().includes(searchWidget.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col font-sans select-none text-slate-100 overflow-hidden">
      {/* Top Main Toolbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Branding & Title */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Exit Builder"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-600 to-sky-500 flex items-center justify-center font-serif font-bold text-white text-sm shadow-md">
              E
            </span>
            <div className="hidden sm:block">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-accent-500 text-sm font-bold text-white px-1.5 py-0.5 outline-none rounded transition w-56"
                placeholder="Section / Page Title"
              />
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Target:</span>
                <span className="text-accent-400 font-mono font-bold">
                  {isPage ? `/p/${slug}` : pageTarget}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Device Switcher & Preview Toggle */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
          <button
            type="button"
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              deviceView === 'desktop' ? 'bg-accent-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceView('tablet')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              deviceView === 'tablet' ? 'bg-accent-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              deviceView === 'mobile' ? 'bg-accent-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden md:inline">Mobile</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
              isPreviewMode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Live Clean Preview"
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden lg:inline">{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
        </div>

        {/* Right: Templates, Tools & Save */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setJsonText(JSON.stringify(blocks, null, 2));
              setShowJsonModal(true);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition border border-slate-700"
            title="Import / Export JSON"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSavePage}
            disabled={isSaving}
            className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg ${
              saveSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-accent-600 hover:bg-accent-500 text-white'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace (Sidebar + Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Elementor Dock (Hidden in Preview Mode) */}
        {/* Left Elementor Dock (Hidden in Preview Mode) */}
        {!isPreviewMode && (
          <>
            {/* If Collapsed, Floating Expand Button */}
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-7 h-14 bg-white hover:bg-slate-50 border-r border-y border-slate-300 rounded-r-lg shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Expand Elementor Panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <aside className={`transition-all duration-300 bg-[#f1f3f5] border-r border-[#d5d9de] flex flex-col flex-shrink-0 z-20 relative ${
              isSidebarCollapsed ? 'w-0 -translate-x-full overflow-hidden' : 'w-80 sm:w-88'
            }`}>
              {/* Retract Tab on right edge of panel */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-white hover:bg-slate-50 border border-slate-300 rounded-r-md shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                title="Collapse Elementor Panel"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Elementor Panel Top Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#e8ecef] border-b border-[#d5d9de]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    {activeSidebarTab === 'inspector' ? 'Edit Widget' : activeSidebarTab === 'structure' ? 'Page Settings' : 'Elements'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveSidebarTab('widgets')}
                    className={`p-1.5 rounded transition ${
                      activeSidebarTab === 'widgets' ? 'bg-white text-[#e01e5a] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Widgets Gallery"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  {selectedBlock && (
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('inspector')}
                      className={`p-1.5 rounded transition ${
                        activeSidebarTab === 'inspector' ? 'bg-white text-[#e01e5a] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Edit Selected Widget"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: WIDGET CATALOG */}
              {activeSidebarTab === 'widgets' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 bg-[#f1f3f5] border-b border-[#d5d9de]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchWidget}
                        onChange={(e) => setSearchWidget(e.target.value)}
                        placeholder="Search Widget..."
                        className="w-full bg-white border border-[#d5d9de] text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-md text-xs outline-none focus:border-[#e01e5a] transition"
                      />
                    </div>
                    {activeTargetColumn && (
                      <div className="mt-2.5 p-2.5 bg-rose-50 border border-[#e01e5a]/30 rounded-lg flex items-center justify-between shadow-2xs animate-in fade-in">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#e01e5a]">
                            <span className="w-2 h-2 rounded-full bg-[#e01e5a] animate-pulse"></span>
                            Adding to: {activeTargetColumn.colName}
                          </div>
                          <p className="text-[10px] text-slate-600 truncate mt-0.5">
                            Click any widget below to insert into this column
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTargetColumn(null)}
                          className="px-2 py-1 text-[10px] font-bold bg-white text-slate-600 hover:text-slate-900 border border-slate-300 rounded shadow-2xs shrink-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {/* Categories: BASIC, GENERAL, LAYOUT */}
                    {[
                      { key: 'basic', label: 'BASIC' },
                      { key: 'general', label: 'GENERAL' },
                      { key: 'layout', label: 'STRUCTURE & COLUMNS' }
                    ].map(({ key, label }) => {
                      const catWidgets = filteredWidgets.filter(w => w.category === key);
                      if (catWidgets.length === 0) return null;
                      const isExpanded = expandedCategories[key] !== false;

                      return (
                        <div key={key} className="border-b border-[#d5d9de] pb-3 last:border-b-0">
                          <button
                            type="button"
                            onClick={() => toggleCategory(key)}
                            className="w-full flex items-center justify-between py-1.5 px-1 text-left select-none text-slate-600 hover:text-slate-900 group"
                          >
                            <span className="text-[11px] font-bold tracking-wider text-slate-500 group-hover:text-slate-800">
                              {label}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              {catWidgets.map(widget => {
                                const IconComponent = WIDGET_ICON_MAP[widget.icon] || Sparkles;
                                return (
                                  <div
                                    key={widget.type + widget.label}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, widget)}
                                    onClick={() => handleAddWidget(widget)}
                                    className="p-3.5 bg-white hover:bg-slate-50 border border-[#d5d9de] hover:border-[#e01e5a] rounded transition-all cursor-grab active:cursor-grabbing flex flex-col items-center justify-center text-center group shadow-2xs hover:shadow-sm select-none"
                                    title={`Click or drag to add ${widget.label}`}
                                  >
                                    <div className="w-8 h-8 flex items-center justify-center text-slate-600 group-hover:text-[#e01e5a] transition mb-1.5">
                                      <IconComponent className="w-5 h-5 stroke-[1.8]" />
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900 line-clamp-1 leading-tight">
                                      {widget.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* TAB 2: INSPECTOR (BLOCK CONTROLS) */}
            {activeSidebarTab === 'inspector' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedBlock ? (
                  <>
                    {/* Selected block header */}
                    <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 block">
                          Editing {selectedBlock.type}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate w-48">
                          {selectedBlock.title || selectedBlock.type}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateBlock(selectedBlock.id)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title="Duplicate Widget"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(selectedBlock.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                          title="Delete Widget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBlockId(null)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title="Deselect"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inspector sub-tabs: Content, Style, Advanced */}
                    <div className="flex border-b border-slate-800 bg-slate-900 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setInspectorTab('content')}
                        className={`flex-1 py-2 text-center transition ${
                          inspectorTab === 'content' ? 'text-accent-400 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectorTab('style')}
                        className={`flex-1 py-2 text-center transition ${
                          inspectorTab === 'style' ? 'text-accent-400 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Style
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectorTab('advanced')}
                        className={`flex-1 py-2 text-center transition ${
                          inspectorTab === 'advanced' ? 'text-accent-400 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Advanced
                      </button>
                    </div>

                    {/* Inspector Form Controls */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs text-slate-300">
                      {/* --- CONTENT TAB --- */}
                      {inspectorTab === 'content' && (
                        <div className="space-y-4">
                          {/* Heading Inputs */}
                          {selectedBlock.type === 'heading' && (
                            <>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Subtext / Pre-heading</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.subtext || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, subtext: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none focus:border-accent-500"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Main Heading Text</label>
                                <textarea
                                  rows={2}
                                  value={selectedBlock.data.text || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, text: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none focus:border-accent-500"
                                />
                              </div>
                            </>
                          )}

                          {/* Text / HTML */}
                          {selectedBlock.type === 'text' && (
                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Paragraph / HTML Content</label>
                              <textarea
                                rows={6}
                                value={selectedBlock.data.htmlContent || ''}
                                onChange={(e) => handleUpdateSelectedBlock(b => ({
                                  ...b,
                                  data: { ...b.data, htmlContent: e.target.value }
                                }))}
                                className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none focus:border-accent-500 font-mono text-[11px]"
                              />
                            </div>
                          )}

                          {/* Button */}
                          {selectedBlock.type === 'button' && (
                            <>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Button Label</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.buttonText || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, buttonText: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none focus:border-accent-500"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Target Link URL</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.buttonLink || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, buttonLink: e.target.value }
                                  }))}
                                  placeholder="#contact or /services"
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none focus:border-accent-500 font-mono"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1">Variant</label>
                                  <select
                                    value={selectedBlock.data.buttonVariant || 'primary'}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, buttonVariant: e.target.value as any }
                                    }))}
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                  >
                                    <option value="primary">Primary Accent</option>
                                    <option value="secondary">Dark Spirit</option>
                                    <option value="outline">Outline</option>
                                    <option value="emerald">Emerald</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1">Size</label>
                                  <select
                                    value={selectedBlock.data.buttonSize || 'md'}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, buttonSize: e.target.value as any }
                                    }))}
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                  >
                                    <option value="sm">Small</option>
                                    <option value="md">Medium</option>
                                    <option value="lg">Large</option>
                                  </select>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Image Widget Controls */}
                          {selectedBlock.type === 'image' && (
                            <div className="space-y-4">
                              {/* 1. Elementor Choose Image Preview Box */}
                              <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                                  Choose Image
                                </label>
                                <div className="border border-slate-700 bg-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center relative group">
                                  <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 relative flex items-center justify-center">
                                    <img
                                      src={selectedBlock.data.imageUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80'}
                                      alt="Preview"
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <label className="cursor-pointer bg-white text-slate-900 px-3 py-1.5 rounded-md text-xs font-bold shadow hover:bg-slate-100 transition flex items-center gap-1.5">
                                        <Upload className="w-3.5 h-3.5" /> Replace
                                        <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                                      </label>
                                    </div>
                                  </div>

                                  {/* Upload Button below preview */}
                                  <div className="w-full mt-2.5 flex items-center justify-between gap-2">
                                    <label className="flex-1 cursor-pointer py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg text-center transition flex items-center justify-center gap-1.5">
                                      <Upload className="w-3.5 h-3.5 text-accent-400" /> Upload from Computer
                                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                                    </label>
                                    {selectedBlock.data.imageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleUpdateSelectedBlock(b => ({
                                            ...b,
                                            data: { ...b.data, imageUrl: '' }
                                          }));
                                          setImageAppliedFeedback('Image reset to default');
                                          setTimeout(() => setImageAppliedFeedback(''), 2500);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
                                        title="Reset Image"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* 2. Image URL with Prominent "Apply Image" Button */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-bold text-slate-300">Image URL</label>
                                  {imageAppliedFeedback && (
                                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> {imageAppliedFeedback}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={selectedBlock.data.imageUrl || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: { ...b.data, imageUrl: val }
                                      }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setImageAppliedFeedback('Applied to Canvas!');
                                        setTimeout(() => setImageAppliedFeedback(''), 2500);
                                      }
                                    }}
                                    placeholder="Paste https://... image URL here"
                                    className="flex-1 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white text-xs outline-none focus:border-accent-500 font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImageAppliedFeedback('Applied to Canvas!');
                                      setTimeout(() => setImageAppliedFeedback(''), 2500);
                                    }}
                                    className="px-3.5 py-2 bg-[#39b54a] hover:bg-[#2fa03e] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                                    title="Click to Apply Image to Canvas"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Apply
                                  </button>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                  Supports direct image links (.jpg, .png, .webp, etc.). Click <strong>Apply</strong> or press Enter to update canvas.
                                </p>
                              </div>

                              {/* 3. Quick Curated Presets */}
                              <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">Or Choose Curated Preset</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {CURATED_IMAGE_PRESETS.map((preset) => (
                                    <button
                                      key={preset.name}
                                      type="button"
                                      onClick={() => {
                                        handleApplyCustomImageUrl(preset.url);
                                      }}
                                      className="group relative h-14 rounded-lg overflow-hidden border border-slate-700 hover:border-accent-500 transition text-left cursor-pointer"
                                      title={preset.name}
                                    >
                                      <img 
                                        src={preset.url} 
                                        alt={preset.name} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1">
                                        <span className="text-[9px] font-bold text-white line-clamp-1 leading-tight">
                                          {preset.name}
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 4. Sizing, Caption & Alt */}
                              <div className="space-y-3 pt-2 border-t border-slate-800">
                                <div>
                                  <label className="block font-bold text-slate-400 text-xs mb-1">Image Size / Max Height</label>
                                  <select
                                    value={selectedBlock.data.imageSize || 'auto'}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, imageSize: e.target.value }
                                    }))}
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs outline-none"
                                  >
                                    <option value="auto">Full Banner (Max 550px)</option>
                                    <option value="large">Large (400px)</option>
                                    <option value="medium">Medium (280px)</option>
                                    <option value="small">Small (180px)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block font-bold text-slate-400 text-xs mb-1">Caption</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.imageCaption || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, imageCaption: e.target.value }
                                    }))}
                                    placeholder="Optional photo caption..."
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block font-bold text-slate-400 text-xs mb-1">Alt Text (Accessibility & SEO)</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.imageAlt || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, imageAlt: e.target.value }
                                    }))}
                                    placeholder="Image description..."
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block font-bold text-slate-400 text-xs mb-1">Link URL (Optional)</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.imageLink || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, imageLink: e.target.value }
                                    }))}
                                    placeholder="https://... when image is clicked"
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs outline-none font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Video */}
                          {selectedBlock.type === 'video' && (
                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Video Embed URL (YouTube/Vimeo)</label>
                              <input
                                type="text"
                                value={selectedBlock.data.videoUrl || ''}
                                onChange={(e) => handleUpdateSelectedBlock(b => ({
                                  ...b,
                                  data: { ...b.data, videoUrl: e.target.value }
                                }))}
                                placeholder="https://www.youtube.com/embed/..."
                                className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none font-mono"
                              />
                            </div>
                          )}

                          {/* Google Maps Controls */}
                          {selectedBlock.type === 'google_maps' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Map Location / Address / City</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.mapLocation || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, mapLocation: e.target.value }
                                  }))}
                                  placeholder="e.g. Makkah, Saudi Arabia"
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">
                                  Zoom Level ({selectedBlock.data.mapZoom || 14})
                                </label>
                                <input
                                  type="range"
                                  min="4"
                                  max="19"
                                  value={selectedBlock.data.mapZoom || 14}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, mapZoom: parseInt(e.target.value) }
                                  }))}
                                  className="w-full accent-[#e01e5a]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Icon Widget Controls */}
                          {selectedBlock.type === 'icon' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Icon Symbol</label>
                                <select
                                  value={selectedBlock.data.iconSymbol || 'Star'}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, iconSymbol: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                >
                                  <option value="Star">Star</option>
                                  <option value="Sparkles">Sparkles</option>
                                  <option value="Heart">Heart</option>
                                  <option value="Shield">Shield</option>
                                  <option value="Globe">Globe</option>
                                  <option value="MapPin">MapPin</option>
                                  <option value="Clock">Clock</option>
                                  <option value="Moon">Moon</option>
                                  <option value="Compass">Compass</option>
                                  <option value="Phone">Phone</option>
                                </select>
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Size</label>
                                <div className="grid grid-cols-4 gap-2">
                                  {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: { ...b.data, iconSize: sz }
                                      }))}
                                      className={`py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                                        (selectedBlock.data.iconSize || 'md') === sz
                                          ? 'bg-[#e01e5a] text-white'
                                          : 'bg-slate-800 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Link URL (Optional)</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.iconLink || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, iconLink: e.target.value }
                                  }))}
                                  placeholder="https://... or #contact"
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Ayat */}
                          {selectedBlock.type === 'ayat' && (
                            <>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Arabic Text</label>
                                <textarea
                                  rows={2}
                                  value={selectedBlock.data.arabicText || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, arabicText: e.target.value }
                                  }))}
                                  dir="rtl"
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-amber-300 text-base font-serif outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Translation</label>
                                <textarea
                                  rows={3}
                                  value={selectedBlock.data.translationText || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, translationText: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Surah / Hadith Reference</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.sourceRef || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, sourceRef: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                            </>
                          )}

                          {/* Iconbox */}
                          {selectedBlock.type === 'iconbox' && (
                            <>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Feature Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.iconTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, iconTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Description</label>
                                <textarea
                                  rows={3}
                                  value={selectedBlock.data.iconDescription || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, iconDescription: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Link (Optional)</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.iconLink || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, iconLink: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                            </>
                          )}

                          {/* Hero */}
                          {selectedBlock.type === 'hero' && (
                            <>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Badge / Pre-title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.heroBadge || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, heroBadge: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Hero Title</label>
                                <textarea
                                  rows={2}
                                  value={selectedBlock.data.heroTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, heroTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none font-bold"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Subtitle</label>
                                <textarea
                                  rows={3}
                                  value={selectedBlock.data.heroSubtitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, heroSubtitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1">Primary Btn Text</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.heroPrimaryBtnText || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, heroPrimaryBtnText: e.target.value }
                                    }))}
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1">Primary Btn Link</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.heroPrimaryBtnLink || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, heroPrimaryBtnLink: e.target.value }
                                    }))}
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* CTA */}
                          {selectedBlock.type === 'cta' && (
                            <>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">CTA Heading</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.ctaTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, ctaTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Description</label>
                                <textarea
                                  rows={3}
                                  value={selectedBlock.data.ctaDescription || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, ctaDescription: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1">Button Label</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.ctaBtnText || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, ctaBtnText: e.target.value }
                                    }))}
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1">Button Target Link</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.ctaBtnLink || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, ctaBtnLink: e.target.value }
                                    }))}
                                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Accordion items editor */}
                          {selectedBlock.type === 'accordion' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-slate-400">FAQ Accordion Questions</label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: {
                                      ...b.data,
                                      accordionItems: [
                                        ...(b.data.accordionItems || []),
                                        { id: generateBlockId(), title: 'New Question', content: 'Answer explanation here.' }
                                      ]
                                    }
                                  }))}
                                  className="text-accent-400 hover:text-accent-300 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Question
                                </button>
                              </div>
                              {(selectedBlock.data.accordionItems || []).map((item, idx) => (
                                <div key={item.id || idx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Item #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: {
                                          ...b.data,
                                          accordionItems: (b.data.accordionItems || []).filter((_, i) => i !== idx)
                                        }
                                      }))}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.accordionItems || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      return { ...b, data: { ...b.data, accordionItems: next } };
                                    })}
                                    placeholder="Question..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white outline-none"
                                  />
                                  <textarea
                                    rows={2}
                                    value={item.content}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.accordionItems || [])];
                                      next[idx] = { ...next[idx], content: e.target.value };
                                      return { ...b, data: { ...b.data, accordionItems: next } };
                                    })}
                                    placeholder="Answer..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Stats counter editor */}
                          {selectedBlock.type === 'stats' && (
                            <div className="space-y-3">
                              <label className="font-bold text-slate-400">Counters & Milestones</label>
                              {(selectedBlock.data.statsItems || []).map((st, idx) => (
                                <div key={st.id || idx} className="grid grid-cols-2 gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
                                  <input
                                    type="text"
                                    value={st.number}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.statsItems || [])];
                                      next[idx] = { ...next[idx], number: e.target.value };
                                      return { ...b, data: { ...b.data, statsItems: next } };
                                    })}
                                    placeholder="e.g. 15,000+"
                                    className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white outline-none font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={st.label}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.statsItems || [])];
                                      next[idx] = { ...next[idx], label: e.target.value };
                                      return { ...b, data: { ...b.data, statsItems: next } };
                                    })}
                                    placeholder="e.g. Healed"
                                    className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Star Rating Controls */}
                          {selectedBlock.type === 'star_rating' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Rating Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.ratingTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, ratingTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">
                                  Rating Value ({selectedBlock.data.ratingValue || 5} Stars)
                                </label>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  step="0.5"
                                  value={selectedBlock.data.ratingValue || 5}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, ratingValue: parseFloat(e.target.value) }
                                  }))}
                                  className="w-full accent-[#e01e5a]"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Rating Count / Subtext</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.ratingCount || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, ratingCount: e.target.value }
                                  }))}
                                  placeholder="e.g. 4.9/5 (1,240+ Reviews)"
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* Image Box Controls */}
                          {selectedBlock.type === 'image_box' && (
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-bold text-slate-300">Image Box URL</label>
                                  {imageAppliedFeedback && (
                                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> {imageAppliedFeedback}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={selectedBlock.data.imageBoxUrl || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: { ...b.data, imageBoxUrl: val }
                                      }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setImageAppliedFeedback('Applied to Canvas!');
                                        setTimeout(() => setImageAppliedFeedback(''), 2500);
                                      }
                                    }}
                                    placeholder="https://... image URL"
                                    className="flex-1 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white text-xs outline-none font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImageAppliedFeedback('Applied to Canvas!');
                                      setTimeout(() => setImageAppliedFeedback(''), 2500);
                                    }}
                                    className="px-3.5 py-2 bg-[#39b54a] hover:bg-[#2fa03e] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Apply
                                  </button>
                                </div>
                              </div>

                              {/* Presets for Image Box */}
                              <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">Quick Presets</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {CURATED_IMAGE_PRESETS.slice(0, 3).map((preset) => (
                                    <button
                                      key={preset.name}
                                      type="button"
                                      onClick={() => {
                                        handleUpdateSelectedBlock(b => ({
                                          ...b,
                                          data: { ...b.data, imageBoxUrl: preset.url }
                                        }));
                                        setImageAppliedFeedback('Preset Applied!');
                                        setTimeout(() => setImageAppliedFeedback(''), 2000);
                                      }}
                                      className="group relative h-12 rounded-lg overflow-hidden border border-slate-700 hover:border-accent-500 transition text-left cursor-pointer"
                                      title={preset.name}
                                    >
                                      <img 
                                        src={preset.url} 
                                        alt={preset.name} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1">
                                        <span className="text-[9px] font-bold text-white line-clamp-1 leading-tight">
                                          {preset.name}
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.imageBoxTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, imageBoxTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Description</label>
                                <textarea
                                  rows={2}
                                  value={selectedBlock.data.imageBoxDescription || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, imageBoxDescription: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Link URL</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.imageBoxLink || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, imageBoxLink: e.target.value }
                                  }))}
                                  placeholder="#services or https://..."
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs font-mono"
                                />
                              </div>
                            </div>
                          )}

                          {/* Basic Gallery Controls */}
                          {selectedBlock.type === 'gallery' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1">Columns</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[2, 3, 4].map(col => (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: { ...b.data, galleryColumns: col }
                                      }))}
                                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                                        (selectedBlock.data.galleryColumns || 3) === col
                                          ? 'bg-[#e01e5a] text-white'
                                          : 'bg-slate-800 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {col} Cols
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-slate-400 text-xs">Gallery Images ({(selectedBlock.data.galleryImages || []).length})</label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: {
                                      ...b.data,
                                      galleryImages: [
                                        ...(b.data.galleryImages || []),
                                        {
                                          id: generateBlockId(),
                                          url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80',
                                          title: 'New Gallery Image'
                                        }
                                      ]
                                    }
                                  }))}
                                  className="text-accent-400 hover:text-accent-300 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Image
                                </button>
                              </div>
                              {(selectedBlock.data.galleryImages || []).map((imgItem, idx) => (
                                <div key={imgItem.id || idx} className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-400">Image #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: {
                                          ...b.data,
                                          galleryImages: (b.data.galleryImages || []).filter((_, i) => i !== idx)
                                        }
                                      }))}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={imgItem.url}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.galleryImages || [])];
                                      next[idx] = { ...next[idx], url: e.target.value };
                                      return { ...b, data: { ...b.data, galleryImages: next } };
                                    })}
                                    placeholder="Image URL..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white outline-none font-mono text-[11px]"
                                  />
                                  <input
                                    type="text"
                                    value={imgItem.title}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.galleryImages || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      return { ...b, data: { ...b.data, galleryImages: next } };
                                    })}
                                    placeholder="Caption..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Image Carousel Controls */}
                          {selectedBlock.type === 'carousel' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-slate-400 text-xs">Slides ({(selectedBlock.data.carouselSlides || []).length})</label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: {
                                      ...b.data,
                                      carouselSlides: [
                                        ...(b.data.carouselSlides || []),
                                        {
                                          id: generateBlockId(),
                                          imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
                                          title: 'New Slide Title',
                                          caption: 'Add informative slide caption text here.'
                                        }
                                      ]
                                    }
                                  }))}
                                  className="text-accent-400 hover:text-accent-300 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Slide
                                </button>
                              </div>
                              {(selectedBlock.data.carouselSlides || []).map((slide, idx) => (
                                <div key={slide.id || idx} className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-400">Slide #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: {
                                          ...b.data,
                                          carouselSlides: (b.data.carouselSlides || []).filter((_, i) => i !== idx)
                                        }
                                      }))}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={slide.imageUrl}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.carouselSlides || [])];
                                      next[idx] = { ...next[idx], imageUrl: e.target.value };
                                      return { ...b, data: { ...b.data, carouselSlides: next } };
                                    })}
                                    placeholder="Image URL..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white outline-none font-mono text-[11px]"
                                  />
                                  <input
                                    type="text"
                                    value={slide.title || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.carouselSlides || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      return { ...b, data: { ...b.data, carouselSlides: next } };
                                    })}
                                    placeholder="Title..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Icon List Controls */}
                          {selectedBlock.type === 'icon_list' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-slate-400 text-xs">List Items</label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: {
                                      ...b.data,
                                      iconListItems: [
                                        ...(b.data.iconListItems || []),
                                        { id: generateBlockId(), text: 'New verified benefit item', icon: 'CheckCircle2' }
                                      ]
                                    }
                                  }))}
                                  className="text-accent-400 hover:text-accent-300 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Item
                                </button>
                              </div>
                              {(selectedBlock.data.iconListItems || []).map((item, idx) => (
                                <div key={item.id || idx} className="p-2 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.iconListItems || [])];
                                      next[idx] = { ...next[idx], text: e.target.value };
                                      return { ...b, data: { ...b.data, iconListItems: next } };
                                    })}
                                    className="flex-1 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white text-xs outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: {
                                        ...b.data,
                                        iconListItems: (b.data.iconListItems || []).filter((_, i) => i !== idx)
                                      }
                                    }))}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Counter Controls */}
                          {selectedBlock.type === 'counter' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1 text-xs">Prefix</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.counterPrefix || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, counterPrefix: e.target.value }
                                    }))}
                                    placeholder=""
                                    className="w-full bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg text-white outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1 text-xs">Number</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.counterNumber || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, counterNumber: e.target.value }
                                    }))}
                                    placeholder="15,000"
                                    className="w-full bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg text-white outline-none font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-slate-400 mb-1 text-xs">Suffix</label>
                                  <input
                                    type="text"
                                    value={selectedBlock.data.counterSuffix || ''}
                                    onChange={(e) => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      data: { ...b.data, counterSuffix: e.target.value }
                                    }))}
                                    placeholder="+"
                                    className="w-full bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg text-white outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Counter Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.counterTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, counterTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Tabs Controls */}
                          {selectedBlock.type === 'tabs' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-slate-400 text-xs">Tabs ({(selectedBlock.data.tabItems || []).length})</label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: {
                                      ...b.data,
                                      tabItems: [
                                        ...(b.data.tabItems || []),
                                        { id: generateBlockId(), title: 'New Tab', content: 'Content for this tab section.' }
                                      ]
                                    }
                                  }))}
                                  className="text-accent-400 hover:text-accent-300 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Tab
                                </button>
                              </div>
                              {(selectedBlock.data.tabItems || []).map((tab, idx) => (
                                <div key={tab.id || idx} className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400">Tab #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: {
                                          ...b.data,
                                          tabItems: (b.data.tabItems || []).filter((_, i) => i !== idx)
                                        }
                                      }))}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={tab.title}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.tabItems || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      return { ...b, data: { ...b.data, tabItems: next } };
                                    })}
                                    placeholder="Tab Label..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs outline-none"
                                  />
                                  <textarea
                                    rows={2}
                                    value={tab.content}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.tabItems || [])];
                                      next[idx] = { ...next[idx], content: e.target.value };
                                      return { ...b, data: { ...b.data, tabItems: next } };
                                    })}
                                    placeholder="Tab Content..."
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Toggle Controls */}
                          {selectedBlock.type === 'toggle' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-slate-400 text-xs">Toggle Items</label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: {
                                      ...b.data,
                                      toggleItems: [
                                        ...(b.data.toggleItems || []),
                                        { id: generateBlockId(), title: 'New Toggle Item', content: 'Detailed explanation when toggled open.' }
                                      ]
                                    }
                                  }))}
                                  className="text-accent-400 hover:text-accent-300 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Item
                                </button>
                              </div>
                              {(selectedBlock.data.toggleItems || []).map((tItem, idx) => (
                                <div key={tItem.id || idx} className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400">Item #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: {
                                          ...b.data,
                                          toggleItems: (b.data.toggleItems || []).filter((_, i) => i !== idx)
                                        }
                                      }))}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={tItem.title}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.toggleItems || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      return { ...b, data: { ...b.data, toggleItems: next } };
                                    })}
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs outline-none"
                                  />
                                  <textarea
                                    rows={2}
                                    value={tItem.content}
                                    onChange={(e) => handleUpdateSelectedBlock(b => {
                                      const next = [...(b.data.toggleItems || [])];
                                      next[idx] = { ...next[idx], content: e.target.value };
                                      return { ...b, data: { ...b.data, toggleItems: next } };
                                    })}
                                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Social Icons Controls */}
                          {selectedBlock.type === 'social_icons' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Icon Shape</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {(['circle', 'rounded', 'square'] as const).map(shape => (
                                    <button
                                      key={shape}
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: { ...b.data, socialShape: shape }
                                      }))}
                                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                                        (selectedBlock.data.socialShape || 'circle') === shape
                                          ? 'bg-[#e01e5a] text-white'
                                          : 'bg-slate-800 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {shape}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Progress Bar Controls */}
                          {selectedBlock.type === 'progress_bar' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Skill / Progress Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.progressTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, progressTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">
                                  Percentage ({selectedBlock.data.progressPercentage || 95}%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={selectedBlock.data.progressPercentage || 95}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, progressPercentage: parseInt(e.target.value) }
                                  }))}
                                  className="w-full accent-[#39b54a]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Sound Cloud Controls */}
                          {selectedBlock.type === 'soundcloud' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Track Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.soundcloudTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, soundcloudTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Reciter / Artist</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.audioReciter || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, audioReciter: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Shortcode Controls */}
                          {selectedBlock.type === 'shortcode' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Shortcode Expression</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.shortcodeString || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, shortcodeString: e.target.value }
                                  }))}
                                  placeholder="[rohani_prayer_times]"
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* HTML Controls */}
                          {selectedBlock.type === 'html' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Custom HTML Code</label>
                                <textarea
                                  rows={5}
                                  value={selectedBlock.data.customHtml || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, customHtml: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 p-2 rounded-lg text-white font-mono text-xs outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* Menu Anchor Controls */}
                          {selectedBlock.type === 'menu_anchor' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Anchor Name (without #)</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.anchorName || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, anchorName: e.target.value }
                                  }))}
                                  placeholder="e.g. spiritual-services"
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Sidebar Controls */}
                          {selectedBlock.type === 'sidebar' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Sidebar Header Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.sidebarTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, sidebarTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Alert Controls */}
                          {selectedBlock.type === 'alert' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Alert Type</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {(['info', 'success', 'warning', 'danger'] as const).map(aType => (
                                    <button
                                      key={aType}
                                      type="button"
                                      onClick={() => handleUpdateSelectedBlock(b => ({
                                        ...b,
                                        data: { ...b.data, alertType: aType }
                                      }))}
                                      className={`py-1 rounded text-[11px] font-bold uppercase transition ${
                                        (selectedBlock.data.alertType || 'info') === aType
                                          ? 'bg-[#e01e5a] text-white'
                                          : 'bg-slate-800 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {aType}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Alert Title</label>
                                <input
                                  type="text"
                                  value={selectedBlock.data.alertTitle || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, alertTitle: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 mb-1 text-xs">Message</label>
                                <textarea
                                  rows={2}
                                  value={selectedBlock.data.alertDescription || ''}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    data: { ...b.data, alertDescription: e.target.value }
                                  }))}
                                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Columns Layout Selector & Elements Manager */}
                          {(selectedBlock.type === 'columns' || selectedBlock.type === 'inner_section') && (
                            <div className="space-y-4">
                              <div>
                                <label className="block font-bold text-slate-400 mb-2">Column Distribution</label>
                                <div className="grid grid-cols-3 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      columnsCount: 2,
                                      columnLayout: '50-50',
                                      columnsData: (b.columnsData?.length || 0) < 2 ? [...(b.columnsData || []), []] : b.columnsData?.slice(0, 2)
                                    }))}
                                    className={`p-2 rounded-lg border text-center font-bold ${
                                      selectedBlock.columnLayout === '50-50' ? 'border-accent-500 bg-accent-500/20 text-white' : 'border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    50 / 50
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      columnsCount: 3,
                                      columnLayout: '33-33-33',
                                      columnsData: (b.columnsData?.length || 0) < 3 ? [...(b.columnsData || []), [], []].slice(0, 3) : b.columnsData?.slice(0, 3)
                                    }))}
                                    className={`p-2 rounded-lg border text-center font-bold ${
                                      selectedBlock.columnLayout === '33-33-33' ? 'border-accent-500 bg-accent-500/20 text-white' : 'border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    33 / 33 / 33
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSelectedBlock(b => ({
                                      ...b,
                                      columnsCount: 2,
                                      columnLayout: '66-33',
                                      columnsData: (b.columnsData?.length || 0) < 2 ? [...(b.columnsData || []), []] : b.columnsData?.slice(0, 2)
                                    }))}
                                    className={`p-2 rounded-lg border text-center font-bold ${
                                      selectedBlock.columnLayout === '66-33' ? 'border-accent-500 bg-accent-500/20 text-white' : 'border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    66 / 33
                                  </button>
                                </div>
                              </div>

                              {/* Column Contents Manager */}
                              <div className="pt-3 border-t border-slate-700/80">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Column Elements Manager
                                  </label>
                                  <span className="text-[11px] text-slate-400">
                                    {selectedBlock.columnsCount || selectedBlock.columnsData?.length || 2} Columns
                                  </span>
                                </div>

                                {/* Column Tab Selector */}
                                <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg mb-3 border border-slate-800">
                                  {Array.from({ length: selectedBlock.columnsCount || selectedBlock.columnsData?.length || 2 }).map((_, cIdx) => {
                                    const count = selectedBlock.columnsData?.[cIdx]?.length || 0;
                                    const effectiveTab = activeColManagerTab >= (selectedBlock.columnsCount || 2) ? 0 : activeColManagerTab;
                                    const isActive = effectiveTab === cIdx;
                                    return (
                                      <button
                                        key={cIdx}
                                        type="button"
                                        onClick={() => setActiveColManagerTab(cIdx)}
                                        className={`flex-1 py-1.5 px-2 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                          isActive
                                            ? 'bg-[#e01e5a] text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                                        }`}
                                      >
                                        <span>Col {cIdx + 1}</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                          isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                          {count}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Active Column Items */}
                                {(() => {
                                  const effectiveTab = activeColManagerTab >= (selectedBlock.columnsCount || 2) ? 0 : activeColManagerTab;
                                  const colItems = selectedBlock.columnsData?.[effectiveTab] || [];

                                  return (
                                    <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-300">
                                          Column {effectiveTab + 1} Elements
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveTargetColumn({
                                              blockId: selectedBlock.id,
                                              colIndex: effectiveTab,
                                              colName: `Column ${effectiveTab + 1}`
                                            });
                                            setActiveSidebarTab('widgets');
                                          }}
                                          className="text-xs font-bold text-white bg-[#e01e5a] hover:bg-[#c9154e] px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                                        >
                                          <Plus className="w-3.5 h-3.5" /> Add Element
                                        </button>
                                      </div>

                                      {colItems.length === 0 ? (
                                        <div className="py-6 px-4 text-center border border-dashed border-slate-700/80 rounded-lg bg-slate-800/30">
                                          <p className="text-xs text-slate-400 mb-2">This column is empty</p>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveTargetColumn({
                                                blockId: selectedBlock.id,
                                                colIndex: effectiveTab,
                                                colName: `Column ${effectiveTab + 1}`
                                              });
                                              setActiveSidebarTab('widgets');
                                            }}
                                            className="text-xs font-bold text-sky-400 hover:text-sky-300 underline underline-offset-2 cursor-pointer"
                                          >
                                            Pick widget from sidebar to insert
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {colItems.map((item, itemIdx) => (
                                            <div
                                              key={item.id}
                                              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:border-sky-500/50 transition group"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setSelectedBlockId(item.id);
                                                  setActiveSidebarTab('inspector');
                                                }}
                                                className="flex items-center gap-2 text-left flex-1 min-w-0 pr-2 cursor-pointer"
                                              >
                                                <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-sky-400 shrink-0 text-xs font-bold">
                                                  {itemIdx + 1}
                                                </span>
                                                <div className="min-w-0">
                                                  <div className="text-xs font-bold text-white truncate">
                                                    {item.title || item.type.replace('_', ' ')}
                                                  </div>
                                                  <div className="text-[10px] text-slate-400 capitalize">
                                                    {item.type.replace('_', ' ')}
                                                  </div>
                                                </div>
                                              </button>

                                              <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setSelectedBlockId(item.id);
                                                    setActiveSidebarTab('inspector');
                                                  }}
                                                  title="Edit in Inspector"
                                                  className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-700 transition"
                                                >
                                                  <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleMoveBlock(item.id, 'up')}
                                                  disabled={itemIdx === 0}
                                                  title="Move Up"
                                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
                                                >
                                                  <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleMoveBlock(item.id, 'down')}
                                                  disabled={itemIdx === colItems.length - 1}
                                                  title="Move Down"
                                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
                                                >
                                                  <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDuplicateBlock(item.id)}
                                                  title="Duplicate"
                                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
                                                >
                                                  <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteBlock(item.id)}
                                                  title="Delete"
                                                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* --- STYLE TAB --- */}
                      {inspectorTab === 'style' && (
                        <div className="space-y-4">
                          {/* Text Color & Alignment */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Text Color</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={selectedBlock.styles.textColor || '#000000'}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    styles: { ...b.styles, textColor: e.target.value }
                                  }))}
                                  className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                                />
                                <span className="font-mono text-[11px]">{selectedBlock.styles.textColor || 'inherit'}</span>
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Background Color</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={selectedBlock.styles.bgColor || '#ffffff'}
                                  onChange={(e) => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    styles: { ...b.styles, bgColor: e.target.value }
                                  }))}
                                  className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                                />
                                <span className="font-mono text-[11px]">{selectedBlock.styles.bgColor || 'none'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Alignment */}
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Text Alignment</label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['left', 'center', 'right'] as const).map(align => (
                                <button
                                  key={align}
                                  type="button"
                                  onClick={() => handleUpdateSelectedBlock(b => ({
                                    ...b,
                                    styles: { ...b.styles, align }
                                  }))}
                                  className={`py-1.5 rounded-lg capitalize font-bold ${
                                    selectedBlock.styles.align === align 
                                      ? 'bg-accent-600 text-white' 
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {align}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Background Image & Overlay */}
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Background Image URL</label>
                            <input
                              type="text"
                              value={selectedBlock.styles.bgImageUrl || ''}
                              onChange={(e) => handleUpdateSelectedBlock(b => ({
                                ...b,
                                styles: { ...b.styles, bgImageUrl: e.target.value }
                              }))}
                              placeholder="https://..."
                              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                            />
                          </div>

                          {selectedBlock.styles.bgImageUrl && (
                            <div>
                              <label className="block font-bold text-slate-400 mb-1">
                                Dark Overlay Tint ({Math.round((selectedBlock.styles.bgOverlayOpacity || 0) * 100)}%)
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={selectedBlock.styles.bgOverlayOpacity || 0}
                                onChange={(e) => handleUpdateSelectedBlock(b => ({
                                  ...b,
                                  styles: { ...b.styles, bgOverlayOpacity: parseFloat(e.target.value) }
                                }))}
                                className="w-full accent-accent-500"
                              />
                            </div>
                          )}

                          {/* Padding & Corner Radius */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Vertical Padding</label>
                              <select
                                value={selectedBlock.styles.paddingY || 'md'}
                                onChange={(e) => handleUpdateSelectedBlock(b => ({
                                  ...b,
                                  styles: { ...b.styles, paddingY: e.target.value as any }
                                }))}
                                className="w-full bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white outline-none"
                              >
                                <option value="none">None (0px)</option>
                                <option value="sm">Small</option>
                                <option value="md">Medium</option>
                                <option value="lg">Large</option>
                                <option value="xl">Extra Large</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-slate-400 mb-1">Corner Radius</label>
                              <select
                                value={selectedBlock.styles.borderRadius || 'none'}
                                onChange={(e) => handleUpdateSelectedBlock(b => ({
                                  ...b,
                                  styles: { ...b.styles, borderRadius: e.target.value as any }
                                }))}
                                className="w-full bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white outline-none"
                              >
                                <option value="none">Sharp (None)</option>
                                <option value="md">Rounded (12px)</option>
                                <option value="xl">Pill Curve (24px)</option>
                                <option value="full">Circle / Capsule</option>
                              </select>
                            </div>
                          </div>

                          {/* Shadow */}
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Box Shadow</label>
                            <select
                              value={selectedBlock.styles.shadow || 'none'}
                              onChange={(e) => handleUpdateSelectedBlock(b => ({
                                ...b,
                                styles: { ...b.styles, shadow: e.target.value as any }
                              }))}
                              className="w-full bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white outline-none"
                            >
                              <option value="none">None</option>
                              <option value="sm">Subtle Shadow</option>
                              <option value="md">Elevated Card</option>
                              <option value="lg">High Lift (Floating)</option>
                              <option value="xl">Deep Cinematic</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* --- ADVANCED TAB --- */}
                      {inspectorTab === 'advanced' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Container Max Width</label>
                            <select
                              value={selectedBlock.styles.maxWidth || 'xl'}
                              onChange={(e) => handleUpdateSelectedBlock(b => ({
                                ...b,
                                styles: { ...b.styles, maxWidth: e.target.value as any }
                              }))}
                              className="w-full bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white outline-none"
                            >
                              <option value="sm">Narrow (max-w-xl)</option>
                              <option value="md">Medium (max-w-2xl)</option>
                              <option value="lg">Wide (max-w-4xl)</option>
                              <option value="xl">Standard Page (max-w-6xl)</option>
                              <option value="2xl">Broad (max-w-7xl)</option>
                              <option value="full">Full Screen Edge-to-Edge</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-400 mb-1">Entrance Animation</label>
                            <select
                              value={selectedBlock.styles.animation || 'none'}
                              onChange={(e) => handleUpdateSelectedBlock(b => ({
                                ...b,
                                styles: { ...b.styles, animation: e.target.value as any }
                              }))}
                              className="w-full bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white outline-none"
                            >
                              <option value="none">None</option>
                              <option value="fade-in">Fade In</option>
                              <option value="slide-up">Slide Up</option>
                              <option value="zoom-in">Zoom In</option>
                              <option value="pulse">Pulse</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                    <Sliders className="w-8 h-8 mb-3 opacity-40" />
                    <p className="font-bold text-slate-400 text-sm">No Widget Selected</p>
                    <p className="text-xs mt-1 max-w-[200px]">
                      Click on any section or component on the canvas to inspect and customize its styles.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PAGE SETTINGS */}
            {activeSidebarTab === 'structure' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs text-slate-300">
                <div>
                  <label className="block font-bold text-slate-400 mb-1.5">Section / Page Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none focus:border-accent-500"
                    placeholder="e.g. Istikhara Guidance Page"
                  />
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <span className="font-bold text-white text-xs block">Target Type</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPage(false)}
                      className={`p-2 rounded-lg font-bold text-center transition ${
                        !isPage ? 'bg-accent-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Section in Page
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPage(true)}
                      className={`p-2 rounded-lg font-bold text-center transition ${
                        isPage ? 'bg-accent-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      New Standalone Page
                    </button>
                  </div>

                  {!isPage ? (
                    <div>
                      <label className="block font-bold text-slate-400 mb-1">Target Page URL</label>
                      <select
                        value={pageTarget}
                        onChange={(e) => setPageTarget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-white outline-none"
                      >
                        <option value="/">Homepage (/)</option>
                        <option value="/services">Services Page (/services)</option>
                        <option value="/store">Store / Products (/store)</option>
                        <option value="/blog">Blog (/blog)</option>
                        <option value="all">All Pages (Sitewide)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-400 mb-1">Page URL Slug</label>
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                        <span className="text-slate-500 font-mono">/p/</span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                          placeholder="rohani-healing"
                          className="w-full bg-transparent text-accent-400 font-mono font-bold outline-none pl-1"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Will be accessible at: <span className="text-slate-300 font-mono">/p/{slug || 'my-page'}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1.5">Publish Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`py-2 rounded-lg font-bold text-center transition ${
                        status === 'published' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('draft')}
                      className={`py-2 rounded-lg font-bold text-center transition ${
                        status === 'draft' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>

                {/* Clear canvas button */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all blocks on this page?')) {
                        setBlocks([]);
                        setSelectedBlockId(null);
                      }
                    }}
                    className="w-full py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Canvas
                  </button>
                </div>
              </div>
            )}

            {/* Elementor Permanent Dock Bottom Bar */}
            <div className="p-2.5 bg-[#e8ecef] border-t border-[#d5d9de] flex items-center justify-between gap-2 z-30 flex-shrink-0">
              <div className="flex items-center gap-1 text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('structure')}
                  className={`p-1.5 rounded transition cursor-pointer ${
                    activeSidebarTab === 'structure' ? 'bg-white text-[#e01e5a] shadow-xs' : 'hover:bg-slate-200 text-slate-600'
                  }`}
                  title="Page Settings"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const views: ('desktop' | 'tablet' | 'mobile')[] = ['desktop', 'tablet', 'mobile'];
                    const nextIdx = (views.indexOf(deviceView) + 1) % views.length;
                    setDeviceView(views[nextIdx]);
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded transition text-slate-600 cursor-pointer"
                  title={`Current: ${deviceView.toUpperCase()} (Click to toggle)`}
                >
                  {deviceView === 'desktop' && <Monitor className="w-4 h-4" />}
                  {deviceView === 'tablet' && <Tablet className="w-4 h-4" />}
                  {deviceView === 'mobile' && <Smartphone className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="p-1.5 hover:bg-slate-200 rounded transition text-slate-600 cursor-pointer"
                  title="Preview Page"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Big Green Elementor Update / Publish Button */}
              <button
                type="button"
                onClick={handleSavePage}
                disabled={isSaving}
                className="flex-1 py-2 px-3 bg-[#39b54a] hover:bg-[#2fa03e] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Click to Apply and Save All Changes to Live Website"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>SAVING...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>UPDATED!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>UPDATE</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Center Live Canvas */}
        <main 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onClick={() => setSelectedBlockId(null)}
          className="flex-1 bg-slate-950 overflow-y-auto p-4 md:p-8 flex flex-col items-center custom-scrollbar"
        >
          {/* Responsive Canvas Width Container */}
          <div 
            className={`w-full transition-all duration-300 shadow-2xl bg-white text-slate-900 rounded-xl overflow-hidden min-h-[700px] flex flex-col ${
              deviceView === 'mobile' ? 'max-w-[375px] my-4 ring-8 ring-slate-800 rounded-3xl' :
              deviceView === 'tablet' ? 'max-w-[768px] my-4 ring-8 ring-slate-800 rounded-2xl' :
              'max-w-full'
            }`}
          >
            {/* Top Canvas Header with Inline Page Title */}
            <div className="w-full px-6 md:px-12 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2 group/title">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-[#e01e5a] outline-none transition w-full px-1 py-0.5"
                    placeholder="New page demo"
                  />
                  <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover/title:opacity-100 transition cursor-pointer" />
                </div>
                {isPage && (
                  <div className="text-xs text-slate-400 mt-1 pl-1 flex items-center gap-2">
                    <span>Page URL:</span>
                    <span className="font-mono text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                      /p/{slug}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Blocks Rendered */}
            {blocks.length > 0 && (
              <ElementorRenderer
                blocks={blocks}
                isBuilderMode={!isPreviewMode}
                selectedBlockId={selectedBlockId}
                onSelectBlock={(id) => setSelectedBlockId(id)}
                onMoveBlock={handleMoveBlock}
                onDuplicateBlock={handleDuplicateBlock}
                onDeleteBlock={handleDeleteBlock}
                onAddBlockHere={(targetIdx) => {
                  const widget = WIDGET_CATALOG.find(w => w.type === 'heading') || WIDGET_CATALOG[0];
                  handleAddWidget(widget, targetIdx);
                }}
                onDropBlockIntoColumn={handleAddBlockToColumn}
                onAddBlockToColumn={handleAddBlockToColumn}
              />
            )}

            {/* Signature WordPress Elementor Drop Zone Box (Empty State or Add Section Below) */}
            {!isPreviewMode && (
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverDropzone(true); }}
                onDragLeave={() => setDragOverDropzone(false)}
                onDrop={(e) => {
                  setDragOverDropzone(false);
                  handleCanvasDrop(e);
                }}
                className={`mx-6 md:mx-12 my-8 p-10 md:p-14 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all ${
                  dragOverDropzone 
                    ? 'border-[#e01e5a] bg-pink-50/50 scale-[1.01]' 
                    : 'border-[#c2c8d0] bg-[#fcfcfd] hover:border-slate-400'
                }`}
              >
                {!isSelectingStructure ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-3">
                      {/* Elementor Pink Plus Button */}
                      <button
                        type="button"
                        onClick={() => setIsSelectingStructure(true)}
                        className="w-12 h-12 rounded-full bg-[#e01e5a] hover:bg-[#c2184d] text-white flex items-center justify-center shadow-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                        title="Add New Section / Select Structure"
                      >
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                      </button>

                      {/* Elementor Grey Folder Button */}
                      <button
                        type="button"
                        onClick={() => setShowTemplatesModal(true)}
                        className="w-12 h-12 rounded-full bg-[#54595f] hover:bg-[#43474c] text-white flex items-center justify-center shadow-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                        title="Add Template from Library"
                      >
                        <Folder className="w-5 h-5 fill-white text-white" />
                      </button>
                    </div>
                    <p className="text-sm italic text-slate-400 mt-4 select-none font-sans">
                      Drag widget here
                    </p>
                  </div>
                ) : (
                  /* Elementor Structure Selector */
                  <div className="w-full max-w-lg flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-3 px-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        SELECT YOUR STRUCTURE
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSelectingStructure(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
                      {/* 100% */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddStructure(1, '100');
                          setIsSelectingStructure(false);
                        }}
                        className="p-2 bg-white border border-slate-300 hover:border-[#e01e5a] rounded flex flex-col items-center gap-1.5 shadow-2xs hover:shadow transition group cursor-pointer"
                        title="1 Column (100%)"
                      >
                        <div className="w-full h-7 bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                        <span className="text-[10px] font-bold text-slate-600">100%</span>
                      </button>
                      {/* 50 / 50 */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddStructure(2, '50-50');
                          setIsSelectingStructure(false);
                        }}
                        className="p-2 bg-white border border-slate-300 hover:border-[#e01e5a] rounded flex flex-col items-center gap-1.5 shadow-2xs hover:shadow transition group cursor-pointer"
                        title="2 Columns (50 / 50)"
                      >
                        <div className="w-full h-7 flex gap-1">
                          <div className="w-1/2 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-1/2 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">50 / 50</span>
                      </button>
                      {/* 33 / 33 / 33 */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddStructure(3, '33-33-33');
                          setIsSelectingStructure(false);
                        }}
                        className="p-2 bg-white border border-slate-300 hover:border-[#e01e5a] rounded flex flex-col items-center gap-1.5 shadow-2xs hover:shadow transition group cursor-pointer"
                        title="3 Columns (33 / 33 / 33)"
                      >
                        <div className="w-full h-7 flex gap-0.5">
                          <div className="w-1/3 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-1/3 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-1/3 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">33 / 33 / 33</span>
                      </button>
                      {/* 4 Columns */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddStructure(4, '25-25-25-25');
                          setIsSelectingStructure(false);
                        }}
                        className="p-2 bg-white border border-slate-300 hover:border-[#e01e5a] rounded flex flex-col items-center gap-1.5 shadow-2xs hover:shadow transition group cursor-pointer"
                        title="4 Columns (25 / 25 / 25 / 25)"
                      >
                        <div className="w-full h-7 flex gap-0.5">
                          <div className="w-1/4 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-1/4 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-1/4 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-1/4 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">4 Cols</span>
                      </button>
                      {/* 33 / 66 */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddStructure(2, '33-66');
                          setIsSelectingStructure(false);
                        }}
                        className="p-2 bg-white border border-slate-300 hover:border-[#e01e5a] rounded flex flex-col items-center gap-1.5 shadow-2xs hover:shadow transition group cursor-pointer"
                        title="2 Columns (33 / 66)"
                      >
                        <div className="w-full h-7 flex gap-1">
                          <div className="w-1/3 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-2/3 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">33 / 66</span>
                      </button>
                      {/* 66 / 33 */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddStructure(2, '66-33');
                          setIsSelectingStructure(false);
                        }}
                        className="p-2 bg-white border border-slate-300 hover:border-[#e01e5a] rounded flex flex-col items-center gap-1.5 shadow-2xs hover:shadow transition group cursor-pointer"
                        title="2 Columns (66 / 33)"
                      >
                        <div className="w-full h-7 flex gap-1">
                          <div className="w-2/3 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                          <div className="w-1/3 h-full bg-slate-200 group-hover:bg-pink-100 rounded border border-slate-300 transition"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">66 / 33</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-lg text-white">Pre-built Elementor Section Templates</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
              {ELEMENTOR_PRESET_TEMPLATES.map(tmpl => (
                <div 
                  key={tmpl.id}
                  className="rounded-2xl bg-slate-800/80 border border-slate-700/80 overflow-hidden hover:border-accent-500 transition group flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img 
                      src={tmpl.thumbnail} 
                      alt={tmpl.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-accent-400">
                      {tmpl.category}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-white mb-1">{tmpl.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{tmpl.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInsertTemplate(tmpl)}
                      className="w-full py-2.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Insert Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* JSON Import / Export Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-white">Import / Export Page JSON</h3>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Copy the JSON below to back up this page layout, or paste a saved JSON schema to load components.
            </p>
            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-xs text-slate-200 outline-none focus:border-accent-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonText);
                    if (Array.isArray(parsed)) {
                      setBlocks(parsed);
                      setShowJsonModal(false);
                    } else {
                      alert('Invalid JSON: Must be an array of Elementor blocks');
                    }
                  } catch (e: any) {
                    alert('JSON Parse Error: ' + e.message);
                  }
                }}
                className="px-5 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold shadow-md"
              >
                Load JSON into Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
