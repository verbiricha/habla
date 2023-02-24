import { Link } from "react-router-dom";

import { getMetadata, useNostrEvents } from "../nostr";
import Badge from "./Badge";
import useCached from "./useCached";

export default function Naddr({ naddr, kind, pubkey, d }) {
  const { events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [kind],
    },
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

  return <Link to={`/a/${naddr}`}>{naddr}</Link>;
}
