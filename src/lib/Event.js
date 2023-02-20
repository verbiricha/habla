import { Link } from "react-router-dom";
import { Box, Flex, HStack, Heading, Text, Image } from "@chakra-ui/react";

import { getMetadata, encodeNaddr } from "./nostr";

import User from "./User";
import Markdown from "./Markdown";
import Hashtag from "./Hashtag";
import Reactions from "./Reactions";
import { RelayList } from "./Relays";

function formatTime(time) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(time);
}

function Hashtags({ hashtags }) {
  return (
    <HStack spacing={2} mt={4}>
      {hashtags.map((t) => (
        <Hashtag key={t} tag={t} />
      ))}
    </HStack>
  );
}

export default function Event({
  showUser = true,
  isPreview = true,
  showReactions = false,
  event,
  relays,
  children,
  ...rest
}) {
  const metadata = getMetadata(event);
  const naddr = encodeNaddr(event);
  const href = `/a/${naddr}`;
  return (
    <>
      <Box as="article" key={event.id}>
        <Flex
          alignItems="center"
          justifyContent={
            event.pubkey && showUser ? "space-between" : "flex-end"
          }
        >
          {event.pubkey && showUser && <User pubkey={event.pubkey} />}
          <RelayList relays={relays} />
        </Flex>
        <Link to={href}>
          <Heading as="h1">{metadata.title}</Heading>
        </Link>
        <Flex alignItems="flex-start">
          {metadata.publishedAt && (
            <Text as="time" fontSize="sm" fontStyle="italic">
              {formatTime(metadata.publishedAt * 1000)}
            </Text>
          )}
        </Flex>
        {metadata.image && (
          <Image className="article-image" src={metadata.image} />
        )}
        {metadata.summary && isPreview && <p>{metadata.summary}</p>}
        {metadata.summary && !isPreview && (
          <blockquote className="summary">{metadata.summary}</blockquote>
        )}
        {!isPreview && <Markdown content={event.content} tags={event.tags} />}
        <Hashtags hashtags={metadata?.hashtags ?? []} />
        <Reactions showUsers={showReactions} event={event} />
        {children}
      </Box>
    </>
  );
}
