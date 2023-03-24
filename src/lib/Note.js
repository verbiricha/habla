import "./Note.css";
import { Card, CardHeader, CardBody } from "@chakra-ui/react";

import { useNostrEvents, encodeTLV } from "../nostr";
import User from "./User";
import Markdown from "./Markdown";
import NostrLink from "./NostrLink";
import useColors from "./useColors";
import useCached from "./useCached";

export function NoteEvent({ note }) {
  const { surface } = useColors();
  return (
    <Card className="note" background={surface} sx={{ textDecoration: "none" }}>
      <CardHeader>
        <User pubkey={note.pubkey} />
      </CardHeader>
      <NostrLink link={`https://snort.social/e/${encodeTLV(note.id, "note")}`}>
        <CardBody mt="-40px" ml="60px">
          <Markdown content={note.content} tags={note.tags} />
        </CardBody>
      </NostrLink>
    </Card>
  );
}

export default function Note({ id, relays }) {
  const cached = useCached(`note:${id}`);
  const { events } = useNostrEvents({
    filter: {
      ids: [id],
      kinds: [1],
    },
    relays,
    enabled: !cached,
  });
  const note = cached || events[0];
  return note ? <NoteEvent note={note} /> : null;
}
