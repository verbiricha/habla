import { Card, CardHeader, CardBody } from "@chakra-ui/react";

import { useNostrEvents } from "../nostr";
import User from "./User";
import Markdown from "./Markdown";

export default function Note({ id }) {
  const { events } = useNostrEvents({
    filter: {
      ids: [id],
      kinds: [1],
    },
  });
  const note = events[0];
  // todo: note1 link
  return (
    <Card>
      <CardHeader>
        {note && <User linkToProfile={false} pubkey={note.pubkey} />}
      </CardHeader>
      <CardBody>
        {note && <Markdown content={note.content} tags={note.tags} />}
      </CardBody>
    </Card>
  );
}
