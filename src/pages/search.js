import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import {
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

import { useNostrEvents } from "../nostr";
import Layout from "../lib/Layout";
import User from "../lib/User";
import Feed from "../lib/Feed";
import { RelayCard } from "../lib/Relays";

export default function Search() {
  const { q } = useParams();
  const [query, setQuery] = useState(q ?? "");
  const { seen, events } = useNostrEvents({
    id: query,
    filter: {
      kinds: [30023],
      search: query,
      limit: 256,
    },
    enabled: query?.trim().length >= 2,
    relays: ["wss://relay.nostr.band"],
  });

  const authors = useMemo(() => {
    const pubkeys = events.map((e) => e.pubkey);
    return Array.from(new Set(pubkeys));
  }, [events]);

  return (
    <Layout
      aside={
        <Flex flexDirection="column" as="aside" width={320} p={4} pr={12}>
          <RelayCard url="wss://relay.nostr.band" mb={6} />
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
        Search
      </Heading>
      <InputGroup mb={6}>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="secondary.500" />}
        />
        <Input
          autoFocus={true}
          type="text"
          placeholder="Search terms"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>

      <Feed seen={seen} events={events} />
    </Layout>
  );
}
