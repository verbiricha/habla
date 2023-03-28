import { Link } from "react-router-dom";
import { Flex, Box, Heading, Text } from "@chakra-ui/react";

import { getMetadata, encodeNaddr } from "../nostr";
import { Hashtags } from "./Hashtag";

function ArticlePreview({ ev, relays = [] }) {
  const meta = getMetadata(ev);
  const naddr = encodeNaddr(ev, relays.slice(0, 5));
  const tags = meta?.hashtags ?? [];
  return (
    <Box key={ev.id} mb={2}>
      <Link to={`/a/${naddr}`}>
        <Flex flexDirection="column">
          <Text fontSize="xl" fontWeight="500">
            {meta?.title}
          </Text>
          <Text fontSize="xs" color="secondary.500">
            {meta?.summary}
          </Text>
          <Hashtags hashtags={tags} />
        </Flex>
      </Link>
    </Box>
  );
}

export default function Articles({ title = "Articles", events, relays }) {
  return (
    <>
      <Heading mt={4} fontSize="2xl" as="h3" mb={2}>
        {title}
      </Heading>
      <Flex flexDirection="column">
        {events.map((ev) => {
          return <ArticlePreview key={ev.id} ev={ev} relays={relays} />;
        })}
      </Flex>
    </>
  );
}
