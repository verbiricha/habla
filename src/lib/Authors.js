import { useMemo } from "react";

import { Flex, Heading } from "@chakra-ui/react";

import User from "../lib/User";

export default function Authors({ events, relays = [] }) {
  const authors = useMemo(() => {
    const pubkeys = events.reduce((acc, e) => {
      const count = acc[e.pubkey] || 0;
      return { ...acc, [e.pubkey]: count + 1 };
    }, {});
    const sorted = Object.entries(pubkeys);
    sorted.sort((a, b) => b[1] - a[1]);
    return sorted.map((a) => a[0]);
  }, [events]);
  return (
    <>
      <Heading mb={4} fontSize="2xl" as="h3">
        Authors
      </Heading>
      <Flex flexDirection="column" mb={6}>
        {authors.map((a) => (
          <User key={a} mb={2} pubkey={a} relays={relays} />
        ))}
      </Flex>
    </>
  );
}
