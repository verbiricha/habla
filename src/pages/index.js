import { useMemo } from "react";
import { Helmet } from "react-helmet";

import { Flex } from "@chakra-ui/react";

import { getEventId, useNostrEvents } from "../nostr";
import Authors from "../lib/Authors";
import Tags from "../lib/Tags";
import Layout from "../lib/Layout";
import Feed from "../lib/Feed";
import useRelays from "../lib/useRelays";

export default function Home() {
  const { selectedRelays } = useRelays();
  const { seen, seenByRelay, events } = useNostrEvents({
    filter: {
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

    return events.filter((ev) => ids.has(getEventId(ev)));
  }, [events, selectedRelays, seenByRelay]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            <Authors events={events} />
            <Tags events={events} />
          </Flex>
        }
      >
        <Feed seen={seen} events={filteredEvents} />
      </Layout>
    </>
  );
}
