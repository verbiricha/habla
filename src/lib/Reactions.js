import { useState } from "react";
import {
  getEventId,
  eventAddress,
  dateToUnix,
  useNostr,
  useNostrEvents,
} from "../nostr";

import {
  useToast,
  Flex,
  HStack,
  Button,
  IconButton,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { TriangleUpIcon, TriangleDownIcon, ChatIcon } from "@chakra-ui/icons";

import useLoggedInUser from "./useLoggedInUser";
import User from "./User";

export default function Reactions({ showUsers = false, event }) {
  const { publish } = useNostr();
  const toast = useToast();
  const [showReply, setShowReply] = useState(false);
  const [comment, setComment] = useState("");
  const { user } = useLoggedInUser();
  const naddr = eventAddress(event);
  const { events } = useNostrEvents({
    filter: {
      kinds: [7],
      "#a": [naddr],
    },
  });
  const likes = events.filter((e) => e.kind === 7 && e.content === "+");
  const liked = likes.find((e) => e.pubkey === user);
  const dislikes = events.filter((e) => e.kind === 7 && e.content === "-");
  const disliked = dislikes.find((e) => e.pubkey === user);
  const comments = events.filter(
    (e) => e.kind === 7 && e.content !== "+" && e.content !== "-"
  );
  //const zaps = events.filter((e) => e.kind === 9735);

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

  function onCancel() {
    setComment("");
    setShowReply(false);
  }

  function onComment() {
    react(comment.trim());
    toast({
      title: "Comment published",
      status: "success",
    });
    setComment("");
    setShowReply(false);
  }

  return (
    <>
      <Flex>
        <HStack spacing={4} mt={4}>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
            <IconButton
              variant="unstyled"
              isDisabled={liked}
              icon={<TriangleUpIcon />}
              size="sm"
              onClick={() => react("+")}
            />
            <Text as="span" ml={4} fontSize="xl">
              {likes.length}
            </Text>
          </Flex>
          <Flex alignItems="center" flexDirection="row" minWidth={"80px"}>
            <IconButton
              variant="unstyled"
              isDisabled={disliked}
              icon={<TriangleDownIcon />}
              size="sm"
              onClick={() => react("-")}
            />
            <Text as="span" ml={4} fontSize="xl">
              {dislikes.length}
            </Text>
          </Flex>
          <Flex alignItems="center" flexDirection="row" minWidth={120}>
            <IconButton
              variant="unstyled"
              icon={<ChatIcon />}
              size="sm"
              onClick={() => setShowReply(true)}
            />
            <Text as="span" ml={4} fontSize="xl">
              {comments.length}
            </Text>
          </Flex>
        </HStack>
      </Flex>
      {showReply && (
        <Flex flexDirection="column">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            autoFocus={true}
            my={4}
          />
          <Flex alignSelf="flex-end">
            <Button mr={2} variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              isDisabled={comment.trim().length === 0}
              onClick={onComment}
            >
              Publish
            </Button>
          </Flex>
        </Flex>
      )}
      {showUsers && (
        <>
          {comments.map((ev) => (
            <Flex key={getEventId(ev)} alignItems="center">
              <User showNip={false} pubkey={ev.pubkey} />
              <Text>: {ev.content}</Text>
            </Flex>
          ))}
        </>
      )}
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
