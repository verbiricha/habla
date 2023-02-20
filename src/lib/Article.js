import { useBoolean, Flex, IconButton } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import { useNostrEvents } from "../nostr";
import Editor from "./Editor";
import Event from "./Event";
import useLoggedInUser from "./useLoggedInUser";

export default function Article({ d, pubkey }) {
  const { user } = useLoggedInUser();
  const isMe = user === pubkey;
  const [isEditing, setIsEditing] = useBoolean(false);
  const { events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#d": [d],
      kinds: [30023],
    },
  });
  const ev = events[0];

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
          showUser={false}
          isPreview={false}
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
