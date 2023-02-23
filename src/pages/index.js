import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";

import { Flex, Button, Heading, Text } from "@chakra-ui/react";

import { getEventId, useNostrEvents } from "../nostr";
import Authors from "../lib/Authors";
import Tags from "../lib/Tags";
import Layout from "../lib/Layout";
import Feed from "../lib/Feed";
import Relays from "../lib/Relays";

export default function Home() {
  const [followsOnly, setFollowsOnly] = useState(false);
  const { follows, selectedRelays } = useSelector((s) => s.relay);
  const { seen, seenByRelay, events } = useNostrEvents({
    filter: followsOnly
      ? {
          kinds: [30023],
          limit: 100,
          authors: [follows],
        }
      : {
          kinds: [30023],
          limit: 100,
        },
  });
  const filteredEvents = useMemo(() => {
    if (selectedRelays.length === 0) return events;

    const ids = selectedRelays.reduce((acc, r) => {
      const seenInRelay = seenByRelay[r];
      if (seenInRelay) {
        Array.from(seenInRelay).forEach((i) => {
          acc.add(i);
        });
      }
      return acc;
    }, new Set());

    return events
      .filter((ev) => ids.has(getEventId(ev)))
      .filter((ev) => (followsOnly ? follows.includes(ev.pubkey) : true));
  }, [events, selectedRelays, seenByRelay, follows, followsOnly]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={4}>
            <Relays />
            <Authors events={filteredEvents} />
            <Tags events={filteredEvents} />
          </Flex>
        }
      >
        <Flex alignItems="center" justifyContent="space-between">
          <Heading
            fontSize="18px"
            fontFamily="var(--font-mono)"
            fontWeight={500}
          >
            Notes on {selectedRelays[0]}
            {selectedRelays.length > 1 && " & "}
            {selectedRelays.length > 1 && (
              <Text as="span" color="purple.500">
                {selectedRelays.length - 1} others
              </Text>
            )}
          </Heading>
        </Flex>
        <Flex justifyContent="flex-end" width="100%">
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
        <Feed seen={seen} events={filteredEvents} />
      </Layout>
    </>
  );
}
