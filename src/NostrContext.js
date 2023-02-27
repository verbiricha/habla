import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NostrProvider, useNostr, useNostrEvents } from "./nostr";
import { setRelays, setFollows, setContacts } from "./relaysStore";
import { setJsonKey } from "./storage";

function NostrConnManager({ children }) {
  const dispatch = useDispatch();
  const { onDisconnect } = useNostr();
  const { relays, user, selectedRelays } = useSelector((s) => s.relay);
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
      dispatch(setRelays(relays));

      const follows = last.tags.filter((t) => t[0] === "p").map((t) => t[1]);
      dispatch(setFollows(follows));
      setJsonKey(`f:${user}`, follows);

      dispatch(setContacts(last.tags));
      setJsonKey(`c:${user}`, last.tags);
    } catch (error) {
      console.error(error);
    }
  }, [events, user, dispatch]);

  useEffect(() => {
    if (user) {
      setJsonKey(`s:${user}`, selectedRelays);
    }
  }, [user, selectedRelays]);

  useEffect(() => {
    if (user) {
      setJsonKey(`r:${user}`, relays);
    }
  }, [user, relays]);

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
  const relayUrls = relays.map(({ url, options }) => url);

  return (
    <NostrProvider debug={false} relayUrls={relayUrls}>
      <NostrConnManager>{children}</NostrConnManager>
    </NostrProvider>
  );
}
