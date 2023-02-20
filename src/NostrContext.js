import { useEffect } from "react";
import { NostrProvider, useNostr } from "./nostr";
import useRelays from "./lib/useRelays";

function NostrConnManager({ children }) {
  const { onDisconnect } = useNostr();

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
  const { relays } = useRelays();

  useEffect(() => {
    window.sessionStorage.setItem("relays", JSON.stringify(relays));
  }, [relays]);

  return (
    <NostrProvider relayUrls={relays} debug={true}>
      <NostrConnManager>{children}</NostrConnManager>
    </NostrProvider>
  );
}
