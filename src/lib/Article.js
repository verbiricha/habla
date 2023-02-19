import { useNostrEvents } from "nostr-react-habla";
import { useBoolean, Flex, Box, IconButton } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

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
        <Flex flexDirection="column" alignItems="center" px={4}>
          <Box minWidth={["100%", "100%", "786px"]} maxWidth="786px">
            <Editor event={ev}>
              <Flex justifyContent="flex-end" mt={4}>
                <IconButton icon={<EditIcon />} onClick={setIsEditing.toggle} />
              </Flex>
            </Editor>
          </Box>
        </Flex>
      )}
      {ev && !isEditing && (
        <Event
          key={ev.id}
          showUser={false}
          isPreview={false}
          //enableReactions={true}
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
