import { Helmet } from "react-helmet";

import { Flex } from "@chakra-ui/react";

import { useNostrEvents } from "../nostr";
import Authors from "../lib/Authors";
import Tags from "../lib/Tags";
import Layout from "../lib/Layout";
import Feed from "../lib/Feed";
import Relays from "../lib/Relays";

export default function Home() {
  const { seen, events } = useNostrEvents({
    filter: {
      kinds: [30023],
      limit: 100,
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
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            <Relays mb={6} />
            <Authors events={events} />
            <Tags events={events} />
          </Flex>
        }
      >
        <Feed seen={seen} events={events} />
      </Layout>
    </>
  );
}
