/**
 * InsForge client configuration and SDK wrapper.
 * Provides access to InsForge services: Auth, Database, Storage, AI Gateway, and Realtime.
 *
 * Uses the official @insforge/sdk for auth (PKCE OAuth) and custom fetch for DB/Storage/AI.
 *
 * @module insforge
 */

import { createClient } from '@insforge/sdk';

/** InsForge configuration loaded from environment variables */
const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? '';

/**
 * InsForge SDK client singleton — browser-only (uses PKCE sessionStorage, localStorage).
 * On the server this is null; auth actions are client-only.
 */
const _sdk =
  typeof window !== 'undefined'
    ? createClient({ baseUrl: INSFORGE_URL, anonKey: INSFORGE_ANON_KEY })
    : null;

/** Type definition for InsForge database query result */
interface QueryResult<T> {
  data: T | null;
  error: InsForgeError | null;
}

/** Type definition for InsForge error */
interface InsForgeError {
  message: string;
  code: string;
  details?: string;
}

/** Type definition for InsForge auth session */
interface Session {
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, string>;
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/** Type definition for InsForge storage upload result */
interface UploadResult {
  path: string;
  url: string;
}

/**
 * InsForge Auth module — email/password authentication for internal use.
 * No OAuth flow needed — this app is single-user / internal only.
 */
export const auth = {
  /**
   * Signs in with email and password.
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{ session: Session | null; error: InsForgeError | null }> {
    if (!_sdk) return { session: null, error: { message: 'Auth SDK not available', code: 'SDK_ERROR' } };

    const { data, error } = await _sdk.auth.signInWithPassword({ email, password });

    if (error || !data) {
      return {
        session: null,
        error: { message: error?.message ?? 'Sign in failed', code: 'AUTH_ERROR' },
      };
    }

    return {
      session: {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: (data.user.profile as Record<string, string>) ?? {},
        },
        access_token: data.accessToken,
        refresh_token: '',
        expires_at: 0,
      },
      error: null,
    };
  },

  /**
   * Exchanges the InsForge OAuth callback code (insforge_code) for a session.
   * Kept for potential future use; not used in the current internal flow.
   */
  async exchangeOAuthCode(
    code: string,
  ): Promise<{ session: Session | null; error: InsForgeError | null }> {
    if (!_sdk)
      return { session: null, error: { message: 'Auth SDK not available', code: 'SDK_ERROR' } };

    const { data, error } = await _sdk.auth.exchangeOAuthCode(code);

    if (error || !data) {
      return {
        session: null,
        error: { message: error?.message ?? 'OAuth code exchange failed', code: 'AUTH_ERROR' },
      };
    }

    return {
      session: {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: (data.user.profile as Record<string, string>) ?? {},
        },
        access_token: data.accessToken,
        refresh_token: '',
        expires_at: 0,
      },
      error: null,
    };
  },

  /**
   * Retrieves the current user session, refreshing if necessary.
   */
  async getSession(): Promise<{ session: Session | null; error: InsForgeError | null }> {
    if (!_sdk) return { session: null, error: null };

    const { data, error } = await _sdk.auth.getCurrentSession();

    if (error || !data?.session) {
      return {
        session: null,
        error: error ? { message: error.message, code: 'AUTH_ERROR' } : null,
      };
    }

    return {
      session: {
        user: {
          id: data.session.user.id,
          email: data.session.user.email,
          user_metadata: (data.session.user.profile as Record<string, string>) ?? {},
        },
        access_token: data.session.accessToken,
        refresh_token: '',
        expires_at: data.session.expiresAt?.getTime() ?? 0,
      },
      error: null,
    };
  },

  /**
   * Signs the user out and clears the session.
   */
  async signOut(): Promise<{ error: InsForgeError | null }> {
    if (!_sdk) return { error: null };
    const { error } = await _sdk.auth.signOut();
    return { error: error ? { message: error.message, code: 'AUTH_ERROR' } : null };
  },

  /**
   * Retrieves the current authenticated user.
   */
  async getUser(): Promise<{ user: Session['user'] | null; error: InsForgeError | null }> {
    const { session, error } = await auth.getSession();
    if (error || !session) return { user: null, error };
    return { user: session.user, error: null };
  },
};

/**
 * InsForge Database module — CRUD operations with RLS enforcement.
 */
export const db = {
  /**
   * Performs a query on the specified table with RLS enforcement.
   */
  async from<T>(table: string): Promise<QueryBuilder<T>> {
    return new QueryBuilder<T>(table);
  },
};

/** Returns the current user's JWT or falls back to the anon key */
async function getAuthToken(): Promise<string> {
  if (!_sdk) return INSFORGE_ANON_KEY;
  const { data } = await _sdk.auth.getCurrentSession();
  return data?.session?.accessToken ?? INSFORGE_ANON_KEY;
}

/**
 * Query builder for InsForge database operations.
 * All queries go through the InsForge SDK which enforces Row-Level Security.
 */
class QueryBuilder<T> {
  private table: string;
  private filters: Array<{ column: string; operator: string; value: string | number | boolean | null }> = [];
  private selectColumns: string = '*';
  private orderByColumn: string | null = null;
  private orderDirection: 'asc' | 'desc' = 'asc';
  private limitCount: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  /** Selects specific columns */
  select(columns: string = '*'): this {
    this.selectColumns = columns;
    return this;
  }

