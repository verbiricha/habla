import { Stack } from "@chakra-ui/react";

import { getEventId, eventAddress } from "../nostr";
import Event from "./Event";

export default function Feed({ events, reactions = [], seenByRelay, ...rest }) {
  return (
    <Stack spacing={12}>
      {events.map((ev) => {
        const addr = eventAddress(ev);
        const eventReactions = reactions.filter((r) =>
          r.tags.find((t) => t[0] === "a" && t[1] === addr)
        );
        return (
          <Event
            key={getEventId(ev)}
            relays={seenByRelay && Array.from(seenByRelay[ev.id])}
            event={ev}
            reactions={eventReactions}
            {...rest}
          />
        );
      })}
    </Stack>
  );
}
