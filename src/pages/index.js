import { Helmet } from "react-helmet";
import { useNostrEvents } from "nostr-react-habla";

import { Flex } from "@chakra-ui/react";

import Authors from "../lib/Authors";
import Tags from "../lib/Tags";
import Layout from "../lib/Layout";
import Feed from "../lib/Feed";
import Relays from "../lib/Relays";

export default function Home() {
  const { events } = useNostrEvents({
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
        <Feed events={events} />
      </Layout>
    </>
  );
}
