import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Emoji } from "emoji-picker-react";

import { Flex, Button, Heading, Text } from "@chakra-ui/react";

import {
  useNostrEvents,
  normalizeURL,
  eventAddress,
  findTag,
  getZapAmount,
} from "../nostr";
import Authors from "../lib/Authors";
import Tags from "../lib/Tags";
import Layout from "../lib/Layout";
import Feed from "../lib/Feed";
import Relays from "../lib/Relays";

const RECENT = "recent";
const HOT = "hot";
const TOP = "top";

export default function Home() {
  const [followsOnly, setFollowsOnly] = useState(false);
  const [sortBy, setSortBy] = useState(RECENT);
  const { user, relays, follows, selectedRelay } = useSelector((s) => s.relay);
  const relayUrls = relays.map((r) => r.url);
  const followsFeed = useNostrEvents({
    filter: {
      kinds: [30023],
      limit: 20,
      authors: follows,
    },
    enabled: followsOnly,
  });
  const allFeed = useNostrEvents({
    filter: {
      kinds: [30023],
      limit: 20,
    },
    enabled: !followsOnly,
  });
  const { events, seen, seenByRelay } = followsOnly ? followsFeed : allFeed;

  const filteredEvents = useMemo(() => {
    if (!selectedRelay) {
      return events;
    }

    let ids = new Set([]);
    const normalized = normalizeURL(selectedRelay);
    const seenInRelay = seen[normalized];
    if (seenInRelay) {
      Array.from(seenInRelay).forEach((i) => {
        ids.add(i);
      });
    }

    return events
      .filter((ev) => ids.has(ev.id))
      .filter((ev) => (followsOnly ? follows.includes(ev.pubkey) : true));
  }, [events, seen, selectedRelay, follows, followsOnly]);

  const addresses = filteredEvents.map(eventAddress);
  const reactions = useNostrEvents({
    filter: {
      "#a": addresses,
      kinds: [7, 9735, 30023],
    },
  });

  function reactionCount(ev) {
    const addr = eventAddress(ev);
    return reactions.events.filter((ev) => findTag(ev.tags, "a") === addr)
      .length;
  }

  function zapCount(ev) {
    const addr = eventAddress(ev);
    return reactions.events
      .filter((ev) => ev.kind === 9735 && findTag(ev.tags, "a") === addr)
      .map(getZapAmount)
      .reduce((acc, a) => acc + a, 0);
  }

  const sortedEvents = useMemo(() => {
    if (sortBy === RECENT) {
      return filteredEvents;
    }
    const sorted = [...filteredEvents];
    if (sortBy === HOT) {
      sorted.sort((a, b) => reactionCount(b) - reactionCount(a));
    } else {
      sorted.sort((a, b) => zapCount(b) - zapCount(a));
    }
    return sorted;
  }, [filteredEvents, sortBy]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={4}>
            <Authors events={filteredEvents} relays={relayUrls} />
            <Tags events={filteredEvents} />
            <Relays />
          </Flex>
        }
      >
        <Flex alignItems="center" justifyContent="space-between">
          <Heading
            fontSize="18px"
            fontFamily="var(--font-mono)"
            fontWeight={500}
          >
            Notes on{" "}
            <Text as="span" color="purple.500">
              {selectedRelay}
            </Text>
          </Heading>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <Flex alignItems="center">
            <Text
              fontSize="sm"
              fontFamily="var(--font-mono)"
              color="secondary.500"
            >
              Sort by:
            </Text>
            <Button
              color={sortBy !== RECENT ? "secondary.500" : "var(--font)"}
              fontWeight={sortBy !== RECENT ? 400 : 500}
              fontSize="14px"
              fontFamily="var(--font-mono)"
              lineHeight="16px"
              variant="unstyled"
              ml={2}
              mr={3}
              onClick={() => setSortBy(RECENT)}
            >
              Recent
            </Button>
            <Button
              color={sortBy !== TOP ? "secondary.500" : "var(--font)"}
              fontWeight={sortBy !== TOP ? 400 : 500}
              fontSize="14px"
              fontFamily="var(--font-mono)"
              lineHeight="16px"
              variant="unstyled"
              onClick={() => setSortBy(TOP)}
              mr={3}
            >
              <Flex alignItems="center">
                <Emoji unified="26a1" size="20" />
                <Text ml={1}>Top</Text>
              </Flex>
            </Button>
            <Button
              color={sortBy !== HOT ? "secondary.500" : "var(--font)"}
              fontWeight={sortBy !== HOT ? 400 : 500}
              fontSize="14px"
              fontFamily="var(--font-mono)"
              lineHeight="16px"
              variant="unstyled"
              onClick={() => setSortBy(HOT)}
            >
              <Flex alignItems="center">
                <Emoji unified="1f525" size="20" />
                <Text ml={1}>Hot</Text>
              </Flex>
            </Button>
          </Flex>
          {user && (
            <Flex>
              <Button
                color={followsOnly ? "secondary.500" : "var(--font)"}
                fontWeight={followsOnly ? 400 : 500}
                fontSize="14px"
                fontFamily="var(--font-mono)"
                lineHeight="16px"
                variant="unstyled"
                mr={3}
                onClick={() => setFollowsOnly(false)}
              >
                All
              </Button>
              <Button
                color={!followsOnly ? "secondary.500" : "var(--font)"}
                fontWeight={followsOnly ? 500 : 400}
                fontSize="14px"
                fontFamily="var(--font-mono)"
                lineHeight="16px"
                variant="unstyled"
                onClick={() => setFollowsOnly(true)}
              >
                Follows
              </Button>
            </Flex>
          )}
        </Flex>
        <Feed
          reactions={reactions.events}
          events={sortedEvents}
          seenByRelay={seenByRelay}
        />
      </Layout>
    </>
  );
}
