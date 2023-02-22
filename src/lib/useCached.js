import { useState, useEffect } from "react";

import { getJsonKey, setJsonKey } from "../storage";

export default function useCached(
  key,
  value,
  { isEvent } = { isEvent: false }
) {
  const [cache, setCache] = useState(() => {
    return getJsonKey(key);
  });

  useEffect(() => {
    if (value) {
      setJsonKey(key, value);
      if (isEvent) {
        if (!cache || value.created_at > cache.created_at) {
          setCache(value);
        }
      } else {
        setCache(value);
      }
    }
  }, [value, isEvent, cache, key]);

  return cache;
}
