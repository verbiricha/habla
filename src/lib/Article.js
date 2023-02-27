import { useBoolean, Flex, IconButton } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import "./Article.css";
import { useNostrEvents } from "../nostr";
import Editor from "./Editor";
import Event from "./Event";
import useLoggedInUser from "./useLoggedInUser";
import useCached from "./useCached";

export default function Article({ d, pubkey, relays }) {
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
          relays={relays || seenByRelay[ev.id]}
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
