import { Link } from "react-router-dom";
import { useNostrEvents } from "nostr-react-habla";
import { getMetadata, decodeNaddr } from "./nostr";

export default function Naddr({ naddr }) {
  const [kind, pubkey, d] = naddr ? decodeNaddr(naddr) : [];
  const { events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [kind],
    },
  });
  const ev = events[0];
  const metadata = ev && getMetadata(ev);
  return metadata ? (
    <Link to={`/a/${naddr}`}>{metadata?.title || naddr}</Link>
  ) : (
    <Link to={`/a/${naddr}`}>{naddr}</Link>
  );
}
