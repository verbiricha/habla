import { useBoolean, Flex, IconButton } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import "./Article.css";
import { useNostrEvents, getEventId } from "../nostr";
import Editor from "./Editor";
import Event from "./Event";
import useLoggedInUser from "./useLoggedInUser";
import useCached from "./useCached";

export default function Article({ d, pubkey }) {
  const { user } = useLoggedInUser();
  const isMe = user === pubkey;
  const [isEditing, setIsEditing] = useBoolean(false);
  const { seenByRelay, events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [30023],
    },
  });
  const ev = useCached(`event:30023:${pubkey}:${d}`, events[0], {
    isEvent: true,
  });
  const relays = ev && seenByRelay[ev.id];

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
          relays={relays}
          showReactions={true}
          event={ev}
        >
          {isMe && (
            <Flex justifyContent="flex-end" mt={4}>
              <IconButton icon={<EditIcon />} onClick={setIsEditing.toggle} />
            </Flex>
          )}
        </Event>
      )}
    </>
  );
}
