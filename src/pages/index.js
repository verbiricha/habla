import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { Helmet } from "react-helmet";

import { Flex, Tag, Text } from "@chakra-ui/react";

import { getEventId, useNostrEvents } from "../nostr";
import Authors from "../lib/Authors";
import Tags from "../lib/Tags";
import Layout from "../lib/Layout";
import Feed from "../lib/Feed";
import Relays, { trimRelayUrl } from "../lib/Relays";

export default function Home() {
  const { relays } = useSelector((s) => s.relay);
  const [selected, setSelected] = useState([]);
  const { seen, seenByRelay, events } = useNostrEvents({
    filter: {
      kinds: [30023],
      limit: 100,
    },
  });
  const filteredEvents = useMemo(() => {
    if (selected.length === 0) return events;

    const ids = selected.reduce((acc, r) => {
      const seenInRelay = seenByRelay[r];
      if (seenInRelay) {
        Array.from(seenInRelay).forEach((i) => {
          acc.add(i);
        });
      }
      return acc;
    }, new Set());

    return events.filter((ev) => ids.has(getEventId(ev)));
  }, [events, selected, seenByRelay]);

  function toggleRelay(r) {
    if (selected.includes(r)) {
      setSelected(selected.filter((s) => s !== r));
    } else {
      setSelected([r, ...selected]);
    }
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            <Relays mb={6} />
            <Authors events={events} />
            <Tags events={events} />
          </Flex>
        }
      >
        <Flex flexDirection={["column", "column", "row"]}>
          {relays.map((r) => (
            <Tag
              colorScheme={selected.includes(r) ? "purple" : "gray"}
              variant="solid"
              cursor="pointer"
              key={r}
              size="md"
              mr={2}
              mb={2}
              onClick={() => toggleRelay(r)}
            >
              <Text fontFamily="var(--font-mono)" mr={1}>
                {seenByRelay[r]?.size}
              </Text>
              {trimRelayUrl(r)}
            </Tag>
          ))}
        </Flex>
        <Feed seen={seen} events={filteredEvents} />
      </Layout>
    </>
  );
}
