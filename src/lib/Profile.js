import { useNostrEvents, useProfile } from "nostr-react-habla";
import { Box, Flex, Text, Avatar, Heading } from "@chakra-ui/react";

import EventItem from "./EventItem";

export default function Profile({ pubkey }) {
  const { data } = useProfile({ pubkey });
  const { events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [30023],
    },
  });
  return (
    <Flex flexDirection="column" alignItems="center" px={4}>
      <Box minWidth={["100%", "100%", "786px"]} maxWidth="786px">
        <Flex alignItems="center">
          <Flex flexDirection="row" mb={12}>
            <Avatar src={data?.picture} name={data?.name} size="2xl" />
            <Flex ml={8} flexDirection="column">
              <Heading as="h1">{data?.name}</Heading>
              <Text fontSize="xl">{data?.nip05}</Text>
              <Text>{data?.about}</Text>
            </Flex>
          </Flex>
        </Flex>

        <Flex flexDirection="column">
          <Heading as="h2" mb={4}>
            Posts ({`${events.length}`})
          </Heading>
          {events.map((e) => (
            <EventItem key={e.id} event={e} />
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}
