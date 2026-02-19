/**
 * InsForge client configuration and SDK wrapper.
 * Provides access to InsForge services: Auth, Database, Storage, AI Gateway, and Realtime.
 *
 * @module insforge
 */

/** InsForge configuration loaded from environment variables */
const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? '';
const INSFORGE_SERVICE_KEY = process.env.INSFORGE_SERVICE_KEY ?? '';

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
 * InsForge Auth module — handles Facebook OAuth and session management.
 */
export const auth = {
  /**
   * Initiates Facebook OAuth login flow.
   * Redirects the user to Facebook for authentication.
   */
  async signInWithFacebook(redirectTo: string): Promise<{ url: string; error: InsForgeError | null }> {
    const params = new URLSearchParams({
      provider: 'facebook',
      redirect_to: redirectTo,
      scopes: 'ads_read,pages_show_list,email,public_profile',
    });

    const response = await fetch(`${INSFORGE_URL}/auth/v1/authorize?${params.toString()}`, {
      headers: {
        'apikey': INSFORGE_ANON_KEY,
      },
    });

    if (!response.ok) {
      return { url: '', error: { message: 'Failed to initiate login', code: 'AUTH_ERROR' } };
    }

    const data: { url: string } = await response.json();
    return { url: data.url, error: null };
  },

  /**
   * Exchanges the OAuth callback code for a session.
   */
  async exchangeCodeForSession(code: string): Promise<{ session: Session | null; error: InsForgeError | null }> {
    const response = await fetch(`${INSFORGE_URL}/auth/v1/token?grant_type=authorization_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': INSFORGE_ANON_KEY,
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      return { session: null, error: { message: 'Failed to exchange code for session', code: 'AUTH_ERROR' } };
    }

    const session: Session = await response.json();
    return { session, error: null };
  },

  /**
   * Retrieves the current user session from cookies.
   */
  async getSession(): Promise<{ session: Session | null; error: InsForgeError | null }> {
    const response = await fetch(`${INSFORGE_URL}/auth/v1/session`, {
      headers: {
        'apikey': INSFORGE_ANON_KEY,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { session: null, error: null };
    }

    const session: Session = await response.json();
    return { session, error: null };
  },

  /**
   * Signs the user out and clears the session.
   */
  async signOut(): Promise<{ error: InsForgeError | null }> {
    const response = await fetch(`${INSFORGE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { error: { message: 'Failed to sign out', code: 'AUTH_ERROR' } };
    }

    return { error: null };
  },

  /**
   * Retrieves the current authenticated user.
   */
  async getUser(): Promise<{ user: Session['user'] | null; error: InsForgeError | null }> {
    const { session, error } = await auth.getSession();
    if (error || !session) {
      return { user: null, error };
    }
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

    const response = await fetch(`${INSFORGE_URL}/rest/v1/${this.table}?${params.toString()}`, {
      headers: {
        'apikey': INSFORGE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
    const response = await fetch(`${INSFORGE_URL}/rest/v1/${this.table}`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      credentials: 'include',
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      return { data: null, error: { message: 'Insert failed', code: 'DB_ERROR' } };
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

    const response = await fetch(`${INSFORGE_URL}/rest/v1/${this.table}?${params.toString()}`, {
      method: 'PATCH',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      credentials: 'include',
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      return { data: null, error: { message: 'Update failed', code: 'DB_ERROR' } };
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

    const response = await fetch(`${INSFORGE_URL}/rest/v1/${this.table}?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
      },
      credentials: 'include',
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
 * InsForge AI Gateway module — LLM calls via OpenRouter.
 */
export const ai = {
  /**
   * Sends a prompt to the AI model and returns a streaming response.
   */
  async stream(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${INSFORGE_URL}/ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...params,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      return null;
    }

    return response.body;
  },

  /**
   * Sends a prompt and returns the full response (non-streaming).
   */
  async complete(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }): Promise<{ content: string | null; error: InsForgeError | null }> {
    const response = await fetch(`${INSFORGE_URL}/ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...params,
        stream: false,
      }),
    });

    if (!response.ok) {
      return { content: null, error: { message: 'AI call failed', code: 'AI_ERROR' } };
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return { content: data.choices[0]?.message?.content ?? null, error: null };
  },
};

/**
 * InsForge Edge Functions module — calls to serverless functions.
 */
export const functions = {
  /**
   * Invokes an InsForge Edge Function.
   */
  async invoke<T>(functionName: string, body: Record<string, unknown> = {}): Promise<{ data: T | null; error: InsForgeError | null }> {
    const response = await fetch(`${INSFORGE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { data: null, error: { message: `Function ${functionName} failed`, code: 'FUNCTION_ERROR' } };
    }

    const data: T = await response.json();
    return { data, error: null };
  },
};

export const insforge = { auth, db, storage, ai, functions };
