import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Sparkles, 
  Moon, 
  BookOpen, 
  Compass, 
  ShieldCheck, 
  Briefcase, 
  Brain, 
  ShieldAlert, 
  Activity, 
  Zap, 
  HeartCrack, 
  Wind, 
  Mountain, 
  Cloud, 
  Heart, 
  Lock, 
  CircleX, 
  FileSignature, 
  Image as ImageIcon, 
  TriangleAlert, 
  Frown, 
  Plane, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  X, 
  ArrowLeft, 
  FolderPlus, 
  Tag, 
  Clock, 
  Layers, 
  Check, 
  Filter,
  Package,
  ScrollText,
  AlertCircle
} from 'lucide-react';
import { 
  ServiceItem, 
  ServiceCategoryItem, 
  getStoredServices, 
  saveStoredServices, 
  getStoredServiceCategories, 
  saveStoredServiceCategories 
} from '../data/servicesData';
import { supabase } from '../lib/supabase';
import { Product } from '../data/products';

// Map icon names to Lucide icons
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>> = {
  Moon,
  BookOpen,
  Compass,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Plane,
  Brain,
  ShieldAlert,
  Activity,
  Zap,
  HeartCrack,
  Wind,
  Mountain,
  Cloud,
  Heart,
  Lock,
  CircleX,
  FileSignature,
  ImageIcon,
  TriangleAlert,
  Frown,
};

