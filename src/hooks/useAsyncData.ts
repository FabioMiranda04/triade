import { useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/**
 * Carrega dados assíncronos uma vez, com estado de loading e erro.
 *
 * `fallback` é o valor mostrado enquanto carrega — normalmente `[]`. Como os
 * providers já caem no seed local quando o Supabase falha, `error` deve ser
 * raro; ainda assim ele existe para a UI poder reagir.
 *
 * Uso:
 *   const { data: events, loading } = useAsyncData(() => db.getEvents(), []);
 *
 * Atenção: `load` é chamado uma vez na montagem. Se precisar recarregar,
 * passe uma `key` diferente.
 */
export function useAsyncData<T>(load: () => Promise<T>, fallback: T, key?: unknown): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: fallback,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));

    load()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (alive) {
          setState({
            data: fallback,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
