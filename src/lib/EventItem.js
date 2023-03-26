import { Link } from "react-router-dom";
import { Flex, Heading, Text } from "@chakra-ui/react";

import { getMetadata, encodeNaddr } from "../nostr";
import { RelayList } from "./Relays";
import { Hashtags } from "./Hashtag";
import Reactions from "./Reactions";

function formatTime(time) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(time);
}

export default function EventItem({ relays, event }) {
  const metadata = getMetadata(event);
  const href = `/a/${encodeNaddr(event, relays)}`;
  return (
    <Flex flexDirection="column" key={event.id}>
      <Flex justifyContent="space-between">
        <Link to={href}>
          <Heading as="h1">{metadata?.title}</Heading>
        </Link>
      </Flex>
      {metadata?.publishedAt && (
        <time>{formatTime(metadata.publishedAt * 1000)}</time>
      )}
      {metadata?.summary && <Text>{metadata.summary}</Text>}
      <Flex alignItems="center" flexDirection="row" mt={2}>
        <Text fontSize="md" color="secondary.500" fontFamily="var(--font-mono)">
          seen in
        </Text>
        <RelayList ml={2} linkToNrelay={true} relays={relays} />
      </Flex>
      <Hashtags hashtags={metadata?.hashtags ?? []} />
      <Reactions mt={0} event={event} />
    </Flex>
  );
}
