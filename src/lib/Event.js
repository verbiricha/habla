import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Flex, Heading, Text, Image, IconButton } from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon as HideIcon } from "@chakra-ui/icons";

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
    <Flex mt={4} flexWrap="wrap">
      {hashtags.map((t) => (
        <Hashtag key={t} mr={2} mb={2} tag={t} />
      ))}
    </Flex>
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
  const { hash } = useLocation();
  const metadata = getMetadata(event);
  const isSensitive = metadata.sensitive;
  const [blurPictures, setBlurPictures] = useState(isSensitive);
  const naddr = encodeNaddr(event); //, randomSlice(Array.from(relays), 3));
  const href = `/a/${naddr}`;
  useEffect(() => {
    if (hash?.length > 1) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView();
      }
    }
  }, [hash]);
  return (
    <>
      <Box
        as="article"
        key={event.id}
        className={`${blurPictures ? "article-blurred" : ""}`}
      >
        <Flex justifyContent="space-around">
          {event.pubkey && showUser && (
            <User pubkey={event.pubkey} relays={relays} />
          )}
          <RelayList ml="auto" relays={relays} />
        </Flex>
        {isSensitive && (
          <Flex alignItems="center" color="secondary.500">
            <Text color="secondary.500" fontSize="md">
              This post was marked as sensitive
            </Text>
            {metadata.warning && (
              <Text color="red.500" fontSize="md">
                {" "}
                {metadata.warning}
              </Text>
            )}
            <IconButton
              variant="unstyled"
              size="sm"
              icon={blurPictures ? <ViewIcon /> : <HideIcon />}
              onClick={() => setBlurPictures(!blurPictures)}
              pb={1}
            />
          </Flex>
        )}
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
        <div className="content">
          {!isPreview && <Markdown content={event.content} tags={event.tags} />}
        </div>
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
