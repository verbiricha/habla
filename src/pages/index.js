import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";

import { Flex, Button, Heading, Text } from "@chakra-ui/react";

import { useNostrEvents, normalizeURL, eventAddress } from "../nostr";
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
  const { relays, follows, selectedRelay } = useSelector((s) => s.relay);
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
          </Flex>
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
        </Flex>
        <Feed
          reactions={reactions.events}
          events={filteredEvents}
          seenByRelay={seenByRelay}
        />
      </Layout>
    </>
  );
}
