import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Flex, Heading } from "@chakra-ui/react";

import { useNostrEvents } from "../nostr";
import Layout from "../lib/Layout";
import User from "../lib/User";
import Feed from "../lib/Feed";
import Relays from "../lib/Relays";
import Authors from "../lib/Authors";

export default function Tag() {
  const { t } = useParams();
  const { seenByRelay, events } = useNostrEvents({
    filter: {
      kinds: [30023],
      "#t": [t],
      limit: 256,
    },
  });

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Habla - #{t}</title>
      </Helmet>
      <Layout
        aside={
          <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
            <Authors events={events} />
            <Relays mb={6} />
          </Flex>
        }
      >
        <Heading as="h2" mb={6}>
          Hashtag: #{t}
        </Heading>
        <Feed seenByRelay={seenByRelay} events={events} />
      </Layout>
    </>
  );
}
