import { Link } from "react-router-dom";
import { Box, Flex, HStack, Heading, Text, Image } from "@chakra-ui/react";

import { getMetadata } from "./nostr";

import User from "./User";
import Markdown from "./Markdown";
import Hashtag from "./Hashtag";
import Reactions from "./Reactions";

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
  children,
  ...rest
}) {
  const metadata = getMetadata(event);
  const href = `/${event.pubkey}/${metadata.d}`;
  return (
    <>
      <Box as="article" key={event.id}>
        {event.pubkey && showUser && <User pubkey={event.pubkey} />}
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
