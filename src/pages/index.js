import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { useNostrEvents } from "nostr-react-habla";

import { Flex, Heading, VStack } from "@chakra-ui/react";

import { getMetadata } from "../lib/nostr";
import Hashtag from "../lib/Hashtag";
import Layout from "../lib/Layout";
import User from "../lib/User";
import Feed from "../lib/Feed";
import Relays from "../lib/Relays";

export default function Home() {
  const { events } = useNostrEvents({
    filter: {
      kinds: [30023],
      limit: 100,
    },
  });
  const authors = useMemo(() => {
    const pubkeys = events.map((e) => e.pubkey);
    return Array.from(new Set(pubkeys));
  }, [events]);
  const tags = useMemo(() => {
    const tags = events.map((e) => getMetadata(e)?.hashtags).flat();
    return Array.from(new Set(tags));
  }, [events]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla</title>
      </Helmet>
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
            <Heading fontSize="2xl" as="h3">
              Tags
            </Heading>
            <VStack alignItems="flex-start" mt={2} spacing={2}>
              {tags.map((t) => (
                <Hashtag tag={t} />
              ))}
            </VStack>
          </Flex>
        }
      >
        <Feed events={events} />
      </Layout>
    </>
  );
}
