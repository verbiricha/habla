import { Stack } from "@chakra-ui/react";

import { getEventId } from "../nostr";
import Event from "./Event";

export default function Feed({ events, seenByRelay }) {
  return (
    <Stack spacing={12}>
      {events.map((ev) => (
        <Event
          key={getEventId(ev)}
          relays={seenByRelay && seenByRelay[ev.id]}
          event={ev}
        />
      ))}
    </Stack>
  );
}
