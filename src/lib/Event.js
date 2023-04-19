import { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
  Button,
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

import {
  getEventId,
  getMetadata,
  useNostr,
  encodeNaddr,
  dateToUnix,
  signEvent,
} from "../nostr";

import useMouseUpSelection from "./useMouseUpSelection";
import useCached from "./useCached";
import User from "./User";
import Markdown from "./Markdown";
import { Hashtags } from "./Hashtag";
import Reactions from "./Reactions";
import SeenIn from "./SeenIn";

function formatTime(time) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(time);
}

function processHighlights(content, hs) {
  const highlighted = [...new Set(hs.map(({ content }) => content))];
  let result = content;
  highlighted.forEach((h) => {
    result = result.replace(h, `<mark>${h}</mark>`);
  });
  return result;
}

function HighlightDialog({ event, naddr, relays }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const { pool } = useNostr();
  const { user, relays: userRelays } = useSelector((s) => s.relay);
  const [highlighted, setHighlighted] = useState("");
  const selectedText = useMouseUpSelection();
  useEffect(() => {
    if (selectedText && selectedText !== highlighted) {
      onOpen();
    }
  }, [selectedText, highlighted]);

  async function highlight(content) {
    if (!user) {
      toast({
        title: "Log in to higlight content",
      });
      return;
    }

    const ev = {
      content,
      kind: 9802,
      created_at: dateToUnix(),
      pubkey: user,
      tags: [
        ["r", `https://habla.news/a/${naddr}`],
        ["a", getEventId(event)],
        ["p", user],
      ],
    };

    try {
      const signed = await signEvent(ev);
      pool.publish(relays, signed);
      pool.publish(userRelays, signed);
      setHighlighted(content);
      onClose();
      toast({
        title: "Highlight published",
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Highlight
            </AlertDialogHeader>

            <AlertDialogBody>{selectedText}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={() => highlight(selectedText)}
                ml={3}
              >
                Highlight
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default function Event({
  showUser = true,
  isPreview = true,
  showReactions = false,
  showComments = false,
  event,
  reactions = [],
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
  const naddr = encodeNaddr(event, relays.slice(0, 5));
  const href = `/a/${naddr}`;
  const highlights = reactions.filter((ev) => ev.kind === 9802);
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
        <Flex justifyContent="flex-start" width="100%">
          {event.pubkey && showUser && (
            <User pubkey={event.pubkey} relays={relays} />
          )}
        </Flex>
        {isSensitive && (
          <Flex alignItems="center" color="secondary.500">
            <Text color="secondary.500" fontSize="md">
              Sensitive Content
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
          {!isPreview && <SeenIn relays={relays} />}
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
        <HighlightDialog event={event} naddr={naddr} relays={relays} />
        <div className="content">
          {!isPreview && (
            <Markdown
              content={processHighlights(event.content, highlights)}
              highlights={highlights}
              tags={event.tags}
            />
          )}
        </div>
        {isPreview && <SeenIn relays={relays} />}
        <Hashtags hashtags={metadata?.hashtags ?? []} />
        <Reactions
          relays={relays}
          events={reactions}
          isBounty={isBounty}
          showUsers={showReactions}
          showComments={showComments}
          event={event}
        />
      </Box>
    </>
  );
}
