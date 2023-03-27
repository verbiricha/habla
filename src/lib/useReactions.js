import { useNostrEvents } from "../nostr";

export default function useReactions({ addresses }) {
  const reactions = useNostrEvents({
    filter: {
      kinds: [7, 9735, 30023],
      "#a": addresses,
    },
  });
  return reactions.events;
}
