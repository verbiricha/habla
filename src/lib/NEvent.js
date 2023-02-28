import { encodeNevent, useNostrEvents } from "../nostr";
import Note from "./Note";

export default function NEvent({ id, relays }) {
  const { events } = useNostrEvents({
    filter: {
      ids: [id],
    },
  });
  const ev = events[0];

  if (ev?.kind === 1) {
    return <Note id={id} relays={relays} />;
  }

  return <>{encodeNevent(id, relays)}</>;
}
