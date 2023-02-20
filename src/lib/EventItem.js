import { Link } from "react-router-dom";
import { Flex, Heading, HStack, Text } from "@chakra-ui/react";

import { getMetadata, encodeNaddr } from "./nostr";

import { RelayList } from "./Relays";
import Hashtag from "./Hashtag";
import Reactions from "./Reactions";

function formatTime(time) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(time);
}

export default function EventItem({ relays, event }) {
  const metadata = getMetadata(event);
  const href = `/a/${encodeNaddr(event)}`;
  return (
    <Flex flexDirection="column" key={event.id}>
      <Flex justifyContent="space-between">
        <Link to={href}>
          <Heading as="h1">{metadata?.title}</Heading>
        </Link>
        <RelayList relays={relays} />
      </Flex>
      {metadata?.publishedAt && (
        <time>{formatTime(metadata.publishedAt * 1000)}</time>
      )}
      {metadata?.summary && <Text>{metadata.summary}</Text>}
      <HStack mt={4} spacing={4}>
        {metadata?.hashtags?.map((t) => (
          <Hashtag key={t} tag={t} />
        ))}
      </HStack>
      <Reactions event={event} />
    </Flex>
  );
}
