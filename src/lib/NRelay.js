import { Flex, Text } from "@chakra-ui/react";

import { normalizeURL } from "../nostr";

import { RelayFavicon } from "./Relays";
import NostrLink from "./NostrLink";

export default function NRelay({ nrelay, relay }) {
  return (
    <NostrLink link={`/r/${nrelay}`}>
      <Flex alignItems="center" key={relay}>
        <RelayFavicon url={relay} mr={2} />
        <Text margin={0} my={1} fontFamily="var(--font-mono)" fontSize="md">
          {normalizeURL(relay)}
        </Text>
      </Flex>
    </NostrLink>
  );
}
