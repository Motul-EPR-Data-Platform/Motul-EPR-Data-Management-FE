import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ParamValue = string | number | boolean;

interface ParamConfig<T extends ParamValue> {
  defaultValue: T;
  parse?: (value: string) => T;
  serialize?: (value: T) => string;
}

type URLParamConfig = Record<string, ParamConfig<ParamValue>>;

interface UseURLParamsReturn<T extends URLParamConfig> {
  params: { [K in keyof T]: T[K]["defaultValue"] };
  updateParams: (updates: Partial<{ [K in keyof T]: T[K]["defaultValue"] }>) => void;
  getParam: <K extends keyof T>(key: K) => T[K]["defaultValue"];
  setParam: <K extends keyof T>(key: K, value: T[K]["defaultValue"]) => void;
}

/**
 * Generic hook for managing URL parameters with type safety
 *
 * @example
 * ```tsx
 * const { params, updateParams } = useURLParams({
 *   page: { defaultValue: 1, parse: Number },
 *   limit: { defaultValue: 20, parse: Number },
 *   status: { defaultValue: "all" },
 *   type: { defaultValue: "all" },
 * });
 *
 * // Use params
 * console.log(params.page); // 1 or value from URL
 *
 * // Update params
 * updateParams({ page: 2, status: "active" });
 * ```
 */
export function useURLParams<T extends URLParamConfig>(
  config: T
): UseURLParamsReturn<T> {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store config in ref to avoid recreation issues
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const [params, setParams] = useState<{ [K in keyof T]: T[K]["defaultValue"] }>(() => {
    const initialParams = {} as { [K in keyof T]: T[K]["defaultValue"] };
    for (const [key, paramConfig] of Object.entries(configRef.current)) {
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        const parse = paramConfig.parse || ((v: string) => v as ParamValue);
        try {
          (initialParams as any)[key] = parse(urlValue);
        } catch {
          (initialParams as any)[key] = paramConfig.defaultValue;
        }
      } else {
        (initialParams as any)[key] = paramConfig.defaultValue;
      }
    }
    return initialParams;
  });

  // Update URL params
  const updateParams = useCallback(
    (updates: Partial<{ [K in keyof T]: T[K]["defaultValue"] }>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        const paramConfig = (configRef.current as any)[key];
        if (!paramConfig) continue;

        const defaultValue = paramConfig.defaultValue;
        const serialize = paramConfig.serialize || String;

        // Remove param if it's the default value, otherwise set it
        if (value === defaultValue) {
          newParams.delete(key);
        } else {
          newParams.set(key, serialize(value));
        }
      }

      const newUrl = newParams.toString()
        ? `${window.location.pathname}?${newParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  // Get a single param
  const getParam = useCallback(
    <K extends keyof T>(key: K): T[K]["defaultValue"] => {
      return params[key];
    },
    [params]
  );

  // Set a single param
  const setParam = useCallback(
    <K extends keyof T>(key: K, value: T[K]["defaultValue"]) => {
      updateParams({ [key]: value } as Partial<{ [K in keyof T]: T[K]["defaultValue"] }>);
    },
    [updateParams]
  );

  // Sync params from URL when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    // Read params directly from searchParams to avoid dependency issues
    const urlParams = {} as { [K in keyof T]: T[K]["defaultValue"] };
    let hasChanges = false;

    // Use configRef to get current config without causing dependency issues
    const currentConfig = configRef.current;

    for (const [key, paramConfig] of Object.entries(currentConfig)) {
      const urlValue = searchParams.get(key);
      let newValue: ParamValue;

      if (urlValue !== null) {
        const parse = paramConfig.parse || ((v: string) => v as ParamValue);
        try {
          newValue = parse(urlValue);
        } catch {
          newValue = paramConfig.defaultValue;
        }
      } else {
        newValue = paramConfig.defaultValue;
      }

      (urlParams as any)[key] = newValue;

      // Check if value actually changed
      if (params[key as keyof typeof params] !== newValue) {
        hasChanges = true;
      }
    }

    // Only update if values actually changed to prevent infinite loops
    if (hasChanges) {
      setParams(urlParams);
    }
    // Only depend on searchParams to avoid recreation issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return {
    params,
    updateParams,
    getParam,
    setParam,
  };
}
