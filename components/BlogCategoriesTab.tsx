import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const BlogCategoriesTab = () => {
  const [categories, setCategories] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('posts')
        .select('id, title, created_at')
        .eq('category', '_blog_category_')
        .order('created_at', { ascending: false });
      
      if (data) setCategories(data);
    } catch(e) {
      console.warn("fetchCategories failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    setIsLoading(true);
    try {
      if (editingId) {
        await supabase.from('posts').update({ title: form.title }).eq('id', editingId);
      } else {
        await supabase.from('posts').insert([{ title: form.title, category: '_blog_category_', status: 'published', excerpt: '', content: '' }]);
      }
    } catch (e) { console.warn(e); }
    
    setForm({ title: '' });
    setEditingId(null);
    await fetchCategories();
  };

  const handleDelete = async (id: string) => {
     
    setIsLoading(true);
    try {
      await supabase.from('posts').delete().eq('id', id);
    } catch (e) { console.warn(e); }
    await fetchCategories();
  };

  const handleEdit = (cat: { id: string; title: string }) => {
    setEditingId(cat.id);
    setForm({ title: cat.title });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-spirit-900 mb-6">Manage Categories</h2>
        
        <form onSubmit={handleSave} className="flex gap-4 mb-8">
            <input 
                type="text" 
                required
                placeholder="New Category Name (e.g. Guidance)"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spirit-500 outline-none"
                value={form.title}
                onChange={e => setForm({ title: e.target.value })}
            />
            {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({title: ''})}} className="px-4 py-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg border border-gray-200">
                    Cancel
                </button>
            )}
            <button type="submit" disabled={isLoading} className="bg-spirit-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-spirit-700 transition flex items-center cursor-pointer">
                {editingId ? <><Save className="w-4 h-4 mr-2" /> Update</> : <><Plus className="w-4 h-4 mr-2" /> Add</>}
            </button>
        </form>

        <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-100">Category Name</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {categories.length === 0 ? (
                <tr><td colSpan={2} className="p-8 text-center text-gray-500">No categories found. Create one above!</td></tr>
                ) : (
                categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-spirit-50/50 transition">
                    <td className="p-4 font-semibold text-gray-800">{cat.title}</td>
                    <td className="p-4 text-right">
                        <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-spirit-700 hover:bg-spirit-50 p-2 rounded-lg transition cursor-pointer inline-flex items-center"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 ml-1 rounded-lg transition cursor-pointer inline-flex items-center"><Trash2 size={16} /></button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
    </div>
  );
};
