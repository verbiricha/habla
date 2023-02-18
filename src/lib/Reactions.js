import { dateToUnix, useNostr, useNostrEvents } from "nostr-react-habla";

import { Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { TriangleUpIcon, TriangleDownIcon } from "@chakra-ui/icons";

import useLoggedInUser from "./useLoggedInUser";
import { eventAddress } from "./nostr";

export default function Reactions({ event }) {
  const { publish } = useNostr();
  const { user } = useLoggedInUser();
  const naddr = eventAddress(event);
  const { events } = useNostrEvents({
    filter: {
      kinds: [7],
      ids: [naddr], // todo: a tag
    },
  });
  const likes = events.filter((e) => e.content !== "-");
  const liked = likes.find((e) => e.pubkey === user);
  const dislikes = events.filter((e) => e.content === "-");
  const disliked = dislikes.find((e) => e.pubkey === user);

  async function react(content) {
    const ev = {
      content,
      kind: 7,
      created_at: dateToUnix(),
      tags: [
        ["e", naddr],
        ["a", naddr],
      ],
    };
    const signed = await window.nostr.signEvent(ev);
    console.log("reaction", signed);
    publish(signed);
  }

  return (
    <Flex>
      <HStack spacing={4} mt={4}>
        <Flex alignItems="center" flexDirection="row" minWidth={120}>
          <IconButton
            isDisabled={liked}
            icon={<TriangleUpIcon />}
            size="sm"
            onClick={() => react("+")}
          />
          <Text as="span" ml={4} fontSize="xl">
            {likes.length}
          </Text>
        </Flex>
        <Flex alignItems="center" flexDirection="row" minWidth={120}>
          <IconButton
            isDisabled={disliked}
            icon={<TriangleDownIcon />}
            size="sm"
            onClick={() => react("-")}
          />
          <Text as="span" ml={4} fontSize="xl">
            {dislikes.length}
          </Text>
        </Flex>
      </HStack>
    </Flex>
  );
}
