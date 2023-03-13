import { Link } from "react-router-dom";
import { Flex, Heading, Text } from "@chakra-ui/react";

import { getMetadata, encodeNaddr } from "../nostr";
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
  const href = `/a/${encodeNaddr(event, relays)}`;
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
      <Flex mt={4} flexWrap="wrap">
        {metadata?.hashtags?.map((t) => (
          <Hashtag mr={2} mb={2} key={t} tag={t} />
        ))}
      </Flex>
      <Reactions event={event} />
    </Flex>
  );
}
