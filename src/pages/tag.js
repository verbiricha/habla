import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNostrEvents } from "nostr-react-habla";

import { Flex, Heading } from "@chakra-ui/react";

import Layout from "../lib/Layout";
import User from "../lib/User";
import Feed from "../lib/Feed";
import Relays from "../lib/Relays";

export default function Tag() {
  const { t } = useParams();
  const { events } = useNostrEvents({
    filter: {
      kinds: [30023],
      "#t": [t],
      limit: 100,
    },
  });
  const authors = useMemo(() => {
    const pubkeys = events.map((e) => e.pubkey);
    return Array.from(new Set(pubkeys));
  }, [events]);

  return (
    <Layout
      aside={
        <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
          <Heading fontSize="2xl" as="h3">
            Relays
          </Heading>
          <Relays mb={6} />
          <Heading fontSize="2xl" as="h3">
            Authors
          </Heading>
          <Flex flexDirection="column" mb={6}>
            {authors.map((a) => (
              <User key={a} mb={2} pubkey={a} />
            ))}
          </Flex>
        </Flex>
      }
    >
      <Heading as="h2" mb={6}>
        Hashtag: #{t}
      </Heading>
      <Feed events={events} />
    </Layout>
  );
}
