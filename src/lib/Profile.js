import { useNostrEvents, useProfile } from "../nostr";
import { Flex, Box, Text, Avatar, Heading } from "@chakra-ui/react";

import { eventAddress } from "../nostr";
import EventItem from "./EventItem";
import Nip05 from "./nip05";
import useReactions from "./useReactions";

export default function Profile({ pubkey, relays }) {
  const { data } = useProfile({ pubkey });
  const { events, seenByRelay } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [30023],
    },
    relays,
  });
  const addresses = events.map(eventAddress);
  const reactions = useReactions({ addresses });
  return (
    <>
      <Flex alignItems="center" flexDirection="column">
        <Flex
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          mt={6}
          mb={12}
        >
          <Avatar src={data?.picture} name={data?.name} size="2xl" />
          <Flex
            ml={8}
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Heading as="h1">{data?.name}</Heading>
            <Nip05 fontSize="xl" pubkey={pubkey} nip05={data?.nip05} />
            <Text>{data?.about}</Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex flexDirection="column">
        <Heading as="h2" mb={4}>
          Posts ({`${events.length}`})
        </Heading>
        {events.map((ev) => {
          const addr = eventAddress(ev);
          const eventReactions = reactions.filter((r) =>
            r.tags.find((t) => t[0] === "a" && t[1] === addr)
          );
          return (
            <Box mb={6}>
              <EventItem
                reactions={eventReactions}
                relays={seenByRelay && Array.from(seenByRelay[ev.id])}
                key={addr}
                event={ev}
              />
            </Box>
          );
        })}
      </Flex>
    </>
  );
}
