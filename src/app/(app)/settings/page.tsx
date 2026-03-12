/**
 * Settings page — multi-brand business profile management,
 * Meta connection, and data management.
 *
 * PRD Section 6.10
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save,
  RefreshCw,
  Trash2,
  AlertTriangle,
  PlusCircle,
  X,
  Upload,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  useBusinessProfiles,
  type BusinessProfile,
  type Competitor,
  type ProductInfo,
  type TargetAudienceInfo,
  type MarketingPrefs,
  type ContactInfo,
} from '@/context/BusinessProfileContext';
import { INDUSTRY_OPTIONS } from '@/lib/validators';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = ['Cash on Delivery', 'Credit Card', 'PayPal', 'Bank Transfer'];
const PLATFORM_OPTIONS = [
  'Facebook', 'Instagram', 'TikTok', 'Google', 'YouTube',
  'Pinterest', 'Snapchat', 'Twitter/X',
];
const OBJECTIVE_OPTIONS = ['Sales', 'Leads', 'Awareness', 'Traffic', 'Engagement'];
const LANGUAGE_OPTIONS = [
  'Arabic', 'English', 'French', 'Spanish', 'German', 'Turkish',
  'Italian', 'Portuguese',
];
const OCCASION_OPTIONS = [
  'Birthday', 'Wedding', 'Anniversary', 'Holiday', 'Graduation',
  'Baby Shower', "Valentine's Day", "Mother's Day", "Father's Day", 'Eid',
];
const COUNTRY_OPTIONS = [
  'Morocco', 'Algeria', 'Tunisia', 'Egypt', 'Saudi Arabia', 'UAE',
  'France', 'USA', 'UK', 'Germany', 'Spain', 'Other',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newCompetitor(): Competitor {
  return {
    id: crypto.randomUUID(),
    website_url: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    pinterest: '',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: readonly string[];
}

function TagInput({ tags, onChange, placeholder = 'Type and press Enter…', suggestions }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions
    ? suggestions.filter((s) => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase()))
    : [];

  return (
    <div style={{ position: 'relative' }}>
      <div className="tag-input-wrapper">
        {tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          className="tag-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => {
            if (input.trim()) { addTag(input); setInput(''); }
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
      {input && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0,
          background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', marginTop: 2, maxHeight: 180, overflowY: 'auto',
        }}>
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '6px 12px', background: 'none', border: 'none',
                color: 'var(--text-primary)', fontSize: 'var(--text-sm)', cursor: 'pointer',
              }}
              onMouseDown={(e) => { e.preventDefault(); addTag(s); setInput(''); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiToggleProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function MultiToggle({ options, selected, onChange }: MultiToggleProps) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div className="multi-toggle-group">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`toggle-chip${selected.includes(opt) ? ' toggle-chip-active' : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const {
    profiles,
    activeProfile,
    activeProfileId,
    isLoading,
    error: ctxError,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    uploadLogo,
    refresh,
  } = useBusinessProfiles();

  // ── Modals ────────────────────────────────────────────────────────────────
  const [createModal, setCreateModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deleteProfileModal, setDeleteProfileModal] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  const [deleteDataModal, setDeleteDataModal] = useState<string | null>(null);

  // ── Form state (mirrored from activeProfile) ──────────────────────────────
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [dailyBudget, setDailyBudget] = useState<number>(20);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [productInfo, setProductInfo] = useState<ProductInfo>({
    categories: [], customization_options: '', price_min: null,
    price_max: null, payment_methods: [], order_process: '', shipping_regions: '',
  });

  const [targetAudience, setTargetAudience] = useState<TargetAudienceInfo>({
    demographics: '', interests: [], behaviors: '', occasions: [], languages: [],
  });

  const [marketingPrefs, setMarketingPrefs] = useState<MarketingPrefs>({
    default_objective: '', preferred_platforms: [], ad_creative_preferences: '', competitors: [],
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '', phone: '', instagram: '', facebook: '', tiktok: '', linkedin: '', youtube: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form with active profile whenever it changes
  const syncFromProfile = useCallback((p: BusinessProfile) => {
    setBusinessName(p.business_name);
    setIndustry(p.industry ?? '');
    setCountry(p.country ?? '');
    setDescription(p.description ?? '');
    setWebsiteUrl(p.website_url ?? '');
    setDailyBudget(p.daily_budget ?? 20);
    setLogoUrl(p.logo_url ?? null);
    setProductInfo({ ...p.product_info });
    setTargetAudience({ ...p.target_audience_info });
    setMarketingPrefs({ ...p.marketing_prefs });
    setContactInfo({ ...p.contact_info });
    setSaveError(null);
    setSaveSuccess(false);
  }, []);

  useEffect(() => {
    if (activeProfile) syncFromProfile(activeProfile);
  }, [activeProfile, syncFromProfile]);

  // ── Logo upload ───────────────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const { url, error } = await uploadLogo(file);
    if (error) {
      setSaveError(`Logo upload failed: ${error}`);
    } else if (url) {
      setLogoUrl(url);
    }
    setIsUploadingLogo(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!activeProfileId) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload: Partial<BusinessProfile> = {
      business_name: businessName.trim(),
      industry,
      country: country || null,
      description: description || null,
      website_url: websiteUrl.trim() || null,
      daily_budget: dailyBudget,
      logo_url: logoUrl,
      product_info: productInfo,
      target_audience_info: targetAudience,
      marketing_prefs: marketingPrefs,
      contact_info: contactInfo,
    };

    const { error } = await updateProfile(activeProfileId, payload);
    if (error) {
      setSaveError(error);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  // ── Create profile ────────────────────────────────────────────────────────
  const handleCreateProfile = async () => {
    if (!newBrandName.trim()) { setCreateError('Brand name is required.'); return; }
    setIsCreating(true);
    setCreateError(null);
    const { data, error } = await createProfile({ business_name: newBrandName.trim() });
    if (error) {
      setCreateError(error);
    } else if (data) {
      switchProfile(data.id);
      setCreateModal(false);
      setNewBrandName('');
    }
    setIsCreating(false);
  };

  // ── Delete profile ────────────────────────────────────────────────────────
  const handleDeleteProfile = async () => {
    if (!activeProfileId) return;
    setIsDeletingProfile(true);
    const { error } = await deleteProfile(activeProfileId);
    if (error) {
      setSaveError(error);
    }
    setDeleteProfileModal(false);
    setIsDeletingProfile(false);
  };

  // ── Competitor helpers ────────────────────────────────────────────────────
  const addCompetitor = () => {
    setMarketingPrefs((prev) => ({
      ...prev,
      competitors: [...prev.competitors, newCompetitor()],
    }));
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    setMarketingPrefs((prev) => ({
      ...prev,
      competitors: prev.competitors.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const removeCompetitor = (id: string) => {
    setMarketingPrefs((prev) => ({
      ...prev,
      competitors: prev.competitors.filter((c) => c.id !== id),
    }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your brands, connections, and data</p>
        </div>
      </div>

      {/* ── Business Profile Section ─────────────────────────────────────── */}
      <section className="settings-section">
        <h2 className="settings-section-title">Business Profiles</h2>

        {isLoading ? (
          <div className="card settings-loading">Loading profiles…</div>
        ) : profiles.length === 0 ? (
          <div className="card settings-empty">
            <Building2 size={32} style={{ margin: '0 auto var(--space-sm)', display: 'block', opacity: 0.4 }} />
            <p>No business profiles yet.</p>
            <div className="empty-state-action">
              <Button variant="primary" onClick={() => setCreateModal(true)} id="settings-create-first-profile">
                <PlusCircle size={16} aria-hidden="true" />
                Create Your First Brand
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Profile selector bar */}
            <div className="card" style={{ padding: 0, overflow: 'visible' }}>
              <div className="profile-selector-bar">
                <div className="profile-selector-left">
                  <span className="profile-selector-label">Active Brand</span>
                  <select
                    className="profile-selector-dropdown"
                    value={activeProfileId ?? ''}
                    onChange={(e) => switchProfile(e.target.value)}
                    aria-label="Switch active brand"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.business_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="profile-selector-actions">
                  <Button variant="secondary" size="sm" onClick={() => { setNewBrandName(''); setCreateError(null); setCreateModal(true); }} id="settings-add-brand">
                    <PlusCircle size={14} aria-hidden="true" />
                    Add Brand
                  </Button>
                  {profiles.length > 1 && (
                    <Button variant="danger" size="sm" onClick={() => setDeleteProfileModal(true)} id="settings-delete-brand">
                      <Trash2 size={14} aria-hidden="true" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Form body */}
              {activeProfile && (
                <div style={{ padding: 'var(--space-lg)' }}>
                  {ctxError && <div className="settings-error-bar">{ctxError}</div>}

                  {/* ─ Basic Info ──────────────────────────────────────── */}
                  <div className="settings-subsection" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                    <h3 className="settings-subsection-title">Basic Information</h3>
                    <div className="settings-grid">
                      {/* Logo */}
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>Logo</label>
                        <div className="logo-upload-area">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Brand logo" className="logo-preview-img" />
                          ) : (
                            <div className="logo-preview-placeholder">No logo</div>
                          )}
                          <div>
                            <label className="logo-upload-label" htmlFor="logo-file-input">
                              <Upload size={14} aria-hidden="true" />
                              {isUploadingLogo ? 'Uploading…' : 'Upload Logo'}
                            </label>
                            <input
                              id="logo-file-input"
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={handleLogoChange}
                              disabled={isUploadingLogo}
                            />
                            <p className="settings-empty-hint" style={{ marginTop: 6 }}>
                              PNG, JPG, WebP — max 2 MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <Input
                        inputId="settings-business-name"
                        label="Brand Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                      />
                      <Select
                        inputId="settings-industry"
                        label="Industry"
                        options={INDUSTRY_OPTIONS.map((i) => ({ value: i, label: i }))}
                        value={industry}
                        onChange={(e) => setIndustry((e.target as HTMLSelectElement).value)}
                      />
                      <Select
                        inputId="settings-country"
                        label="Country"
                        options={[
                          { value: '', label: '— Select country —' },
                          ...COUNTRY_OPTIONS.map((c) => ({ value: c, label: c })),
                        ]}
                        value={country}
                        onChange={(e) => setCountry((e.target as HTMLSelectElement).value)}
                      />
                      <Input
                        inputId="settings-website"
                        label="Website URL"
                        type="url"
                        placeholder="https://yourbrand.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                      <Input
                        inputId="settings-budget"
                        label="Default Daily Budget ($)"
                        type="number"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(Number(e.target.value))}
                        min={1}
                        max={100000}
                        step={0.01}
                      />
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 6 }}>
                          Brand Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          placeholder="Describe what your brand does…"
                          style={{
                            width: '100%', background: 'var(--bg-control)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px', fontSize: 'var(--text-sm)', resize: 'vertical',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ─ Product / Service ───────────────────────────────── */}
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Product / Service</h3>
                    <div className="settings-grid">
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 6 }}>
                          Product Categories
                        </label>
                        <TagInput
                          tags={productInfo.categories}
                          onChange={(tags) => setProductInfo((p) => ({ ...p, categories: tags }))}
                          placeholder="Add categories…"
                        />
                      </div>
                      <Input
                        inputId="settings-price-min"
                        label="Min Price ($)"
                        type="number"
                        value={productInfo.price_min ?? ''}
                        onChange={(e) => setProductInfo((p) => ({ ...p, price_min: e.target.value === '' ? null : Number(e.target.value) }))}
                        min={0}
                        placeholder="0"
                      />
                      <Input
                        inputId="settings-price-max"
                        label="Max Price ($)"
                        type="number"
                        value={productInfo.price_max ?? ''}
                        onChange={(e) => setProductInfo((p) => ({ ...p, price_max: e.target.value === '' ? null : Number(e.target.value) }))}
                        min={0}
                        placeholder="999"
                      />
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>
                          Payment Methods
                        </label>
                        <MultiToggle
                          options={PAYMENT_METHODS}
                          selected={productInfo.payment_methods}
                          onChange={(sel) => setProductInfo((p) => ({ ...p, payment_methods: sel }))}
                        />
                      </div>
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 6 }}>
                          Customization Options
                        </label>
                        <textarea
                          value={productInfo.customization_options}
                          onChange={(e) => setProductInfo((p) => ({ ...p, customization_options: e.target.value }))}
                          rows={2}
                          placeholder="e.g. Custom engraving, color choices…"
                          style={{
                            width: '100%', background: 'var(--bg-control)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px', fontSize: 'var(--text-sm)', resize: 'vertical', fontFamily: 'inherit',
                          }}
                        />
                      </div>
                      <Input
                        inputId="settings-order-process"
                        label="Order Process"
                        placeholder="e.g. Order online, ships in 3–5 days"
                        value={productInfo.order_process}
                        onChange={(e) => setProductInfo((p) => ({ ...p, order_process: e.target.value }))}
                      />
                      <Input
                        inputId="settings-shipping"
                        label="Shipping Regions"
                        placeholder="e.g. Morocco, Europe, Worldwide"
                        value={productInfo.shipping_regions}
                        onChange={(e) => setProductInfo((p) => ({ ...p, shipping_regions: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* ─ Target Audience ─────────────────────────────────── */}
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Target Audience</h3>
                    <div className="settings-grid">
                      <div className="settings-grid-span2">
                        <Input
                          inputId="settings-demographics"
                          label="Demographics"
                          placeholder="e.g. Women 25–45, urban, middle income"
                          value={targetAudience.demographics}
                          onChange={(e) => setTargetAudience((t) => ({ ...t, demographics: e.target.value }))}
                        />
                      </div>
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 6 }}>
                          Interests
                        </label>
                        <TagInput
                          tags={targetAudience.interests}
                          onChange={(tags) => setTargetAudience((t) => ({ ...t, interests: tags }))}
                          placeholder="Type an interest and press Enter…"
                        />
                      </div>
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 6 }}>
                          Behaviors
                        </label>
                        <textarea
                          value={targetAudience.behaviors}
                          onChange={(e) => setTargetAudience((t) => ({ ...t, behaviors: e.target.value }))}
                          rows={2}
                          placeholder="e.g. Online shoppers, gift buyers, frequent travelers…"
                          style={{
                            width: '100%', background: 'var(--bg-control)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px', fontSize: 'var(--text-sm)', resize: 'vertical', fontFamily: 'inherit',
                          }}
                        />
                      </div>
                      <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>
                          Gift Occasions
                        </label>
                        <MultiToggle
                          options={OCCASION_OPTIONS}
                          selected={targetAudience.occasions}
                          onChange={(sel) => setTargetAudience((t) => ({ ...t, occasions: sel }))}
                        />
                      </div>
                      <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>
                          Languages
                        </label>
                        <MultiToggle
                          options={LANGUAGE_OPTIONS}
                          selected={targetAudience.languages}
                          onChange={(sel) => setTargetAudience((t) => ({ ...t, languages: sel }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ─ Marketing Preferences ───────────────────────────── */}
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Marketing Preferences</h3>
                    <div className="settings-grid">
                      <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>
                          Preferred Platforms
                        </label>
                        <MultiToggle
                          options={PLATFORM_OPTIONS}
                          selected={marketingPrefs.preferred_platforms}
                          onChange={(sel) => setMarketingPrefs((m) => ({ ...m, preferred_platforms: sel }))}
                        />
                      </div>
                      <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>
                          Default Campaign Objective
                        </label>
                        <MultiToggle
                          options={OBJECTIVE_OPTIONS}
                          selected={marketingPrefs.default_objective ? [marketingPrefs.default_objective] : []}
                          onChange={(sel) => setMarketingPrefs((m) => ({ ...m, default_objective: sel[sel.length - 1] ?? '' }))}
                        />
                      </div>
                      <div className="settings-grid-span2">
                        <label className="input-label" style={{ display: 'block', marginBottom: 6 }}>
                          Ad Creative Preferences
                        </label>
                        <textarea
                          value={marketingPrefs.ad_creative_preferences}
                          onChange={(e) => setMarketingPrefs((m) => ({ ...m, ad_creative_preferences: e.target.value }))}
                          rows={2}
                          placeholder="e.g. Lifestyle photos, short-form video, UGC…"
                          style={{
                            width: '100%', background: 'var(--bg-control)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px', fontSize: 'var(--text-sm)', resize: 'vertical', fontFamily: 'inherit',
                          }}
                        />
                      </div>

                      {/* Competitors */}
                      <div className="settings-grid-span2">
                        <div className="competitors-header">
                          <label className="input-label">Competitors</label>
                          <Button variant="secondary" size="sm" onClick={addCompetitor} id="settings-add-competitor">
                            <PlusCircle size={14} aria-hidden="true" />
                            Add Competitor
                          </Button>
                        </div>
                        {marketingPrefs.competitors.length === 0 && (
                          <p className="settings-empty-hint">No competitors added yet.</p>
                        )}
                        {marketingPrefs.competitors.map((comp, idx) => (
                          <div key={comp.id} className="competitor-card">
                            <div className="competitor-card-header">
                              <span className="competitor-card-title">Competitor {idx + 1}</span>
                              <button
                                type="button"
                                className="competitor-remove-btn"
                                onClick={() => removeCompetitor(comp.id)}
                                aria-label={`Remove competitor ${idx + 1}`}
                              >
                                <X size={14} aria-hidden="true" /> Remove
                              </button>
                            </div>
                            <div className="settings-grid">
                              <div className="settings-grid-span2">
                                <Input
                                  inputId={`comp-website-${comp.id}`}
                                  label="Website URL"
                                  type="url"
                                  placeholder="https://competitor.com"
                                  value={comp.website_url}
                                  onChange={(e) => updateCompetitor(comp.id, 'website_url', e.target.value)}
                                />
                              </div>
                              <Input
                                inputId={`comp-facebook-${comp.id}`}
                                label="Facebook"
                                placeholder="facebook.com/page"
                                value={comp.facebook}
                                onChange={(e) => updateCompetitor(comp.id, 'facebook', e.target.value)}
                              />
                              <Input
                                inputId={`comp-instagram-${comp.id}`}
                                label="Instagram"
                                placeholder="@handle"
                                value={comp.instagram}
                                onChange={(e) => updateCompetitor(comp.id, 'instagram', e.target.value)}
                              />
                              <Input
                                inputId={`comp-tiktok-${comp.id}`}
                                label="TikTok"
                                placeholder="@handle"
                                value={comp.tiktok}
                                onChange={(e) => updateCompetitor(comp.id, 'tiktok', e.target.value)}
                              />
                              <Input
                                inputId={`comp-youtube-${comp.id}`}
                                label="YouTube"
                                placeholder="youtube.com/channel"
                                value={comp.youtube}
                                onChange={(e) => updateCompetitor(comp.id, 'youtube', e.target.value)}
                              />
                              <Input
                                inputId={`comp-pinterest-${comp.id}`}
                                label="Pinterest"
                                placeholder="pinterest.com/user"
                                value={comp.pinterest}
                                onChange={(e) => updateCompetitor(comp.id, 'pinterest', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ─ Contact Info ────────────────────────────────────── */}
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Contact Information</h3>
                    <div className="settings-grid">
                      <Input
                        inputId="settings-contact-email"
                        label="Email"
                        type="email"
                        placeholder="hello@yourbrand.com"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo((c) => ({ ...c, email: e.target.value }))}
                      />
                      <Input
                        inputId="settings-contact-phone"
                        label="Phone"
                        type="tel"
                        placeholder="+212 600 000 000"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo((c) => ({ ...c, phone: e.target.value }))}
                      />
                      <Input
                        inputId="settings-contact-instagram"
                        label="Instagram"
                        placeholder="@yourbrand"
                        value={contactInfo.instagram}
                        onChange={(e) => setContactInfo((c) => ({ ...c, instagram: e.target.value }))}
                      />
                      <Input
                        inputId="settings-contact-facebook"
                        label="Facebook"
                        placeholder="facebook.com/yourbrand"
                        value={contactInfo.facebook}
                        onChange={(e) => setContactInfo((c) => ({ ...c, facebook: e.target.value }))}
                      />
                      <Input
                        inputId="settings-contact-tiktok"
                        label="TikTok"
                        placeholder="@yourbrand"
                        value={contactInfo.tiktok}
                        onChange={(e) => setContactInfo((c) => ({ ...c, tiktok: e.target.value }))}
                      />
                      <Input
                        inputId="settings-contact-linkedin"
                        label="LinkedIn"
                        placeholder="linkedin.com/company/yourbrand"
                        value={contactInfo.linkedin}
                        onChange={(e) => setContactInfo((c) => ({ ...c, linkedin: e.target.value }))}
                      />
                      <Input
                        inputId="settings-contact-youtube"
                        label="YouTube"
                        placeholder="youtube.com/@yourbrand"
                        value={contactInfo.youtube}
                        onChange={(e) => setContactInfo((c) => ({ ...c, youtube: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* ─ Save bar ────────────────────────────────────────── */}
                  <div className="settings-save-bar">
                    {saveError && <span className="settings-save-error">{saveError}</span>}
                    {saveSuccess && <span className="settings-save-success">Saved successfully!</span>}
                    <Button
                      variant="secondary"
                      onClick={() => { if (activeProfile) syncFromProfile(activeProfile); }}
                      disabled={isSaving}
                      id="settings-discard"
                    >
                      Discard
                    </Button>
                    <Button variant="primary" onClick={handleSave} loading={isSaving} id="settings-save">
                      <Save size={16} aria-hidden="true" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* ── Meta Connection Section ──────────────────────────────────────── */}
      <section className="settings-section">
        <h2 className="settings-section-title">Meta Connection</h2>
        <div className="card">
          <div className="settings-row">
            <div className="settings-connection">
              <span className="settings-connection-dot settings-connected" />
              <span className="settings-label">
                Connected via System User Token — managed by administrator
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Data Management Section ──────────────────────────────────────── */}
      <section className="settings-section">
        <h2 className="settings-section-title">Website Data</h2>
        <div className="card">
          <div className="settings-row">
            <span className="settings-label">Scraped website content for AI personalization</span>
            <div className="quick-actions">
              <Button variant="secondary" size="sm" onClick={() => refresh()} id="settings-refresh-website">
                <RefreshCw size={14} aria-hidden="true" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDataModal('website')}
                id="settings-delete-website"
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete All
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <section className="settings-section">
        <div className="settings-danger-zone">
          <h2 className="settings-danger-title">
            <AlertTriangle size={18} aria-hidden="true" />
            {' '}Danger Zone
          </h2>
          <div className="settings-danger-item">
            <span className="settings-danger-label">Delete all campaign plans</span>
            <Button variant="danger" size="sm" onClick={() => setDeleteDataModal('plans')} id="settings-delete-plans">
              Delete Plans
            </Button>
          </div>
          <div className="settings-danger-item">
            <span className="settings-danger-label">Delete all analyses</span>
            <Button variant="danger" size="sm" onClick={() => setDeleteDataModal('analyses')} id="settings-delete-analyses">
              Delete Analyses
            </Button>
          </div>
          <div className="settings-danger-item">
            <span className="settings-danger-label">Delete account and all data</span>
            <Button variant="danger" size="sm" onClick={() => setDeleteDataModal('account')} id="settings-delete-account">
              Delete Account
            </Button>
          </div>
        </div>
      </section>

      {/* ── Create Brand Modal ───────────────────────────────────────────── */}
      <Modal
        open={createModal}
        title="Create New Brand"
        onClose={() => { setCreateModal(false); setCreateError(null); }}
        footer={
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => { setCreateModal(false); setCreateError(null); }} id="create-cancel">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProfile} loading={isCreating} id="create-confirm">
              <PlusCircle size={14} aria-hidden="true" />
              Create
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <Input
            inputId="new-brand-name"
            label="Brand Name"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleCreateProfile(); }}
            required
            autoFocus
          />
          {createError && <p className="settings-save-error" style={{ margin: 0 }}>{createError}</p>}
        </div>
      </Modal>

      {/* ── Delete Brand Modal ───────────────────────────────────────────── */}
      <Modal
        open={deleteProfileModal}
        title="Delete Brand"
        onClose={() => setDeleteProfileModal(false)}
        footer={
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setDeleteProfileModal(false)} id="delete-brand-cancel">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProfile} loading={isDeletingProfile} id="delete-brand-confirm">
              <Trash2 size={14} aria-hidden="true" />
              Delete Brand
            </Button>
          </div>
        }
      >
        <p className="page-subtitle">
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{activeProfile?.business_name}</strong>?
          This will permanently remove this brand profile and cannot be undone.
        </p>
      </Modal>

      {/* ── Data Deletion Modal ──────────────────────────────────────────── */}
      <Modal
        open={deleteDataModal !== null}
        title="Confirm Deletion"
        onClose={() => setDeleteDataModal(null)}
        footer={
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setDeleteDataModal(null)} id="delete-data-cancel">
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setDeleteDataModal(null)} id="delete-data-confirm">
              <Trash2 size={14} aria-hidden="true" />
              Delete Permanently
            </Button>
          </div>
        }
      >
        <p className="page-subtitle">
          {deleteDataModal === 'account'
            ? 'This will permanently delete your account and all associated data. This action cannot be undone.'
            : deleteDataModal === 'plans'
            ? 'This will permanently delete all your campaign plans. This action cannot be undone.'
            : deleteDataModal === 'analyses'
            ? 'This will permanently delete all your campaign analyses. This action cannot be undone.'
            : 'This will permanently delete all scraped website data. This action cannot be undone.'}
        </p>
      </Modal>
    </div>
  );
}
