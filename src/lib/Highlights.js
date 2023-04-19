import { Link } from "react-router-dom";
import { Flex, Box, Heading, Text } from "@chakra-ui/react";
import { getMetadata, encodeNaddr } from "../nostr";

import Highlight from "./Highlight";

export default function Highlights({ highlights, relays, reactions }) {
  return highlights.length > 0 ? (
    <>
      <Heading id="--highlights" mt={4} fontSize="4xl" as="h3" mb={2}>
        Highlights
      </Heading>
      <Flex flexDirection="column">
        {highlights.map((ev) => {
          return (
            <Highlight
              key={ev.id}
              highlight={ev}
              relays={relays}
              reactions={reactions}
              my={2}
            />
          );
        })}
      </Flex>
    </>
  ) : null;
}
