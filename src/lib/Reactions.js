import { dateToUnix, useNostr, useNostrEvents } from "../nostr";

import { Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { TriangleUpIcon, TriangleDownIcon } from "@chakra-ui/icons";

import useLoggedInUser from "./useLoggedInUser";
import { getEventId } from "../nostr";
import { eventAddress } from "./nostr";
import User from "./User";

export default function Reactions({ showUsers = false, event }) {
  const { publish } = useNostr();
  const { user } = useLoggedInUser();
  const naddr = eventAddress(event);
  const { events } = useNostrEvents({
    filter: {
      kinds: [7, 9735],
      "#a": [naddr],
    },
  });
  const likes = events.filter((e) => e.kind === 7 && e.content !== "-");
  const liked = likes.find((e) => e.pubkey === user);
  const dislikes = events.filter((e) => e.kind === 7 && e.content === "-");
  const disliked = dislikes.find((e) => e.pubkey === user);

  async function react(content) {
    const ev = {
      content,
      kind: 7,
      created_at: dateToUnix(),
      tags: [
        ["e", event.id],
        ["a", naddr],
      ],
    };
    const signed = await window.nostr.signEvent(ev);
    publish(signed);
  }

  return (
    <>
      <Flex>
        <HStack spacing={4} mt={4}>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
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
      {showUsers && likes.length > 0 && (
        <>
          {likes.map((ev) => (
            <Flex key={getEventId(ev)} alignItems="center">
              <User showNip={false} pubkey={ev.pubkey} />
              <Text> liked</Text>
            </Flex>
          ))}
        </>
      )}
      {showUsers && dislikes.length > 0 && (
        <>
          {dislikes.map((ev) => (
            <Flex key={getEventId(ev)} alignItems="center">
              <User showNip={false} pubkey={ev.pubkey} />
              <Text> disliked</Text>
            </Flex>
          ))}
        </>
      )}
    </>
  );
}
