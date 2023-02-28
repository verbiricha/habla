import { Flex, Text } from "@chakra-ui/react";

import { normalizeURL } from "../nostr";

import { RelayFavicon } from "./Relays";

export default function NRelay({ relay }) {
  return (
    <Flex alignItems="center" key={relay}>
      <RelayFavicon url={relay} mr={2} />
      <Text margin={0} my={1} fontFamily="var(--font-mono)" fontSize="md">
        {normalizeURL(relay)}
      </Text>
    </Flex>
  );
}
