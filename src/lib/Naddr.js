import { Link } from "react-router-dom";

import { getMetadata, useNostrEvents } from "../nostr";
import Badge from "./Badge";
import List from "./List";
import useCached from "./useCached";

const LIST_KINDS = [10000, 10001, 30000, 30001];

export default function Naddr({ naddr, kind, pubkey, d }) {
  const isReplaceableEvent = kind >= 30000 && kind <= 40000;
  const filter = isReplaceableEvent
    ? {
        authors: [pubkey],
        "#d": [d],
        kinds: [kind],
      }
    : {
        authors: [pubkey],
        kinds: [kind],
      };
  const { events } = useNostrEvents({
    filter,
  });
  const addr = `${kind}:${pubkey}:${d}`;
  const ev = useCached(addr, events[0], { isEvent: true });

  if (ev?.kind === 30009) {
    return <Badge ev={ev} />;
  }

  if (ev?.kind === 30023) {
    const metadata = ev && getMetadata(ev);
    return metadata ? (
      <Link to={`/a/${naddr}`}>{metadata?.title || naddr}</Link>
    ) : (
      <Link to={`/a/${naddr}`}>{naddr}</Link>
    );
  }

  if (LIST_KINDS.includes(ev?.kind)) {
    return <List ev={ev} />;
  }

  return <Link to={`/a/${naddr}`}>{naddr}</Link>;
}
