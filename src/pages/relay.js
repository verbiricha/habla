import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";

import { Flex, Button, Heading, Text } from "@chakra-ui/react";

import {
  useNostrEvents,
  normalizeURL,
  decodeNrelay,
  eventAddress,
} from "../nostr";
import Authors from "../lib/Authors";
import Tags from "../lib/Tags";
import Layout from "../lib/Layout";
import Feed from "../lib/Feed";
import { RelayCard } from "../lib/Relays";
import useReactions from "../lib/useReactions";

export default function Relay() {
  const { nrelay } = useParams();
  const relay = decodeNrelay(nrelay);
  const [followsOnly, setFollowsOnly] = useState(false);
  const { user, follows } = useSelector((s) => s.relay);
  const followsFeed = useNostrEvents({
    filter: {
      kinds: [30023],
      authors: follows,
    },
    relays: [relay],
    enabled: followsOnly,
  });
  const allFeed = useNostrEvents({
    filter: {
      kinds: [30023],
    },
    enabled: !followsOnly,
    relays: [relay],
  });
  const { events, seenByRelay } = followsOnly ? followsFeed : allFeed;

  const filteredEvents = useMemo(() => {
    return events.filter((ev) =>
      followsOnly ? follows.includes(ev.pubkey) : true
    );
  }, [events, follows, followsOnly]);

  const addresses = filteredEvents.map(eventAddress);
  const reactions = useReactions({ addresses });

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla - Notes on {relay}</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={4}>
            <RelayCard url={relay} />
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
            Notes on{" "}
            <Text as="span" color="purple.500">
              {normalizeURL(relay)}
            </Text>
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
          {user && (
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
          )}
        </Flex>
        <Feed
          relays={[relay]}
          reactions={reactions}
          events={filteredEvents}
          seenByRelay={seenByRelay}
        />
      </Layout>
    </>
  );
}
