import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NostrProvider, useNostr, useNostrEvents } from "./nostr";
import { setRelays, setFollows } from "./relaysStore";
import { setJsonKey } from "./storage";

function NostrConnManager({ children }) {
  const dispatch = useDispatch();
  const { onDisconnect } = useNostr();
  const { user } = useSelector((s) => s.relay);
  const { events } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [user],
    },
    enabled: Boolean(user),
  });

  useEffect(() => {
    const sorted = [...events];
    sorted.sort((a, b) => b.created_at - a.created_at);
    const last = sorted[0];

    if (!last || !user) {
      return;
    }

    try {
      const parsed = JSON.parse(last.content);
      const relays = Object.entries(parsed).map(([url, options]) => {
        return { url, options };
      });
      setJsonKey(`relays:${user}`, relays);
      dispatch(setRelays(relays));
      const follows = last.tags.filter((t) => t[0] === "p").map((t) => t[1]);
      dispatch(setFollows(follows));
      setJsonKey(`follows:${user}`, follows);
    } catch (error) {
      console.error(error);
    }
  }, [events, user, dispatch]);

  const onDisconnectCallback = (relay) => {
    setTimeout(() => {
      relay
        .connect()
        .then(() => console.log(`reconnected: ${relay.url}`))
        .catch(() => console.log(`unable to reconnect: ${relay.url}`));
    }, 5000);
  };

  useEffect(() => {
    onDisconnect(onDisconnectCallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}

export default function NostrContext({ children }) {
  const { relays } = useSelector((s) => s.relay);

  return (
    <NostrProvider
      relayUrls={relays.map((r) => (r.options.read ? [r.url] : [])).flat()}
    >
      <NostrConnManager>{children}</NostrConnManager>
    </NostrProvider>
  );
}
