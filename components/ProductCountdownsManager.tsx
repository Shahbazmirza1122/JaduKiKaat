import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Flame, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Tag, 
  Sparkles, 
  Layers, 
  MoveVertical,
  CheckCircle2,
  Eye,
  AlertCircle,
  HelpCircle,
  Save,
  X
} from 'lucide-react';
import { 
  ProductCountdown, 
  ProductPageCountdownPosition, 
  PRODUCT_COUNTDOWN_POSITIONS,
  getNextPositionUp,
  getNextPositionDown
} from '../data/storeSettings';
import { Product } from '../data/products';

interface ProductCountdownsManagerProps {
  products: Product[];
  countdowns: ProductCountdown[];
  onSave: (countdowns: ProductCountdown[]) => void;
}

export const ProductCountdownsManager: React.FC<ProductCountdownsManagerProps> = ({
  products,
  countdowns = [],
  onSave,
}) => {
  const [list, setList] = useState<ProductCountdown[]>(countdowns);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ProductCountdown>({
    id: '',
    productId: products[0]?.id || '1',
    enabled: true,
    title: '',
    tag: '⚡ Flash Blessed Deal',
    discountPrice: '$65.00',
    originalPrice: '$95.00',
    days: '02',
    hours: '14',
    minutes: '38',
    seconds: '45',
    theme: 'amber',
    showOnProductPage: true,
    productPagePosition: 'above_cta',
    showOnStorePage: false,
    urgencyText: 'Hurry, limited consecrated items remaining at this blessed discount!',
  });

  const handleOpenAdd = () => {
    const defaultProduct = products[0];
    setFormData({
      id: `cd-${Date.now()}`,
      productId: defaultProduct?.id || '1',
      enabled: true,
      title: defaultProduct?.name || 'Blessed Ring',
      tag: '⚡ Flash Blessed Deal',
      discountPrice: defaultProduct?.salePrice || defaultProduct?.price || '$65.00',
      originalPrice: defaultProduct?.price || '$95.00',
      days: '02',
      hours: '14',
      minutes: '38',
      seconds: '45',
      theme: 'amber',
      showOnProductPage: true,
      productPagePosition: 'above_cta',
      showOnStorePage: false,
      urgencyText: 'Hurry, limited consecrated items remaining at this blessed discount!',
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (cd: ProductCountdown) => {
    setFormData({ ...cd });
    setEditingId(cd.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product countdown timer?')) {
      const updated = list.filter(c => c.id !== id);
      setList(updated);
      onSave(updated);
      showNotice();
    }
  };

  const handleDuplicate = (cd: ProductCountdown) => {
    const copy: ProductCountdown = {
      ...cd,
      id: `cd-${Date.now()}`,
      title: `${cd.title} (Copy)`,
    };
    const updated = [...list, copy];
    setList(updated);
    onSave(updated);
    showNotice();
  };

  const handleToggleEnabled = (id: string) => {
    const updated = list.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c);
    setList(updated);
    onSave(updated);
    showNotice();
  };

  // Move position UP (towards top of product page)
  const handleMoveUp = (id: string) => {
    const updated = list.map(c => {
      if (c.id === id) {
        return {
          ...c,
          productPagePosition: getNextPositionUp(c.productPagePosition),
        };
      }
      return c;
    });
    setList(updated);
    onSave(updated);
    showNotice();
  };

  // Move position DOWN (towards bottom of product page)
  const handleMoveDown = (id: string) => {
    const updated = list.map(c => {
      if (c.id === id) {
        return {
          ...c,
          productPagePosition: getNextPositionDown(c.productPagePosition),
        };
      }
      return c;
    });
    setList(updated);
    onSave(updated);
    showNotice();
  };

  // Direct position change
  const handleChangePosition = (id: string, newPos: ProductPageCountdownPosition) => {
    const updated = list.map(c => c.id === id ? { ...c, productPagePosition: newPos } : c);
    setList(updated);
    onSave(updated);
    showNotice();
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: ProductCountdown[];
    if (editingId) {
      updated = list.map(c => c.id === editingId ? { ...formData } : c);
    } else {
      updated = [...list, { ...formData, id: formData.id || `cd-${Date.now()}` }];
    }
    setList(updated);
    onSave(updated);
    setIsEditing(false);
    showNotice();
  };

  const showNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-spirit-100 text-spirit-900 flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-500" />
              </span>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Product Countdown Timers & Section Positioning
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              Create and manage multiple live countdown timers for any product. Choose exactly where each countdown is posted on the product page using the <strong>Move Up</strong> and <strong>Move Down</strong> options.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-spirit-700 bg-spirit-50 border border-spirit-200 px-3 py-1.5 rounded-lg animate-fade-in">
                <CheckCircle2 size={14} className="text-spirit-600" /> Changes Saved!
              </span>
            )}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Plus size={16} /> Add Product Countdown
            </button>
          </div>
        </div>

        {/* Section Positioning Legend */}
        <div className="mt-5 p-4 bg-spirit-50/50 rounded-xl border border-spirit-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-spirit-950 mb-2">
            <MoveVertical size={14} className="text-spirit-700" />
            <span>Product Page Posting Positions Anatomy (from Top to Bottom):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {PRODUCT_COUNTDOWN_POSITIONS.map((pos) => (
              <div 
                key={pos.id} 
                className="bg-white p-2 rounded-lg border border-spirit-200/70 text-center shadow-2xs"
              >
                <span className="inline-block w-4 h-4 rounded-full bg-spirit-900 text-white text-[10px] font-bold leading-4 mb-1">
                  {pos.stepNumber}
                </span>
                <span className="font-bold text-slate-800 block text-[11px] leading-tight">
                  {pos.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COUNTDOWNS LIST */}
      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Product Countdowns Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add multiple countdown timers for any product to drive urgency and conversions.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-2 bg-spirit-900 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-spirit-800 transition"
            >
              <Plus size={14} /> Create First Countdown
            </button>
          </div>
        ) : (
          list.map((cd, index) => {
            const currentPos = PRODUCT_COUNTDOWN_POSITIONS.find(p => p.id === cd.productPagePosition) || PRODUCT_COUNTDOWN_POSITIONS[3];
            const targetProduct = products.find(p => String(p.id) === String(cd.productId));
            const canMoveUp = currentPos.stepNumber > 1;
            const canMoveDown = currentPos.stepNumber < PRODUCT_COUNTDOWN_POSITIONS.length;

            return (
              <div 
                key={cd.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs ${
                  cd.enabled ? 'border-spirit-200 hover:border-spirit-400' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left: Product info, thumbnail & deal title */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                      {targetProduct?.image ? (
                        <img 
                          src={targetProduct.image} 
                          alt={targetProduct.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                          All
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5">
                        #{cd.productId}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                          {cd.tag || 'Flash Deal'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cd.enabled ? 'bg-spirit-100 text-spirit-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cd.enabled ? '● Active' : '○ Paused'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Theme: <strong className="capitalize text-slate-700">{cd.theme || 'amber'}</strong>
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-gray-900 mt-1 truncate">
                        {cd.title || targetProduct?.name || 'Unnamed Countdown'}
                      </h3>

                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-sm font-bold text-spirit-900">{cd.discountPrice || targetProduct?.price}</span>
                        {cd.originalPrice && cd.originalPrice !== cd.discountPrice && (
                          <span className="text-xs text-slate-400 line-through">{cd.originalPrice}</span>
                        )}
                        <span className="text-[11px] text-slate-500 hidden sm:inline ml-2 truncate max-w-xs">
                          {cd.urgencyText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Live Clock Digits */}
                  <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-800 shrink-0">
                    <Clock size={14} className="text-amber-400 mr-1" />
                    {[
                      { l: 'D', v: cd.days },
                      { l: 'H', v: cd.hours },
                      { l: 'M', v: cd.minutes },
                      { l: 'S', v: cd.seconds },
                    ].map((t, idx) => (
                      <React.Fragment key={t.l}>
                        {idx > 0 && <span className="text-amber-400 font-bold text-xs">:</span>}
                        <div className="text-center">
                          <span className="font-mono font-bold text-xs bg-slate-800 px-1.5 py-0.5 rounded block text-amber-300">
                            {t.v}
                          </span>
                          <span className="text-[7px] text-slate-400 font-bold block">{t.l}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Right: Section Posting Selector & Move Up/Down Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Position Selector & Step Badge */}
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Product Page Posting:
                        </span>
                        <select
                          value={cd.productPagePosition}
                          onChange={(e) => handleChangePosition(cd.id, e.target.value as ProductPageCountdownPosition)}
                          className="text-xs font-semibold text-spirit-900 bg-spirit-50 border border-spirit-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-spirit-500"
                        >
                          {PRODUCT_COUNTDOWN_POSITIONS.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Move Up & Move Down Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(cd.id)}
                          disabled={!canMoveUp}
                          title="Move section higher on Product Page"
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-spirit-100 text-spirit-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(cd.id)}
                          disabled={!canMoveDown}
                          title="Move section lower on Product Page"
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-spirit-100 text-spirit-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                      {targetProduct && (
                        <Link
                          to={`/product/${targetProduct.id}`}
                          target="_blank"
                          title="View live on Product Page"
                          className="p-2 text-slate-500 hover:text-spirit-900 hover:bg-slate-100 rounded-lg transition"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleEnabled(cd.id)}
                        title={cd.enabled ? "Disable Countdown" : "Enable Countdown"}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                          cd.enabled 
                            ? 'bg-spirit-50 text-spirit-900 border-spirit-200 hover:bg-spirit-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {cd.enabled ? "Active" : "Paused"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(cd)}
                        title="Duplicate countdown"
                        className="p-2 text-slate-500 hover:text-spirit-900 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cd)}
                        title="Edit countdown"
                        className="p-2 text-spirit-700 hover:text-spirit-900 hover:bg-spirit-50 rounded-lg transition"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cd.id)}
                        title="Delete countdown"
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsEditing(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-spirit-200 z-10 animate-scale-up p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-spirit-100 text-spirit-900 flex items-center justify-center">
                  <Flame size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-spirit-950">
                    {editingId ? "Edit Product Countdown" : "Add Product Countdown"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure countdown clock, deal pricing, and choose its posting section on the product page.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Row 1: Target Product Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Target Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const p = products.find(prod => String(prod.id) === String(selId));
                      if (p) {
                        setFormData({
                          ...formData,
                          productId: selId,
                          title: p.name,
                          discountPrice: p.salePrice || p.price,
                          originalPrice: p.price,
                        });
                      } else {
                        setFormData({ ...formData, productId: selId });
                      }
                    }}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                    required
                  >
                    <option value="all">★ All Products (Universal Deal)</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        #{p.id} — {p.name} ({p.price})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Choose which product page will display this countdown.
                  </span>
                </div>

                {/* Section Posting on Product Page */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Product Page Posting Section *</span>
                    <span className="text-[10px] text-spirit-700 font-bold">Top/Bottom Positioning</span>
                  </label>
                  <select
                    value={formData.productPagePosition}
                    onChange={(e) => setFormData({ ...formData, productPagePosition: e.target.value as ProductPageCountdownPosition })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-spirit-300 bg-spirit-50/50 font-medium text-spirit-950 focus:ring-2 focus:ring-spirit-500 outline-none"
                  >
                    {PRODUCT_COUNTDOWN_POSITIONS.map(pos => (
                      <option key={pos.id} value={pos.id}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    You can move this up or down anytime via the admin list or directly on the product view.
                  </span>
                </div>
              </div>

              {/* Row 2: Headline & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Deal Headline / Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. Natural Yemeni Aqeeq Silver Ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Badge Tag Text
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="e.g. ⚡ Flash Blessed Deal"
                  />
                </div>
              </div>

              {/* Row 3: Deal Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Discount Deal Price ($)
                  </label>
                  <input
                    type="text"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-bold text-red-600 focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="$65.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Original Price ($)
                  </label>
                  <input
                    type="text"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-500 line-through focus:ring-2 focus:ring-spirit-500 outline-none"
                    placeholder="$95.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Color Theme
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none font-medium"
                  >
                    <option value="amber">Warm Amber Gold (Spiritual)</option>
                    <option value="emerald">Emerald Green (Sacred Sunnah)</option>
                    <option value="ruby">Ruby Red (Urgent Sale)</option>
                    <option value="obsidian">Obsidian Black (Luxury)</option>
                    <option value="gold">Royal Gold</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Urgency Microcopy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Urgency Note / Subtext
                </label>
                <input
                  type="text"
                  value={formData.urgencyText}
                  onChange={(e) => setFormData({ ...formData, urgencyText: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                  placeholder="Hurry, only 5 consecrated items remaining at this blessed discount!"
                />
              </div>

              {/* Row 5: Timer Clock Setup */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-spirit-700" />
                    Set Live Countdown Clock
                  </h4>

                  {/* Duration Presets */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
                    {[
                      { l: '12h', d: '00', h: '12', m: '00', s: '00' },
                      { l: '24h', d: '01', h: '00', m: '00', s: '00' },
                      { l: '48h', d: '02', h: '14', m: '38', s: '45' },
                      { l: '7d', d: '07', h: '00', m: '00', s: '00' },
                    ].map(pre => (
                      <button
                        type="button"
                        key={pre.l}
                        onClick={() => setFormData({ ...formData, days: pre.d, hours: pre.h, minutes: pre.m, seconds: pre.s })}
                        className="px-2 py-0.5 text-[11px] font-bold bg-white hover:bg-spirit-50 text-slate-700 hover:text-spirit-900 border border-slate-200 rounded-md transition"
                      >
                        {pre.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 text-center">Days</label>
                    <input
                      type="text"
                      value={formData.days}
                      onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                      className="w-full py-2 text-center font-mono font-bold text-lg rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 text-center">Hours</label>
                    <input
                      type="text"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      className="w-full py-2 text-center font-mono font-bold text-lg rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 text-center">Minutes</label>
                    <input
                      type="text"
                      value={formData.minutes}
                      onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                      className="w-full py-2 text-center font-mono font-bold text-lg rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 text-center">Seconds</label>
                    <input
                      type="text"
                      value={formData.seconds}
                      onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                      className="w-full py-2 text-center font-mono font-bold text-lg rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-spirit-600 focus:ring-spirit-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Enable this Countdown Timer</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnProductPage}
                    onChange={(e) => setFormData({ ...formData, showOnProductPage: e.target.checked })}
                    className="w-4 h-4 rounded text-spirit-600 focus:ring-spirit-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Display on Product Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnStorePage}
                    onChange={(e) => setFormData({ ...formData, showOnStorePage: e.target.checked })}
                    className="w-4 h-4 rounded text-spirit-600 focus:ring-spirit-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Also Highlight in Store Page Flash Banner</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-spirit-900 hover:bg-spirit-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingId ? "Save Changes" : "Create Countdown"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCountdownsManager;
