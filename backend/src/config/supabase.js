import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isRealSupabaseConfigured = () => {
  const url = config.supabase.url;
  const key = config.supabase.serviceRoleKey;
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('YOUR_SUPABASE_URL') &&
    !key.includes('YOUR_SUPABASE')
  );
};

let supabaseClient = null;

if (isRealSupabaseConfigured()) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Database] Connected to Supabase PostgreSQL at:', config.supabase.url);
  } catch (err) {
    console.error('[Database] Failed to initialize Supabase client:', err.message);
  }
}

// Fallback / In-Memory Mock Database for Local Offline Resilience
class LocalDbFallback {
  constructor() {
    this.storagePath = path.resolve(__dirname, '../../database/local_store.json');
    this.data = {
      users: [],
      hostel_rooms: [],
      technicians: [],
      complaints: [],
      complaint_history: [],
      feedback: [],
      notifications: [],
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Database Fallback] Could not read local store, using memory:', err.message);
    }
  }

  save() {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.storagePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[Database Fallback] Could not persist local store:', err.message);
    }
  }

  from(tableName) {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }

    const self = this;
    const records = self.data[tableName];

    class QueryBuilder {
      constructor() {
        this.filters = [];
        this.selectedFields = '*';
        this.isSingle = false;
        this.limitVal = null;
        this.orderField = null;
        this.orderAsc = true;
      }

      select(fields = '*') {
        this.selectedFields = fields;
        return this;
      }

      eq(column, value) {
        this.filters.push((item) => String(item[column]) === String(value));
        return this;
      }

      neq(column, value) {
        this.filters.push((item) => String(item[column]) !== String(value));
        return this;
      }

      in(column, values) {
        const valSet = new Set(values.map(String));
        this.filters.push((item) => valSet.has(String(item[column])));
        return this;
      }

      ilike(column, pattern) {
        const clean = pattern.replace(/%/g, '').toLowerCase();
        this.filters.push((item) => (item[column] || '').toLowerCase().includes(clean));
        return this;
      }

      order(column, { ascending = true } = {}) {
        this.orderField = column;
        this.orderAsc = ascending;
        return this;
      }

      limit(count) {
        this.limitVal = count;
        return this;
      }

      single() {
        this.isSingle = true;
        return this;
      }

      insert(items) {
        const toInsert = Array.isArray(items) ? items : [items];
        const inserted = toInsert.map((item) => ({
          id: item.id || crypto.randomUUID(),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          ...item,
        }));
        records.push(...inserted);
        self.save();
        this._resultData = this.isSingle ? inserted[0] : (Array.isArray(items) ? inserted : inserted[0]);
        return this;
      }

      update(updates) {
        this._pendingUpdates = updates;
        return this;
      }

      delete() {
        this._isDelete = true;
        return this;
      }

      async then(resolve, reject) {
        try {
          if (this._resultData !== undefined) {
            return resolve({ data: this._resultData, error: null });
          }

          if (this._pendingUpdates) {
            let matched = records.filter((item) => this.filters.every((fn) => fn(item)));
            const now = new Date().toISOString();
            matched.forEach((item) => {
              Object.assign(item, this._pendingUpdates, { updated_at: now });
            });
            self.save();
            return resolve({
              data: this.isSingle ? matched[0] || null : matched,
              error: null,
            });
          }

          if (this._isDelete) {
            const initialCount = records.length;
            const remaining = records.filter((item) => !this.filters.every((fn) => fn(item)));
            self.data[tableName] = remaining;
            self.save();
            return resolve({
              data: initialCount - remaining.length,
              error: null,
            });
          }

          let result = [...records];
          for (const fn of this.filters) {
            result = result.filter(fn);
          }
          if (this.orderField) {
            result.sort((a, b) => {
              const va = a[this.orderField];
              const vb = b[this.orderField];
              if (va < vb) return this.orderAsc ? -1 : 1;
              if (va > vb) return this.orderAsc ? 1 : -1;
              return 0;
            });
          }
          if (this.limitVal !== null) {
            result = result.slice(0, this.limitVal);
          }
          let data = result;
          if (this.isSingle) {
            data = result.length > 0 ? result[0] : null;
          }
          resolve({ data, error: null });
        } catch (err) {
          resolve({ data: null, error: err });
        }
      }
    }

    return new QueryBuilder();
  }
}

export const localDb = new LocalDbFallback();

export const getSupabase = () => {
  if (supabaseClient) {
    return supabaseClient;
  }
  return localDb;
};

export const isUsingFallbackDb = () => !supabaseClient;

