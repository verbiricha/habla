import { useState, useEffect } from "react";
import {
  Avatar,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Text,
} from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";

import { useNostrEvents, encodeNevent } from "../nostr";
import Markdown from "./Markdown";
import NostrLink from "./NostrLink";
import useColors from "./useColors";

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (error) {}
}

export default function Channel({ channel }) {
  const { surface } = useColors();
  const metadata = safeJsonParse(channel.content);
  const [lastMetadata, setLastMetadata] = useState();
  const { events } = useNostrEvents({
    filter: {
      "#e": [channel.id],
      authors: [channel.pubkey],
      kinds: [41],
    },
  });

  useEffect(() => {
    if (events[0]) {
      setLastMetadata(safeJsonParse(events[0]));
    }
  }, [events]);
  const name = lastMetadata
    ? lastMetadata.name
    : metadata
    ? metadata.name
    : channel.id;
  const about = lastMetadata
    ? lastMetadata.about
    : metadata
    ? metadata.about
    : "";

  return (
    <NostrLink link={encodeNevent(channel.id)}>
      <Card className="note" background={surface}>
        <CardHeader>
          <Flex alignItems="center">
            <Avatar
              icon={<ChatIcon />}
              size="sm"
              mr={2}
              src={metadata.picture}
            />
            <Text fontWeight="500">{name}</Text>
          </Flex>
        </CardHeader>
        <CardBody mt="-40px" ml="40px">
          <Markdown content={about} tags={channel.tags} />
        </CardBody>
      </Card>
    </NostrLink>
  );
}
