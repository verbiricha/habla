import { Link } from "react-router-dom";
import { Flex, Heading, Text } from "@chakra-ui/react";

import { getMetadata, encodeNaddr } from "../nostr";
import { Hashtags } from "./Hashtag";
import Reactions from "./Reactions";
import SeenIn from "./SeenIn";

function formatTime(time) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(time);
}

export default function EventItem({ relays, event, reactions }) {
  const metadata = getMetadata(event);
  const href = `/a/${encodeNaddr(event, relays.slice(0, 5))}`;
  return (
    <Flex
      flexDirection="column"
      key={event.id}
      sx={{
        overflow: "hidden",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <Flex justifyContent="space-between">
        <Link to={href}>
          <Heading as="h1">{metadata?.title}</Heading>
        </Link>
      </Flex>
      {metadata?.publishedAt && (
        <time>{formatTime(metadata.publishedAt * 1000)}</time>
      )}
      {metadata?.summary && <Text>{metadata.summary}</Text>}
      <SeenIn relays={relays} />
      <Hashtags hashtags={metadata?.hashtags ?? []} />
      <Reactions mt={0} event={event} events={reactions} />
    </Flex>
  );
}
