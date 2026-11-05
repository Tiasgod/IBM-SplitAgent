import { useState, useEffect, useRef } from "react";

/**
 * Stale-while-revalidate via sessionStorage.
 *
 * - On first load: shows cached data instantly (if any), then fetches fresh data in background.
 * - `isStale` is true while showing cached data and the fresh fetch is in progress.
 * - `loading` is true only when there is no cached data yet (first-ever load).
 */
export function useStaleCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): { data: T | null; loading: boolean; isStale: boolean; error: string | null; reload: () => void } {
  const [data, setData] = useState<T | null>(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(cacheKey);
    } catch {
      return true;
    }
  });
  const [isStale, setIsStale] = useState<boolean>(() => {
    try {
      return !!sessionStorage.getItem(cacheKey);
    } catch {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  function run() {
    const fetchId = ++fetchCountRef.current;
    setError(null);

    fetcher()
      .then((fresh) => {
        if (fetchId !== fetchCountRef.current) return; // stale fetch
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(fresh));
        } catch {
          // storage full or private mode — silently ignore
        }
        setData(fresh);
        setIsStale(false);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (fetchId !== fetchCountRef.current) return;
        setError(e.message);
        setLoading(false);
        setIsStale(false);
      });
  }

  function reload() {
    setIsStale(data !== null);
    if (data === null) setLoading(true);
    run();
  }

  useEffect(() => {
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, isStale, error, reload };
}
