import { Link } from "react-router-dom";
import { Box, Flex, HStack, Heading, Text, Image } from "@chakra-ui/react";

import { getEventId, getMetadata, encodeNaddr } from "../nostr";

import useCached from "./useCached";
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
  showComments = false,
  event,
  relays,
  children,
  ...rest
}) {
  useCached(`event:${getEventId(event)}`, event, { isEvent: true });
  const metadata = getMetadata(event);
  const naddr = encodeNaddr(event); //, randomSlice(Array.from(relays), 3));
  const href = `/a/${naddr}`;
  return (
    <>
      <Box as="article" key={event.id}>
        <Flex justifyContent="space-around">
          {event.pubkey && showUser && (
            <User pubkey={event.pubkey} relays={relays} />
          )}
          <RelayList ml="auto" relays={relays} />
        </Flex>
        <Link to={href}>
          <Heading fontSize="52px" fontFamily="var(--article-heading)" as="h1">
            {metadata.title}
          </Heading>
          <Flex alignItems="flex-start">
            {metadata.publishedAt && (
              <Text
                as="time"
                fontSize="sm"
                fontStyle="italic"
                color="secondary.500"
              >
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
        </Link>
        {children}
        {!isPreview && <Markdown content={event.content} tags={event.tags} />}
        <Hashtags hashtags={metadata?.hashtags ?? []} />
        <Reactions
          showUsers={showReactions}
          showComments={showComments}
          event={event}
        />
      </Box>
    </>
  );
}
