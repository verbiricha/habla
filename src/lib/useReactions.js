import { useNostrEvents } from "../nostr";

export function useEventReactions({ events, relays, enabled }) {
  const reactions = useNostrEvents({
    filter: {
      kinds: [7, 9735, 30023, 9802],
      "#e": events?.map((e) => e.id) ?? [],
    },
    relays,
    enabled,
  });
  return reactions.events;
}

export default function useReactions({ addresses }) {
  const reactions = useNostrEvents({
    filter: {
      kinds: [7, 9735, 30023, 9802],
      "#a": addresses,
    },
  });
  return reactions.events;
}
