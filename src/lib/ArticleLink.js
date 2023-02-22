import { Link } from "react-router-dom";

import { getMetadata, getEventId, useNostrEvents } from "../nostr";
import useCached from "./useCached";

export default function ArticleLink({ d, pubkey }) {
  const { events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [30023],
    },
  });
  const ev = useCached(`30023:${pubkey}:${d}`, events[0]);

  return ev ? (
    <Link key={getEventId(ev)} to={`/${pubkey}/${d}`}>
      {getMetadata(ev)?.title}
    </Link>
  ) : (
    <Link to={`/${pubkey}/${d}`}>
      {pubkey}:{d}
    </Link>
  );
}