  /** Adds an equality filter */
  eq(column: string, value: string | number | boolean | null): this {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  /** Adds ordering */
  order(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderByColumn = column;
    this.orderDirection = direction;
    return this;
  }

  /** Limits number of results */
  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  /** Executes the query and returns results */
  async execute(): Promise<QueryResult<T[]>> {
    const params = new URLSearchParams();
    params.set('select', this.selectColumns);

    for (const filter of this.filters) {
      params.set(`${filter.column}`, `${filter.operator}.${filter.value}`);
    }

    if (this.orderByColumn) {
      params.set('order', `${this.orderByColumn}.${this.orderDirection}`);
    }

    if (this.limitCount !== null) {
      params.set('limit', String(this.limitCount));
    }

    const token = await getAuthToken();
    const response = await fetch(`${INSFORGE_URL}/api/database/records/${this.table}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: {
          message: (errorData as Record<string, string>).message ?? 'Query failed',
          code: 'DB_ERROR',
        },
      };
    }

    const data: T[] = await response.json();
    return { data, error: null };
  }

  /** Inserts a record */
  async insert(record: Partial<T>): Promise<QueryResult<T>> {
    const token = await getAuthToken();
    const response = await fetch(`${INSFORGE_URL}/api/database/records/${this.table}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify([record]),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: (errorData as Record<string, string>).message ?? 'Insert failed', code: 'DB_ERROR' } };
    }

    const data: T[] = await response.json();
    return { data: data[0] ?? null, error: null };
  }

  /** Updates a record matching the current filters */
  async update(record: Partial<T>): Promise<QueryResult<T>> {
    const params = new URLSearchParams();
    for (const filter of this.filters) {
      params.set(`${filter.column}`, `${filter.operator}.${filter.value}`);
    }

    const token = await getAuthToken();
    const response = await fetch(`${INSFORGE_URL}/api/database/records/${this.table}?${params.toString()}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: { message: (errorData as Record<string, string>).message ?? 'Update failed', code: 'DB_ERROR' } };
    }

    const data: T[] = await response.json();
    return { data: data[0] ?? null, error: null };
  }

  /** Deletes records matching the current filters */
  async delete(): Promise<QueryResult<null>> {
    const params = new URLSearchParams();
    for (const filter of this.filters) {
      params.set(`${filter.column}`, `${filter.operator}.${filter.value}`);
    }

    const token = await getAuthToken();
    const response = await fetch(`${INSFORGE_URL}/api/database/records/${this.table}?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { data: null, error: { message: 'Delete failed', code: 'DB_ERROR' } };
    }

    return { data: null, error: null };
  }
}

/**
 * InsForge Storage module — file uploads and management.
 */
export const storage = {
  /**
   * Uploads a file to InsForge Cloud Storage.
   */
  async upload(bucket: string, path: string, file: File): Promise<{ data: UploadResult | null; error: InsForgeError | null }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${INSFORGE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
      },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      return { data: null, error: { message: 'Upload failed', code: 'STORAGE_ERROR' } };
    }

    const data: UploadResult = await response.json();
    return { data, error: null };
  },

  /**
   * Gets the public URL for a stored file.
   */
  getPublicUrl(bucket: string, path: string): string {
    return `${INSFORGE_URL}/storage/v1/object/public/${bucket}/${path}`;
  },

  /**
   * Deletes a file from storage.
   */
  async remove(bucket: string, paths: string[]): Promise<{ error: InsForgeError | null }> {
    const response = await fetch(`${INSFORGE_URL}/storage/v1/object/${bucket}`, {
      method: 'DELETE',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ prefixes: paths }),
    });

    if (!response.ok) {
      return { error: { message: 'Delete failed', code: 'STORAGE_ERROR' } };
    }

    return { error: null };
  },
};

/**
 * InsForge AI Gateway module — LLM calls via InsForge SDK.
 */
export const ai = {
  /**
   * Sends a prompt and returns the full response (non-streaming).
   */
  async complete(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }): Promise<{ content: string | null; error: InsForgeError | null }> {
    if (!_sdk) return { content: null, error: { message: 'AI SDK not available', code: 'SDK_ERROR' } };

    try {
      const completion = await _sdk.ai.chat.completions.create({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        maxTokens: params.max_tokens,
      });

      const content = (completion as { choices: Array<{ message: { content: string } }> })
        .choices[0]?.message?.content ?? null;
      return { content, error: null };
    } catch (err) {
      return { content: null, error: { message: String(err), code: 'AI_ERROR' } };
    }
  },
};

/**
 * InsForge Edge Functions module — calls to serverless functions via SDK.
 */
export const functions = {
  /**
   * Invokes an InsForge Edge Function using the SDK (correct URL + auth headers).
   */
  async invoke<T>(functionName: string, body: Record<string, unknown> = {}): Promise<{ data: T | null; error: InsForgeError | null }> {
    if (!_sdk) return { data: null, error: { message: 'SDK not available', code: 'SDK_ERROR' } };

    const { data, error } = await _sdk.functions.invoke(functionName, { body });

    if (error) {
      return { data: null, error: { message: error.message, code: 'FUNCTION_ERROR' } };
    }

    return { data: data as T, error: null };
  },
};

export const insforge = { auth, db, storage, ai, functions };
