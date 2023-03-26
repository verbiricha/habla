import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon as HideIcon } from "@chakra-ui/icons";

import { getEventId, getMetadata, encodeNaddr } from "../nostr";

import useCached from "./useCached";
import User from "./User";
import Markdown from "./Markdown";
import { Hashtags } from "./Hashtag";
import Reactions from "./Reactions";
import { RelayList } from "./Relays";

function formatTime(time) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(time);
}

export default function Event({
  showUser = true,
  isPreview = true,
  showReactions = false,
  showComments = false,
  event,
  relays = [],
  children,
  ...rest
}) {
  useCached(`event:${getEventId(event)}`, event, { isEvent: true });
  const { hash } = useLocation();
  const metadata = getMetadata(event);
  const isSensitive = metadata.sensitive;
  const isBounty = metadata.reward !== null;
  const [blurPictures, setBlurPictures] = useState(isSensitive);
  const naddr = encodeNaddr(event, relays);
  const href = `/a/${naddr}`;
  useEffect(() => {
    if (hash?.length > 1) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView();
      }
    }
  }, [hash]);
  const seenIn = (
    <Flex alignItems="center" flexDirection="row" mt={2}>
      <Text fontSize="md" color="secondary.500" fontFamily="var(--font-mono)">
        seen in
      </Text>
      <RelayList ml={2} linkToNrelay={true} relays={relays} />
    </Flex>
  );
  return (
    <>
      <Box
        as="article"
        key={event.id}
        className={`${blurPictures ? "article-blurred" : ""}`}
      >
        <Flex justifyContent="flex-start" width="100%">
          {event.pubkey && showUser && (
            <User pubkey={event.pubkey} relays={relays} />
          )}
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
          <Heading fontFamily="var(--article-heading)" as="h1">
            {metadata.title}
          </Heading>
          {!isPreview && seenIn}
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
        {isBounty && (
          <Stat>
            <StatLabel>Bounty</StatLabel>
            <StatNumber>{metadata.reward} sats</StatNumber>
          </Stat>
        )}
        {children}
        <div className="content">
          {!isPreview && <Markdown content={event.content} tags={event.tags} />}
        </div>
        {isPreview && seenIn}
        <Hashtags hashtags={metadata?.hashtags ?? []} />
        <Reactions
          isBounty={isBounty}
          showUsers={showReactions}
          showComments={showComments}
          event={event}
        />
      </Box>
    </>
  );
}
