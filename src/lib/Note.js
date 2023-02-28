import { Card, CardHeader, CardBody } from "@chakra-ui/react";

import { useNostrEvents } from "../nostr";
import User from "./User";
import Markdown from "./Markdown";
import useColors from "./useColors";
import useCached from "./useCached";

export default function Note({ id, relays }) {
  const { surface } = useColors();
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
  return (
    <Card background={surface}>
      <CardHeader>
        {note && <User linkToProfile={false} pubkey={note.pubkey} />}
      </CardHeader>
      <CardBody mt="-40px" ml="60px">
        {note && <Markdown content={note.content} tags={note.tags} />}
      </CardBody>
    </Card>
  );
}
