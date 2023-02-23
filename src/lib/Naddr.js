import { Link } from "react-router-dom";

import { getMetadata, useNostrEvents } from "../nostr";
import Badge from "./Badge";
import useCached from "./useCached";

export default function Naddr({ kind, pubkey, d }) {
  const { events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [kind],
    },
  });
  const naddr = `${kind}:${pubkey}:${d}`;
  const ev = useCached(naddr, events[0], { isEvent: true });
  if (ev?.kind === 30023) {
    const metadata = ev && getMetadata(ev);
    return metadata ? (
      <Link to={`/a/${naddr}`}>{metadata?.title || naddr}</Link>
    ) : (
      <Link to={`/a/${naddr}`}>{naddr}</Link>
    );
  }

  if (ev?.kind === 30009) {
    return <Badge ev={ev} />;
  }

  return <Link to={`/a/${naddr}`}>{naddr}</Link>;
}
