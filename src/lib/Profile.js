import { useNostrEvents, useProfile } from "../nostr";
import { Flex, Text, Avatar, Heading } from "@chakra-ui/react";

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
    <>
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
    </>
  );
}
