/**
 * BusinessProfileContext — multi-brand profile state management.
 *
 * Loads all business profiles for the current user, tracks which one is
 * currently active (persisted in localStorage), and exposes full CRUD.
 * Wrap the authenticated app layout with <BusinessProfileProvider /> so
 * every page can read the active profile via useBusinessProfiles().
 */
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { db, auth, storage } from '@/lib/insforge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Competitor {
  id: string;
  website_url: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  pinterest: string;
}

export interface ProductInfo {
  categories: string[];
  customization_options: string;
  price_min: number | null;
  price_max: number | null;
  payment_methods: string[];
  order_process: string;
  shipping_regions: string;
}

export interface TargetAudienceInfo {
  demographics: string;
  interests: string[];
  behaviors: string;
  occasions: string[];
  languages: string[];
}

export interface MarketingPrefs {
  default_objective: string;
  preferred_platforms: string[];
  ad_creative_preferences: string;
  competitors: Competitor[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  youtube: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry: string;
  country: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  daily_budget: number;
  scrape_consent: boolean;
  meta_ad_account_id: string | null;
  product_info: ProductInfo;
  target_audience_info: TargetAudienceInfo;
  marketing_prefs: MarketingPrefs;
  contact_info: ContactInfo;
  created_at: string;
  updated_at: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PRODUCT_INFO: ProductInfo = {
  categories: [],
  customization_options: '',
  price_min: null,
  price_max: null,
  payment_methods: [],
  order_process: '',
  shipping_regions: '',
};

const DEFAULT_TARGET_AUDIENCE: TargetAudienceInfo = {
  demographics: '',
  interests: [],
  behaviors: '',
  occasions: [],
  languages: [],
};

const DEFAULT_MARKETING_PREFS: MarketingPrefs = {
  default_objective: '',
  preferred_platforms: [],
  ad_creative_preferences: '',
  competitors: [],
};

const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: '',
  phone: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  linkedin: '',
  youtube: '',
};

const ACTIVE_PROFILE_KEY = 'advize_active_profile_id';

// ─── Context interface ─────────────────────────────────────────────────────────

interface BusinessProfileContextValue {
  profiles: BusinessProfile[];
  activeProfile: BusinessProfile | null;
  activeProfileId: string | null;
  isLoading: boolean;
  error: string | null;
  switchProfile: (id: string) => void;
  refresh: () => Promise<void>;
  createProfile: (data: { business_name: string; industry?: string; daily_budget?: number }) => Promise<{ data: BusinessProfile | null; error: string | null }>;
  updateProfile: (id: string, data: Partial<BusinessProfile>) => Promise<{ error: string | null }>;
  deleteProfile: (id: string) => Promise<{ error: string | null }>;
  uploadLogo: (file: File) => Promise<{ url: string | null; error: string | null }>;
}

const BusinessProfileContext = createContext<BusinessProfileContextValue | null>(null);

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeProfile(raw: Record<string, unknown>): BusinessProfile {
  return {
    id: String(raw.id ?? ''),
    user_id: String(raw.user_id ?? ''),
    business_name: String(raw.business_name ?? ''),
    industry: String(raw.industry ?? ''),
    country: raw.country != null ? String(raw.country) : null,
    description: raw.description != null ? String(raw.description) : null,
    logo_url: raw.logo_url != null ? String(raw.logo_url) : null,
    website_url: raw.website_url != null ? String(raw.website_url) : null,
    daily_budget: Number(raw.daily_budget ?? 20),
    scrape_consent: Boolean(raw.scrape_consent),
    meta_ad_account_id: raw.meta_ad_account_id != null ? String(raw.meta_ad_account_id) : null,
    product_info: { ...DEFAULT_PRODUCT_INFO, ...((raw.product_info as Partial<ProductInfo>) ?? {}) },
    target_audience_info: { ...DEFAULT_TARGET_AUDIENCE, ...((raw.target_audience_info as Partial<TargetAudienceInfo>) ?? {}) },
    marketing_prefs: {
      ...DEFAULT_MARKETING_PREFS,
      ...((raw.marketing_prefs as Partial<MarketingPrefs>) ?? {}),
    },
    contact_info: { ...DEFAULT_CONTACT_INFO, ...((raw.contact_info as Partial<ContactInfo>) ?? {}) },
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BusinessProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = await db.from<Record<string, unknown>>('business_profiles');
      const result = await query.select('*').order('created_at', 'asc').execute();

      if (result.error) {
        setError(result.error.message);
      } else {
        const loaded = (result.data ?? []).map((p) => normalizeProfile(p));
        setProfiles(loaded);

        // Resolve active profile: prefer localStorage-saved ID, fallback to first
        const saved = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_PROFILE_KEY) : null;
        const validSaved = saved && loaded.some((p) => p.id === saved);
        if (validSaved) {
          setActiveProfileId(saved);
        } else if (loaded.length > 0) {
          setActiveProfileId(loaded[0].id);
          if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_PROFILE_KEY, loaded[0].id);
        }
      }
    } catch {
      setError('Failed to load business profiles');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const switchProfile = useCallback((id: string) => {
    setActiveProfileId(id);
    if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  }, []);

  const createProfile = useCallback(async (data: { business_name: string; industry?: string; daily_budget?: number }) => {
    const { user, error: authErr } = await auth.getUser();
    if (authErr || !user) return { data: null, error: 'Not authenticated' };

    const query = await db.from<Record<string, unknown>>('business_profiles');
    const result = await query.insert({
      user_id: user.id,
      business_name: data.business_name,
      industry: data.industry ?? 'Other',
      daily_budget: data.daily_budget ?? 20,
    });

    if (result.error || !result.data) {
      return { data: null, error: result.error?.message ?? 'Failed to create profile' };
    }

    const created = normalizeProfile(result.data as Record<string, unknown>);
    setProfiles((prev) => [...prev, created]);
    switchProfile(created.id);
    return { data: created, error: null };
  }, [switchProfile]);

  const updateProfile = useCallback(async (id: string, data: Partial<BusinessProfile>) => {
    const query = await db.from<Record<string, unknown>>('business_profiles');
    const result = await query.eq('id', id).update(data as Record<string, unknown>);

    if (result.error) return { error: result.error.message };

    if (result.data) {
      const updated = normalizeProfile(result.data as Record<string, unknown>);
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return { error: null };
  }, []);

  const deleteProfile = useCallback(async (id: string) => {
    const query = await db.from<Record<string, unknown>>('business_profiles');
    const result = await query.eq('id', id).delete();

    if (result.error) return { error: result.error.message };

    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);

    if (activeProfileId === id) {
      const next = remaining[0]?.id ?? null;
      setActiveProfileId(next);
      if (typeof window !== 'undefined') {
        if (next) localStorage.setItem(ACTIVE_PROFILE_KEY, next);
        else localStorage.removeItem(ACTIVE_PROFILE_KEY);
      }
    }
    return { error: null };
  }, [profiles, activeProfileId]);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const result = await storage.upload('media-gallery', path, file);
      if (result.error || !result.data) {
        return { url: null, error: result.error?.message ?? 'Upload failed' };
      }
      const url = storage.getPublicUrl('media-gallery', path);
      return { url, error: null };
    } catch {
      return { url: null, error: 'Upload failed' };
    }
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? null;

  return (
    <BusinessProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId,
        isLoading,
        error,
        switchProfile,
        refresh,
        createProfile,
        updateProfile,
        deleteProfile,
        uploadLogo,
      }}
    >
      {children}
    </BusinessProfileContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBusinessProfiles(): BusinessProfileContextValue {
  const ctx = useContext(BusinessProfileContext);
  if (!ctx) throw new Error('useBusinessProfiles must be used inside <BusinessProfileProvider>');
  return ctx;
}
