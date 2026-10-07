import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Star,
  AlertCircle,
  MessageSquareQuote,
  Check,
} from 'lucide-react';
import {
  TestimonialItem,
  getStoredTestimonials,
  saveStoredTestimonials,
} from '../data/testimonialsData';
import { supabase } from '../lib/supabase';

interface TestimonialsManagerProps {
  onNotification?: (msg: string) => void;
}

const emptyForm = {
  name: '',
  role: '',
  location: '',
  service: '',
  imageUrl: '',
  quote: '',
  rating: 5,
  status: 'active' as 'active' | 'inactive',
};

export const TestimonialsManager: React.FC<TestimonialsManagerProps> = ({ onNotification }) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg: string) => {
    if (onNotification) onNotification(msg);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: TestimonialItem[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          role: t.role || '',
          location: t.location || '',
          imageUrl: t.image_url || '',
          service: t.service || '',
          quote: t.quote || '',
          rating: t.rating ?? 5,
          status: t.status === 'inactive' ? 'inactive' : 'active',
          createdAt: t.created_at,
        }));
        setTestimonials(mapped);
        saveStoredTestimonials(mapped);
      } else {
        setTestimonials(getStoredTestimonials());
      }
    } catch (e) {
      console.warn('Error loading testimonials from Supabase, using local:', e);
      setTestimonials(getStoredTestimonials());
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => {
    setFormError(null);
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (t: TestimonialItem) => {
    setFormError(null);
    setForm({
      name: t.name,
      role: t.role,
      location: t.location,
      service: t.service,
      imageUrl: t.imageUrl,
      quote: t.quote,
      rating: t.rating,
      status: t.status || 'active',
    });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Please enter the client’s name.');
      return;
    }
    if (!form.imageUrl.trim()) {
      setFormError('Please provide a picture URL for this client.');
      return;
    }
    if (!form.quote.trim()) {
      setFormError('Please enter the testimonial message.');
      return;
    }
    setFormError(null);
    setIsLoading(true);

    const payload: TestimonialItem = {
      id: editingId || `testimonial-${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      service: form.service.trim(),
      imageUrl: form.imageUrl.trim(),
      quote: form.quote.trim(),
      rating: form.rating,
      status: form.status,
      createdAt: new Date().toISOString(),
    };

    let updatedList: TestimonialItem[];
    if (editingId) {
      updatedList = testimonials.map((t) => (t.id === editingId ? payload : t));
    } else {
      updatedList = [payload, ...testimonials];
    }

    // 1. Save locally immediately so it shows up on the site right away.
    setTestimonials(updatedList);
    saveStoredTestimonials(updatedList);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('testimonials-updated', { detail: updatedList }));
    }

    // 2. Best-effort sync to Supabase.
    try {
      if (editingId) {
        await supabase
          .from('testimonials')
          .update({
            name: payload.name,
            role: payload.role,
            location: payload.location,
            service: payload.service,
            image_url: payload.imageUrl,
            quote: payload.quote,
            rating: payload.rating,
            status: payload.status,
          })
          .eq('id', editingId);
      } else {
        await supabase.from('testimonials').insert([
          {
            name: payload.name,
            role: payload.role,
            location: payload.location,
            service: payload.service,
            image_url: payload.imageUrl,
            quote: payload.quote,
            rating: payload.rating,
            status: payload.status,
          },
        ]);
      }
    } catch (err) {
      console.warn('Could not sync testimonial to Supabase (saved locally):', err);
    }

    setIsLoading(false);
    setIsModalOpen(false);
    notify(editingId ? 'Testimonial updated successfully!' : 'New testimonial added successfully!');
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    saveStoredTestimonials(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('testimonials-updated', { detail: updated }));
    }
    try {
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (e) {
      console.warn('Could not delete testimonial from Supabase:', e);
    }
    notify('Testimonial removed successfully.');
    setDeleteConfirm(null);
  };

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-spirit-100 text-spirit-900 flex items-center justify-center shadow-xs">
              <MessageSquareQuote className="w-5 h-5 text-spirit-700" />
            </span>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">Manage Happy Clients</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Add or edit the client photos and testimonials shown in the "Our Happy Clients" section on the home page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-sm transition shrink-0"
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>+ Add Testimonial</span>
          </button>
        </div>

        <div className="mt-5">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <MessageSquareQuote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Testimonials Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No testimonials match your search.'
              : "You haven't added any testimonials yet. Click '+ Add Testimonial' to feature your first happy client."}
          </p>
          <button
            onClick={openAdd}
            className="mt-4 inline-flex items-center gap-2 bg-spirit-900 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-spirit-800 transition shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} /> Add First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-spirit-300 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-spirit-200 bg-spirit-50 shrink-0">
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-spirit-300">
                          <MessageSquareQuote size={18} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {t.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-gray-950 mt-1">{t.name}</h3>
                      <p className="text-[11px] text-gray-500">
                        {t.role}
                        {t.location ? ` · ${t.location}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      title="Edit testimonial"
                      className="p-1.5 text-gray-400 hover:text-spirit-900 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ id: t.id, name: t.name })}
                      title="Delete testimonial"
                      className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-3 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed italic">"{t.quote}"</p>
              </div>

              {t.service && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-spirit-700 bg-spirit-50 px-2 py-0.5 rounded-full border border-spirit-100">
                    {t.service}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-spirit-200 z-10 animate-scale-up p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-spirit-100 text-spirit-900 flex items-center justify-center">
                  <MessageSquareQuote size={20} className="text-spirit-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-spirit-950">
                    {editingId ? 'Edit Testimonial' : '+ Add Testimonial'}
                  </h3>
                  <p className="text-xs text-slate-500">Feature a happy client's picture and message on the home page.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. Tariq Al-Mansoor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. Community Director"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. Birmingham, UK"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Related Service</label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. Istikhara & Guidance"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Client Picture URL *</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {form.imageUrl && (
                  <div className="mt-2 w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Testimonial Message *</label>
                <textarea
                  rows={4}
                  value={form.quote}
                  onChange={(e) => {
                    setForm({ ...form, quote: e.target.value });
                    if (formError) setFormError(null);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                  placeholder="What did this client say about their experience?"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rating</label>
                  <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, rating: n })}
                        className="p-0.5"
                      >
                        <Star
                          size={18}
                          className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none font-medium"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isLoading}
                  className="bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Check size={16} />
                  <span>{isLoading ? 'Saving...' : editingId ? 'Update Testimonial' : 'Save Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full shadow-2xl z-10 p-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Delete Testimonial?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove <strong>{deleteConfirm.name}</strong>'s testimonial? This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
