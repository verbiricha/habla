import { useNostrEvents } from "nostr-react-habla";
import { Link } from "react-router-dom";

import { getMetadata } from "./nostr";

export default function ArticleLink({ d, pubkey }) {
  const { events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [30023],
    },
  });
  const ev = events[0];

  return ev ? (
    <Link to={`/${pubkey}/${d}`}>{getMetadata(ev)?.title}</Link>
  ) : (
    <Link to={`/${pubkey}/${d}`}>
      {pubkey}:{d}
    </Link>
  );
}
