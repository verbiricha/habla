import {
  useRef,
  useMemo,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Relay,
  Filter,
  Event as NostrEvent,
  SimplePool,
  Sub,
} from "nostr-tools";

import { uniqByFn, getEventId } from "./utils";

type OnConnectFunc = (relay: Relay) => void;
type OnDisconnectFunc = (relay: Relay) => void;
type OnEventFunc = (event: NostrEvent) => void;
type OnDoneFunc = () => void;
type OnSubscribeFunc = (sub: Sub) => void;

interface NostrContextType {
  isLoading: boolean;
  debug?: boolean;
  relayUrls: string[];
  connectedRelays: string[];
  onConnect: (_onConnectCallback?: OnConnectFunc) => void;
  onDisconnect: (_onDisconnectCallback?: OnDisconnectFunc) => void;
  publish: (event: NostrEvent) => void;
  pool: any;
  seenByRelay: any;
}

const NostrContext = createContext<NostrContextType>({
  isLoading: true,
  relayUrls: [],
  connectedRelays: [],
  onConnect: () => null,
  onDisconnect: () => null,
  publish: () => null,
  pool: () => null,
  seenByRelay: {},
});

const log = (
  isOn: boolean | undefined,
  type: "info" | "error" | "warn",
  ...args: unknown[]
) => {
  if (!isOn) return;
  console[type](...args);
};

export function NostrProvider({
  children,
  relayUrls,
  debug,
}: {
  children: ReactNode;
  relayUrls: string[];
  debug?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const pool = useMemo(() => new SimplePool(), []);
  // @ts-expect-error: Property
  const connectedRelays = Object.keys(pool._conn);

  let onConnectCallback: null | OnConnectFunc = null;
  let onDisconnectCallback: null | OnDisconnectFunc = null;

  // @ts-expect-error: Property
  const seenByRelay = pool._seenOn;

  let isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      relayUrls.forEach(async (relayUrl) => {
        const relay = await pool.ensureRelay(relayUrl);
        relay.on("connect", () => {
          log(debug, "info", `✅ nostr (${relayUrl}): Connected!`);
          setIsLoading(false);
          onConnectCallback?.(relay);
        });

        relay.on("disconnect", () => {
          log(debug, "warn", `🚪 nostr (${relayUrl}): Connection closed.`);
          onDisconnectCallback?.(relay);
        });

        relay.on("error", () => {
          log(debug, "error", `❌ nostr (${relayUrl}): Connection error!`);
        });
      });
    }
  }, []);

  const publish = (event: NostrEvent) => {
    log(debug, "info", `Publishing event $(${JSON.stringify(event)})`);
    return pool.publish(relayUrls, event);
  };

  const value: NostrContextType = {
    pool,
    relayUrls,
    debug,
    seenByRelay,
    isLoading,
    connectedRelays,
    publish,
    onConnect: (_onConnectCallback?: OnConnectFunc) => {
      if (_onConnectCallback) {
        onConnectCallback = _onConnectCallback;
      }
    },
    onDisconnect: (_onDisconnectCallback?: OnDisconnectFunc) => {
      if (_onDisconnectCallback) {
        onDisconnectCallback = _onDisconnectCallback;
      }
    },
  };

  return (
    <NostrContext.Provider value={value}>{children}</NostrContext.Provider>
  );
}

export function useNostr() {
  return useContext(NostrContext);
}

export function useNostrEvents({
  filter,
  enabled = true,
}: {
  filter: Filter;
  enabled?: boolean;
}) {
  const {
    isLoading: isLoadingProvider,
    onConnect,
    seenByRelay,
    relayUrls,
    debug,
    pool,
    connectedRelays,
  } = useNostr();

  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<NostrEvent[]>([]);
  const [unsubscribe, setUnsubscribe] = useState<() => void | void>(() => {
    return;
  });

  let onEventCallback: null | OnEventFunc = null;
  let onSubscribeCallback: null | OnSubscribeFunc = null;
  let onDoneCallback: null | OnDoneFunc = null;
  const seen = Object.entries(seenByRelay).reduce((acc, [id, rs]) => {
    Array.from(rs as Set<string>).forEach((r) => {
      const soFar = acc[r as string] || new Set();
      soFar.add(id);
      acc[r] = soFar;
    });
    return acc;
  }, {} as Record<string, Set<string>>);

  // Lets us detect changes in the nested filter object for the useEffect hook
  const filterBase64 =
    typeof window !== "undefined" ? window.btoa(JSON.stringify(filter)) : null;

  const _unsubscribe = (sub: Sub) => {
    log(debug, "info", `🙉 nostr: Unsubscribing from filter:`, filter);
    return sub.unsub();
  };

  const subscribe = useCallback((filter: Filter) => {
    log(debug, "info", `👂 nostr Subscribing to filter:`, filter);
    const sub = pool.sub(relayUrls, [filter]);

    setIsLoading(true);

    const unsubscribeFunc = () => {
      _unsubscribe(sub);
    };

    setUnsubscribe(() => unsubscribeFunc);

    sub.on("event", (event: NostrEvent) => {
      log(debug, "info", `⬇️ nostr: Received event:`, event);

      onEventCallback?.(event);
      setEvents((_events) => {
        const newEvents = [event, ..._events];
        const uniqEvents =
          newEvents.length > 0 ? uniqByFn(newEvents, getEventId) : [];
        uniqEvents.sort((a, b) => b.created_at - a.created_at);
        return uniqEvents;
      });
    });

    sub.on("eose", () => {
      setIsLoading(false);
      onDoneCallback?.();
    });

    return sub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const sub = subscribe(filter);
    onSubscribeCallback?.(sub);

    return () => {
      sub.unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBase64, enabled]);

  return {
    isLoading: isLoading || isLoadingProvider,
    events,
    onConnect,
    seen,
    seenByRelay,
    connectedRelays,
    unsubscribe,
    onSubscribe: (_onSubscribeCallback: OnSubscribeFunc) => {
      if (_onSubscribeCallback) {
        onSubscribeCallback = _onSubscribeCallback;
      }
    },
    onEvent: (_onEventCallback: OnEventFunc) => {
      if (_onEventCallback) {
        onEventCallback = _onEventCallback;
      }
    },
    onDone: (_onDoneCallback: OnDoneFunc) => {
      if (_onDoneCallback) {
        onDoneCallback = _onDoneCallback;
      }
    },
  };
}