const AVAILABLE_ICONS = [
  { name: "Moon", label: "Crescent Moon (Dua)", icon: Moon },
  { name: "BookOpen", label: "Open Quran / Wazaif", icon: BookOpen },
  { name: "Compass", label: "Compass (Istikhara)", icon: Compass },
  { name: "Sparkles", label: "Spiritual Sparkles (Rohani Ilaj)", icon: Sparkles },
  { name: "ShieldCheck", label: "Sacred Shield (Jadu Ki Kaat)", icon: ShieldCheck },
  { name: "Briefcase", label: "Briefcase (Career / Job)", icon: Briefcase },
  { name: "Plane", label: "Airplane (Abroad Journey)", icon: Plane },
  { name: "Heart", label: "Heart (Love / Marriage)", icon: Heart },
  { name: "Lock", label: "Lock (Bandish Tod)", icon: Lock },
  { name: "Brain", label: "Mind / Brain (Waswas / Peace)", icon: Brain },
  { name: "ShieldAlert", label: "Protection Shield (Fear / Nazar)", icon: ShieldAlert },
  { name: "Activity", label: "Health / Shifa", icon: Activity },
  { name: "Zap", label: "Divine Energy", icon: Zap },
  { name: "Wind", label: "Restlessness Healing", icon: Wind },
  { name: "Mountain", label: "Grounding / Earth Magic", icon: Mountain },
];

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface ServicesManagerProps {
  products?: Product[];
  posts?: any[];
  onNotification?: (msg: string) => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  products = [],
  posts = [],
  onNotification,
}) => {
  // Main view state
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'categories'>('services');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Data lists
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);

  // Category relation editing state (detail, products, articles)
  const [editingCategoryRelationId, setEditingCategoryRelationId] = useState<string | null>(null);
  const [categoryRelationTab, setCategoryRelationTab] = useState<'details' | 'products' | 'articles'>('details');
  const [relationSearchTerm, setRelationSearchTerm] = useState('');

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [previewContentService, setPreviewContentService] = useState<ServiceItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'service' | 'category'; id: string; title: string } | null>(null);

  // Service Form State
  const [serviceForm, setServiceForm] = useState<{
    title: string;
    description: string;
    content: string;
    category: string;
    categoryId: string;
    icon: string;
    imageUrl: string;
    price: string;
    duration: string;
    features: string[];
    featureInput: string;
    status: 'active' | 'inactive';
  }>({
    title: '',
    description: '',
    content: '',
    category: '',
    categoryId: '',
    icon: 'Sparkles',
    imageUrl: '',
    price: 'Free Consultation',
    duration: '24 Hours',
    features: [],
    featureInput: '',
    status: 'active',
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    description: string;
    imageUrl: string;
  }>({
    name: '',
    description: '',
    imageUrl: '',
  });

  // Validation Error States
  const [serviceFormError, setServiceFormError] = useState<string | null>(null);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

  // Initial Load from Supabase + LocalStorage fallback
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // 1. Load Categories
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: ServiceCategoryItem[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          imageUrl: c.image_url || '',
          relatedProducts: c.related_products || [],
          relatedArticles: c.related_articles || [],
          createdAt: c.created_at,
        }));
        setCategories(mapped);
        saveStoredServiceCategories(mapped);
      } else {
        // Fallback to local storage
        const localCats = getStoredServiceCategories();
        setCategories(localCats);
      }
    } catch (e) {
      console.warn('Error loading categories from Supabase, using local:', e);
      setCategories(getStoredServiceCategories());
    }

    // 2. Load Services
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: ServiceItem[] = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description || '',
          content: s.content || '',
          category: s.category || 'Spiritual Healing',
          categoryId: s.category_id,
          icon: s.icon || 'Sparkles',
          imageUrl: s.image_url || '',
          price: s.price || 'Free Consultation',
          duration: s.duration || '24 Hours',
          features: Array.isArray(s.features) ? s.features : [],
          status: s.status === 'inactive' ? 'inactive' : 'active',
          createdAt: s.created_at,
        }));
        setServices(mapped);
        saveStoredServices(mapped);
      } else {
        // Fallback to local storage
        const localSrv = getStoredServices();
        setServices(localSrv);
      }
    } catch (e) {
      console.warn('Error loading services from Supabase, using local:', e);
      setServices(getStoredServices());
    } finally {
      setIsLoading(false);
    }
  };

  const notify = (msg: string) => {
    if (onNotification) onNotification(msg);
  };

  // --- SERVICE MODAL HANDLERS ---
  const handleOpenAddService = () => {
    setServiceFormError(null);
    const defaultCat = categories[0]?.name || 'Spiritual Healing (Rohani Ilaj)';
    const defaultCatId = categories[0]?.id || '';
    setServiceForm({
      title: '',
      description: '',
      content: '',
      category: defaultCat,
      categoryId: defaultCatId,
      icon: 'Sparkles',
      imageUrl: '',
      price: 'Free Consultation',
      duration: '24 Hours',
      features: [
        'Quranic and authentic Sunnah remedy',
        'Confidential personalized guidance',
      ],
      featureInput: '',
      status: 'active',
    });
    setEditingServiceId(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setServiceFormError(null);
    setServiceForm({
      title: service.title,
      description: service.description,
      content: service.content || '',
      category: service.category || categories[0]?.name || 'Spiritual Healing (Rohani Ilaj)',
      categoryId: service.categoryId || '',
      icon: service.icon || 'Sparkles',
      imageUrl: service.imageUrl || '',
      price: service.price || 'Free Consultation',
      duration: service.duration || '24 Hours',
      features: service.features || [],
      featureInput: '',
      status: service.status || 'active',
    });
    setEditingServiceId(service.id);
    setIsServiceModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!serviceForm.featureInput.trim()) return;
    setServiceForm({
      ...serviceForm,
      features: [...serviceForm.features, serviceForm.featureInput.trim()],
      featureInput: '',
    });
  };

  const handleRemoveFeature = (index: number) => {
    setServiceForm({
      ...serviceForm,
      features: serviceForm.features.filter((_, i) => i !== index),
    });
  };

  const handleSaveService = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serviceForm.title.trim()) {
      setServiceFormError('Please enter a service name/title.');
      return;
    }
    setServiceFormError(null);

    setIsLoading(true);

    const isUUID = (str?: string) =>
      typeof str === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const safeDescription =
      serviceForm.description.trim() ||
      `Personalized spiritual service and consultation for ${serviceForm.title.trim()}.`;
    const safeContent = serviceForm.content.trim() || safeDescription;
    const safeCategory = serviceForm.category || categories[0]?.name || 'Spiritual Healing (Rohani Ilaj)';
    const safeCategoryId = serviceForm.categoryId || categories.find(c => c.name === safeCategory)?.id || '';

    const servicePayload: ServiceItem = {
      id: editingServiceId || `srv-${Date.now()}`,
      title: serviceForm.title.trim(),
      slug: serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: safeDescription,
      content: safeContent,
      category: safeCategory,
      categoryId: safeCategoryId,
      icon: serviceForm.icon || 'Sparkles',
      imageUrl: serviceForm.imageUrl.trim(),
      price: serviceForm.price.trim() || 'Free Consultation',
      duration: serviceForm.duration.trim() || '24 Hours',
      features: serviceForm.features,
      status: serviceForm.status || 'active',
      createdAt: new Date().toISOString(),
    };

    let updatedList: ServiceItem[];
    if (editingServiceId) {
      updatedList = services.map(s => s.id === editingServiceId ? { ...servicePayload, id: editingServiceId } : s);
    } else {
      updatedList = [servicePayload, ...services];
    }

    // 1. Save to Local Storage immediately
    setServices(updatedList);
    saveStoredServices(updatedList);

    // Broadcast update across the entire applet
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('services-updated', { detail: updatedList }));
    }

    // 2. Sync to Supabase services table
    try {
      if (editingServiceId) {
        await supabase
          .from('services')
          .update({
            title: servicePayload.title,
            slug: servicePayload.slug,
            description: servicePayload.description,
            content: servicePayload.content,
            category: servicePayload.category,
            category_id: isUUID(servicePayload.categoryId) ? servicePayload.categoryId : null,
            icon: servicePayload.icon,
            image_url: servicePayload.imageUrl || null,
            price: servicePayload.price,
            duration: servicePayload.duration,
            features: servicePayload.features,
            status: servicePayload.status,
          })
          .eq('id', editingServiceId);
      } else {
        await supabase
          .from('services')
          .insert([{
            id: servicePayload.id,
            title: servicePayload.title,
            slug: servicePayload.slug,
            description: servicePayload.description,
            content: servicePayload.content,
            category: servicePayload.category,
            category_id: isUUID(servicePayload.categoryId) ? servicePayload.categoryId : null,
            icon: servicePayload.icon,
            image_url: servicePayload.imageUrl || null,
            price: servicePayload.price,
            duration: servicePayload.duration,
            features: servicePayload.features,
            status: servicePayload.status,
          }]);
      }
    } catch (err) {
      console.warn('Could not sync service to Supabase (saved locally):', err);
    }

    setIsLoading(false);
    setIsServiceModalOpen(false);
    notify(editingServiceId ? 'Service updated successfully with all content!' : 'New spiritual service added successfully and saved!');
  };

  // --- CATEGORY MODAL HANDLERS ---
  const handleOpenAddCategory = () => {
    setCategoryFormError(null);
    setCategoryForm({
      name: '',
      description: '',
      imageUrl: '',
    });
    setEditingCategoryId(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ServiceCategoryItem) => {
    setCategoryFormError(null);
    setCategoryForm({
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
    });
    setEditingCategoryId(cat.id);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!categoryForm.name.trim()) {
      setCategoryFormError('Please enter a category name.');
      return;
    }
    setCategoryFormError(null);

    setIsLoading(true);
    const categoryPayload: ServiceCategoryItem = {
      id: editingCategoryId || `cat-${Date.now()}`,
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      imageUrl: categoryForm.imageUrl.trim(),
      relatedProducts: [],
      relatedArticles: [],
      createdAt: new Date().toISOString(),
    };

    let updatedCats: ServiceCategoryItem[];
    if (editingCategoryId) {
      updatedCats = categories.map(c => c.id === editingCategoryId ? {
        ...c,
        name: categoryPayload.name,
        description: categoryPayload.description,
        imageUrl: categoryPayload.imageUrl,
      } : c);
    } else {
      updatedCats = [categoryPayload, ...categories];
    }

    // 1. Save to Local Storage immediately
    setCategories(updatedCats);
    saveStoredServiceCategories(updatedCats);

    // Broadcast update across the entire applet
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('categories-updated', { detail: updatedCats }));
    }

    // 2. Sync to Supabase service_categories table
    try {
      if (editingCategoryId) {
        await supabase
          .from('service_categories')
          .update({
            name: categoryPayload.name,
            description: categoryPayload.description,
            image_url: categoryPayload.imageUrl,
          })
          .eq('id', editingCategoryId);
      } else {
        await supabase
          .from('service_categories')
          .insert([{
            name: categoryPayload.name,
            description: categoryPayload.description,
            image_url: categoryPayload.imageUrl,
            related_products: [],
            related_articles: [],
          }]);
      }
    } catch (err) {
      console.warn('Could not sync category to Supabase (saved locally):', err);
    }

    setIsLoading(false);
    setIsCategoryModalOpen(false);
    notify(editingCategoryId ? 'Service category updated successfully!' : 'New category created successfully!');
  };

  // --- DELETE HANDLERS ---
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    if (type === 'service') {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      saveStoredServices(updated);
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (e) {
        console.warn('Could not delete service from Supabase:', e);
      }
      notify('Service removed successfully.');
    } else {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      saveStoredServiceCategories(updated);
      try {
        await supabase.from('service_categories').delete().eq('id', id);
      } catch (e) {
        console.warn('Could not delete category from Supabase:', e);
      }
      notify('Category removed successfully.');
    }

    setDeleteConfirm(null);
  };

  // --- RELATION MANAGEMENT (Products & Articles) ---
  const updateCategoryRelations = async (
    categoryId: string,
    type: "products" | "articles",
    relations: string[]
  ) => {
    const updated = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          [type === "products" ? "relatedProducts" : "relatedArticles"]: relations,
        };
      }
      return cat;
    });

    setCategories(updated);
    saveStoredServiceCategories(updated);

    try {
      const updateData = type === "products" ? { related_products: relations } : { related_articles: relations };
      await supabase.from("service_categories").update(updateData).eq("id", categoryId);
    } catch (e) {
      console.warn("Failed updating category relations in Supabase", e);
    }
    notify(`Updated related ${type} successfully!`);
  };

  // Filtered lists
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.content && service.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === 'all' || service.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If currently managing relations for a specific category:
  if (editingCategoryRelationId) {
    const activeCat = categories.find(c => c.id === editingCategoryRelationId);
    if (!activeCat) {
      setEditingCategoryRelationId(null);
      return null;
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
        <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingCategoryRelationId(null);
                setRelationSearchTerm('');
              }}
              className="text-gray-600 hover:text-spirit-900 border border-gray-200 bg-white rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowLeft size={16} /> Back to Services
            </button>
            <div>
              <span className="text-[10px] font-bold text-spirit-600 uppercase tracking-wider block">Managing Relations</span>
              <h2 className="font-serif font-bold text-xl text-spirit-950 line-clamp-1">{activeCat.name}</h2>
            </div>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white p-1 gap-1">
            <button
              type="button"
              onClick={() => setCategoryRelationTab('products')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                categoryRelationTab === 'products' ? 'bg-spirit-900 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Related Products ({activeCat.relatedProducts?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setCategoryRelationTab('articles')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                categoryRelationTab === 'articles' ? 'bg-spirit-900 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Related Articles ({activeCat.relatedArticles?.length || 0})
            </button>
          </div>
        </div>

        <div className="p-6">
          {categoryRelationTab === 'products' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Select products from your catalog to recommend alongside this service category in the mega-menu and category landing page.
                </p>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={relationSearchTerm}
                  onChange={(e) => setRelationSearchTerm(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none w-full sm:w-64"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {products
                  .filter(p => !relationSearchTerm || p.name.toLowerCase().includes(relationSearchTerm.toLowerCase()))
                  .map(p => {
                    const isSelected = (activeCat.relatedProducts || []).includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          const current = activeCat.relatedProducts || [];
                          const updated = isSelected ? current.filter(id => id !== p.id) : [...current, p.id];
                          updateCategoryRelations(activeCat.id, 'products', updated);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                          isSelected ? 'bg-spirit-50 border-spirit-400 ring-1 ring-spirit-400' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{p.name}</h4>
                            <span className="text-[11px] font-bold text-spirit-700">{p.price}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                          isSelected ? 'bg-spirit-900 border-spirit-900 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Select educational articles & blog guides to link under this service category.
                </p>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={relationSearchTerm}
                  onChange={(e) => setRelationSearchTerm(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none w-full sm:w-64"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {posts
                  .filter(post => !relationSearchTerm || (post.title || '').toLowerCase().includes(relationSearchTerm.toLowerCase()))
                  .map(post => {
                    const isSelected = (activeCat.relatedArticles || []).includes(post.id);
                    return (
                      <div
                        key={post.id}
                        onClick={() => {
                          const current = activeCat.relatedArticles || [];
                          const updated = isSelected ? current.filter(id => id !== post.id) : [...current, post.id];
                          updateCategoryRelations(activeCat.id, 'articles', updated);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                          isSelected ? 'bg-spirit-50 border-spirit-400 ring-1 ring-spirit-400' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{post.title || 'Untitled Article'}</h4>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{post.category || 'Article'}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                          isSelected ? 'bg-spirit-900 border-spirit-900 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-spirit-100 text-spirit-900 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-spirit-700" />
              </span>
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">
                  Manage Spiritual Services & Categories
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure services with full rich content, categories for the mega-menu, pricing, and spiritual benefits.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: + Add Service and + Add Category */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-2 bg-white hover:bg-spirit-50 text-spirit-900 border border-spirit-300 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition hover:border-spirit-400"
            >
              <FolderPlus size={16} className="text-spirit-700" />
              <span>+ Add Category</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddService}
              className="inline-flex items-center gap-2 bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-sm transition"
            >
              <Plus size={17} strokeWidth={2.5} />
              <span>+ Add Service</span>
            </button>
          </div>
        </div>

        {/* Sub-tab switcher + Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
          {/* Subtabs: Services vs Categories */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('services')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'services'
                  ? 'bg-white text-spirit-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Sparkles size={14} className={activeSubTab === 'services' ? 'text-spirit-700' : 'text-gray-400'} />
              <span>Services</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeSubTab === 'services' ? 'bg-spirit-100 text-spirit-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {services.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'categories'
                  ? 'bg-white text-spirit-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FolderPlus size={14} className={activeSubTab === 'categories' ? 'text-spirit-700' : 'text-gray-400'} />
              <span>Categories</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeSubTab === 'categories' ? 'bg-spirit-100 text-spirit-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {categories.length}
              </span>
            </button>
          </div>

          {/* Search Bar & Category Filter */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {activeSubTab === 'services' && (
              <div className="relative">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-spirit-500"
                >
                  <option value="all">All Categories ({services.length})</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeSubTab === 'services' ? "Search services..." : "Search categories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SERVICES TAB CONTENT (PROPER CLEAN FORMATTING)                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Services Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchTerm || selectedCategoryFilter !== 'all'
                  ? "No services match your current search or category filter."
                  : "You have not added any services yet. Click '+ Add Service' to create your first spiritual solution."}
              </p>
              <button
                onClick={handleOpenAddService}
                className="mt-4 inline-flex items-center gap-2 bg-spirit-900 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-spirit-800 transition shadow-sm"
              >
                <Plus size={14} strokeWidth={2.5} /> Add First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => {
                const IconComponent = ICON_MAP[service.icon] || Sparkles;
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-spirit-300 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header Row of Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-spirit-50 to-spirit-100 border border-spirit-200 flex items-center justify-center text-spirit-900 shadow-2xs shrink-0 overflow-hidden">
                            {service.imageUrl ? (
                              <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                            ) : (
                              <IconComponent size={22} className="text-spirit-800" strokeWidth={1.75} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-spirit-50 text-spirit-800 border border-spirit-100">
                                {service.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                service.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {service.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <h3 className="font-serif font-bold text-base text-gray-950 mt-1">
                              {service.title}
                            </h3>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {service.content && (
                            <button
                              type="button"
                              onClick={() => setPreviewContentService(service)}
                              title="View full content & details"
                              className="p-1.5 text-gray-400 hover:text-spirit-900 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditService(service)}
                            title="Edit service"
                            className="p-1.5 text-gray-400 hover:text-spirit-900 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({
                              isOpen: true,
                              type: 'service',
                              id: service.id,
                              title: service.title,
                            })}
                            title="Delete service"
                            className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Key features bullets preview if present */}
                      {service.features && service.features.length > 0 && (
                        <div className="mt-3 space-y-1 pt-2 border-t border-gray-100">
                          {service.features.slice(0, 2).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <CheckCircle2 size={12} className="text-spirit-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                          {service.features.length > 2 && (
                            <span className="text-[10px] text-spirit-700 font-bold block pl-4">
                              +{service.features.length - 2} more benefits
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata Bar */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-spirit-900 bg-spirit-50 px-2 py-0.5 rounded border border-spirit-100">
                          {service.price || 'Free Consultation'}
                        </span>
                        {service.duration && (
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            {service.duration}
                          </span>
                        )}
                      </div>

                      {service.content && (
                        <button
                          type="button"
                          onClick={() => setPreviewContentService(service)}
                          className="text-spirit-700 hover:text-spirit-900 font-bold text-[11px] flex items-center gap-1 hover:underline"
                        >
                          Details & Procedure &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CATEGORIES TAB CONTENT (PROPER CLEAN FORMATTING)                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <FolderPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Categories Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No categories available. Create service categories to organize the mega-menu and storefront navigation.
              </p>
              <button
                onClick={handleOpenAddCategory}
                className="mt-4 inline-flex items-center gap-2 bg-spirit-900 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-spirit-800 transition"
              >
                <Plus size={14} /> + Add Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-spirit-300 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="w-full h-32 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-100 mb-3">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                          <Package size={28} className="text-slate-300 mb-1" />
                          <span className="text-[10px] font-bold">No Image</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                        {services.filter(s => s.category === cat.name || s.categoryId === cat.id).length} Services
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-gray-900 leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description || "No description provided."}
                    </p>

                    {/* Relations badge counts */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {cat.relatedProducts?.length || 0} Products
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                        {cat.relatedArticles?.length || 0} Articles
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryRelationId(cat.id);
                        setCategoryRelationTab('products');
                      }}
                      className="text-xs font-bold text-spirit-700 hover:text-spirit-900 flex items-center gap-1 hover:underline"
                    >
                      <Layers size={13} />
                      <span>Link Items</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        title="Edit category"
                        className="p-1.5 text-gray-400 hover:text-spirit-900 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({
                          isOpen: true,
                          type: 'category',
                          id: cat.id,
                          title: cat.name,
                        })}
                        title="Delete category"
                        className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADD / EDIT SERVICE POPUP MODAL                                         */}
      {/* ========================================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsServiceModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-spirit-200 z-10 animate-scale-up p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-spirit-100 text-spirit-900 flex items-center justify-center">
                  <Sparkles size={20} className="text-spirit-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-spirit-950">
                    {editingServiceId ? "Edit Spiritual Service" : "+ Add Spiritual Service"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Save service with full content, category assignment, pricing, and sacred spiritual benefits into database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-5">
              {serviceFormError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{serviceFormError}</span>
                </div>
              )}

              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Service Name / Title *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) => {
                      setServiceForm({ ...serviceForm, title: e.target.value });
                      if (serviceFormError) setServiceFormError(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. Abroad Journey Visa Istikhara"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Service Category
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => {
                      const selCat = categories.find(c => c.name === e.target.value);
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value,
                        categoryId: selCat?.id || '',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <option value="Spiritual Healing (Rohani Ilaj)">Spiritual Healing (Rohani Ilaj)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 2: Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Short Description (Shown on cards & previews)
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                  placeholder="e.g. Specialized Quranic recitations and divine supplications to resolve travel barriers and visa delays."
                />
              </div>

              {/* Row 3: Full Detailed Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Full Detailed Content & Sacred Procedure</span>
                  <span className="text-[10px] text-spirit-700 font-bold">Saved in Database</span>
                </label>
                <textarea
                  rows={4}
                  value={serviceForm.content}
                  onChange={(e) => setServiceForm({ ...serviceForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none font-sans"
                  placeholder="Provide detailed description of the service, who it is for, step-by-step spiritual rituals, tahajjud prayers, and expected blessings..."
                />
              </div>

              {/* Row 4: Icon Selector & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Spiritual Icon
                  </label>
                  <select
                    value={serviceForm.icon}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none font-medium"
                  >
                    {AVAILABLE_ICONS.map(ic => (
                      <option key={ic.name} value={ic.name}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Image URL (Optional Cover Photo)
                  </label>
                  <input
                    type="text"
                    value={serviceForm.imageUrl}
                    onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {serviceForm.imageUrl && (
                    <div className="mt-2 w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={serviceForm.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Price / Offering
                  </label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none font-semibold text-spirit-900"
                    placeholder="Free Consultation or $50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. 24 - 48 Hours"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={serviceForm.status}
                    onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none font-medium"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Paused)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Key Features / Bullet points */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Key Benefits & Inclusions (Bullet Points)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serviceForm.featureInput}
                    onChange={(e) => setServiceForm({ ...serviceForm, featureInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="e.g. Direct one-on-one scholar consultation"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-spirit-900 text-white rounded-xl text-xs font-bold hover:bg-spirit-800 transition"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {serviceForm.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium shadow-2xs"
                    >
                      <CheckCircle2 size={12} className="text-spirit-600" />
                      {feat}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveService()}
                  disabled={isLoading}
                  className="bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles size={16} />
                  <span>{isLoading ? "Saving..." : editingServiceId ? "Update Service" : "Save Service to Database"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADD / EDIT CATEGORY POPUP MODAL (REPLACING THE STATIC FORM)            */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsCategoryModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-spirit-200 z-10 animate-scale-up p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-spirit-100 text-spirit-900 flex items-center justify-center">
                  <FolderPlus size={20} className="text-spirit-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-spirit-950">
                    {editingCategoryId ? "Edit Service Category" : "+ Add Service Category"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Category will appear in the mega-menu navigation and services filters.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {categoryFormError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{categoryFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => {
                    setCategoryForm({ ...categoryForm, name: e.target.value });
                    if (categoryFormError) setCategoryFormError(null);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                  placeholder="e.g. Abroad Journey & Career"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                  placeholder="Short summary for mega-menu and category landing page..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {categoryForm.imageUrl && (
                  <div className="mt-2 w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={categoryForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCategory()}
                  disabled={isLoading}
                  className="bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer active:scale-98"
                >
                  {isLoading ? "Saving..." : editingCategoryId ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW CONTENT PREVIEW MODAL                                             */}
      {/* ========================================================================= */}
      {previewContentService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setPreviewContentService(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-spirit-200 z-10 p-6 sm:p-8 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-spirit-100 text-spirit-900 flex items-center justify-center">
                  <BookOpen size={20} className="text-spirit-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-spirit-700 uppercase tracking-wider block">Service Details</span>
                  <h3 className="font-serif font-bold text-xl text-slate-900">{previewContentService.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewContentService(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Category & Fee</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-spirit-50 text-spirit-900 border border-spirit-200">
                    {previewContentService.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {previewContentService.price}
                  </span>
                  {previewContentService.duration && (
                    <span className="text-xs text-slate-500 font-medium">
                      Duration: {previewContentService.duration}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Summary</span>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {previewContentService.description}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Detailed Content & Procedures</span>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-spirit-50/40 p-4 rounded-xl border border-spirit-100 font-serif">
                  {previewContentService.content || "No detailed content specified."}
                </div>
              </div>

              {previewContentService.features && previewContentService.features.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Key Highlights</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewContentService.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                        <CheckCircle2 size={14} className="text-spirit-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewContentService(null)}
                className="px-5 py-2 rounded-xl bg-spirit-900 text-white text-xs font-bold hover:bg-spirit-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 z-10 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Delete {deleteConfirm.type === 'service' ? 'Service' : 'Category'}?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
