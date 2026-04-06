import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { unwrapData, normalizeListPayload } from '../../lib/http';

/** Department scope (matches catalog product `type` values). */
const SEARCH_DEPARTMENTS = [
  { value: '', label: 'All' },
  { value: 'Casual Retro Runner', label: 'Adidas' },
  { value: 'Lifestyle Basketball Sneaker', label: 'Nike' },
  { value: 'Performance & Motorsport', label: 'Puma' },
  { value: 'Heritage Court & Fitness', label: 'Reebok' },
  { value: 'Premium Heritage Runner', label: 'New Balance' },
];

const SUGGEST_DEBOUNCE_MS = 220;
const MIN_QUERY = 2;
const SUGGEST_LIMIT = 8;

/**
 * Amazon-style search: department + input + submit as one control,
 * unified focus ring, autocomplete dropdown, keyboard navigation.
 */
export default function NavbarSearchBar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const listboxId = useId();
  const formRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  /** Sync query + department from URL on home (/?q=) or search page */
  useEffect(() => {
    if (location.pathname !== '/searchPage' && location.pathname !== '/') return;
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const t = params.get('type') || '';
    setQuery(q ?? '');
    setDepartment(t);
  }, [location.pathname, location.search]);

  /** Debounced suggestions */
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setSuggestions([]);
      setLoadingSuggest(false);
      return;
    }

    let cancelled = false;
    setLoadingSuggest(true);
    const timer = setTimeout(async () => {
      try {
        const params = { search: q, limit: SUGGEST_LIMIT };
        if (department) params.type = department;
        const res = await api.get('/products', { params });
        const inner = unwrapData(res.data);
        const list = normalizeListPayload(inner);
        if (!cancelled) setSuggestions(Array.isArray(list) ? list.slice(0, SUGGEST_LIMIT) : []);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoadingSuggest(false);
      }
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, department]);

  /** Scroll active option into view */
  useEffect(() => {
    if (!panelOpen || activeIndex < 0 || !listRef.current) return;
    const node = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, panelOpen]);

  /** Close panel on outside click */
  useEffect(() => {
    const onDoc = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setPanelOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const goSearch = useCallback(
    (qRaw) => {
      const q = (qRaw ?? query).trim();
      const params = new URLSearchParams();
      if (q.length >= MIN_QUERY) params.set('q', q);
      if (department) params.set('type', department);
      const qs = params.toString();
      const onHome = location.pathname === '/';

      if (!qs) {
        navigate(onHome ? '/' : '/searchPage');
        onNavigate?.();
        setPanelOpen(false);
        setActiveIndex(-1);
        return;
      }

      /** Amazon-style: search from home stays on `/` with query string; other routes use `/searchPage` */
      if (onHome) {
        navigate({ pathname: '/', search: `?${qs}` });
      } else {
        navigate({ pathname: '/searchPage', search: `?${qs}` });
      }
      onNavigate?.();
      setPanelOpen(false);
      setActiveIndex(-1);
    },
    [query, department, navigate, onNavigate, location.pathname]
  );

  const onSubmit = (e) => {
    e.preventDefault();
    if (panelOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      const p = suggestions[activeIndex];
      setQuery(p.name ?? '');
      goSearch(p.name ?? '');
      return;
    }
    goSearch();
  };

  const onInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (query.trim().length < MIN_QUERY) return;
      setPanelOpen(true);
      if (suggestions.length === 0) return;
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setPanelOpen(true);
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setPanelOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === 'Enter' && panelOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      const p = suggestions[activeIndex];
      setQuery(p.name ?? '');
      goSearch(p.name ?? '');
    }
  };

  const onInputChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
    if (e.target.value.trim().length >= MIN_QUERY) setPanelOpen(true);
    else setPanelOpen(false);
  };

  const onInputFocus = () => {
    if (query.trim().length >= MIN_QUERY) setPanelOpen(true);
  };

  const panelVisible = panelOpen && query.trim().length >= MIN_QUERY;

  useEffect(() => {
    if (query.trim().length < MIN_QUERY) {
      setPanelOpen(false);
      setActiveIndex(-1);
    }
  }, [query]);

  return (
    <div ref={formRef} className="relative mx-auto min-w-0 max-w-xl flex-1 md:block">
      <form
        role="search"
        onSubmit={onSubmit}
        className="flex w-full items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm ring-0 transition-[border-color,box-shadow] focus-within:border-indigo-500 focus-within:shadow-md focus-within:shadow-indigo-500/10 focus-within:ring-2 focus-within:ring-indigo-500/70 dark:border-slate-600 dark:bg-slate-900 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-400/60"
        aria-label="Site search"
      >
        {/* Department (Amazon-style left segment) */}
        <div className="relative flex shrink-0 items-stretch border-r border-slate-200 dark:border-slate-600">
          <label htmlFor={`${listboxId}-dept`} className="sr-only">
            Search in category
          </label>
          <select
            id={`${listboxId}-dept`}
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setActiveIndex(-1);
            }}
            className="h-10 max-w-[min(9.5rem,32vw)] cursor-pointer appearance-none border-0 bg-slate-50 py-0 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-100 focus:ring-0 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Search in category"
          >
            {SEARCH_DEPARTMENTS.map((d) => (
              <option key={d.value || 'all'} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
        </div>

        {/* Query */}
        <input
          id={`${listboxId}-q`}
          type="search"
          name="q"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={onInputChange}
          onFocus={onInputFocus}
          onKeyDown={onInputKeyDown}
          placeholder="Search products, brands…"
          role="combobox"
          aria-expanded={panelVisible}
          aria-controls={panelVisible ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          className="h-10 min-w-0 flex-1 border-0 bg-white px-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:ring-0 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        />

        {/* Submit */}
        <button
          type="submit"
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 border-l border-indigo-700/25 bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:bg-indigo-700 dark:border-indigo-500/30"
          aria-label="Search"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Suggestions */}
      {panelVisible && (
        <div
          id={listboxId}
          role="listbox"
          ref={listRef}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-[min(20rem,50vh)] overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/40 dark:ring-white/10"
        >
          {loadingSuggest && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              Searching…
            </div>
          )}
          {!loadingSuggest && suggestions.length === 0 && query.trim().length >= MIN_QUERY && (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No suggestions — press Search to see results
            </div>
          )}
          {suggestions.map((p, idx) => {
            const primary =
              p.images?.find((img) => img.is_primary)?.image_url ||
              p.images?.[0]?.image_url ||
              p.image_url;
            const selected = idx === activeIndex;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                id={`${listboxId}-opt-${idx}`}
                data-index={idx}
                aria-selected={selected}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                  selected
                    ? 'bg-indigo-50 text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-100'
                    : 'text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80'
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery(p.name ?? '');
                  goSearch(p.name ?? '');
                }}
              >
                {primary ? (
                  <img
                    src={primary}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md bg-slate-100 object-cover dark:bg-slate-800"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-md bg-slate-100 dark:bg-slate-800" />
                )}
                <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                {p.sale_price != null && (
                  <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    ₹{p.sale_price}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
