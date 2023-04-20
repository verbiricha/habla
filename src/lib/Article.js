import { useBoolean, useToast, Flex, IconButton } from "@chakra-ui/react";
import { EditIcon, RepeatIcon } from "@chakra-ui/icons";

import "./Article.css";
import { useNostr, useNostrEvents } from "../nostr";
import Editor from "./Editor";
import Event from "./Event";
import useLoggedInUser from "./useLoggedInUser";
import useCached from "./useCached";

export default function Article({ d, pubkey, relays = [], reactions = [] }) {
  const toast = useToast();
  const { user, relays: userRelays } = useLoggedInUser();
  const isMe = user === pubkey;
  const [isEditing, setIsEditing] = useBoolean(false);
  const { pool } = useNostr();
  const { seenByRelay, events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [30023],
    },
    relays,
  });
  const ev = useCached(`event:30023:${pubkey}:${d}`, events[0], {
    isEvent: true,
  });
  function rebroadcast() {
    try {
      pool.publish(userRelays, ev);
      toast({
        title: "Event rebroadcasted",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Couldn't rebroadcast event",
        status: "success",
      });
    }
  }
  const seenIn =
    seenByRelay && ev?.id && seenByRelay[ev.id]
      ? Array.from(seenByRelay[ev.id])
      : relays;

  return (
    <>
      {ev && isEditing && (
        <Editor event={ev}>
          <Flex justifyContent="flex-end" mt={4}>
            <IconButton icon={<EditIcon />} onClick={setIsEditing.toggle} />
          </Flex>
        </Editor>
      )}
      {ev && !isEditing && (
        <Event
          key={ev.id}
          isPreview={false}
          relays={seenIn}
          reactions={reactions}
          showReactions={true}
          showComments={true}
          event={ev}
        >
          {isMe && (
            <Flex justifyContent="flex-end" mt={4}>
              <IconButton icon={<RepeatIcon />} onClick={rebroadcast} mr={2} />
              <IconButton icon={<EditIcon />} onClick={setIsEditing.toggle} />
            </Flex>
          )}
        </Event>
      )}
    </>
  );
}
